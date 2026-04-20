import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseExamBuffer, ParseError } from "@/lib/parser";
import * as XLSX from "xlsx";

const FIX = resolve(__dirname, "..", "..", "fixtures");

function buf(name: string): Uint8Array {
  return new Uint8Array(readFileSync(resolve(FIX, name)));
}

function sheetOf(aoa: unknown[][]): Uint8Array {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Data");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

describe("parseExamBuffer", () => {
  it("parses the generated pretest fixture with expected diagnostics", () => {
    const parsed = parseExamBuffer(buf("Pretest.xlsx"), { kind: "pretest" });
    expect(parsed.kind).toBe("pretest");
    expect(parsed.students.length).toBe(60);
    expect(parsed.diagnostics.rejectedInvalidNim).toBeGreaterThanOrEqual(1);
    expect(parsed.diagnostics.duplicateNim).toBeGreaterThanOrEqual(1);
    expect(parsed.diagnostics.hasKunci).toBe(true);
    expect(parsed.soalIds.length).toBe(30);
    // NIM strings are 10-digit and preserved as strings
    for (const s of parsed.students) expect(s.nim).toMatch(/^\d{10}$/);
  });

  it("throws MISSING_REQUIRED_HEADERS when NIM is absent", () => {
    const aoa = [["Name", "Soal 1"], ["foo", "A"]];
    expect(() => parseExamBuffer(sheetOf(aoa), { kind: "pretest" })).toThrow(ParseError);
  });

  it("reports out-of-range single-letter answers as-is but still parses", () => {
    // Parser should not reject a row for an unusual option like "Z" — it is
    // left for psikometri to assess; downstream scoring just treats it as wrong.
    const aoa = [
      ["NIM", "NAMA LENGKAP", "Soal 1"],
      ["KUNCI", "", "A"],
      ["1234567890", "A Student", "Z"],
    ];
    const p = parseExamBuffer(sheetOf(aoa), { kind: "pretest" });
    expect(p.students[0]?.answers["S01"]).toBe("Z");
    expect(p.kunci["S01"]).toBe("A");
  });

  it("deduplicates repeat NIMs with a diagnostic counter", () => {
    const aoa = [
      ["NIM", "NAMA LENGKAP", "Soal 1"],
      ["KUNCI", "", "A"],
      ["1234567890", "A", "A"],
      ["1234567890", "B dup", "B"],
      ["2234567890", "C", "A"],
    ];
    const p = parseExamBuffer(sheetOf(aoa), { kind: "posttest" });
    expect(p.students.length).toBe(2);
    expect(p.diagnostics.duplicateNim).toBe(1);
  });
});
