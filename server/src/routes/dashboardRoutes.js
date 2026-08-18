import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// Protect all dashboard routes
router.use(authMiddleware);
router.use(authorize("ADMIN"));

// Dashboard Routes
router.get("/", getDashboard);

export default router;