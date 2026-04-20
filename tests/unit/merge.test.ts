import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseExamBuffer } from "@/lib/parser";
import { computeKPI, mergeExams } from "@/lib/analytics";

const FIX = resolve(__dirname, "..", "..", "fixtures");
function buf(n: string) {
  return new Uint8Array(readFileSync(resolve(FIX, n)));
}

describe("mergeExams + KPI pipeline", () => {
  it("joins pretest+posttest on NIM and produces sane KPI", () => {
    const pre = parseExamBuffer(buf("Pretest.xlsx"), { kind: "pretest" });
    const post = parseExamBuffer(buf("Posttest.xlsx"), { kind: "posttest" });
    const ds = mergeExams(pre, post, { language: "en" });
    expect(ds.students.length).toBeGreaterThan(0);
    expect(ds.maxScore).toBe(30);
    expect(ds.students.length).toBeLessThanOrEqual(
      Math.min(pre.students.length, post.students.length),
    );
    const kpi = computeKPI(ds.students, ds.passThreshold);
    expect(kpi.jumlahPeserta).toBe(ds.students.length);
    // Deterministic seed => posttest mean must exceed pretest mean
    expect(kpi.rataRataPost).toBeGreaterThan(kpi.rataRataPre);
    // N-Gain is in [-1, +1]
    expect(kpi.rataRataNGain).toBeGreaterThanOrEqual(-1);
    expect(kpi.rataRataNGain).toBeLessThanOrEqual(1);
  });
});
