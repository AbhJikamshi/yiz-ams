import express from "express";
import * as memberDashboardController from "../controllers/memberDashboardController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// Member Dashboard
router.get(
  "/",
  memberAuthMiddleware,
  memberDashboardController.getDashboard
);

export default router;