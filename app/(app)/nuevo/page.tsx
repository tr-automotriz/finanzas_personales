import { prisma } from "@/lib/prisma";
import { todayLocalISODate } from "@/lib/dates";
import { NewTransactionForm } from "./NewTransactionForm";

export default async function NuevoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Nuevo movimiento</h1>
      <NewTransactionForm categories={categories} today={todayLocalISODate()} />
    </div>
  );
}
