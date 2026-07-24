import { prisma } from "@/lib/prisma";

function monthRange(month: string) {
  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);
  return { start, end };
}

export async function getMonthSummary(month: string) {
  const { start, end } = monthRange(month);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    include: { category: true },
  });

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, { name: string; color: string; total: number }>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const existing = byCategory.get(t.categoryId) ?? { name: t.category.name, color: t.category.color, total: 0 };
    existing.total += t.amount;
    byCategory.set(t.categoryId, existing);
  }

  return {
    income,
    expense,
    balance: income - expense,
    expenseByCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
  };
}

export async function getMonthlyTrend(months: string[]) {
  return Promise.all(
    months.map(async (month) => {
      const summary = await getMonthSummary(month);
      return { month, income: summary.income, expense: summary.expense };
    })
  );
}

export async function getBudgetProgress(month: string) {
  const { start, end } = monthRange(month);
  const budgets = await prisma.budget.findMany({
    where: { month },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  return Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: { categoryId: budget.categoryId, type: "expense", date: { gte: start, lt: end } },
        _sum: { amount: true },
      });
      return { ...budget, spent: spent._sum.amount ?? 0 };
    })
  );
}

export async function getGoalsProgress() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } });

  return Promise.all(
    goals.map(async (goal) => {
      const sum = await prisma.transaction.aggregate({
        where: { goalId: goal.id },
        _sum: { amount: true },
      });
      return { ...goal, currentAmount: sum._sum.amount ?? 0 };
    })
  );
}
