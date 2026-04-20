import type { KPI } from "@/types";
import { dict } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";

export function KPICards({ kpi }: { kpi: KPI }) {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const items: Array<{ label: string; value: string; hint?: string }> = [
    { label: t.kpi.jumlahPeserta, value: kpi.jumlahPeserta.toString() },
    { label: t.kpi.rataRataPre, value: kpi.rataRataPre.toFixed(2) },
    { label: t.kpi.rataRataPost, value: kpi.rataRataPost.toFixed(2) },
    { label: t.kpi.rataRataGain, value: kpi.rataRataGain.toFixed(2) },
    { label: t.kpi.rataRataNGain, value: kpi.rataRataNGain.toFixed(3) },
    { label: t.kpi.kelulusan, value: `${kpi.kelulusanPercent.toFixed(1)}%` },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="card p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">{it.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{it.value}</dd>
        </div>
      ))}
    </div>
  );
}
