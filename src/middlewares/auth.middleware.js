import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { AppError } from "./error.middleware.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("Server misconfiguration", 500);
    }
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }
    if (!payload?.userId) {
      throw new AppError("Invalid token payload", 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: userSelect,
    });
    if (!user) {
      throw new AppError("User not found", 401);
    }
    if (user.status !== "ACTIVE") {
      throw new AppError("Account is inactive", 403);
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}
