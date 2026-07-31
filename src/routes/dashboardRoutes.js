import express from "express";
import { dashboard } from "../controllers/dashboardController.js";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// Dashboard is accessible only to Admins
router.get("/", protect, authorize("ADMIN"), dashboard);

export default router;