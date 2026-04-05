import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function createCategory({ name, type }) {
  try {
    return await prisma.category.create({
      data: { name, type },
    });
  } catch (e) {
    if (e.code === "P2002") {
      throw new AppError("Category with this name and type already exists", 409);
    }
    throw e;
  }
}

export async function deleteCategory(id) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) {
    throw new AppError("Category not found", 404);
  }
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (e.code === "P2003") {
      throw new AppError("Cannot delete category that is used by transactions", 409);
    }
    throw e;
  }
}
