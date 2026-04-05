import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

export async function register({ name, email, password, role = "VIEWER" }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: userPublic,
  });
  return user;
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.status !== "ACTIVE") {
    throw new AppError("Account is inactive", 403);
  }
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  if (!secret) {
    throw new AppError("Server misconfiguration", 500);
  }
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn });
  const { password: _, ...safe } = user;
  return { token, user: safe };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublic,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
