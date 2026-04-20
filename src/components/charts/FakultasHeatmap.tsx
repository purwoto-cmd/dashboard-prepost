import type { FakultasAggregate } from "@/types";

function heatColor(v: number, min: number, max: number): string {
  if (max === min) return "hsl(210 40% 85%)";
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  // brand-50 → brand-700 approximate
  const hue = 212;
  const sat = 80;
  const light = 92 - 50 * t;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function FakultasHeatmap({ data }: { data: FakultasAggregate[] }) {
  const posts = data.map((d) => d.rataRataPost);
  const min = Math.min(...posts, 0);
  const max = Math.max(...posts, 1);
  return (
    <div className="card p-4" role="figure" aria-label="Heatmap Fakultas">
      <h3 className="mb-3">Heatmap Fakultas (rata-rata posttest)</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map((d) => (
          <div
            key={d.fakultas}
            className="rounded-lg p-3 text-slate-900"
            style={{ backgroundColor: heatColor(d.rataRataPost, min, max) }}
            title={`${d.fakultas} — pre ${d.rataRataPre.toFixed(1)} → post ${d.rataRataPost.toFixed(
              1,
            )} · N-Gain ${d.rataRataNGain.toFixed(2)}`}
          >
            <div className="truncate text-xs font-semibold">{d.fakultas || "—"}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {d.rataRataPost.toFixed(1)}
            </div>
            <div className="text-xs opacity-80">n = {d.peserta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
