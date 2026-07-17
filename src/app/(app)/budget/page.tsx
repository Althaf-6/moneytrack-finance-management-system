import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, and } from "drizzle-orm";
import { Wallet, Gauge, CalendarDays } from "lucide-react";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getMonthTotals } from "@/lib/queries";
import {
  formatLKR,
  currentMonth,
  monthLabel,
  isValidMonth,
  cx,
} from "@/lib/utils";
import { PageHeader, Card } from "@/components/stat-card";
import { ProgressBar, EmptyState } from "@/components/ui";
import { MonthPicker } from "@/components/month-picker";
import { BudgetForm, DeleteBudgetButton } from "@/components/budget-manager";

export const metadata: Metadata = { title: "Budget" };

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const { month: rawMonth } = await searchParams;
  const month = isValidMonth(rawMonth) ? rawMonth : currentMonth();

  const [budgetForMonth, monthTotals, allBudgets] = await Promise.all([
    db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, user.id), eq(budgets.month, month)))
      .limit(1),
    getMonthTotals(user.id, month),
    db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, user.id))
      .orderBy(desc(budgets.month))
      .limit(12),
  ]);

  const budget = budgetForMonth[0] ?? null;

  const history = await Promise.all(
    allBudgets.map(async (b) => {
      const t = await getMonthTotals(user.id, b.month);
      return { ...b, spent: t.expense };
    }),
  );

  const spent = monthTotals.expense;
  const pct = budget ? (spent / budget.monthlyLimit) * 100 : 0;
  const remaining = budget ? budget.monthlyLimit - spent : 0;

  return (
    <div>
      <PageHeader
        title="Budget"
        description="Set a monthly spending limit and track your pace."
        actions={<MonthPicker value={month} basePath="/budget" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* main status */}
        <Card
          title={`Monthly budget · ${monthLabel(month)}`}
          index={0}
          className="relative lg:col-span-3"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-500/[0.08] blur-3xl"
          />
          {budget ? (
            <div className="relative px-6 py-6">
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Remaining
              </p>
              <p
                className={cx(
                  "mt-1 font-display text-4xl font-bold tracking-tight",
                  remaining < 0 ? "text-rose-300" : "text-white",
                )}
              >
                {remaining < 0
                  ? `− ${formatLKR(Math.abs(remaining))}`
                  : formatLKR(remaining)}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-line bg-white/[0.02] p-4">
                {[
                  ["Limit", formatLKR(budget.monthlyLimit), "text-zinc-100"],
                  ["Spent", formatLKR(spent), "text-zinc-100"],
                  [
                    "Used",
                    `${Math.round(pct)}%`,
                    pct >= 100
                      ? "text-rose-300"
                      : pct >= 75
                        ? "text-amber-300"
                        : "text-emerald-300",
                  ],
                ].map(([label, value, color]) => (
                  <div key={label as string}>
                    <p className="text-[11px] tracking-wider text-zinc-500 uppercase">
                      {label}
                    </p>
                    <p
                      className={`mt-1 font-display text-base font-semibold ${color}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <ProgressBar value={pct} className="!h-3" />
                <p className="mt-3 text-sm text-zinc-500">
                  {pct >= 100 ? (
                    <span className="font-medium text-rose-300">
                      You are over budget by{" "}
                      {formatLKR(spent - budget.monthlyLimit)} this month.
                    </span>
                  ) : pct >= 75 ? (
                    <span className="font-medium text-amber-300">
                      Careful — {Math.round(pct)}% of your budget is already
                      spent.
                    </span>
                  ) : (
                    <>
                      Nice pace. You have used {Math.round(pct)}% of your{" "}
                      {monthLabel(month)} budget.
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={<Gauge className="h-5 w-5" />}
                title={`No budget for ${monthLabel(month)}`}
                hint="Set a monthly limit using the form and MoneyTrack will track your spending against it."
              />
            </div>
          )}
        </Card>

        {/* form */}
        <Card
          title={budget ? "Update budget" : "Create budget"}
          subtitle="Pick a month and a limit"
          index={1}
          className="lg:col-span-2"
        >
          <div className="px-6 py-6">
            <BudgetForm
              month={month}
              currentLimit={budget?.monthlyLimit ?? null}
            />
            <div className="mt-6 rounded-2xl border border-line bg-white/[0.02] p-4">
              <p className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-500">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                A good rule of thumb: keep monthly spending below 70% of your
                income and route the rest to a savings goal.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* history */}
      <div className="mt-6">
        <Card
          title="Budget history"
          subtitle="Limits and actual spending by month"
          index={2}
        >
          {history.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CalendarDays className="h-5 w-5" />}
                title="No budgets yet"
                hint="Your monthly budgets will appear here once you create them."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs tracking-wider text-zinc-500 uppercase">
                    <th className="px-6 py-3.5 font-medium">Month</th>
                    <th className="px-4 py-3.5 font-medium">Limit</th>
                    <th className="px-4 py-3.5 font-medium">Spent</th>
                    <th className="px-4 py-3.5 font-medium">Progress</th>
                    <th className="px-4 py-3.5 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => {
                    const p = (b.spent / b.monthlyLimit) * 100;
                    return (
                      <tr
                        key={b.id}
                        className={cx(
                          "group border-b border-line/60 last:border-0 transition-colors hover:bg-white/[0.02]",
                          b.month === month && "bg-emerald-400/[0.04]",
                        )}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/budget?month=${b.month}`}
                            className="font-medium text-zinc-100 transition-colors hover:text-emerald-300"
                          >
                            {monthLabel(b.month)}
                          </Link>
                          {b.month === month && (
                            <span className="ml-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                              Viewing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-zinc-300">
                          {formatLKR(b.monthlyLimit)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-zinc-300">
                          {formatLKR(b.spent)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <ProgressBar value={p} className="max-w-[160px]" />
                            <span
                              className={cx(
                                "w-10 text-xs font-semibold",
                                p >= 100
                                  ? "text-rose-300"
                                  : p >= 75
                                    ? "text-amber-300"
                                    : "text-emerald-300",
                              )}
                            >
                              {Math.round(p)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <DeleteBudgetButton id={b.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
