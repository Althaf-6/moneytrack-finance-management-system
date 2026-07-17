"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

function revalidateFinancePaths() {
  for (const p of [
    "/dashboard",
    "/transactions",
    "/income",
    "/expenses",
    "/budget",
    "/goals",
    "/reports",
  ]) {
    revalidatePath(p);
  }
}

function parseAmount(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000_000_000) return null;
  return Math.round(n * 100) / 100;
}

function parseDate(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : raw;
}

async function ownedCategoryId(
  userId: string,
  type: "INCOME" | "EXPENSE",
  raw: string,
): Promise<string | null> {
  if (!raw) return null;
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, raw),
        eq(categories.userId, userId),
        eq(categories.type, type),
      ),
    )
    .limit(1);
  return cat?.id ?? null;
}

export async function createTransactionAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const type = typeRaw === "INCOME" ? "INCOME" : typeRaw === "EXPENSE" ? "EXPENSE" : null;
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const date = parseDate(String(formData.get("date") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = await ownedCategoryId(
    user.id,
    type ?? "EXPENSE",
    String(formData.get("categoryId") ?? ""),
  );

  if (!title || title.length > 120)
    return { ok: false, error: "A title is required (max 120 characters)." };
  if (!type) return { ok: false, error: "Choose a transaction type." };
  if (!amount) return { ok: false, error: "Enter a valid amount greater than 0." };
  if (!date) return { ok: false, error: "Enter a valid date." };

  await db.insert(transactions).values({
    userId: user.id,
    title,
    type,
    amount,
    date,
    description,
    categoryId,
  });

  revalidateFinancePaths();
  return {
    ok: true,
    message: type === "INCOME" ? "Income added." : "Expense added.",
  };
}

export async function updateTransactionAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const type = typeRaw === "INCOME" ? "INCOME" : typeRaw === "EXPENSE" ? "EXPENSE" : null;
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const date = parseDate(String(formData.get("date") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!id) return { ok: false, error: "Missing transaction id." };
  if (!title || title.length > 120)
    return { ok: false, error: "A title is required (max 120 characters)." };
  if (!type) return { ok: false, error: "Choose a transaction type." };
  if (!amount) return { ok: false, error: "Enter a valid amount greater than 0." };
  if (!date) return { ok: false, error: "Enter a valid date." };

  const categoryId = await ownedCategoryId(
    user.id,
    type,
    String(formData.get("categoryId") ?? ""),
  );

  const updated = await db
    .update(transactions)
    .set({ title, type, amount, date, description, categoryId })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    .returning({ id: transactions.id });

  if (!updated.length) return { ok: false, error: "Transaction not found." };

  revalidateFinancePaths();
  return { ok: true, message: "Transaction updated." };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) return { ok: false, error: "Missing transaction id." };

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  revalidateFinancePaths();
  return { ok: true, message: "Transaction deleted." };
}
