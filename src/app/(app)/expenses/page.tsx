import type { Metadata } from "next";
import {
  TrendingDown,
  CalendarDays,
  Flame,
  Receipt,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  listCategories,
  listTransactions,
  getMonthTotals,
  getHighestSpendingCategory,
} from "@/lib/queries";
import { PageHeader, StatCard, Card } from "@/components/stat-card";
import { AddTransactionButton } from "@/components/transaction-modal";
import { TransactionsTable } from "@/components/transactions-table";
import { formatLKR, currentMonth, monthLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const user = await requireUser();
  const month = currentMonth();

  const [transactions, categories, monthTotals, topCategory] =
    await Promise.all([
      listTransactions(user.id, { type: "EXPENSE" }),
      listCategories(user.id),
      getMonthTotals(user.id, month),
      getHighestSpendingCategory(user.id, month),
    ]);

  const totalExpense = transactions.reduce((s, t) => s + t.amount, 0);

  const currentYear = new Date().getFullYear();
  const thisYear = transactions
    .filter((t) => t.date.startsWith(String(currentYear)))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Food, transport, bills and everything you spend on."
        actions={
          <AddTransactionButton categories={categories} fixedType="EXPENSE" />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="Total expenses"
          value={formatLKR(totalExpense)}
          tone="zinc"
          sub="All time"
        />
        <StatCard
          icon={CalendarDays}
          label={`Spent · ${monthLabel(month)}`}
          value={formatLKR(monthTotals.expense)}
          tone="white"
          index={1}
          sub="This month"
        />
        <StatCard
          icon={TrendingDown}
          label={`Spent in ${currentYear}`}
          value={formatLKR(thisYear)}
          tone="zinc"
          index={2}
          sub="Year to date"
        />
        <StatCard
          icon={Flame}
          label="Highest category"
          value={topCategory ? topCategory.name : "—"}
          tone="rose"
          index={3}
          sub={
            topCategory
              ? `${formatLKR(topCategory.value)} this month`
              : "No spending this month"
          }
        />
      </div>

      <div className="mt-6">
        <Card
          title="Expense history"
          subtitle="Search and manage your daily spending"
          index={4}
        >
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
