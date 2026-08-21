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
// Get Member Settings
// ===============================
export const getMemberSettings = async (req, res, next) => {
  try {
    const settings =
      await settingsService.getMemberSettings();

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
    const settings =
      await settingsService.updateSettings(req.body);

    res.json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Upload Association Logo
// ===============================
export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an association logo.",
      });
    }

    const logoPath =
      `/uploads/association/${req.file.filename}`;

    const settings =
      await settingsService.updateAssociationLogo(
        logoPath
      );

    res.json({
      success: true,
      message: "Association logo uploaded successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};