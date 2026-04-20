import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UploadView } from "@/views/UploadView";
import { DashboardView } from "@/views/DashboardView";
import { FakultasView } from "@/views/FakultasView";
import { ButirSoalView } from "@/views/ButirSoalView";
import { assertUnreachable } from "@/lib/utils/exhaustive";
import { useAppStore } from "@/store/useAppStore";

export function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const view = useAppStore((s) => s.view);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Layout>
      <ErrorBoundary>{renderView(view)}</ErrorBoundary>
    </Layout>
  );
}

function renderView(v: ReturnType<typeof useAppStore.getState>["view"]) {
  switch (v) {
    case "upload":
      return <UploadView />;
    case "dashboard":
      return <DashboardView />;
    case "fakultas":
      return <FakultasView />;
    case "butir-soal":
      return <ButirSoalView />;
    default:
      return assertUnreachable(v);
  }
}
