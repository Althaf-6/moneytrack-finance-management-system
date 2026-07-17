"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, categories } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  requireUser,
} from "@/lib/auth";

export type AuthFormState = { error: string | null };

const DEFAULT_CATEGORIES: Array<{ name: string; type: "INCOME" | "EXPENSE" }> =
  [
    { name: "Salary", type: "INCOME" },
    { name: "Business", type: "INCOME" },
    { name: "Freelance", type: "INCOME" },
    { name: "Investment", type: "INCOME" },
    { name: "Food", type: "EXPENSE" },
    { name: "Transport", type: "EXPENSE" },
    { name: "Shopping", type: "EXPENSE" },
    { name: "Bills", type: "EXPENSE" },
    { name: "Health", type: "EXPENSE" },
    { name: "Education", type: "EXPENSE" },
    { name: "Entertainment", type: "EXPENSE" },
  ];

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!validEmail(email)) return { error: "Please enter a valid email address." };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters." };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return { error: "An account with this email already exists." };

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: hashPassword(password) })
    .returning({ id: users.id });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({
      userId: user.id,
      name: c.name,
      type: c.type,
    })),
  );

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!validEmail(email) || !password)
    return { error: "Enter your email and password." };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !verifyPassword(password, user.passwordHash))
    return { error: "Invalid email or password." };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2) return { ok: false, error: "Name is too short." };

  await db.update(users).set({ name }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 6)
    return { ok: false, error: "New password must be at least 6 characters." };
  if (next !== confirm) return { ok: false, error: "Passwords do not match." };

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row || !verifyPassword(current, row.passwordHash))
    return { ok: false, error: "Current password is incorrect." };

  await db
    .update(users)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(users.id, user.id));

  return { ok: true, message: "Password changed." };
}
