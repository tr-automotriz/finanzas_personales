import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { todayLocalISODate } from "@/lib/dates";
import { detectCategoryName, detectType, extractAmount } from "@/lib/voiceParsing";

const bodySchema = z.union([
  z.object({
    text: z.string().trim().min(1),
  }),
  z.object({
    amount: z.coerce.number().positive(),
    type: z.enum(["expense", "income"]).default("expense"),
    category: z.string().trim().optional(),
    note: z.string().trim().max(200).optional(),
  }),
]);

const DEFAULT_CATEGORY_NAME: Record<"expense" | "income", string> = {
  expense: "Sin categorizar",
  income: "Otros ingresos",
};

async function resolveCategory(type: "expense" | "income", requestedName?: string | null) {
  const category = await prisma.category.findFirst({
    where: requestedName
      ? { type, name: { equals: requestedName, mode: "insensitive" } }
      : { type, name: DEFAULT_CATEGORY_NAME[type] },
  });

  return (
    category ??
    (await prisma.category.upsert({
      where: { name_type: { name: DEFAULT_CATEGORY_NAME[type], type } },
      update: {},
      create: { name: DEFAULT_CATEGORY_NAME[type], type, color: "#6b7280" },
    }))
  );
}

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

  let amount: number;
  let type: "expense" | "income";
  let requestedCategory: string | null;
  let note: string;

  if ("text" in parsed.data) {
    const text = parsed.data.text;
    const detectedAmount = extractAmount(text);
    if (detectedAmount === null) {
      return NextResponse.json(
        { error: "No pude encontrar un monto en lo que dijiste. Repetí incluyendo el número." },
        { status: 422 }
      );
    }

    const categories = await prisma.category.findMany({ select: { name: true } });
    amount = detectedAmount;
    type = detectType(text);
    requestedCategory = detectCategoryName(
      text,
      categories.map((c) => c.name)
    );
    note = text;
  } else {
    amount = parsed.data.amount;
    type = parsed.data.type;
    requestedCategory = parsed.data.category ?? null;
    note = parsed.data.note || "Cargado por Siri";
  }

  const finalCategory = await resolveCategory(type, requestedCategory);

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      categoryId: finalCategory.id,
      date: new Date(`${todayLocalISODate()}T12:00:00`),
      note,
      source: "manual",
    },
  });

  return NextResponse.json({
    ok: true,
    id: transaction.id,
    amount: transaction.amount,
    category: finalCategory.name,
    categorized: requestedCategory !== null,
    type: transaction.type,
  });
}
