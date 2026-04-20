import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Dataset, FakultasAggregate, KPI } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  h2: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  muted: { color: "#555" },
  row: { flexDirection: "row" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  kpi: {
    width: "16.3%",
    padding: 6,
    border: "1pt solid #CBD5E1",
    borderRadius: 4,
  },
  kpiLabel: { fontSize: 7, color: "#555", textTransform: "uppercase" },
  kpiValue: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    fontWeight: 700,
  },
  tr: { flexDirection: "row", borderBottom: "0.5pt solid #CBD5E1" },
  td: { flex: 1, padding: 4 },
  tdNum: { flex: 1, padding: 4, textAlign: "right" },
  footer: { position: "absolute", bottom: 14, left: 28, right: 28, color: "#888", fontSize: 8 },
});

export interface LPJReportProps {
  dataset: Dataset;
  kpi: KPI;
  fakultas: FakultasAggregate[];
}

export function LPJReport({ dataset, kpi, fakultas }: LPJReportProps) {
  const ctx = dataset.language === "ar" ? "Bahasa Arab" : "Bahasa Inggris";
  const createdAt = new Date(dataset.createdAt).toLocaleString("id-ID");
  const kpiEntries: Array<[string, string]> = [
    ["Peserta", kpi.jumlahPeserta.toString()],
    ["Rata Pre", kpi.rataRataPre.toFixed(2)],
    ["Rata Post", kpi.rataRataPost.toFixed(2)],
    ["Gain", kpi.rataRataGain.toFixed(2)],
    ["N-Gain", kpi.rataRataNGain.toFixed(3)],
    ["Kelulusan", `${kpi.kelulusanPercent.toFixed(1)}%`],
  ];
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.h1}>Laporan LPJ · Program {ctx}</Text>
        <Text style={styles.muted}>Dibuat {createdAt}</Text>
        <Text style={styles.h2}>Ringkasan KPI</Text>
        <View style={styles.kpiRow}>
          {kpiEntries.map(([k, v]) => (
            <View style={styles.kpi} key={k}>
              <Text style={styles.kpiLabel}>{k}</Text>
              <Text style={styles.kpiValue}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.h2}>Per Fakultas</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.td}>Fakultas</Text>
          <Text style={styles.tdNum}>n</Text>
          <Text style={styles.tdNum}>Pre</Text>
          <Text style={styles.tdNum}>Post</Text>
          <Text style={styles.tdNum}>N-Gain</Text>
          <Text style={styles.tdNum}>Kelulusan %</Text>
        </View>
        {fakultas.map((f) => (
          <View key={f.fakultas || "__"} style={styles.tr} wrap={false}>
            <Text style={styles.td}>{f.fakultas || "—"}</Text>
            <Text style={styles.tdNum}>{f.peserta}</Text>
            <Text style={styles.tdNum}>{f.rataRataPre.toFixed(2)}</Text>
            <Text style={styles.tdNum}>{f.rataRataPost.toFixed(2)}</Text>
            <Text style={styles.tdNum}>{f.rataRataNGain.toFixed(3)}</Text>
            <Text style={styles.tdNum}>{f.kelulusanPercent.toFixed(1)}%</Text>
          </View>
        ))}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `LPJ ${ctx} — halaman ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
