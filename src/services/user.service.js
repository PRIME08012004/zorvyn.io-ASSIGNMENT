import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";

const userPublic = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function listUsers() {
  return prisma.user.findMany({
    select: userPublic,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userPublic,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateUser(id, data) {
  await getUserById(id);
  return prisma.user.update({
    where: { id },
    data,
    select: userPublic,
  });
}

export async function deleteUser(id) {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
}
