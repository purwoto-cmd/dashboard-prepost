import type { MergedStudent, TopEntry } from "@/types";

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function topInstruktur(students: MergedStudent[], limit = 10): TopEntry[] {
  const m = new Map<string, MergedStudent[]>();
  for (const s of students) {
    const k = s.instruktur || "(tanpa instruktur)";
    const bucket = m.get(k);
    if (bucket) bucket.push(s);
    else m.set(k, [s]);
  }
  const entries: TopEntry[] = [];
  for (const [k, list] of m) {
    entries.push({
      key: k,
      label: k,
      peserta: list.length,
      rataRataNGain: mean(list.map((s) => s.ngain)),
      rataRataPost: mean(list.map((s) => s.postScore)),
    });
  }
  // Require minimum of 3 participants to be "top" — avoids single-student outliers.
  return entries
    .filter((e) => e.peserta >= 3)
    .sort((a, b) => b.rataRataNGain - a.rataRataNGain)
    .slice(0, limit);
}

export function topMahasiswa(students: MergedStudent[], limit = 10): TopEntry[] {
  return students
    .map<TopEntry>((s) => ({
      key: s.nim,
      label: `${s.nama} (${s.nim})`,
      peserta: 1,
      rataRataNGain: s.ngain,
      rataRataPost: s.postScore,
    }))
    .sort((a, b) => b.rataRataNGain - a.rataRataNGain || b.rataRataPost - a.rataRataPost)
    .slice(0, limit);
}
