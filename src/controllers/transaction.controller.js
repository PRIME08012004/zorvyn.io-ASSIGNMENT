import * as transactionService from "../services/transaction.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery;
  const { data, pagination } = await transactionService.listTransactions(req.user, q);
  res.json({ success: true, data, pagination });
});

export const getById = asyncHandler(async (req, res) => {
  const tx = await transactionService.getTransactionById(req.user, req.validatedParams.id);
  res.json({ success: true, data: tx });
});

export const create = asyncHandler(async (req, res) => {
  const tx = await transactionService.createTransaction(req.user, req.body);
  res.status(201).json({ success: true, data: tx });
});

export const update = asyncHandler(async (req, res) => {
  const tx = await transactionService.updateTransaction(req.user, req.validatedParams.id, req.body);
  res.json({ success: true, data: tx });
});

export const remove = asyncHandler(async (req, res) => {
  await transactionService.softDeleteTransaction(req.validatedParams.id);
  res.json({ success: true, data: null });
});
