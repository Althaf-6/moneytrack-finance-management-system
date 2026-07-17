"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "./transactions";

function revalidateCategoryPaths() {
  for (const p of ["/categories", "/transactions", "/income", "/expenses"]) {
    revalidatePath(p);
  }
}

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const type = typeRaw === "INCOME" ? "INCOME" : "EXPENSE";

  if (!name || name.length > 60)
    return { ok: false, error: "A category name is required (max 60 characters)." };

  try {
    await db.insert(categories).values({ userId: user.id, name, type });
  } catch {
    return { ok: false, error: "That category already exists." };
  }

  revalidateCategoryPaths();
  return { ok: true, message: "Category created." };
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!id) return { ok: false, error: "Missing category id." };
  if (!name || name.length > 60)
    return { ok: false, error: "A category name is required (max 60 characters)." };

  try {
    await db
      .update(categories)
      .set({ name })
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)));
  } catch {
    return { ok: false, error: "That category already exists." };
  }

  revalidateCategoryPaths();
  return { ok: true, message: "Category updated." };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) return { ok: false, error: "Missing category id." };

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

  revalidateCategoryPaths();
  return { ok: true, message: "Category deleted." };
}
