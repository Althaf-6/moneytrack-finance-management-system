"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2, Wallet } from "lucide-react";
import { Modal, Spinner } from "@/components/ui";
import { upsertBudgetAction, deleteBudgetAction } from "@/actions/budgets";

export function BudgetForm({
  month,
  currentLimit,
}: {
  month: string;
  currentLimit: number | null;
}) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await upsertBudgetAction(fd);
      if (res.ok) toast.success(res.message ?? "Budget saved.");
      else toast.error(res.error ?? "Could not save budget.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="w-[170px]">
        <label htmlFor="budget-month" className="field-label">
          Month
        </label>
        <input
          id="budget-month"
          name="month"
          type="month"
          required
          defaultValue={month}
          className="field-input"
        />
      </div>
      <div className="min-w-[180px] flex-1">
        <label htmlFor="budget-limit" className="field-label">
          Spending limit (LKR)
        </label>
        <input
          id="budget-limit"
          name="monthlyLimit"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="50000"
          defaultValue={currentLimit ?? ""}
          className="field-input"
        />
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? (
          <>
            <Spinner /> Saving…
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            {currentLimit ? "Update budget" : "Set budget"}
          </>
        )}
      </button>
    </form>
  );
}

export function DeleteBudgetButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const res = await deleteBudgetAction(id);
      if (res.ok) {
        toast.success(res.message ?? "Budget removed.");
        setOpen(false);
      } else {
        toast.error(res.error ?? "Could not delete budget.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="icon-btn danger"
        aria-label="Delete budget"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Remove budget"
        subtitle="Your spending history stays intact."
      >
        <p className="text-sm text-zinc-400">
          Remove this monthly spending limit?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={isPending}
            className="btn-primary !bg-rose-400 !text-rose-950 hover:!bg-rose-300"
          >
            {isPending ? (
              <>
                <Spinner /> Removing…
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </Modal>
    </>
  );
}
