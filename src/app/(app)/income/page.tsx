import type { Metadata } from "next";
import {
  TrendingUp,
  CalendarDays,
  Landmark,
  CircleDollarSign,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  listCategories,
  listTransactions,
  getMonthTotals,
} from "@/lib/queries";
import { PageHeader, StatCard, Card } from "@/components/stat-card";
import { AddTransactionButton } from "@/components/transaction-modal";
import { TransactionsTable } from "@/components/transactions-table";
import { formatLKR, currentMonth, monthLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Income" };

export default async function IncomePage() {
  const user = await requireUser();
  const month = currentMonth();

  const [transactions, categories, monthTotals] = await Promise.all([
    listTransactions(user.id, { type: "INCOME" }),
    listCategories(user.id),
    getMonthTotals(user.id, month),
  ]);

  const totalIncome = transactions.reduce((s, t) => s + t.amount, 0);

  const monthsActive = new Set(transactions.map((t) => t.date.slice(0, 7)))
    .size;
  const avgMonthly = monthsActive > 0 ? totalIncome / monthsActive : 0;

  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    const key = t.categoryName ?? "Uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + t.amount);
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <PageHeader
        title="Income"
        description="Salary, freelance work, business and investment returns."
        actions={
          <AddTransactionButton categories={categories} fixedType="INCOME" />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          label="Total income"
          value={formatLKR(totalIncome)}
          tone="emerald"
          sub="All time"
        />
        <StatCard
          icon={CalendarDays}
          label={`Income · ${monthLabel(month)}`}
          value={formatLKR(monthTotals.income)}
          tone="white"
          index={1}
          sub="This month"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly average"
          value={formatLKR(Math.round(avgMonthly))}
          tone="zinc"
          index={2}
          sub={
            monthsActive > 0
              ? `Across ${monthsActive} active ${
                  monthsActive === 1 ? "month" : "months"
                }`
              : "No data yet"
          }
        />
        <StatCard
          icon={Landmark}
          label="Top source"
          value={topCategory ? topCategory[0] : "—"}
          tone="white"
          index={3}
          sub={topCategory ? formatLKR(topCategory[1]) : "No income recorded"}
        />
      </div>

      <div className="mt-6">
        <Card title="Income history" subtitle="Every payment you've recorded" index={4}>
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            enableSearch
          />
        </Card>
      </div>
    </div>
  );
}
