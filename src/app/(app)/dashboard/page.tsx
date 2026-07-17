import type { Metadata } from "next";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { budgets, savingGoals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  getTotals,
  getMonthTotals,
  getMonthlySeries,
  getExpenseByCategory,
  listCategories,
  listTransactions,
} from "@/lib/queries";
import {
  formatLKR,
  currentMonth,
  monthLabel,
  lastMonths,
  formatDate,
  cx,
} from "@/lib/utils";
import { PageHeader, StatCard, Card } from "@/components/stat-card";
import { AddTransactionButton } from "@/components/transaction-modal";
import { IncomeExpenseChart, ExpenseDonut, DONUT_COLORS } from "@/components/charts";
import { ProgressBar, EmptyState } from "@/components/ui";
import { ReceiptText } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const month = currentMonth();

  const [
    totals,
    monthTotals,
    series,
    categorySpend,
    categories,
    recent,
    budgetRows,
    goals,
  ] = await Promise.all([
    getTotals(user.id),
    getMonthTotals(user.id, month),
    getMonthlySeries(user.id, lastMonths(6)),
    getExpenseByCategory(user.id, month),
    listCategories(user.id),
    listTransactions(user.id, { limit: 6 }),
    db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, user.id))
      .orderBy(desc(budgets.month))
      .limit(20),
    db
      .select()
      .from(savingGoals)
      .where(eq(savingGoals.userId, user.id))
      .orderBy(desc(savingGoals.createdAt))
      .limit(3),
  ]);

  const balance = totals.income - totals.expense;
  const savingsRate =
    totals.income > 0 ? Math.round((balance / totals.income) * 100) : 0;
  const spendTotal = categorySpend.reduce((s, c) => s + c.value, 0);
  const activeBudget = budgetRows.find((b) => b.month === month) ?? null;
  const budgetPct = activeBudget
    ? (monthTotals.expense / activeBudget.monthlyLimit) * 100
    : 0;

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={`Here's your financial picture for ${monthLabel(month)}.`}
        actions={<AddTransactionButton categories={categories} />}
      />

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total balance"
          value={formatLKR(balance)}
          tone="emerald"
          index={0}
          sub={<>Income − expenses · all time</>}
        />
        <StatCard
          icon={TrendingUp}
          label="Total income"
          value={formatLKR(totals.income)}
          tone="white"
          index={1}
          sub={<>+ {formatLKR(monthTotals.income)} this month</>}
        />
        <StatCard
          icon={TrendingDown}
          label="Total expenses"
          value={formatLKR(totals.expense)}
          tone="zinc"
          index={2}
          sub={<>− {formatLKR(monthTotals.expense)} this month</>}
        />
        <StatCard
          icon={PiggyBank}
          label="Savings"
          value={formatLKR(Math.max(balance, 0))}
          tone="emerald"
          index={3}
          sub={<>{savingsRate}% savings rate</>}
        />
      </div>

      {/* charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card
          title="Income vs expenses"
          subtitle="Last 6 months"
          index={1}
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
          title="Spending by category"
          subtitle={monthLabel(month)}
          index={2}
          className="lg:col-span-2"
        >
          {categorySpend.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<TrendingDown className="h-5 w-5" />}
                title="No spending yet"
                hint="Your expense categories will appear here once you record spending this month."
              />
            </div>
          ) : (
            <div className="px-6 py-5">
              <ExpenseDonut data={categorySpend.slice(0, 7)} />
              <ul className="mt-2 space-y-2.5">
                {categorySpend.slice(0, 5).map((c, i) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-2.5 text-sm"
                  >
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

      {/* bottom row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Recent transactions"
          index={3}
          className="lg:col-span-2"
          actions={
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ReceiptText className="h-5 w-5" />}
                title="No transactions yet"
                hint="Use the button above to record your first income or expense."
              />
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {recent.map((t) => {
                const income = t.type === "INCOME";
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
                  >
                    <span
                      className={cx(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        income
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-white/[0.05] text-zinc-400",
                      )}
                    >
                      {income ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {t.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {t.categoryName ?? "Uncategorized"} ·{" "}
                        {formatDate(t.date)}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "font-display text-sm font-semibold whitespace-nowrap",
                        income ? "text-emerald-300" : "text-zinc-200",
                      )}
                    >
                      {income ? "+" : "-"} {formatLKR(t.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          {/* budget snapshot */}
          <Card
            title={`Budget · ${monthLabel(month)}`}
            index={4}
            actions={
              <Link
                href="/budget"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {activeBudget ? (
              <div className="space-y-4 px-6 py-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Spent</p>
                    <p className="font-display text-xl font-bold text-white">
                      {formatLKR(monthTotals.expense)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Limit</p>
                    <p className="font-display text-sm font-semibold text-zinc-300">
                      {formatLKR(activeBudget.monthlyLimit)}
                    </p>
                  </div>
                </div>
                <ProgressBar value={budgetPct} />
                <p className="text-xs text-zinc-500">
                  {budgetPct >= 100 ? (
                    <span className="font-semibold text-rose-300">
                      Over budget by{" "}
                      {formatLKR(monthTotals.expense - activeBudget.monthlyLimit)}
                    </span>
                  ) : (
                    <>
                      {formatLKR(activeBudget.monthlyLimit - monthTotals.expense)}{" "}
                      remaining · {Math.round(budgetPct)}% used
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div className="px-6 py-5">
                <p className="text-sm text-zinc-500">
                  No budget set for this month.
                </p>
                <Link href="/budget" className="btn-ghost mt-4 !py-2 text-xs">
                  Set a monthly budget
                </Link>
              </div>
            )}
          </Card>

          {/* goals snapshot */}
          <Card
            title="Savings goals"
            index={5}
            actions={
              <Link
                href="/goals"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {goals.length === 0 ? (
              <div className="px-6 py-5">
                <p className="text-sm text-zinc-500">
                  Create a goal to start saving towards something.
                </p>
                <Link href="/goals" className="btn-ghost mt-4 !py-2 text-xs">
                  Create a goal
                </Link>
              </div>
            ) : (
              <ul className="space-y-4 px-6 py-5">
                {goals.map((g) => {
                  const pct = Math.round(
                    (g.currentAmount / g.targetAmount) * 100,
                  );
                  return (
                    <li key={g.id}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-2 truncate text-sm font-medium text-zinc-200">
                          <Target className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span className="truncate">{g.title}</span>
                        </span>
                        <span className="font-display text-xs font-semibold text-emerald-300">
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar value={pct} tone="emerald" />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
