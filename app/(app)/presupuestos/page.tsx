import { prisma } from "@/lib/prisma";
import { currentMonth, monthLabel } from "@/lib/dates";
import { getBudgetProgress, getMonthSummary } from "@/lib/queries";
import { BudgetRow } from "./BudgetRow";

function shiftMonth(month: string, delta: number): string {
  const [year, monthNum] = month.split("-").map(Number);
  const d = new Date(year, monthNum - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : currentMonth();

  const [categories, budgets, summary] = await Promise.all([
    prisma.category.findMany({ where: { type: "expense" }, orderBy: { name: "asc" } }),
    getBudgetProgress(month),
    getMonthSummary(month),
  ]);

  const spentByCategory = new Map(summary.expenseByCategory.map((c) => [c.name, c.total]));
  const budgetByCategoryId = new Map(budgets.map((b) => [b.categoryId, b]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">
          Presupuestos · {monthLabel(month)}
        </h1>
      </div>

      <div className="flex justify-between text-sm">
        <a href={`/presupuestos?month=${shiftMonth(month, -1)}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Mes anterior
        </a>
        <a href={`/presupuestos?month=${shiftMonth(month, 1)}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          Mes siguiente →
        </a>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((c) => {
          const budget = budgetByCategoryId.get(c.id);
          return (
            <BudgetRow
              key={c.id}
              categoryId={c.id}
              categoryName={c.name}
              categoryColor={c.color}
              month={month}
              spent={budget?.spent ?? spentByCategory.get(c.name) ?? 0}
              budget={budget ? { id: budget.id, limitAmount: budget.limitAmount } : null}
            />
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-zinc-400">Creá categorías de gasto primero para poder definir presupuestos.</p>
        )}
      </ul>
    </div>
  );
}
