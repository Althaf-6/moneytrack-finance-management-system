"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  HandCoins,
  CheckCircle2,
} from "lucide-react";
import { Modal, Spinner, ProgressBar } from "@/components/ui";
import {
  createGoalAction,
  updateGoalAction,
  addFundsAction,
  deleteGoalAction,
} from "@/actions/goals";
import { formatLKR, formatDate, cx } from "@/lib/utils";

export type GoalRow = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
};

/* ---------------- progress ring ---------------- */

function Ring({ pct }: { pct: number }) {
  const size = 76;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#1d1d24"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={clamped >= 100 ? "#10b981" : "#34d399"}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute font-display text-sm font-bold text-white">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

/* ---------------- add / edit modal ---------------- */

function GoalFormModal({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal?: GoalRow | null;
}) {
  const isEdit = !!goal;
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (isEdit && goal) fd.set("id", goal.id);
    startTransition(async () => {
      const res = isEdit
        ? await updateGoalAction(fd)
        : await createGoalAction(fd);
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
      title={isEdit ? "Edit goal" : "New savings goal"}
      subtitle={
        isEdit
          ? "Adjust your target or deadline."
          : "Give your savings a purpose and a target."
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-title" className="field-label">
            Goal title
          </label>
          <input
            id="goal-title"
            name="title"
            required
            maxLength={120}
            placeholder="Buy Laptop"
            defaultValue={goal?.title ?? ""}
            className="field-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="goal-target" className="field-label">
              Target (LKR)
            </label>
            <input
              id="goal-target"
              name="targetAmount"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="200000"
              defaultValue={goal?.targetAmount ?? ""}
              className="field-input"
            />
          </div>
          {!isEdit && (
            <div>
              <label htmlFor="goal-current" className="field-label">
                Already saved
              </label>
              <input
                id="goal-current"
                name="currentAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                className="field-input"
              />
            </div>
          )}
          <div className={cx(isEdit && "col-span-2")}>
            <label htmlFor="goal-deadline" className="field-label">
              Deadline{" "}
              <span className="font-normal text-zinc-600">(optional)</span>
            </label>
            <input
              id="goal-deadline"
              name="deadline"
              type="date"
              defaultValue={goal?.deadline ?? ""}
              className="field-input"
            />
          </div>
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
              "Create goal"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- funds modal ---------------- */

function FundsModal({
  goal,
  onClose,
}: {
  goal: GoalRow | null;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState<"add" | "withdraw">("add");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (goal) fd.set("id", goal.id);
    fd.set("direction", direction);
    startTransition(async () => {
      const res = await addFundsAction(fd);
      if (res.ok) {
        toast.success(res.message ?? "Done.");
        onClose();
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Modal
      open={!!goal}
      onClose={onClose}
      title={goal ? `Update “${goal.title}”` : "Update goal"}
      subtitle="Move money in or out of this goal."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white/[0.03] p-1">
          {(
            [
              ["add", "Add funds"],
              ["withdraw", "Withdraw"],
            ] as const
          ).map(([d, label]) => (
            <button
              type="button"
              key={d}
              onClick={() => setDirection(d)}
              className={cx(
                "rounded-lg py-2 text-sm font-semibold transition-all",
                direction === d
                  ? d === "add"
                    ? "bg-emerald-400 text-emerald-950"
                    : "bg-zinc-100 text-zinc-950"
                  : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="funds-amount" className="field-label">
            Amount (LKR)
          </label>
          <input
            id="funds-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="10000"
            className="field-input"
          />
        </div>
        {goal ? (
          <p className="text-xs text-zinc-500">
            Currently saved {formatLKR(goal.currentAmount)} of{" "}
            {formatLKR(goal.targetAmount)}.
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? (
              <>
                <Spinner /> Updating…
              </>
            ) : direction === "add" ? (
              "Add funds"
            ) : (
              "Withdraw"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- grid ---------------- */

export function GoalGrid({ goals }: { goals: GoalRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<GoalRow | null>(null);
  const [funding, setFunding] = useState<GoalRow | null>(null);
  const [deleting, setDeleting] = useState<GoalRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteGoalAction(deleting.id);
      if (res.ok) {
        toast.success(res.message ?? "Goal deleted.");
        setDeleting(null);
      } else {
        toast.error(res.error ?? "Could not delete goal.");
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((g, i) => {
          const pct =
            g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
          const done = pct >= 100;
          return (
            <article
              key={g.id}
              className="card group relative flex animate-fade-up flex-col overflow-hidden p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {done ? (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                  <CheckCircle2 className="h-3 w-3" /> Done
                </span>
              ) : null}
              <div className="flex items-start gap-4">
                <Ring pct={pct} />
                <div className="min-w-0 pt-1">
                  <h3 className="truncate font-display text-base font-semibold text-white">
                    {g.title}
                  </h3>
                  <p className="mt-1 font-display text-sm font-semibold text-emerald-300">
                    {formatLKR(g.currentAmount)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    of {formatLKR(g.targetAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <ProgressBar value={pct} tone="emerald" />
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    {formatLKR(Math.max(g.targetAmount - g.currentAmount, 0))}{" "}
                    to go
                  </span>
                  {g.deadline ? (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(g.deadline)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                <button
                  onClick={() => setFunding(g)}
                  className="btn-primary flex-1 !py-2 text-xs"
                >
                  <HandCoins className="h-3.5 w-3.5" />
                  Update funds
                </button>
                <button
                  onClick={() => setEditing(g)}
                  className="icon-btn border border-line"
                  aria-label={`Edit ${g.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(g)}
                  className="icon-btn danger border border-line"
                  aria-label={`Delete ${g.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}

        {/* add card */}
        <button
          onClick={() => setAdding(true)}
          className="group flex min-h-[220px] animate-fade-up flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-line text-zinc-500 transition-all hover:border-emerald-400/40 hover:text-emerald-300"
          style={{ animationDelay: `${goals.length * 60}ms` }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.03] transition-colors group-hover:border-emerald-400/30 group-hover:bg-emerald-400/10">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold">New savings goal</span>
        </button>
      </div>

      {adding && <GoalFormModal open={adding} onClose={() => setAdding(false)} />}
      {editing && (
        <GoalFormModal
          key={editing.id}
          open={!!editing}
          onClose={() => setEditing(null)}
          goal={editing}
        />
      )}
      <FundsModal goal={funding} onClose={() => setFunding(null)} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete goal"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm text-zinc-400">
          Permanently delete{" "}
          <span className="font-semibold text-zinc-100">
            “{deleting?.title}”
          </span>
          ? The money you tracked is not affected anywhere else.
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
    </>
  );
}
