import generateToken from "../utils/generateToken.js";
import {
  registerAdmin,
  loginAdmin,
} from "../services/authService.js";

// ===============================
// Register Admin
// ===============================
export const register = async (req, res, next) => {
  try {
    const admin = await registerAdmin(req.body);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Login Admin
// ===============================
export const login = async (req, res, next) => {
  try {
    const admin = await loginAdmin(req.body);

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};