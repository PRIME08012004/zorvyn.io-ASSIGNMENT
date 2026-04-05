import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema, updateUserSchema } from "../validations/schemas.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

const idParams = validate(idParamSchema, "params");

router.get("/", userController.list);
router.get("/:id", idParams, userController.getById);
router.patch("/:id", idParams, validate(updateUserSchema), userController.update);
router.delete("/:id", idParams, userController.remove);

export default router;
