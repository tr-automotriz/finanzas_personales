"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function createGoal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const deadlineRaw = formData.get("deadline");
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    deadline: deadlineRaw ? deadlineRaw : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.goal.create({
    data: {
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      deadline: parsed.data.deadline ?? null,
    },
  });

  revalidatePath("/metas");
  revalidatePath("/");
  return undefined;
}

export async function deleteGoal(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.$transaction([
    prisma.transaction.updateMany({ where: { goalId: id }, data: { goalId: null } }),
    prisma.goal.delete({ where: { id } }),
  ]);

  revalidatePath("/metas");
  revalidatePath("/");
}

const contributionSchema = z.object({
  goalId: z.string().min(1),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.coerce.date(),
});

export async function contributeToGoal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contributionSchema.safeParse({
    goalId: formData.get("goalId"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const savingsCategory = await prisma.category.upsert({
    where: { name_type: { name: "Ahorro", type: "expense" } },
    update: {},
    create: { name: "Ahorro", type: "expense", color: "#14b8a6" },
  });

  await prisma.transaction.create({
    data: {
      amount: parsed.data.amount,
      type: "expense",
      categoryId: savingsCategory.id,
      goalId: parsed.data.goalId,
      date: parsed.data.date,
      note: "Aporte a meta de ahorro",
    },
  });

  revalidatePath("/metas");
  revalidatePath("/");
  revalidatePath("/movimientos");
  return undefined;
}
