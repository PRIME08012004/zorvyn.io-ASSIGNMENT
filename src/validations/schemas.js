import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum(["VIEWER"]).optional().default("VIEWER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateUserSchema = z
  .object({
    role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((d) => d.role !== undefined || d.status !== undefined, {
    message: "At least one of role or status is required",
  });

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export const transactionCreateSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1),
  description: z.string().max(2000).optional().nullable(),
  date: z.coerce.date(),
});

export const transactionUpdateSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    categoryId: z.string().min(1).optional(),
    description: z.string().max(2000).optional().nullable(),
    date: z.coerce.date().optional(),
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

export const transactionListQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const monthlyQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
