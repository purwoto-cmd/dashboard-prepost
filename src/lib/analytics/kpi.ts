import type { KPI, MergedStudent } from "@/types";

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function computeKPI(students: MergedStudent[], passThreshold: number): KPI {
  const n = students.length;
  if (n === 0) {
    return {
      jumlahPeserta: 0,
      rataRataPre: 0,
      rataRataPost: 0,
      rataRataGain: 0,
      rataRataNGain: 0,
      kelulusanPercent: 0,
    };
  }
  const pre = students.map((s) => s.preScore);
  const post = students.map((s) => s.postScore);
  const gain = students.map((s) => s.postScore - s.preScore);
  const ng = students.map((s) => s.ngain);
  const lulus = students.filter((s) => s.postScore >= passThreshold).length;
  return {
    jumlahPeserta: n,
    rataRataPre: mean(pre),
    rataRataPost: mean(post),
    rataRataGain: mean(gain),
    rataRataNGain: mean(ng),
    kelulusanPercent: (lulus / n) * 100,
  };
}
