import type { Metadata } from "next";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/queries";
import { PageHeader, Card } from "@/components/stat-card";
import { CategoryPanel } from "@/components/category-manager";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const user = await requireUser();

  const [cats, usageRows] = await Promise.all([
    listCategories(user.id),
    db
      .select({
        categoryId: transactions.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          isNotNull(transactions.categoryId),
        ),
      )
      .groupBy(transactions.categoryId),
  ]);

  const usage = new Map(usageRows.map((r) => [r.categoryId, r.count]));
  const withCount = cats.map((c) => ({ ...c, count: usage.get(c.id) ?? 0 }));

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize where money comes from and where it goes."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Income categories"
          subtitle="Tag every source of money"
          index={0}
        >
          <CategoryPanel
            type="INCOME"
            categories={withCount.filter((c) => c.type === "INCOME")}
          />
        </Card>
        <Card
          title="Expense categories"
          subtitle="Tag every way you spend"
          index={1}
        >
          <CategoryPanel
            type="EXPENSE"
            categories={withCount.filter((c) => c.type === "EXPENSE")}
          />
        </Card>
      </div>
    </div>
  );
}
