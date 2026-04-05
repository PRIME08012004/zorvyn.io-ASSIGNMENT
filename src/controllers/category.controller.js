import * as categoryService from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  res.json({ success: true, data: categories });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.validatedParams.id);
  res.json({ success: true, data: null });
});
