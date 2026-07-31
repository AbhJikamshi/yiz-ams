import express from "express";
import { get, update } from "../controllers/settingsController.js";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import settingsValidation from "../middlewares/settingsValidation.js";

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), get);

router.put(
  "/",
  protect,
  authorize("ADMIN"),
  settingsValidation,
  update
);

export default router;