"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { savingGoals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "./transactions";

function parseMoney(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000_000_000) return null;
  return Math.round(n * 100) / 100;
}

function parseOptionalDate(raw: string): string | null | undefined {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  return raw;
}

export async function createGoalAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const target = parseMoney(String(formData.get("targetAmount") ?? ""));
  const currentRaw = String(formData.get("currentAmount") ?? "").trim();
  const current = currentRaw ? parseMoney(currentRaw) : 0;
  const deadline = parseOptionalDate(String(formData.get("deadline") ?? ""));

  if (!title || title.length > 120)
    return { ok: false, error: "A goal title is required." };
  if (!target) return { ok: false, error: "Enter a valid target amount." };
  if (current === null)
    return { ok: false, error: "Enter a valid starting amount." };
  if (deadline === undefined)
    return { ok: false, error: "Enter a valid deadline date." };

  await db.insert(savingGoals).values({
    userId: user.id,
    title,
    targetAmount: target,
    currentAmount: Math.min(current ?? 0, target),
    deadline,
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true, message: "Savings goal created." };
}

export async function updateGoalAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const target = parseMoney(String(formData.get("targetAmount") ?? ""));
  const deadline = parseOptionalDate(String(formData.get("deadline") ?? ""));

  if (!id) return { ok: false, error: "Missing goal id." };
  if (!title || title.length > 120)
    return { ok: false, error: "A goal title is required." };
  if (!target) return { ok: false, error: "Enter a valid target amount." };
  if (deadline === undefined)
    return { ok: false, error: "Enter a valid deadline date." };

  await db
    .update(savingGoals)
    .set({
      title,
      targetAmount: target,
      deadline,
      currentAmount: sql`LEAST(${savingGoals.currentAmount}, ${target})`,
    })
    .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true, message: "Goal updated." };
}

export async function addFundsAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const amount = parseMoney(String(formData.get("amount") ?? ""));
  const direction = String(formData.get("direction") ?? "add");

  if (!id) return { ok: false, error: "Missing goal id." };
  if (!amount) return { ok: false, error: "Enter a valid amount." };

  const delta = direction === "withdraw" ? -amount : amount;

  await db
    .update(savingGoals)
    .set({
      currentAmount: sql`GREATEST(LEAST(${savingGoals.currentAmount} + ${delta}, ${savingGoals.targetAmount}), 0)`,
    })
    .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: direction === "withdraw" ? "Funds withdrawn." : "Funds added.",
  };
}

export async function deleteGoalAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) return { ok: false, error: "Missing goal id." };

  await db
    .delete(savingGoals)
    .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true, message: "Goal deleted." };
}
