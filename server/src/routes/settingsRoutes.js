import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import settingsValidation from "../middlewares/settingsValidation.js";
import associationLogoUploadMiddleware from "../middlewares/associationLogoUploadMiddleware.js";

import {
  get,
  update,
  uploadLogo,
} from "../controllers/settingsController.js";

const router = express.Router();

// ===============================
// Protect all settings routes
// ===============================
router.use(authMiddleware);
router.use(authorize("ADMIN"));

// ===============================
// Settings Routes
// ===============================

// Get settings
router.get("/", get);

// Update general settings
router.patch(
  "/",
  settingsValidation,
  update
);

// Upload association logo
router.post(
  "/logo",
  associationLogoUploadMiddleware.single("logo"),
  uploadLogo
);

export default router;