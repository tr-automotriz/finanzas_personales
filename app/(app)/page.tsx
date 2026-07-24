import Link from "next/link";
import { currentMonth, lastNMonths, monthLabel } from "@/lib/dates";
import { getBudgetProgress, getGoalsProgress, getMonthSummary, getMonthlyTrend } from "@/lib/queries";
import { currency } from "@/lib/format";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { ProgressBar } from "@/components/ProgressBar";

export default async function DashboardPage() {
  const month = currentMonth();
  const [summary, trend, budgets, goals] = await Promise.all([
    getMonthSummary(month),
    getMonthlyTrend(lastNMonths(6)),
    getBudgetProgress(month),
    getGoalsProgress(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">{monthLabel(month)}</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Ingresos</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">{currency.format(summary.income)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Gastos</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{currency.format(summary.expense)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Balance</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{currency.format(summary.balance)}</p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Gasto por categoría</h2>
        <CategoryPieChart data={summary.expenseByCategory} />
        {summary.expenseByCategory.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {summary.expenseByCategory.slice(0, 5).map((c) => (
              <li key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400">{c.name}</span>
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{currency.format(c.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Tendencia (6 meses)</h2>
        <MonthlyTrendChart data={trend} />
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Presupuestos del mes</h2>
          <Link href="/presupuestos" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            Ver todos
          </Link>
        </div>
        {budgets.length === 0 ? (
          <p className="text-sm text-zinc-400">Todavía no definiste presupuestos para este mes.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {budgets.slice(0, 4).map((b) => (
              <li key={b.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{b.category.name}</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {currency.format(b.spent)} / {currency.format(b.limitAmount)}
                  </span>
                </div>
                <ProgressBar value={b.spent} max={b.limitAmount} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Metas de ahorro</h2>
          <Link href="/metas" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            Ver todas
          </Link>
        </div>
        {goals.length === 0 ? (
          <p className="text-sm text-zinc-400">Todavía no creaste metas de ahorro.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {goals.slice(0, 4).map((g) => (
              <li key={g.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{g.name}</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {currency.format(g.currentAmount)} / {currency.format(g.targetAmount)}
                  </span>
                </div>
                <ProgressBar value={g.currentAmount} max={g.targetAmount} colorClass="bg-teal-500" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
