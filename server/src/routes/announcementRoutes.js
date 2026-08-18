import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import announcementValidation from "../middlewares/announcementValidation.js";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/announcementController.js";

const router = express.Router();

// Protect all announcement routes
router.use(authMiddleware);

// View announcements (Admin & Members)
router.get("/", getAll);
router.get("/:id", getOne);

// Admin only
router.post(
  "/",
  authorize("ADMIN"),
  announcementValidation,
  create
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  announcementValidation,
  update
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  remove
);

export default router;