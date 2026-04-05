import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin, requireAnalystPlus } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  idParamSchema,
  transactionCreateSchema,
  transactionListQuerySchema,
  transactionUpdateSchema,
} from "../validations/schemas.js";

const router = Router();

const idParams = validate(idParamSchema, "params");

router.get(
  "/",
  authMiddleware,
  validate(transactionListQuerySchema, "query"),
  transactionController.list
);
router.get("/:id", authMiddleware, idParams, transactionController.getById);
router.post(
  "/",
  authMiddleware,
  requireAnalystPlus,
  validate(transactionCreateSchema),
  transactionController.create
);
router.patch(
  "/:id",
  authMiddleware,
  requireAnalystPlus,
  idParams,
  validate(transactionUpdateSchema),
  transactionController.update
);
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  idParams,
  transactionController.remove
);

export default router;
