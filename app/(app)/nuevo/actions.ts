"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function createTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = transactionSchema.safeParse({
    amount: formData.get("amount"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category || category.type !== parsed.data.type) {
    return { error: "La categoría elegida no corresponde al tipo seleccionado." };
  }

  await prisma.transaction.create({
    data: {
      amount: parsed.data.amount,
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      date: parsed.data.date,
      note: parsed.data.note || undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/movimientos");
  revalidatePath("/presupuestos");
  return { success: true };
}
