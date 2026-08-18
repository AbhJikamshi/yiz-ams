import express from "express";

import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  resetMemberPassword,
} from "../controllers/memberController.js";

import {
  validateMember,
  validateMemberUpdate,
} from "../middlewares/memberValidation.js";
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
  validateMemberUpdate,
  updateMember
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ADMIN"),
  deleteMember
);

router.patch(
  "/:id/reset-password",
  authMiddleware,
  authorize("ADMIN"),
  resetMemberPassword
);
export default router;