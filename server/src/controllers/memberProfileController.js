import * as memberProfileService from "../services/memberProfileService.js";

// ===============================
// Get Logged-in Member Profile
// ===============================
export const getProfile = async (req, res, next) => {
  try {
    const profile = await memberProfileService.getProfile(
      req.member.id
    );

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Update Member Profile
// ===============================
export const updateProfile = async (req, res, next) => {
  try {
    const profile =
      await memberProfileService.updateProfile(
        req.member.id,
        req.body
      );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Change Password
// ===============================
export const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const { currentPassword, newPassword } =
      req.body;

    const result =
      await memberProfileService.changePassword(
        req.member.id,
        currentPassword,
        newPassword
      );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};