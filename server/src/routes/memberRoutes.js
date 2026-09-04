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

import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// ===============================
// Protected Routes (ADMIN only)
// ===============================
router.get(
  "/",
  adminAuthMiddleware,
  authorize("ADMIN"),
  getMembers
);

router.get(
  "/:id",
  adminAuthMiddleware,
  authorize("ADMIN"),
  getMemberById
);

router.post(
  "/",
  adminAuthMiddleware,
  authorize("ADMIN"),
  validateMember,
  createMember
);

router.put(
  "/:id",
  adminAuthMiddleware,
  authorize("ADMIN"),
  validateMemberUpdate,
  updateMember
);

router.delete(
  "/:id",
  adminAuthMiddleware,
  authorize("ADMIN"),
  deleteMember
);

router.patch(
  "/:id/reset-password",
  adminAuthMiddleware,
  authorize("ADMIN"),
  resetMemberPassword
);

export default router;
