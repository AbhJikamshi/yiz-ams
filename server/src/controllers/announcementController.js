import * as announcementService from "../services/announcementService.js";

export const create = async (req, res, next) => {
  try {
    const announcement = await announcementService.createAnnouncement(
      req.body,
      req.admin.id
    );

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const announcements =
      await announcementService.getAnnouncements();

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const announcement =
      await announcementService.getAnnouncementById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const announcement =
      await announcementService.updateAnnouncement(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncement(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};