import * as XLSX from "xlsx";
import type { AnswerKey, ParseDiagnostics, ParsedExam, StudentResponses } from "@/types";
import { buildLayout, REQUIRED_FIELDS } from "@/lib/schema/headers";
import { NIM_REGEX, normaliseNim } from "@/lib/schema/nim";

const KUNCI_ROW_MARKERS = new Set(["kunci", "key", "jawaban", "kunci jawaban"]);

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

function firstNonEmpty(row: unknown[]): string {
  for (const cell of row) {
    if (cell !== null && cell !== undefined && String(cell).trim() !== "") {
      return String(cell).trim();
    }
  }
  return "";
}

function normaliseAnswer(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  const s = String(raw).trim().toUpperCase();
  if (!s) return "";
  // Accept single letter A-E; numerics 0/1 (already-scored) stay as-is.
  if (/^[A-E]$/.test(s)) return s;
  if (/^[01]$/.test(s)) return s;
  // Letters like "a.", "A)" etc.
  const m = /^([A-E])[.)]/.exec(s);
  if (m) return m[1]!;
  return s;
}

export interface ParseOptions {
  kind: "pretest" | "posttest";
  /** Optional externally-provided kunci; if omitted, parser tries to detect a kunci row. */
  explicitKunci?: AnswerKey;
}

/**
 * Pure function: given a Uint8Array of an Excel file, produce a ParsedExam.
 * No DOM / no worker primitives so this is trivially unit-testable.
 */
export function parseExamBuffer(data: ArrayBuffer | Uint8Array, options: ParseOptions): ParsedExam {
  const wb = XLSX.read(data, { type: "array" });
  if (wb.SheetNames.length === 0) {
    throw new ParseError("Workbook tidak memiliki sheet", "EMPTY_WORKBOOK");
  }

  // Detect a dedicated KUNCI sheet first.
  const kunciSheetName = wb.SheetNames.find((n) => /^kunci/i.test(n));
  const kunci: AnswerKey = { ...(options.explicitKunci ?? {}) };
  if (!options.explicitKunci && kunciSheetName) {
    const sheet = wb.Sheets[kunciSheetName]!;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    for (const row of rows.slice(1)) {
      const id = String(row[0] ?? "").trim();
      const ans = normaliseAnswer(row[1]);
      if (id && /^[A-E]$/.test(ans)) kunci[id] = ans;
    }
  }

  // Pick the first data sheet (non-KUNCI).
  const dataSheetName = wb.SheetNames.find((n) => !/^kunci/i.test(n)) ?? wb.SheetNames[0]!;
  const sheet = wb.Sheets[dataSheetName]!;
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });
  if (rows.length === 0) {
    throw new ParseError("Sheet kosong", "EMPTY_SHEET");
  }
  const headerRow = rows[0]!.map((c) => String(c ?? ""));
  const layout = buildLayout(headerRow);

  const requiredMissing = REQUIRED_FIELDS.filter((f) => layout.indexByField[f] === undefined);
  if (requiredMissing.length > 0 || layout.soalColumns.length === 0) {
    throw new ParseError(
      `Header wajib hilang: ${[
        ...requiredMissing,
        ...(layout.soalColumns.length === 0 ? ["soal"] : []),
      ].join(", ")}`,
      "MISSING_REQUIRED_HEADERS",
    );
  }

  const nimIdx = layout.indexByField.nim!;
  const namaIdx = layout.indexByField.nama!;

  const diagnostics: ParseDiagnostics = {
    totalRows: 0,
    accepted: 0,
    rejectedInvalidNim: 0,
    duplicateNim: 0,
    missingHeaders: layout.missing,
    soalCount: layout.soalColumns.length,
    hasKunci: Object.keys(kunci).length > 0,
    warnings: [],
  };

  const seenNim = new Set<string>();
  const students: StudentResponses[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (firstNonEmpty(row) === "") continue;
    diagnostics.totalRows++;
    const rawNim = row[nimIdx];
    const rawNimStr = normaliseNim(rawNim) ?? "";

    // Detect inline kunci row.
    if (KUNCI_ROW_MARKERS.has(rawNimStr.toLowerCase())) {
      if (!options.explicitKunci) {
        for (const { index, id } of layout.soalColumns) {
          const ans = normaliseAnswer(row[index]);
          if (/^[A-E]$/.test(ans)) kunci[id] = ans;
        }
        diagnostics.hasKunci = Object.keys(kunci).length > 0;
      }
      continue;
    }

    if (!NIM_REGEX.test(rawNimStr)) {
      diagnostics.rejectedInvalidNim++;
      continue;
    }
    if (seenNim.has(rawNimStr)) {
      diagnostics.duplicateNim++;
      continue;
    }
    seenNim.add(rawNimStr);

    const answers: Record<string, string> = {};
    for (const { index, id } of layout.soalColumns) {
      const a = normaliseAnswer(row[index]);
      if (a) answers[id] = a;
    }
    students.push({
      nim: rawNimStr,
      nama: String(row[namaIdx] ?? "").trim(),
      fakultas: String(row[layout.indexByField.fakultas ?? -1] ?? "").trim(),
      jurusan: String(row[layout.indexByField.jurusan ?? -1] ?? "").trim(),
      instruktur: String(row[layout.indexByField.instruktur ?? -1] ?? "").trim(),
      kelas: String(row[layout.indexByField.kelas ?? -1] ?? "").trim(),
      answers,
    });
    diagnostics.accepted++;
  }

  if (diagnostics.accepted === 0) {
    diagnostics.warnings.push("Tidak ada baris valid yang diterima");
  }
  if (!diagnostics.hasKunci) {
    diagnostics.warnings.push(
      "Tidak ditemukan kunci jawaban — nilai akan 0 sampai kunci disediakan",
    );
  }

  return {
    kind: options.kind,
    soalIds: layout.soalColumns.map((c) => c.id),
    kunci,
    students,
    diagnostics,
  };
}
