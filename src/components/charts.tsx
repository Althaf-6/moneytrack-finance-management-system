"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatLKR, formatCompact, shortMonthLabel } from "@/lib/utils";

export type SeriesPoint = { month: string; income: number; expense: number };

const tooltipBase: React.CSSProperties = {
  background: "#101013",
  border: "1px solid #202027",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBase}>
      {label ? (
        <p className="mb-1.5 font-semibold text-zinc-200">{label}</p>
      ) : null}
      {payload.map((p) => (
        <p
          key={p.name}
          className="flex items-center gap-2 capitalize text-zinc-400"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color ?? "#34d399" }}
          />
          {p.name}:{" "}
          <span className="font-semibold text-zinc-100">
            {formatLKR(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

const axisStyle = {
  fill: "#71717a",
  fontSize: 12,
} as const;

/* ---------------- Income vs Expense bars ---------------- */

export function IncomeExpenseChart({ data }: { data: SeriesPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: shortMonthLabel(d.month),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barGap={6} margin={{ top: 8, right: 4 }}>
        <CartesianGrid
          strokeDasharray="3 6"
          stroke="#1c1c22"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={axisStyle}
          axisLine={{ stroke: "#202027" }}
          tickLine={false}
        />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
          width={52}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar
          name="Income"
          dataKey="income"
          fill="#10b981"
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
        />
        <Bar
          name="Expense"
          dataKey="expense"
          fill="#3f3f46"
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Expense donut ---------------- */

export const DONUT_COLORS = [
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#047857",
  "#71717a",
  "#3f3f46",
  "#27272a",
];

export function ExpenseDonut({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Balance area ---------------- */

export function BalanceArea({
  data,
}: {
  data: Array<{ month: string; balance: number }>;
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: shortMonthLabel(d.month),
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 4 }}>
        <defs>
          <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 6"
          stroke="#1c1c22"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={axisStyle}
          axisLine={{ stroke: "#202027" }}
          tickLine={false}
        />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
          width={52}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2f2f38" }} />
        <Area
          name="Net savings"
          type="monotone"
          dataKey="balance"
          stroke="#34d399"
          strokeWidth={2.5}
          fill="url(#bal)"
          dot={false}
          activeDot={{ r: 4, fill: "#34d399", stroke: "#0a0a0c" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
