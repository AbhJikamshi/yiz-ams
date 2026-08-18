import express from "express";
import * as memberNotificationController from "../controllers/memberNotificationController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// Get all notifications
router.get(
  "/notifications",
  memberAuthMiddleware,
  memberNotificationController.notifications
);

// Get unread count
router.get(
  "/notifications/unread-count",
  memberAuthMiddleware,
  memberNotificationController.unreadCount
);

// Mark notification as read
router.patch(
  "/notifications/:notificationId/read",
  memberAuthMiddleware,
  memberNotificationController.markRead
);

export default router;