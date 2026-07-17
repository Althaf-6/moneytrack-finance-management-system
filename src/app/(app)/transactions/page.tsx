import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listCategories, listTransactions, getTotals } from "@/lib/queries";
import { PageHeader, Card } from "@/components/stat-card";
import { AddTransactionButton } from "@/components/transaction-modal";
import { TransactionsTable } from "@/components/transactions-table";
import { formatLKR } from "@/lib/utils";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const user = await requireUser();
  const [transactions, categories, totals] = await Promise.all([
    listTransactions(user.id),
    listCategories(user.id),
    getTotals(user.id),
  ]);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every rupee in and out — searchable, editable, complete."
        actions={<AddTransactionButton categories={categories} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card px-5 py-4">
          <p className="text-xs tracking-wider text-zinc-500 uppercase">
            Total entries
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-white">
            {totals.count}
          </p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs tracking-wider text-zinc-500 uppercase">
            Money in
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-300">
            {formatLKR(totals.income)}
          </p>
        </div>
        <div className="card col-span-2 px-5 py-4 sm:col-span-1">
          <p className="text-xs tracking-wider text-zinc-500 uppercase">
            Money out
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-zinc-100">
            {formatLKR(totals.expense)}
          </p>
        </div>
      </div>

      <Card index={1}>
        <TransactionsTable
          transactions={transactions}
          categories={categories}
          enableSearch
          enableTypeFilter
        />
      </Card>
    </div>
  );
}
