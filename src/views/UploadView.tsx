import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UploadPanel } from "@/components/UploadPanel";
import { dict } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";

export function UploadView() {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  return (
    <ErrorBoundary fallbackTitle={t.errors.boundaryTitle} retryLabel={t.errors.boundaryRetry}>
      <h2 className="mb-4">{t.nav.upload}</h2>
      <UploadPanel />
    </ErrorBoundary>
  );
}
