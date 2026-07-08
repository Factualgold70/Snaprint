"use client";

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
import type { TrendPoint } from "@/lib/data/dashboard";
import { formatMoney } from "@/lib/format";

function formatMoneyNoDecimals(n: number) {
  const formatted = formatMoney(n);
  const parts = formatted.split(",");
  return parts[0];
}

export default function DashboardChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="viz-root rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <style>{`
        .viz-root {
          --surface-1: #fcfcfb;
          --text-secondary: #52514e;
          --muted: #898781;
          --gridline: #e1e0d9;
          --series-income: #008300;
          --series-expense: #e34948;
        }
        @media (prefers-color-scheme: dark) {
          .viz-root {
            --surface-1: #1a1a19;
            --text-secondary: #c3c2b7;
            --muted: #898781;
            --gridline: #2c2c2a;
            --series-income: #008300;
            --series-expense: #e66767;
          }
        }
      `}</style>
      <h2 className="mb-3 text-sm font-medium text-[#0b0b0b] dark:text-white">
        Income vs. expenses — last {data.length} months
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={16} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--gridline)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatMoney(Number(v))}
              width={64}
            />
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              contentStyle={{
                background: "var(--surface-1)",
                border: "1px solid var(--gridline)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
            <Bar dataKey="income" name="Income" fill="var(--series-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" name="Expenses" fill="var(--series-expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
