import express from "express";

import {
  register,
  login,
} from "../controllers/adminController.js";

const router = express.Router();

// ===============================
// Register Admin
// ===============================
router.post("/register", register);

// ===============================
// Login Admin
// ===============================
router.post("/login", login);

export default router;