import type { FakultasAggregate, JurusanAggregate, MergedStudent } from "@/types";

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function groupBy<K extends string, V>(items: V[], key: (v: V) => K): Map<K, V[]> {
  const m = new Map<K, V[]>();
  for (const it of items) {
    const k = key(it);
    const bucket = m.get(k);
    if (bucket) bucket.push(it);
    else m.set(k, [it]);
  }
  return m;
}

export function aggregateByJurusan(students: MergedStudent[]): JurusanAggregate[] {
  const groups = groupBy(students, (s) => `${s.fakultas}||${s.jurusan}`);
  const out: JurusanAggregate[] = [];
  for (const [k, list] of groups) {
    const [fakultas, jurusan] = k.split("||") as [string, string];
    out.push({
      fakultas,
      jurusan,
      peserta: list.length,
      rataRataPre: mean(list.map((s) => s.preScore)),
      rataRataPost: mean(list.map((s) => s.postScore)),
      rataRataNGain: mean(list.map((s) => s.ngain)),
    });
  }
  out.sort((a, b) =>
    a.fakultas === b.fakultas
      ? a.jurusan.localeCompare(b.jurusan)
      : a.fakultas.localeCompare(b.fakultas),
  );
  return out;
}

export function aggregateByFakultas(
  students: MergedStudent[],
  passThreshold: number,
): FakultasAggregate[] {
  const groups = groupBy(students, (s) => s.fakultas);
  const out: FakultasAggregate[] = [];
  for (const [fakultas, list] of groups) {
    const lulus = list.filter((s) => s.postScore >= passThreshold).length;
    out.push({
      fakultas,
      peserta: list.length,
      rataRataPre: mean(list.map((s) => s.preScore)),
      rataRataPost: mean(list.map((s) => s.postScore)),
      rataRataNGain: mean(list.map((s) => s.ngain)),
      kelulusanPercent: list.length === 0 ? 0 : (lulus / list.length) * 100,
      jurusan: aggregateByJurusan(list),
    });
  }
  out.sort((a, b) => a.fakultas.localeCompare(b.fakultas));
  return out;
}
