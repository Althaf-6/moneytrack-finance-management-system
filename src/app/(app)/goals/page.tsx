import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Target, PiggyBank, Trophy } from "lucide-react";
import { db } from "@/db";
import { savingGoals } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatCard } from "@/components/stat-card";
import { GoalGrid } from "@/components/goal-manager";
import { formatLKR } from "@/lib/utils";

export const metadata: Metadata = { title: "Savings goals" };

export default async function GoalsPage() {
  const user = await requireUser();

  const goals = await db
    .select({
      id: savingGoals.id,
      title: savingGoals.title,
      targetAmount: savingGoals.targetAmount,
      currentAmount: savingGoals.currentAmount,
      deadline: savingGoals.deadline,
    })
    .from(savingGoals)
    .where(eq(savingGoals.userId, user.id))
    .orderBy(desc(savingGoals.createdAt));

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const overall = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Savings goals"
        description="Turn intentions into targets — then watch them fill up."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Target}
          label="Total target"
          value={formatLKR(totalTarget)}
          tone="white"
          sub={`${goals.length} active ${goals.length === 1 ? "goal" : "goals"}`}
        />
        <StatCard
          icon={PiggyBank}
          label="Total saved"
          value={formatLKR(totalSaved)}
          tone="emerald"
          index={1}
          sub={`${overall}% of all targets`}
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={String(completed)}
          tone="zinc"
          index={2}
          sub="Goals fully funded"
        />
      </div>

      <GoalGrid goals={goals} />
    </div>
  );
}
