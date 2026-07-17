import type { Metadata } from "next";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getMonthTotals,
  getMonthlySeries,
  getExpenseByCategory,
  getHighestSpendingCategory,
  listTransactions,
} from "@/lib/queries";
import {
  formatLKR,
  currentMonth,
  monthLabel,
  isValidMonth,
  lastMonths,
  cx,
} from "@/lib/utils";
import { PageHeader, StatCard, Card } from "@/components/stat-card";
import { MonthPicker } from "@/components/month-picker";
import { EmptyState } from "@/components/ui";
import {
  IncomeExpenseChart,
  ExpenseDonut,
  BalanceArea,
  DONUT_COLORS,
} from "@/components/charts";

export const metadata: Metadata = { title: "Reports" };

function prevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <span>No prior data</span>;
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 font-semibold",
        up ? "text-emerald-300" : "text-rose-300",
      )}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(Math.round(pct))}% vs last month
    </span>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonth(rawMonth) ? rawMonth : currentMonth();
  const prev = prevMonth(month);

  const [totals, prevTotals, series, categorySpend, highest, monthTx] =
    await Promise.all([
      getMonthTotals(user.id, month),
      getMonthTotals(user.id, prev),
      getMonthlySeries(user.id, lastMonths(6)),
      getExpenseByCategory(user.id, month),
      getHighestSpendingCategory(user.id, month),
      listTransactions(user.id, { month, limit: 500 }),
    ]);

  const savings = totals.income - totals.expense;
  const savingsRate =
    totals.income > 0 ? Math.round((savings / totals.income) * 100) : 0;
  const spendTotal = categorySpend.reduce((s, c) => s + c.value, 0);

  // cumulative net savings across the 6-month window
  let running = 0;
  const balanceSeries = series.map((p) => {
    running += p.income - p.expense;
    return { month: p.month, balance: running };
  });

  const daysInMonth = new Date(
    Number(month.split("-")[0]),
    Number(month.split("-")[1]),
    0,
  ).getDate();
  const avgDaily = totals.expense / daysInMonth;

  return (
    <div>
      <PageHeader
        title="Reports & analytics"
        description="Understand your money with visual breakdowns."
        actions={<MonthPicker value={month} basePath="/reports" />}
      />

      {/* stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label={`Income · ${monthLabel(month)}`}
          value={formatLKR(totals.income)}
          tone="emerald"
          sub={<Delta current={totals.income} previous={prevTotals.income} />}
        />
        <StatCard
          icon={TrendingDown}
          label={`Expenses · ${monthLabel(month)}`}
          value={formatLKR(totals.expense)}
          tone="zinc"
          index={1}
          sub={<Delta current={totals.expense} previous={prevTotals.expense} />}
        />
        <StatCard
          icon={PiggyBank}
          label="Net savings"
          value={formatLKR(savings)}
          tone={savings >= 0 ? "emerald" : "rose"}
          index={2}
          sub={`${savingsRate}% savings rate`}
        />
        <StatCard
          icon={Flame}
          label="Highest spending category"
          value={highest ? highest.name : "—"}
          tone="rose"
          index={3}
          sub={highest ? `${formatLKR(highest.value)} spent` : "No expenses"}
        />
      </div>

      {/* charts row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card
          title="Income vs expenses"
          subtitle="Monthly comparison · last 6 months"
          index={2}
          className="lg:col-span-3"
          actions={
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-600" /> Expenses
              </span>
            </div>
          }
        >
          <div className="px-4 py-5">
            <IncomeExpenseChart data={series} />
          </div>
        </Card>

        <Card
          title="Expense categories"
          subtitle={monthLabel(month)}
          index={3}
          className="lg:col-span-2"
        >
          {categorySpend.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<TrendingDown className="h-5 w-5" />}
                title="No expenses this month"
                hint="Record expenses to see the category breakdown."
              />
            </div>
          ) : (
            <div className="px-6 py-5">
              <ExpenseDonut data={categorySpend.slice(0, 7)} />
              <ul className="mt-2 space-y-2.5">
                {categorySpend.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <span className="flex-1 truncate text-zinc-400">
                      {c.name}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {Math.round((c.value / spendTotal) * 100)}%
                    </span>
                    <span className="font-display text-xs font-semibold text-zinc-200">
                      {formatLKR(c.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* charts row 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card
          title="Net savings trend"
          subtitle="Cumulative income − expenses over 6 months"
          index={4}
          className="lg:col-span-3"
        >
          <div className="px-4 py-5">
            <BalanceArea data={balanceSeries} />
          </div>
        </Card>

        <Card
          title={`Monthly report · ${monthLabel(month)}`}
          subtitle="Automated summary"
          index={5}
          className="lg:col-span-2"
        >
          <dl className="divide-y divide-line/60 px-6">
            {[
              ["Total income", formatLKR(totals.income), "text-emerald-300"],
              ["Total expenses", formatLKR(totals.expense), "text-zinc-100"],
              [
                "Savings",
                formatLKR(savings),
                savings >= 0 ? "text-emerald-300" : "text-rose-300",
              ],
              ["Savings rate", `${savingsRate}%`, "text-zinc-100"],
              [
                "Highest spending category",
                highest ? highest.name : "—",
                "text-zinc-100",
              ],
              [
                "Avg. daily spend",
                formatLKR(Math.round(avgDaily)),
                "text-zinc-100",
              ],
              [
                "Transactions recorded",
                String(monthTx.length),
                "text-zinc-100",
              ],
            ].map(([label, value, color]) => (
              <div
                key={label as string}
                className="flex items-center justify-between py-3.5"
              >
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className={`font-display text-sm font-semibold ${color}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
