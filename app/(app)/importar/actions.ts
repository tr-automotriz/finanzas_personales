"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const importRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1),
  note: z.string().optional(),
});

export type ImportResult = { error?: string; imported?: number };

export async function importTransactions(rows: unknown[]): Promise<ImportResult> {
  const parsed = z.array(importRowSchema).min(1).safeParse(rows);
  if (!parsed.success) {
    return { error: "No hay filas válidas para importar." };
  }

  const categoryIds = [...new Set(parsed.data.map((r) => r.categoryId))];
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  for (const row of parsed.data) {
    const category = categoryById.get(row.categoryId);
    if (!category || category.type !== row.type) {
      return { error: "Alguna fila tiene una categoría que no corresponde a su tipo." };
    }
  }

  await prisma.transaction.createMany({
    data: parsed.data.map((r) => ({
      amount: r.amount,
      type: r.type,
      categoryId: r.categoryId,
      date: new Date(`${r.date}T00:00:00`),
      note: r.note || null,
      source: "import" as const,
    })),
  });

  revalidatePath("/movimientos");
  revalidatePath("/");
  revalidatePath("/presupuestos");

  return { imported: parsed.data.length };
}
