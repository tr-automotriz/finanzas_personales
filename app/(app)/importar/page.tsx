import { prisma } from "@/lib/prisma";
import { ImportCsv } from "./ImportCsv";

export default async function ImportarPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Importar movimientos</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Subí un CSV exportado de tu banco o tarjeta. Vas a poder revisar y ajustar antes de confirmar.
      </p>
      <ImportCsv categories={categories} />
    </div>
  );
}
