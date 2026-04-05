import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAnalystPlus } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { monthlyQuerySchema } from "../validations/schemas.js";

const router = Router();

router.get("/summary", authMiddleware, dashboardController.summary);
router.get("/recent", authMiddleware, dashboardController.recent);
router.get(
  "/categories",
  authMiddleware,
  requireAnalystPlus,
  dashboardController.categories
);
router.get(
  "/monthly",
  authMiddleware,
  requireAnalystPlus,
  validate(monthlyQuerySchema, "query"),
  dashboardController.monthly
);
router.get("/weekly", authMiddleware, requireAnalystPlus, dashboardController.weekly);

export default router;
