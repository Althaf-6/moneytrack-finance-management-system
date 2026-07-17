"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "./transactions";

export async function upsertBudgetAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const month = String(formData.get("month") ?? "");
  const limit = Number(formData.get("monthlyLimit"));

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    return { ok: false, error: "Choose a valid month." };
  if (!Number.isFinite(limit) || limit <= 0 || limit > 1_000_000_000_000)
    return { ok: false, error: "Enter a valid budget limit greater than 0." };

  await db
    .insert(budgets)
    .values({
      userId: user.id,
      month,
      monthlyLimit: Math.round(limit * 100) / 100,
    })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.month],
      set: { monthlyLimit: Math.round(limit * 100) / 100 },
    });

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { ok: true, message: "Budget saved." };
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) return { ok: false, error: "Missing budget id." };

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, user.id)));

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { ok: true, message: "Budget removed." };
}
