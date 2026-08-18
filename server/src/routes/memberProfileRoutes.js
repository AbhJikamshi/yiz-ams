import express from "express";
import * as memberProfileController from "../controllers/memberProfileController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(memberAuthMiddleware);

// Get profile
router.get(
  "/",
  memberProfileController.getProfile
);

// Update profile
router.put(
  "/",
  memberProfileController.updateProfile
);

// Change password
router.put(
  "/change-password",
  memberProfileController.changePassword
);

export default router;