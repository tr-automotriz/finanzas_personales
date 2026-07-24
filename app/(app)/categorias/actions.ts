"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "Ya existe una categoría con ese nombre y tipo." };
  }

  revalidatePath("/categorias");
  return undefined;
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color") || undefined,
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Falta el id" : parsed.error.issues[0]?.message };
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "No se pudo actualizar la categoría." };
  }

  revalidatePath("/categorias");
  return undefined;
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el id" };

  const usageCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (usageCount > 0) {
    return {
      error: `No se puede borrar: tiene ${usageCount} movimiento(s) asociado(s). Borrá o reasigná esos movimientos primero.`,
    };
  }

  await prisma.budget.deleteMany({ where: { categoryId: id } });
  await prisma.category.delete({ where: { id } });

  revalidatePath("/categorias");
  return undefined;
}
