import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { Dataset, FakultasAggregate, KPI } from "@/types";
import { LPJReport } from "./LPJReport";
import { dict } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";

export function PdfExportButton({
  dataset,
  kpi,
  fakultas,
}: {
  dataset: Dataset;
  kpi: KPI;
  fakultas: FakultasAggregate[];
}) {
  const language = useAppStore((s) => s.language);
  const t = dict(language);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      const blob = await pdf(
        <LPJReport dataset={dataset} kpi={kpi} fakultas={fakultas} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LPJ-${dataset.language}-${dataset.createdAt.slice(0, 10)}.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={onClick}
      disabled={busy}
      data-testid="export-pdf"
    >
      {busy ? `${t.upload.processing}` : t.actions.exportPdf}
    </button>
  );
}
