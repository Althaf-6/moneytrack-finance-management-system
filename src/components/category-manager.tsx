"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown } from "lucide-react";
import { Modal, Spinner, EmptyState } from "@/components/ui";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/categories";
import type { CategoryRow, TxType } from "@/lib/queries";

export type CategoryWithCount = CategoryRow & { count: number };

export function CategoryPanel({
  type,
  categories,
}: {
  type: TxType;
  categories: CategoryWithCount[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);

  const income = type === "INCOME";

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("type", type);
    startTransition(async () => {
      const res = await createCategoryAction(fd);
      if (res.ok) {
        toast.success(res.message ?? "Category created.");
        form.reset();
      } else {
        toast.error(res.error ?? "Could not create category.");
      }
    });
  }

  function onUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editing) fd.set("id", editing.id);
    startTransition(async () => {
      const res = await updateCategoryAction(fd);
      if (res.ok) {
        toast.success(res.message ?? "Category updated.");
        setEditing(null);
      } else {
        toast.error(res.error ?? "Could not update category.");
      }
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(deleting.id);
      if (res.ok) {
        toast.success(res.message ?? "Category deleted.");
        setDeleting(null);
      } else {
        toast.error(res.error ?? "Could not delete category.");
      }
    });
  }

  return (
    <div>
      <form onSubmit={onCreate} className="flex gap-2 px-6 py-5">
        <input
          name="name"
          required
          maxLength={60}
          placeholder={income ? "e.g. Side hustle" : "e.g. Subscriptions"}
          className="field-input"
        />
        <button type="submit" disabled={isPending} className="btn-primary shrink-0">
          {isPending ? <Spinner /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="px-6 pb-6">
          <EmptyState
            icon={<Tag className="h-5 w-5" />}
            title={`No ${income ? "income" : "expense"} categories`}
            hint="Create one above to start organizing transactions."
          />
        </div>
      ) : (
        <ul className="divide-y divide-line/60 border-t border-line">
          {categories.map((c) => (
            <li
              key={c.id}
              className="group flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
            >
              <span
                className={
                  income
                    ? "grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"
                    : "grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-zinc-400"
                }
              >
                {income ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-zinc-100">
                {c.name}
              </span>
              <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
                {c.count} {c.count === 1 ? "entry" : "entries"}
              </span>
              <div className="flex gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  className="icon-btn"
                  onClick={() => setEditing(c)}
                  aria-label={`Rename ${c.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  className="icon-btn danger"
                  onClick={() => setDeleting(c)}
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Rename category"
        subtitle="Existing transactions will keep this category."
      >
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="field-label">
              Category name
            </label>
            <input
              id="cat-name"
              name="name"
              required
              maxLength={60}
              defaultValue={editing?.name}
              className="field-input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete category"
        subtitle="Transactions will become uncategorized."
      >
        <p className="text-sm text-zinc-400">
          Delete <span className="font-semibold text-zinc-100">“{deleting?.name}”</span>?
          Its {deleting?.count ?? 0}{" "}
          {(deleting?.count ?? 0) === 1 ? "transaction" : "transactions"} will be
          kept but marked as uncategorized.
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
