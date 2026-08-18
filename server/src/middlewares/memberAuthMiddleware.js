import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const memberAuthMiddleware = async (req, res, next) => {
  try {
    console.log("========== MEMBER AUTH ==========");

    const authHeader = req.headers.authorization;
    console.log("Authorization:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required.",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    if (decoded.role !== "MEMBER") {
      return res.status(403).json({
        success: false,
        message: "Member access only.",
      });
    }

    console.log("Decoded role:", decoded.role);
    console.log("Decoded id:", decoded.id);

    const member = await prisma.member.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        status: true,
      },
    });

    console.log("Member:", member);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    if (member.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Member account is inactive.",
      });
    }

    req.member = member;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
export default memberAuthMiddleware;