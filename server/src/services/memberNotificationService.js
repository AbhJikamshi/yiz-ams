import prisma from "../config/prisma.js";

export const getNotifications = async (memberId) => {
  return await prisma.notification.findMany({
    where: {
      memberId: Number(memberId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUnreadCount = async (memberId) => {
  return await prisma.notification.count({
    where: {
      memberId: Number(memberId),
      isRead: false,
    },
  });
};

export const markAsRead = async (memberId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: Number(notificationId),
      memberId: Number(memberId),
    },
  });

  if (!notification) {
    const error = new Error("Notification not found.");
    error.status = 404;
    throw error;
  }

  return await prisma.notification.update({
    where: {
      id: Number(notificationId),
    },
    data: {
      isRead: true,
    },
  });
};