import * as memberNotificationService from "../services/memberNotificationService.js";

export const notifications = async (req, res, next) => {
  try {
    const data =
      await memberNotificationService.getNotifications(
        req.member.id
      );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const unreadCount = async (req, res, next) => {
  try {
    const count =
      await memberNotificationService.getUnreadCount(
        req.member.id
      );

    res.json({
      success: true,
      data: {
        unread: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const notification =
      await memberNotificationService.markAsRead(
        req.member.id,
        req.params.notificationId
      );

    res.json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
