import express from "express";
import * as memberAuthController from "../controllers/memberAuthController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// Register Member
router.post(
  "/register",
  memberAuthController.register
);

// Member Login
router.post(
  "/login",
  memberAuthController.login
);

// Logged-in Member Profile
router.get(
  "/profile",
  memberAuthMiddleware,
  memberAuthController.profile
);

export default router;