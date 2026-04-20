import type { CanonicalField, DetectedHeader } from "@/types";
import { assertUnreachable } from "@/lib/utils/exhaustive";

/**
 * Known aliases for each canonical metadata column. Matching is
 * whitespace-insensitive, case-insensitive, and punctuation-agnostic.
 */
const ALIAS_MAP: Record<CanonicalField, string[]> = {
  nim: ["NIM", "Nim", "NIM Mahasiswa", "Nomor Induk", "Nomor Induk Mahasiswa", "N.I.M."],
  nama: ["NAMA LENGKAP", "Nama Lengkap", "Nama", "Full Name", "Student Name", "NAMA"],
  fakultas: ["FAKULTAS", "Fakultas", "Faculty"],
  jurusan: ["JURUSAN", "Jurusan", "Program Studi", "Prodi", "Departemen", "Department"],
  instruktur: ["INSTRUKTUR", "Instruktur", "Dosen", "Pengajar", "Instructor", "Teacher"],
  kelas: ["KELAS", "Kelas", "Class", "Rombel"],
};

const canonicalFields: CanonicalField[] = [
  "nim",
  "nama",
  "fakultas",
  "jurusan",
  "instruktur",
  "kelas",
];

function normalise(s: string): string {
  return s.toLowerCase().replace(/\./g, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

const NORMALISED_ALIAS_MAP: Record<CanonicalField, Set<string>> = (() => {
  const out = {} as Record<CanonicalField, Set<string>>;
  for (const f of canonicalFields) {
    out[f] = new Set(ALIAS_MAP[f].map(normalise));
  }
  return out;
})();

/** Regexes that identify "soal" columns (e.g. "Soal 1", "No. 3", "Q12", "3"). */
const SOAL_PATTERNS: RegExp[] = [/^(?:soal|no|nomor|q|question|item)\s*\.?\s*(\d+)$/i, /^(\d+)$/];

/**
 * Detect the role of a single header string. Exhaustive over CanonicalField
 * aliases, with soal-number fallback and unknown as last resort.
 */
export function detectHeader(raw: string): DetectedHeader {
  const n = normalise(raw);
  for (const field of canonicalFields) {
    if (NORMALISED_ALIAS_MAP[field].has(n)) {
      return { kind: "canonical", field, raw };
    }
  }
  for (const re of SOAL_PATTERNS) {
    const m = re.exec(raw.trim());
    if (m && m[1]) {
      return { kind: "soal", id: `S${m[1].padStart(2, "0")}`, raw };
    }
  }
  return { kind: "unknown", raw };
}

/**
 * Exhaustive reducer that maps a list of DetectedHeader to an indexed layout.
 * Uses assertUnreachable to force the union to be handled.
 */
export interface HeaderLayout {
  indexByField: Partial<Record<CanonicalField, number>>;
  soalColumns: Array<{ index: number; id: string }>;
  unknownColumns: Array<{ index: number; raw: string }>;
  missing: CanonicalField[];
}

export function buildLayout(headers: string[]): HeaderLayout {
  const indexByField: Partial<Record<CanonicalField, number>> = {};
  const soalColumns: HeaderLayout["soalColumns"] = [];
  const unknownColumns: HeaderLayout["unknownColumns"] = [];
  headers.forEach((h, index) => {
    const det = detectHeader(h);
    switch (det.kind) {
      case "canonical":
        if (indexByField[det.field] === undefined) indexByField[det.field] = index;
        return;
      case "soal":
        soalColumns.push({ index, id: det.id });
        return;
      case "unknown":
        unknownColumns.push({ index, raw: det.raw });
        return;
      default:
        return assertUnreachable(det);
    }
  });
  const missing = canonicalFields.filter((f) => indexByField[f] === undefined);
  // NIM, NAMA, and at least one soal are strictly required downstream. Other
  // canonical fields are optional but we still surface them in `missing`.
  return { indexByField, soalColumns, unknownColumns, missing };
}

export const REQUIRED_FIELDS: CanonicalField[] = ["nim", "nama"];
export const CANONICAL_FIELDS: readonly CanonicalField[] = canonicalFields;
