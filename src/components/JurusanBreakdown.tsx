import type { FakultasAggregate } from "@/types";

export function JurusanBreakdown({ data }: { data: FakultasAggregate[] }) {
  const flat = data.flatMap((f) => f.jurusan.map((j) => ({ ...j, fakultas: f.fakultas })));
  const columns = 3;
  const perCol = Math.ceil(flat.length / columns);
  const cols = Array.from({ length: columns }, (_, i) => flat.slice(i * perCol, (i + 1) * perCol));
  return (
    <div className="card p-4" role="region" aria-label="Rincian Jurusan">
      <h3 className="mb-3">Rincian Jurusan</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((col, i) => (
          <ul key={i} className="space-y-2 text-sm">
            {col.map((j) => (
              <li
                key={`${j.fakultas}-${j.jurusan}`}
                className="rounded-md border border-slate-200 p-2 dark:border-slate-800"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium" title={j.jurusan}>
                    {j.jurusan || "—"}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-slate-500">n={j.peserta}</span>
                </div>
                <div className="text-xs text-slate-500">{j.fakultas}</div>
                <div className="mt-1 flex items-center justify-between text-xs tabular-nums">
                  <span>
                    {j.rataRataPre.toFixed(1)} → {j.rataRataPost.toFixed(1)}
                  </span>
                  <span className="font-semibold">N-Gain {j.rataRataNGain.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
