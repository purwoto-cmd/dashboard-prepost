import { useMemo, useState } from "react";
import type { PsikometriSummary } from "@/types";
import { dict } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";

export function ButirSoalTable({ summary }: { summary: PsikometriSummary }) {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const [selected, setSelected] = useState<string | null>(summary.items[0]?.soalId ?? null);
  const item = useMemo(
    () => summary.items.find((i) => i.soalId === selected) ?? summary.items[0] ?? null,
    [summary.items, selected],
  );

  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
          {t.butirSoal.soal} · KR-20 {summary.kr20.toFixed(3)}
        </div>
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t.butirSoal.p}</th>
                <th className="px-3 py-2">{t.butirSoal.d}</th>
                <th className="px-3 py-2">{t.butirSoal.rpb}</th>
              </tr>
            </thead>
            <tbody>
              {summary.items.map((it) => {
                const sel = item?.soalId === it.soalId;
                return (
                  <tr
                    key={it.soalId}
                    onClick={() => setSelected(it.soalId)}
                    className={`cursor-pointer border-t border-slate-100 dark:border-slate-800 ${
                      sel
                        ? "bg-brand-50 dark:bg-brand-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    data-testid={`soal-row-${it.soalId}`}
                  >
                    <td className="px-3 py-1.5 font-mono">{it.soalId}</td>
                    <td className="px-3 py-1.5 tabular-nums">{it.p.toFixed(2)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{it.d.toFixed(2)}</td>
                    <td className="px-3 py-1.5 tabular-nums">{it.rpb.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-4">
        {item ? (
          <>
            <div className="flex items-baseline justify-between">
              <h3>
                {t.butirSoal.soal} {item.soalId}
              </h3>
              <span className="text-sm text-slate-500">
                {t.butirSoal.kunci}:{" "}
                <span className="font-mono font-semibold">{item.kunci || "—"}</span>
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <Metric label={t.butirSoal.p} value={item.p.toFixed(2)} />
              <Metric label={t.butirSoal.d} value={item.d.toFixed(2)} />
              <Metric label={t.butirSoal.rpb} value={item.rpb.toFixed(2)} />
            </dl>
            <div className="mt-4">
              <h4 className="text-sm font-semibold">{t.butirSoal.opsiMerged}</h4>
              <ul className="mt-2 grid grid-cols-5 gap-2">
                {Object.entries(item.opsi)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([opt, count]) => (
                    <li
                      key={opt}
                      className={`rounded-md border p-2 text-center ${
                        opt === item.kunci
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="text-xs text-slate-500">{opt}</div>
                      <div className="font-mono font-semibold tabular-nums">{count}</div>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold">{t.butirSoal.distraktor}</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(item.distraktor)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([opt, share]) => (
                    <li key={opt} className="flex items-center gap-2">
                      <span className="w-6 font-mono">{opt}</span>
                      <div className="h-2 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-2 rounded bg-brand-500"
                          style={{ width: `${Math.min(100, share * 100).toFixed(1)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono tabular-nums text-xs">
                        {(share * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Belum ada butir soal.</p>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
