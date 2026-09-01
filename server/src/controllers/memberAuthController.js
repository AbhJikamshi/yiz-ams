import * as memberAuthService from "../services/memberAuthService.js";

// Register Member
export const register = async (req, res, next) => {
  try {
    const member = await memberAuthService.registerMember(req.body);

    res.status(201).json({
      success: true,
      message: "Member registered successfully.",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Member Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await memberAuthService.loginMember(
      email,
      password
    );

    res.json({
      success: true,
      message: "Login successful.",
      token: result.token,
      member: result.member,
    });
  } catch (error) {
    next(error);
  }
};

// Get Logged-in Member Profile
export const profile = async (req, res, next) => {
  try {
    const member = await memberAuthService.verifyMember(
      req.member.id
    );

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Request Password Reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result =
      await memberAuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Verify Password Reset Token
export const verifyPasswordResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;

    const result =
      await memberAuthService.verifyPasswordResetToken(token);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Reset Member Password
export const resetMemberPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const result =
      await memberAuthService.resetMemberPassword(
        token,
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