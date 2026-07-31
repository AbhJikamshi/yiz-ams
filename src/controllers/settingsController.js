import {
  getSettings,
  updateSettings,
} from "../services/settingsService.js";

export const get = async (req, res, next) => {
  try {
    const settings = await getSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body);

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};