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

// All routes require login
router.use(authMiddleware);

// Get all contributions
router.get("/", getAll);

// Get all contributions for one member
router.get("/member/:memberId", getByMember);

// Get one contribution
router.get("/:id", getById);

// Create contribution
router.post(
  "/",
  authorize("ADMIN"),
  contributionValidation,
  create
);

// Update contribution
router.put(
  "/:id",
  authorize("ADMIN"),
  contributionValidation,
  update
);

// Delete contribution
router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;