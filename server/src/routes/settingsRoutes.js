import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";
import settingsValidation from "../middlewares/settingsValidation.js";
import associationLogoUploadMiddleware from "../middlewares/associationLogoUploadMiddleware.js";

import {
  get,
  getMemberSettings,
  update,
  uploadLogo,
} from "../controllers/settingsController.js";

const router = express.Router();

// ======================================================
// MEMBER SETTINGS
// ======================================================

router.get(
  "/member",
  memberAuthMiddleware,
  getMemberSettings
);

// ======================================================
// ADMIN SETTINGS
// ======================================================

router.use(authMiddleware);
router.use(authorize("ADMIN"));

router.get("/", get);

router.patch(
  "/",
  settingsValidation,
  update
);

router.post(
  "/logo",
  associationLogoUploadMiddleware.single("logo"),
  uploadLogo
);

export default router;