import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user);
  res.json({ success: true, data });
});

export const recent = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecent(req.user, 10);
  res.json({ success: true, data });
});

export const categories = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryTotals(req.user);
  res.json({ success: true, data });
});

export const monthly = asyncHandler(async (req, res) => {
  const { year } = req.validatedQuery;
  const data = await dashboardService.getMonthlyTrends(req.user, year);
  res.json({ success: true, data });
});

export const weekly = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklyBreakdown(req.user);
  res.json({ success: true, data });
});
