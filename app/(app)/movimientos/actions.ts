"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function updateTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = transactionSchema.safeParse({
    amount: formData.get("amount"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
    note: formData.get("note") ?? "",
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Falta el id" : parsed.error.issues[0]?.message };
  }

  await prisma.transaction.update({
    where: { id },
    data: {
      amount: parsed.data.amount,
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      date: parsed.data.date,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/movimientos");
  revalidatePath("/");
  revalidatePath("/presupuestos");
  return undefined;
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/movimientos");
  revalidatePath("/");
  revalidatePath("/presupuestos");
}
