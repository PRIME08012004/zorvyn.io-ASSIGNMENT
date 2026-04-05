import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema, idParamSchema } from "../validations/schemas.js";

const router = Router();

router.get("/", authMiddleware, categoryController.list);
router.post(
  "/",
  authMiddleware,
  requireAdmin,
  validate(createCategorySchema),
  categoryController.create
);
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  validate(idParamSchema, "params"),
  categoryController.remove
);

export default router;
