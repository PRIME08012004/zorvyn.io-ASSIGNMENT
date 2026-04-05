import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json({ success: true, data: users });
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.validatedParams.id);
  res.json({ success: true, data: user });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.validatedParams.id, req.body);
  res.json({ success: true, data: user });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.validatedParams.id);
  res.json({ success: true, data: null });
});
