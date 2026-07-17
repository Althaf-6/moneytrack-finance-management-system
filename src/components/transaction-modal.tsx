"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Modal, Spinner } from "@/components/ui";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/actions/transactions";
import { todayISO, cx } from "@/lib/utils";
import type { CategoryRow, TxRow, TxType } from "@/lib/queries";

function TypeSwitch({
  value,
  onChange,
}: {
  value: TxType;
  onChange: (t: TxType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white/[0.03] p-1">
      {(["EXPENSE", "INCOME"] as const).map((t) => (
        <button
          type="button"
          key={t}
          onClick={() => onChange(t)}
          className={cx(
            "rounded-lg py-2 text-sm font-semibold transition-all",
            value === t
              ? t === "INCOME"
                ? "bg-emerald-400 text-emerald-950"
                : "bg-zinc-100 text-zinc-950"
              : "text-zinc-500 hover:text-zinc-200",
          )}
        >
          {t === "INCOME" ? "Income" : "Expense"}
        </button>
      ))}
    </div>
  );
}

export function TransactionFormModal({
  open,
  onClose,
  categories,
  transaction,
  fixedType,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryRow[];
  transaction?: TxRow | null;
  fixedType?: TxType;
}) {
  const isEdit = !!transaction;
  const [type, setType] = useState<TxType>(
    transaction?.type ?? fixedType ?? "EXPENSE",
  );
  const [isPending, startTransition] = useTransition();

  const visibleCats = categories.filter((c) => c.type === type);
  const defaultCatValid = visibleCats.some(
    (c) => c.id === transaction?.categoryId,
  );

  const title = isEdit
    ? "Edit transaction"
    : fixedType === "INCOME"
      ? "Add income"
      : fixedType === "EXPENSE"
        ? "Add expense"
        : "Add transaction";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    if (isEdit && transaction) fd.set("id", transaction.id);

    startTransition(async () => {
      const res = isEdit
        ? await updateTransactionAction(fd)
        : await createTransactionAction(fd);
      if (res.ok) {
        toast.success(res.message ?? "Saved.");
        onClose();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={isEdit ? "Update the details of this entry." : "Record money in or out of your account."}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!fixedType && (
          <div>
            <span className="field-label">Type</span>
            <TypeSwitch value={type} onChange={setType} />
          </div>
        )}

        <div>
          <label htmlFor="tx-title" className="field-label">
            Title
          </label>
          <input
            id="tx-title"
            name="title"
            required
            maxLength={120}
            placeholder={
              type === "INCOME" ? "Monthly Salary" : "Internet Bill"
            }
            defaultValue={transaction?.title ?? ""}
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tx-amount" className="field-label">
              Amount (LKR)
            </label>
            <input
              id="tx-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="150000"
              defaultValue={transaction?.amount ?? ""}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="tx-date" className="field-label">
              Date
            </label>
            <input
              id="tx-date"
              name="date"
              type="date"
              required
              defaultValue={transaction?.date ?? todayISO()}
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tx-category" className="field-label">
            Category
          </label>
          <select
            id="tx-category"
            name="categoryId"
            key={type}
            defaultValue={defaultCatValid ? transaction?.categoryId ?? "" : ""}
            className="field-input"
          >
            <option value="">Uncategorized</option>
            {visibleCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-desc" className="field-label">
            Description{" "}
            <span className="font-normal text-zinc-600">(optional)</span>
          </label>
          <textarea
            id="tx-desc"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Add a note…"
            defaultValue={transaction?.description ?? ""}
            className="field-input resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? (
              <>
                <Spinner /> Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddTransactionButton({
  categories,
  fixedType,
  label,
  className,
}: {
  categories: CategoryRow[];
  fixedType?: TxType;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const defaultLabel =
    fixedType === "INCOME"
      ? "Add income"
      : fixedType === "EXPENSE"
        ? "Add expense"
        : "Add transaction";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cx("btn-primary", className)}
      >
        <Plus className="h-4 w-4" />
        {label ?? defaultLabel}
      </button>
      {open && (
        <TransactionFormModal
          open={open}
          onClose={() => setOpen(false)}
          categories={categories}
          fixedType={fixedType}
        />
      )}
    </>
  );
}
