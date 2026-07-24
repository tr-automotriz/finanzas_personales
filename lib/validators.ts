import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(40),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido")
    .default("#6366f1"),
});

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Elegí una categoría"),
  date: z.coerce.date(),
  note: z.string().trim().max(200).optional().or(z.literal("")),
  goalId: z.string().optional().or(z.literal("")),
});

export const budgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mes inválido"),
  limitAmount: z.coerce.number().positive("El límite debe ser mayor a 0"),
});

export const goalSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  targetAmount: z.coerce.number().positive("El objetivo debe ser mayor a 0"),
  deadline: z.coerce.date().optional().nullable(),
});
