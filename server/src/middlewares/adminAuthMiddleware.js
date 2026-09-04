import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const adminAuthMiddleware = async (req, res, next) => {
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
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!admin.organizationId) {
      return res.status(403).json({
        success: false,
        message: "Admin is not assigned to an organization.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default adminAuthMiddleware;
