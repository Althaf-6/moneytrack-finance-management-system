import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";

export type TxType = "INCOME" | "EXPENSE";

export type TxRow = {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  date: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export type CategoryRow = {
  id: string;
  name: string;
  type: TxType;
};

/* ---------------- lists ---------------- */

export async function listCategories(userId: string): Promise<CategoryRow[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.type, categories.name);
}

export async function listTransactions(
  userId: string,
  opts?: { type?: TxType; limit?: number; month?: string },
): Promise<TxRow[]> {
  const conditions = [eq(transactions.userId, userId)];
  if (opts?.type) conditions.push(eq(transactions.type, opts.type));
  if (opts?.month)
    conditions.push(sql`substring(${transactions.date}::text from 1 for 7) = ${opts.month}`);

  const rows = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      amount: transactions.amount,
      type: transactions.type,
      date: transactions.date,
      description: transactions.description,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(opts?.limit ?? 500);

  return rows;
}

/* ---------------- aggregates ---------------- */

export async function getTotals(userId: string) {
  const [row] = await db
    .select({
      income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
      expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  return {
    income: row?.income ?? 0,
    expense: row?.expense ?? 0,
    count: row?.count ?? 0,
  };
}

export async function getMonthTotals(userId: string, month: string) {
  const [row] = await db
    .select({
      income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
      expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`substring(${transactions.date}::text from 1 for 7) = ${month}`,
      ),
    );

  return { income: row?.income ?? 0, expense: row?.expense ?? 0 };
}

/** Income / expense per month for a list of "YYYY-MM" months. */
export async function getMonthlySeries(userId: string, months: string[]) {
  const first = months[0];
  const rows = first
    ? await db
        .select({
          month: sql<string>`substring(${transactions.date}::text from 1 for 7)`,
          income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
          expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)::float`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.date, `${first}-01`),
          ),
        )
        .groupBy(sql`substring(${transactions.date}::text from 1 for 7)`)
    : [];

  const map = new Map(rows.map((r) => [r.month, r]));
  return months.map((m) => {
    const r = map.get(m);
    return { month: m, income: r?.income ?? 0, expense: r?.expense ?? 0 };
  });
}

export type CategorySpend = { name: string; value: number };

export async function getExpenseByCategory(
  userId: string,
  month?: string,
): Promise<CategorySpend[]> {
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, "EXPENSE"),
  ];
  if (month)
    conditions.push(sql`substring(${transactions.date}::text from 1 for 7) = ${month}`);

  const rows = await db
    .select({
      name: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
      value: sql<number>`COALESCE(SUM(${transactions.amount}), 0)::float`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .groupBy(categories.name)
    .orderBy(sql`SUM(${transactions.amount}) DESC`);

  return rows.filter((r) => r.value > 0);
}

export async function getHighestSpendingCategory(
  userId: string,
  month: string,
): Promise<CategorySpend | null> {
  const [first] = await getExpenseByCategory(userId, month);
  return first ?? null;
}
