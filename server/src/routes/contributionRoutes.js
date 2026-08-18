import express from "express";

import {
  getAll,
  getById,
  create,
  update,
  remove,
  getByMember,
  getOverview,
  getAdminOverview,
} from "../controllers/contributionController.js";

const router = express.Router();

// ============================================================
// CONTRIBUTION OVERVIEW ROUTES
// IMPORTANT:
// These MUST come BEFORE /:id
// Otherwise "overview" will be treated as an ID.
// ============================================================

// Main member-level contribution overview
router.get("/overview", getOverview);

// Admin monthly contribution overview
router.get("/admin-overview", getAdminOverview);

// ============================================================
// CONTRIBUTION LIST
// ============================================================

router.get("/", getAll);

// ============================================================
// CONTRIBUTIONS BY MEMBER
// IMPORTANT:
// This must also come BEFORE /:id
// ============================================================

router.get("/member/:memberId", getByMember);

// ============================================================
// SINGLE CONTRIBUTION
// ============================================================

router.get("/:id", getById);

// ============================================================
// CREATE
// ============================================================

router.post("/", create);

// ============================================================
// UPDATE
// ============================================================

router.put("/:id", update);

// ============================================================
// DELETE
// ============================================================

router.delete("/:id", remove);

export default router;