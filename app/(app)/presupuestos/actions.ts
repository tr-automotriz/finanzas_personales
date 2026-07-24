"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function upsertBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    month: formData.get("month"),
    limitAmount: formData.get("limitAmount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.budget.upsert({
    where: { categoryId_month: { categoryId: parsed.data.categoryId, month: parsed.data.month } },
    update: { limitAmount: parsed.data.limitAmount },
    create: parsed.data,
  });

  revalidatePath("/presupuestos");
  revalidatePath("/");
  return undefined;
}

export async function deleteBudget(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.budget.delete({ where: { id } });

  revalidatePath("/presupuestos");
  revalidatePath("/");
}
