import * as settingsService from "../services/settingsService.js";

// ===============================
// Get Settings
// ===============================
export const get = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Update Settings
// ===============================
export const update = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);

    res.json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};