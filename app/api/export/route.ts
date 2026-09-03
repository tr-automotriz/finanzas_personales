import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@/app/generated/prisma/client";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Exporta los movimientos (respetando los mismos filtros que /movimientos) como
// CSV, pensado para analizarlos afuera de la app (ej. subiéndolo a Claude).
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.TransactionWhereInput = {};
  if (type === "income" || type === "expense") where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true, goal: true },
    orderBy: { date: "asc" },
  });

  const header = ["Fecha", "Tipo", "Categoria", "Monto", "Nota", "Meta"];
  const rows = transactions.map((t) => [
    t.date.toISOString().slice(0, 10),
    t.type === "income" ? "Ingreso" : "Gasto",
    t.category.name,
    String(t.amount),
    t.note ?? "",
    t.goal?.name ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => csvEscape(String(value))).join(","))
    .join("\n");

  // BOM inicial para que Excel/Numbers detecten UTF-8 y no rompan tildes.
  const body = "﻿" + csv;
  const today = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="movimientos-${today}.csv"`,
    },
  });
}
