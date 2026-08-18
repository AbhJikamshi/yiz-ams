import memberApi from "./memberApi";

// ========================================
// GET ALL MEMBER NOTIFICATIONS
// ========================================

export const getNotifications = async () => {
  const response = await memberApi.get(
    "/member/notifications"
  );

  return response.data;
};

// ========================================
// GET UNREAD NOTIFICATION COUNT
// ========================================

export const getUnreadNotificationCount = async () => {
  const response = await memberApi.get(
    "/member/notifications/unread-count"
  );

  return response.data;
};

// ========================================
// MARK NOTIFICATION AS READ
// ========================================

export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await memberApi.patch(
    `/member/notifications/${notificationId}/read`
  );

  return response.data;
};