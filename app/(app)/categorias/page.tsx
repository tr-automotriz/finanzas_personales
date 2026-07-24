import { prisma } from "@/lib/prisma";
import { CategoryRow } from "./CategoryRow";
import { NewCategoryForm } from "./NewCategoryForm";

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Categorías</h1>

      <NewCategoryForm />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Gastos</h2>
        <ul className="flex flex-col gap-2">
          {expense.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
          {expense.length === 0 && (
            <p className="text-sm text-zinc-400">Todavía no hay categorías de gasto.</p>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ingresos</h2>
        <ul className="flex flex-col gap-2">
          {income.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
          {income.length === 0 && (
            <p className="text-sm text-zinc-400">Todavía no hay categorías de ingreso.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
