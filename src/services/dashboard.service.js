import { prisma } from "../config/prisma.js";

function isAdmin(user) {
  return user.role === "ADMIN";
}

function scopeUserId(user) {
  return isAdmin(user) ? undefined : user.id;
}

/** @param {import("@prisma/client").Prisma.Decimal} d */
function num(d) {
  return Number(d);
}

export async function getSummary(user) {
  const uid = scopeUserId(user);
  const base = { isDeleted: false, ...(uid ? { userId: uid } : {}) };

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...base, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...base, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const income = num(incomeAgg._sum.amount ?? 0);
  const expenses = num(expenseAgg._sum.amount ?? 0);
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
  };
}

export async function getRecent(user, limit = 10) {
  const uid = scopeUserId(user);
  const rows = await prisma.transaction.findMany({
    where: { isDeleted: false, ...(uid ? { userId: uid } : {}) },
    include: {
      category: { select: { id: true, name: true, type: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
  }));
}

export async function getCategoryTotals(user) {
  const uid = scopeUserId(user);
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId", "type"],
    where: { isDeleted: false, ...(uid ? { userId: uid } : {}) },
    _sum: { amount: true },
  });
  const ids = [...new Set(rows.map((r) => r.categoryId))];
  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, type: true },
  });
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: byId[r.categoryId]?.name ?? null,
    type: r.type,
    total: num(r._sum.amount ?? 0),
  }));
}

export async function getMonthlyTrends(user, year) {
  const uid = scopeUserId(user);
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const rows = await prisma.transaction.findMany({
    where: {
      isDeleted: false,
      date: { gte: start, lt: end },
      ...(uid ? { userId: uid } : {}),
    },
    select: { amount: true, type: true, date: true },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expenses: 0,
  }));

  for (const r of rows) {
    const m = r.date.getUTCMonth();
    if (r.type === "INCOME") {
      months[m].income += Number(r.amount);
    } else {
      months[m].expenses += Number(r.amount);
    }
  }
  return { year, months };
}

export async function getWeeklyBreakdown(user) {
  const uid = scopeUserId(user);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  start.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.transaction.findMany({
    where: {
      isDeleted: false,
      date: { gte: start, lte: end },
      ...(uid ? { userId: uid } : {}),
    },
    select: { amount: true, type: true, date: true },
  });

  const byKey = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    byKey[key] = { date: key, income: 0, expenses: 0 };
  }
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10);
    const bucket = byKey[key];
    if (!bucket) continue;
    if (r.type === "INCOME") {
      bucket.income += Number(r.amount);
    } else {
      bucket.expenses += Number(r.amount);
    }
  }
  return Object.values(byKey);
}
