import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./emailService.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Register Member
export const registerMember = async (data) => {
  const existing = await prisma.member.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existing) {
    const error = new Error("Email already exists.");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const member = await prisma.member.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: hashedPassword,
      status: "ACTIVE",
    },
  });

  return member;
};

// Member Login
export const loginMember = async (email, password) => {
  console.log("Login email:", email);

  const member = await prisma.member.findUnique({
    where: { email },
  });

  console.log("Member from DB:", member);

  if (!member) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(
    password,
    member.password
  );

  console.log("Password match:", validPassword);

  if (!validPassword) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  if (member.status !== "ACTIVE") {
    const error = new Error("Member account is inactive.");
    error.status = 403;
    throw error;
  }

  const token = jwt.sign(
    {
      id: member.id,
      role: "MEMBER",
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    member: {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
    },
  };
};

// Verify Member
export const verifyMember = async (id) => {
  return await prisma.member.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      status: true,
      createdAt: true,
    },
  });
};

// Request Password Reset
export const requestPasswordReset = async (email) => {
  const member = await prisma.member.findUnique({
    where: { email },
  });

  // Always return the same response whether the email exists or not.
  if (!member) {
    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  // Remove any previous reset tokens for this member.
  await prisma.memberPasswordReset.deleteMany({
    where: {
      memberId: member.id,
    },
  });

  // Generate a secure random token.
  const resetToken = crypto.randomBytes(32).toString("hex");

  const expiresInMinutes =
    Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 15;

  const expiresAt = new Date(
    Date.now() + expiresInMinutes * 60 * 1000
  );

  await prisma.memberPasswordReset.create({
    data: {
      token: resetToken,
      memberId: member.id,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({
    email: member.email,
    fullName: member.fullName,
    resetToken,
  });

  return {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
};

// Verify Password Reset Token
export const verifyPasswordResetToken = async (token) => {
  if (!token) {
    const error = new Error("Reset token is required.");
    error.status = 400;
    throw error;
  }

  const reset = await prisma.memberPasswordReset.findUnique({
    where: {
      token,
    },
  });

  if (!reset) {
    const error = new Error("Invalid or expired reset link.");
    error.status = 400;
    throw error;
  }

  if (reset.expiresAt < new Date()) {
    await prisma.memberPasswordReset.delete({
      where: {
        id: reset.id,
      },
    });

    const error = new Error("Invalid or expired reset link.");
    error.status = 400;
    throw error;
  }

  return {
    valid: true,
  };
};

// Reset Member Password
export const resetMemberPassword = async (
  token,
  newPassword
) => {
  if (!token) {
    const error = new Error("Reset token is required.");
    error.status = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error(
      "New password must be at least 6 characters long."
    );
    error.status = 400;
    throw error;
  }

  const reset = await prisma.memberPasswordReset.findUnique({
    where: {
      token,
    },
    include: {
      member: true,
    },
  });

  if (!reset || reset.expiresAt < new Date()) {
    if (reset) {
      await prisma.memberPasswordReset.delete({
        where: {
          id: reset.id,
        },
      });
    }

    const error = new Error("Invalid or expired reset link.");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.member.update({
      where: {
        id: reset.memberId,
      },
      data: {
        password: hashedPassword,
      },
    }),

    prisma.memberPasswordReset.delete({
      where: {
        id: reset.id,
      },
    }),
  ]);

  return {
    message: "Password reset successfully.",
  };
};