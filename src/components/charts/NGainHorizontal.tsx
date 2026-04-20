import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FakultasAggregate } from "@/types";

export function NGainHorizontal({ data }: { data: FakultasAggregate[] }) {
  const chartData = data
    .map((d) => ({
      fakultas: d.fakultas || "—",
      ngain: Number(d.rataRataNGain.toFixed(3)),
    }))
    .sort((a, b) => b.ngain - a.ngain);
  return (
    <div className="card p-4" role="figure" aria-label="N-Gain per Fakultas">
      <h3 className="mb-3">N-Gain per Fakultas</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-700"
            />
            <XAxis type="number" domain={[-1, 1]} />
            <YAxis type="category" dataKey="fakultas" width={140} />
            <Tooltip />
            <Bar dataKey="ngain" fill="#1c6ce0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
