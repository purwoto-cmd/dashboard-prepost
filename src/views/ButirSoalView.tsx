import { useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ButirSoalTable } from "@/components/ButirSoalTable";
import { dict } from "@/i18n";
import { currentDataset, useAppStore } from "@/store/useAppStore";
import { computePsikometri } from "@/lib/analytics";

export function ButirSoalView() {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const data = useAppStore(currentDataset);
  const summary = useMemo(() => {
    if (!data) return null;
    return computePsikometri({
      soalIds: data.soalIds,
      kunci: data.kunci,
      students: data.students,
      preResponses: data.preResponses,
      postResponses: data.postResponses,
    });
  }, [data]);
  if (!data || !summary) return <p className="text-sm text-slate-500">{t.dashboard.noData}</p>;
  return (
    <ErrorBoundary fallbackTitle={t.errors.boundaryTitle} retryLabel={t.errors.boundaryRetry}>
      <h2 className="mb-4">{t.nav.butirSoal}</h2>
      <ButirSoalTable summary={summary} />
    </ErrorBoundary>
  );
}
