import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================
    // ADMIN AUTHENTICATION ONLY
    // ========================================
    //
    // A valid MEMBER token is authenticated,
    // but it must not access ADMIN routes.
    //
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access only.",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;