import { useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JurusanBreakdown } from "@/components/JurusanBreakdown";
import { FakultasBarChart } from "@/components/charts/FakultasBarChart";
import { NGainHorizontal } from "@/components/charts/NGainHorizontal";
import { FakultasHeatmap } from "@/components/charts/FakultasHeatmap";
import { dict } from "@/i18n";
import { currentDataset, useAppStore } from "@/store/useAppStore";
import { aggregateByFakultas } from "@/lib/analytics";

export function FakultasView() {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const data = useAppStore(currentDataset);
  const fakultas = useMemo(
    () => (data ? aggregateByFakultas(data.students, data.passThreshold) : []),
    [data],
  );
  if (!data) return <p className="text-sm text-slate-500">{t.dashboard.noData}</p>;
  return (
    <ErrorBoundary fallbackTitle={t.errors.boundaryTitle} retryLabel={t.errors.boundaryRetry}>
      <h2 className="mb-4">{t.nav.fakultas}</h2>
      <FakultasHeatmap data={fakultas} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FakultasBarChart data={fakultas} />
        <NGainHorizontal data={fakultas} />
      </div>
      <div className="mt-4">
        <JurusanBreakdown data={fakultas} />
      </div>
    </ErrorBoundary>
  );
}
