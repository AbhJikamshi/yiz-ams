import express from "express";

import {
  create,
  getAll,
  getById,
  getByMember,
  update,
  remove,
} from "../controllers/contributionController.js";

import { validateContribution } from "../middlewares/contributionValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// =====================================
// All contribution routes require login
// =====================================
router.use(authMiddleware);

// =====================================
// Get all contributions
// =====================================
router.get("/", getAll);

// =====================================
// Get one contribution
// =====================================
router.get("/:id", getById);

// =====================================
// Get contributions by member
// =====================================
router.get("/member/:memberId", getByMember);

// =====================================
// Create contribution
// Admin only
// =====================================
router.post(
  "/",
  authorize("ADMIN"),
  validateContribution,
  create
);

// =====================================
// Update contribution
// Admin only
// =====================================
router.put(
  "/:id",
  authorize("ADMIN"),
  validateContribution,
  update
);

// =====================================
// Delete contribution
// Admin only
// =====================================
router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;