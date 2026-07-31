import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  getDashboard
);

export default router;