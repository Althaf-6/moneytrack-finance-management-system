"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import { Modal, Spinner, TypeBadge, EmptyState } from "@/components/ui";
import { TransactionFormModal } from "@/components/transaction-modal";
import { deleteTransactionAction } from "@/actions/transactions";
import { formatLKR, formatDate, cx } from "@/lib/utils";
import type { CategoryRow, TxRow, TxType } from "@/lib/queries";

const PAGE = 10;

export function TransactionsTable({
  transactions,
  categories,
  enableSearch = false,
  enableTypeFilter = false,
}: {
  transactions: TxRow[];
  categories: CategoryRow[];
  enableSearch?: boolean;
  enableTypeFilter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TxType>("ALL");
  const [visible, setVisible] = useState(PAGE);
  const [editing, setEditing] = useState<TxRow | null>(null);
  const [deleting, setDeleting] = useState<TxRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.categoryName ?? "").toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });
  }, [transactions, query, typeFilter]);

  const rows = filtered.slice(0, visible);

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteTransactionAction(deleting.id);
      if (res.ok) {
        toast.success(res.message ?? "Deleted.");
        setDeleting(null);
      } else {
        toast.error(res.error ?? "Could not delete.");
      }
    });
  }

  return (
    <div>
      {(enableSearch || enableTypeFilter) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          {enableSearch && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE);
                }}
                placeholder="Search title, category, amount…"
                className="field-input !pl-10"
              />
            </div>
          )}
          {enableTypeFilter && (
            <div className="flex gap-1 rounded-xl border border-line bg-white/[0.03] p-1">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setVisible(PAGE);
                  }}
                  className={cx(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                    typeFilter === t
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-500 hover:text-zinc-200",
                  )}
                >
                  {t === "ALL" ? "All" : t === "INCOME" ? "Income" : "Expenses"}
                </button>
              ))}
            </div>
          )}
          <span className="ml-auto text-xs text-zinc-600">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<ReceiptText className="h-5 w-5" />}
            title={query ? "No matching transactions" : "No transactions yet"}
            hint={
              query
                ? "Try a different search term."
                : "Add your first transaction to see it here."
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wider text-zinc-500 uppercase">
                <th className="px-6 py-3.5 font-medium">Date</th>
                <th className="px-4 py-3.5 font-medium">Description</th>
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Type</th>
                <th className="px-4 py-3.5 text-right font-medium">Amount</th>
                <th className="px-4 py-3.5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const income = t.type === "INCOME";
                return (
                  <tr
                    key={t.id}
                    className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cx(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
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
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-100">
                            {t.title}
                          </p>
                          {t.description ? (
                            <p className="max-w-[240px] truncate text-xs text-zinc-500">
                              {t.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-zinc-400">
                      {t.categoryName ?? (
                        <span className="text-zinc-600">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <TypeBadge type={t.type} />
                    </td>
                    <td
                      className={cx(
                        "px-4 py-4 text-right font-display font-semibold whitespace-nowrap",
                        income ? "text-emerald-300" : "text-zinc-200",
                      )}
                    >
                      {income ? "+" : "-"} {formatLKR(t.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                        <button
                          className="icon-btn"
                          onClick={() => setEditing(t)}
                          aria-label="Edit transaction"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => setDeleting(t)}
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > visible && (
        <div className="border-t border-line px-6 py-4 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE)}
            className="btn-ghost !py-2 text-xs"
          >
            Show {Math.min(PAGE, filtered.length - visible)} more
          </button>
        </div>
      )}

      {editing && (
        <TransactionFormModal
          key={editing.id}
          open={!!editing}
          onClose={() => setEditing(null)}
          categories={categories}
          transaction={editing}
        />
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete transaction"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm text-zinc-400">
          Permanently delete{" "}
          <span className="font-semibold text-zinc-100">
            “{deleting?.title}”
          </span>{" "}
          ({deleting ? formatLKR(deleting.amount) : ""})?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setDeleting(null)} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isPending}
            className="btn-primary !bg-rose-400 !text-rose-950 hover:!bg-rose-300"
          >
            {isPending ? (
              <>
                <Spinner /> Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
