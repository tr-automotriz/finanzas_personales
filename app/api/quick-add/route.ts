import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { todayLocalISODate } from "@/lib/dates";

const bodySchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["expense", "income"]).default("expense"),
  category: z.string().trim().optional(),
  note: z.string().trim().max(200).optional(),
});

const DEFAULT_CATEGORY_NAME: Record<"expense" | "income", string> = {
  expense: "Sin categorizar",
  income: "Otros ingresos",
};

export async function POST(request: Request) {
  const token = process.env.QUICK_ADD_TOKEN;
  const authHeader = request.headers.get("authorization");

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { amount, type, note } = parsed.data;

  const category = await prisma.category.findFirst({
    where: parsed.data.category
      ? { type, name: { equals: parsed.data.category, mode: "insensitive" } }
      : { type, name: DEFAULT_CATEGORY_NAME[type] },
  });

  const finalCategory =
    category ??
    (await prisma.category.upsert({
      where: { name_type: { name: DEFAULT_CATEGORY_NAME[type], type } },
      update: {},
      create: { name: DEFAULT_CATEGORY_NAME[type], type, color: "#6b7280" },
    }));

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      categoryId: finalCategory.id,
      date: new Date(`${todayLocalISODate()}T12:00:00`),
      note: note || "Cargado por Siri",
      source: "manual",
    },
  });

  return NextResponse.json({
    ok: true,
    id: transaction.id,
    amount: transaction.amount,
    category: finalCategory.name,
    type: transaction.type,
  });
}
