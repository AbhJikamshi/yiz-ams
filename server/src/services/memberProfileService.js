import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

// ======================================================
// GET MEMBER PROFILE
// ======================================================
export const getProfile = async (memberId) => {
  const member = await prisma.member.findUnique({
    where: {
      id: Number(memberId),
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

  if (!member) {
    const error = new Error("Member not found.");
    error.status = 404;
    throw error;
  }

  return member;
};

// ======================================================
// UPDATE MEMBER SETTINGS
// ======================================================
// Member can change:
// - Phone
// - Email
// - Address
//
// Member CANNOT change:
// - Full name
// - Status
// - Member ID
// - Contribution information
// ======================================================
export const updateProfile = async (memberId, data) => {
  const id = Number(memberId);

  const member = await prisma.member.findUnique({
    where: {
      id,
    },
  });

  if (!member) {
    const error = new Error("Member not found.");
    error.status = 404;
    throw error;
  }

  const updateData = {};

  // ----------------------------------------------------
  // Phone
  // ----------------------------------------------------
  if (data.phone !== undefined) {
    updateData.phone =
      data.phone === null
        ? null
        : String(data.phone).trim();
  }

  // ----------------------------------------------------
  // Email
  // ----------------------------------------------------
  if (data.email !== undefined) {
    const email =
      data.email === null
        ? null
        : String(data.email).trim().toLowerCase();

    // Check whether another member already uses this email
    if (email) {
      const existingMember =
        await prisma.member.findFirst({
          where: {
            email,
            NOT: {
              id,
            },
          },
        });

      if (existingMember) {
        const error = new Error(
          "This email address is already registered to another member."
        );

        error.status = 409;
        throw error;
      }
    }

    updateData.email = email;
  }

  // ----------------------------------------------------
  // Address
  // ----------------------------------------------------
  if (data.address !== undefined) {
    updateData.address =
      data.address === null
        ? null
        : String(data.address).trim();
  }

  // ----------------------------------------------------
  // IMPORTANT:
  // fullName is deliberately NOT included.
  // Members cannot change their official name.
  // ----------------------------------------------------

  return prisma.member.update({
    where: {
      id,
    },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      status: true,
    },
  });
};

// ======================================================
// CHANGE MEMBER PASSWORD
// ======================================================
export const changePassword = async (
  memberId,
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    const error = new Error(
      "Current password and new password are required."
    );

    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error(
      "New password must be at least 6 characters long."
    );

    error.status = 400;
    throw error;
  }

  const member = await prisma.member.findUnique({
    where: {
      id: Number(memberId),
    },
  });

  if (!member) {
    const error = new Error("Member not found.");
    error.status = 404;
    throw error;
  }

  if (!member.password) {
    const error = new Error(
      "Password has not been set for this account."
    );

    error.status = 400;
    throw error;
  }

  const valid = await bcrypt.compare(
    currentPassword,
    member.password
  );

  if (!valid) {
    const error = new Error(
      "Current password is incorrect."
    );

    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await prisma.member.update({
    where: {
      id: Number(memberId),
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully.",
  };
};