import prisma from "../config/prisma.js";

// ========================================
// CREATE ANNOUNCEMENT
// ========================================

export const createAnnouncement = async (data, adminId) => {
  const numericAdminId = Number(adminId);

  if (!numericAdminId) {
    const error = new Error("Invalid admin ID.");
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // ----------------------------------------
    // 1. Create the announcement
    // ----------------------------------------

    const announcement = await tx.announcement.create({
      data: {
        title: data.title,
        message: data.message,
        createdById: numericAdminId,
      },
    });

    // ----------------------------------------
    // 2. Get all active members
    // ----------------------------------------

    const members = await tx.member.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    // ----------------------------------------
    // 3. Create notification for every
    //    active member
    // ----------------------------------------

    if (members.length > 0) {
      await tx.notification.createMany({
        data: members.map((member) => ({
          title: announcement.title,
          message: announcement.message,
          type: "ANNOUNCEMENT",
          memberId: member.id,
          createdById: numericAdminId,
          isRead: false,
        })),
      });
    }

    // ----------------------------------------
    // 4. Return the created announcement
    // ----------------------------------------

    return announcement;
  });
};

// ========================================
// GET ALL ANNOUNCEMENTS
// ========================================

export const getAnnouncements = async () => {
  return await prisma.announcement.findMany({
    where: {
      isActive: true,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ========================================
// GET ANNOUNCEMENT BY ID
// ========================================

export const getAnnouncementById = async (id) => {
  const announcementId = Number(id);

  if (!announcementId) {
    const error = new Error("Invalid announcement ID.");
    error.status = 400;
    throw error;
  }

  const announcement = await prisma.announcement.findUnique({
    where: {
      id: announcementId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!announcement || !announcement.isActive) {
    const error = new Error("Announcement not found.");
    error.status = 404;
    throw error;
  }

  return announcement;
};

// ========================================
// UPDATE ANNOUNCEMENT
// ========================================

export const updateAnnouncement = async (id, data) => {
  const announcementId = Number(id);

  if (!announcementId) {
    const error = new Error("Invalid announcement ID.");
    error.status = 400;
    throw error;
  }

  return await prisma.announcement.update({
    where: {
      id: announcementId,
    },

    data: {
      title: data.title,
      message: data.message,
    },
  });
};

// ========================================
// DELETE ANNOUNCEMENT
// ========================================

export const deleteAnnouncement = async (id) => {
  const announcementId = Number(id);

  if (!announcementId) {
    const error = new Error("Invalid announcement ID.");
    error.status = 400;
    throw error;
  }

  return await prisma.announcement.update({
    where: {
      id: announcementId,
    },

    data: {
      isActive: false,
    },
  });
};