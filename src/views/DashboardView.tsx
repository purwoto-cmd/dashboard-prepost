import { useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KPICards } from "@/components/KPICards";
import { FakultasBarChart } from "@/components/charts/FakultasBarChart";
import { NGainHorizontal } from "@/components/charts/NGainHorizontal";
import { FakultasHeatmap } from "@/components/charts/FakultasHeatmap";
import { TopList } from "@/components/TopList";
import { dict } from "@/i18n";
import { currentDataset, useAppStore } from "@/store/useAppStore";
import { aggregateByFakultas, computeKPI, topInstruktur, topMahasiswa } from "@/lib/analytics";
import { PdfExportButton } from "@/lib/pdf/PdfExportButton";

export function DashboardView() {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const data = useAppStore(currentDataset);

  const computed = useMemo(() => {
    if (!data) return null;
    const fakultas = aggregateByFakultas(data.students, data.passThreshold);
    const kpi = computeKPI(data.students, data.passThreshold);
    return {
      kpi,
      fakultas,
      topI: topInstruktur(data.students),
      topM: topMahasiswa(data.students),
    };
  }, [data]);

  if (!data || !computed) {
    return <p className="text-sm text-slate-500">{t.dashboard.noData}</p>;
  }

  return (
    <ErrorBoundary fallbackTitle={t.errors.boundaryTitle} retryLabel={t.errors.boundaryRetry}>
      <div className="mb-4 flex items-center justify-between">
        <h2>{t.nav.dashboard}</h2>
        <PdfExportButton dataset={data} kpi={computed.kpi} fakultas={computed.fakultas} />
      </div>
      <KPICards kpi={computed.kpi} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FakultasBarChart data={computed.fakultas} />
        <NGainHorizontal data={computed.fakultas} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FakultasHeatmap data={computed.fakultas} />
        </div>
        <TopList
          title={t.dashboard.topInstruktur}
          entries={computed.topI}
          emptyLabel={t.dashboard.noData}
        />
      </div>
      <div className="mt-4">
        <TopList
          title={t.dashboard.topMahasiswa}
          entries={computed.topM}
          emptyLabel={t.dashboard.noData}
        />
      </div>
    </ErrorBoundary>
  );
}
