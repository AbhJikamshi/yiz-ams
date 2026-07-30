import express from "express";

import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";

import { validateMember } from "../middlewares/memberValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// ===============================
// Public Routes
// ===============================
router.get("/", getMembers);
router.get("/:id", getMemberById);

// ===============================
// Protected Routes (ADMIN only)
// ===============================
router.post(
  "/",
  authMiddleware,
  authorize("ADMIN"),
  validateMember,
  createMember
);

router.put(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  validateMember,
  updateMember
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteMember
);

export default router;