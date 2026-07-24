import { getGoalsProgress } from "@/lib/queries";
import { NewGoalForm } from "./NewGoalForm";
import { GoalCard } from "./GoalCard";

export default async function MetasPage() {
  const goals = await getGoalsProgress();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Metas de ahorro</h1>

      <NewGoalForm />

      <ul className="flex flex-col gap-2">
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={{
              id: g.id,
              name: g.name,
              targetAmount: g.targetAmount,
              currentAmount: g.currentAmount,
              deadline: g.deadline ? g.deadline.toISOString().slice(0, 10) : null,
            }}
          />
        ))}
        {goals.length === 0 && <p className="text-sm text-zinc-400">Todavía no creaste ninguna meta.</p>}
      </ul>
    </div>
  );
}
