import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FakultasAggregate } from "@/types";

export function FakultasBarChart({ data }: { data: FakultasAggregate[] }) {
  const chartData = data.map((d) => ({
    fakultas: d.fakultas || "—",
    pre: Number(d.rataRataPre.toFixed(2)),
    post: Number(d.rataRataPost.toFixed(2)),
  }));
  return (
    <div className="card p-4" role="figure" aria-label="Rata-rata Pre vs Post per Fakultas">
      <h3 className="mb-3">Rata-rata Pre vs Post per Fakultas</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis dataKey="fakultas" interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pre" name="Pretest" fill="#8dcaff" />
            <Bar dataKey="post" name="Posttest" fill="#1c6ce0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
