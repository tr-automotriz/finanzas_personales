import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const DEFAULT_CATEGORIES: { name: string; type: "income" | "expense"; color: string }[] = [
  { name: "Sueldo", type: "income", color: "#16a34a" },
  { name: "Otros ingresos", type: "income", color: "#22c55e" },
  { name: "Comida", type: "expense", color: "#f97316" },
  { name: "Transporte", type: "expense", color: "#3b82f6" },
  { name: "Servicios", type: "expense", color: "#0ea5e9" },
  { name: "Vivienda", type: "expense", color: "#8b5cf6" },
  { name: "Entretenimiento", type: "expense", color: "#ec4899" },
  { name: "Salud", type: "expense", color: "#ef4444" },
  { name: "Ropa", type: "expense", color: "#eab308" },
  { name: "Ahorro", type: "expense", color: "#14b8a6" },
  { name: "Trabajo", type: "expense", color: "#64748b" },
  { name: "Sin categorizar", type: "expense", color: "#6b7280" },
];

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name: category.name, type: category.type } },
      update: {},
      create: category,
    });
  }

  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("Definí SEED_EMAIL y SEED_PASSWORD en .env antes de correr el seed.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Listo. Usuario ${email} creado/actualizado y categorías por defecto cargadas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
