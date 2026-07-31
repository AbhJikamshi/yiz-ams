import express from "express";

import {
  create,
  getAll,
  getById,
  getByMember,
  update,
  remove,
} from "../controllers/contributionController.js";

import contributionValidation from "../middlewares/contributionValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";

const router = express.Router();

// All contribution routes require authentication
router.use(authMiddleware);

// Get all contributions
router.get("/", getAll);

// Get contribution by ID
router.get("/:id", getById);

// Get contributions for a member
router.get("/member/:memberId", getByMember);

// Create contribution (Admin only)
router.post(
  "/",
  authorize("ADMIN"),
  contributionValidation,
  create
);

// Update contribution (Admin only)
router.put(
  "/:id",
  authorize("ADMIN"),
  contributionValidation,
  update
);

// Delete contribution (Admin only)
router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;