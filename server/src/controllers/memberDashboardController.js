import * as memberDashboardService from "../services/memberDashboardService.js";

export const getDashboard = async (req, res, next) => {
  try {
    console.log("========== MEMBER DASHBOARD ==========");
    console.log("Authenticated Member:", req.member);

    // FIXED: Correct service function name
    const dashboard =
      await memberDashboardService.getMemberDashboard(req.member.id);

    console.log("Dashboard Result:");
    console.dir(dashboard, { depth: null });

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard Error:");
    console.error(error);

    next(error);
  }
};