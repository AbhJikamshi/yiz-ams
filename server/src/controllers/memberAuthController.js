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