import express from "express";

import {
  register,
  login,
} from "../controllers/adminController.js";

const router = express.Router();

// ===============================
// Admin Registration
// ===============================
router.post("/register", register);

// ===============================
// Admin Login
// ===============================
router.post("/login", login);

// ===============================
// IMPORTANT:
// index.js imports this router as:
// import adminRoutes from "./routes/adminRoutes.js";
// ===============================
export default router;