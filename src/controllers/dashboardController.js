import { getDashboard } from "../services/dashboardService.js";

export const dashboard = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const data = await getDashboard(month, year);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};