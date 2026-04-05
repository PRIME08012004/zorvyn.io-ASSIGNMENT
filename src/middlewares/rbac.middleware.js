import { AppError } from "./error.middleware.js";

const ROLE_RANK = { VIEWER: 1, ANALYST: 2, ADMIN: 3 };

export function requireMinRole(minRole) {
  const min = ROLE_RANK[minRole];
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (ROLE_RANK[req.user.role] < min) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
}

export function requireAdmin(req, res, next) {
  return requireMinRole("ADMIN")(req, res, next);
}

export function requireAnalystPlus(req, res, next) {
  return requireMinRole("ANALYST")(req, res, next);
}
