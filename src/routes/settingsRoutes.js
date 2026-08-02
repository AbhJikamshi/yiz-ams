import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import settingsValidation from "../middlewares/settingsValidation.js";

import {
  get,
  update,
} from "../controllers/settingsController.js";

const router = express.Router();

// Protect all settings routes
router.use(authMiddleware);
router.use(authorize("ADMIN"));

// Settings Routes
router.get("/", get);
router.patch("/", settingsValidation, update);

export default router;