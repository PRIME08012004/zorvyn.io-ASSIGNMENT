import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";

const txInclude = {
  category: { select: { id: true, name: true, type: true } },
  user: { select: { id: true, name: true, email: true } },
};

function mapTransaction(row) {
  if (!row) return row;
  const { amount, ...rest } = row;
  return { ...rest, amount: Number(amount) };
}

function isAdmin(user) {
  return user.role === "ADMIN";
}

export async function listTransactions(user, query) {
  const { type, categoryId, startDate, endDate, page, limit } = query;
  const where = { isDeleted: false };
  if (!isAdmin(user)) {
    where.userId = user.id;
  }
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: txInclude,
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);
  return {
    data: rows.map(mapTransaction),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getTransactionById(user, id) {
  const row = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
    include: txInclude,
  });
  if (!row) {
    throw new AppError("Transaction not found", 404);
  }
  if (!isAdmin(user) && row.userId !== user.id) {
    throw new AppError("Forbidden", 403);
  }
  return mapTransaction(row);
}

async function assertCategoryMatchesType(categoryId, type) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) {
    throw new AppError("Category not found", 404);
  }
  if (cat.type !== type) {
    throw new AppError("Transaction type must match category type", 400);
  }
}

export async function createTransaction(user, payload) {
  await assertCategoryMatchesType(payload.categoryId, payload.type);
  const row = await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: payload.amount,
      type: payload.type,
      categoryId: payload.categoryId,
      description: payload.description ?? null,
      date: payload.date,
    },
    include: txInclude,
  });
  return mapTransaction(row);
}

export async function updateTransaction(user, id, payload) {
  const existing = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError("Transaction not found", 404);
  }
  if (!isAdmin(user) && existing.userId !== user.id) {
    throw new AppError("Forbidden", 403);
  }
  const nextType = payload.type ?? existing.type;
  const nextCategoryId = payload.categoryId ?? existing.categoryId;
  await assertCategoryMatchesType(nextCategoryId, nextType);
  const row = await prisma.transaction.update({
    where: { id },
    data: {
      ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.date !== undefined ? { date: payload.date } : {}),
    },
    include: txInclude,
  });
  return mapTransaction(row);
}

export async function softDeleteTransaction(id) {
  const existing = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError("Transaction not found", 404);
  }
  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
  });
}
