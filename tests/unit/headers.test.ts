import { describe, expect, it } from "vitest";
import { buildLayout, detectHeader } from "@/lib/schema/headers";

describe("header detector", () => {
  it("detects canonical aliases (case/space/punct-insensitive)", () => {
    expect(detectHeader("NIM")).toMatchObject({ kind: "canonical", field: "nim" });
    expect(detectHeader("nim")).toMatchObject({ kind: "canonical", field: "nim" });
    expect(detectHeader("NIM Mahasiswa")).toMatchObject({ kind: "canonical", field: "nim" });
    expect(detectHeader("N.I.M.")).toMatchObject({ kind: "canonical", field: "nim" });
    expect(detectHeader("Nama Lengkap")).toMatchObject({ kind: "canonical", field: "nama" });
    expect(detectHeader("Program Studi")).toMatchObject({ kind: "canonical", field: "jurusan" });
    expect(detectHeader("instructor")).toMatchObject({ kind: "canonical", field: "instruktur" });
  });

  it("detects soal columns with id normalisation", () => {
    expect(detectHeader("Soal 1")).toMatchObject({ kind: "soal", id: "S01" });
    expect(detectHeader("No. 12")).toMatchObject({ kind: "soal", id: "S12" });
    expect(detectHeader("Q3")).toMatchObject({ kind: "soal", id: "S03" });
    expect(detectHeader("25")).toMatchObject({ kind: "soal", id: "S25" });
  });

  it("returns unknown for anything else", () => {
    expect(detectHeader("Remark")).toMatchObject({ kind: "unknown" });
  });

  it("builds a layout with missing-field detection", () => {
    const layout = buildLayout(["NIM", "NAMA", "Soal 1", "Soal 2"]);
    expect(layout.indexByField.nim).toBe(0);
    expect(layout.indexByField.nama).toBe(1);
    expect(layout.soalColumns).toHaveLength(2);
    expect(layout.missing).toContain("fakultas");
    expect(layout.missing).not.toContain("nim");
  });
});
