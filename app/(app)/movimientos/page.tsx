import { prisma } from "@/lib/prisma";
import { TransactionRow } from "./TransactionRow";
import type { Prisma } from "@/app/generated/prisma/client";

const PAGE_SIZE = 30;

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; categoryId?: string; from?: string; to?: string; skip?: string }>;
}) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const skip = Number(params.skip ?? 0) || 0;

  const where: Prisma.TransactionWhereInput = {};
  if (params.type === "income" || params.type === "expense") where.type = params.type;
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.from || params.to) {
    where.date = {};
    if (params.from) where.date.gte = new Date(params.from);
    if (params.to) where.date.lte = new Date(params.to);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.transaction.count({ where }),
  ]);

  const buildQuery = (overrides: Record<string, string>) => {
    const merged = { ...params, ...overrides };
    const usp = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) usp.set(k, v);
    });
    return `/movimientos?${usp.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Movimientos</h1>

      <form method="get" className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">Todos los tipos</option>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <select
            name="categoryId"
            defaultValue={params.categoryId ?? ""}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="from"
            type="date"
            defaultValue={params.from ?? ""}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="to"
            type="date"
            defaultValue={params.to ?? ""}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Filtrar
        </button>
      </form>

      <p className="text-xs text-zinc-400">{total} movimiento(s)</p>

      <ul className="flex flex-col gap-2">
        {transactions.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={{
              id: t.id,
              amount: t.amount,
              type: t.type,
              date: t.date.toISOString().slice(0, 10),
              note: t.note,
              categoryId: t.categoryId,
              category: { name: t.category.name, color: t.category.color },
            }}
            categories={categories}
          />
        ))}
        {transactions.length === 0 && (
          <p className="text-sm text-zinc-400">No hay movimientos con estos filtros.</p>
        )}
      </ul>

      <div className="flex justify-between text-xs">
        {skip > 0 && (
          <a href={buildQuery({ skip: String(Math.max(0, skip - PAGE_SIZE)) })} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            ← Anteriores
          </a>
        )}
        {skip + PAGE_SIZE < total && (
          <a
            href={buildQuery({ skip: String(skip + PAGE_SIZE) })}
            className="ml-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Siguientes →
          </a>
        )}
      </div>
    </div>
  );
}
