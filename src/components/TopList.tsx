import type { TopEntry } from "@/types";

export function TopList({
  title,
  entries,
  emptyLabel,
}: {
  title: string;
  entries: TopEntry[];
  emptyLabel: string;
}) {
  return (
    <div className="card p-4">
      <h3 className="mb-3">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {entries.map((e, i) => (
            <li key={e.key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 font-mono text-xs text-brand-800 dark:bg-brand-900/40 dark:text-brand-100">
                  {i + 1}
                </span>
                <span className="truncate" title={e.label}>
                  {e.label}
                </span>
              </span>
              <span className="shrink-0 font-mono tabular-nums">{e.rataRataNGain.toFixed(3)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
