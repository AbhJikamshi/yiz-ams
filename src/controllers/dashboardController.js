import * as dashboardService from "../services/dashboardService.js";

// ===============================
// Dashboard Summary
// ===============================
export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboardSummary();

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};