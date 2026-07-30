import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

// ===============================
// Register Admin
// ===============================
export const registerAdmin = async ({
  fullName,
  email,
  password,
}) => {
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    throw {
      status: 409,
      message: "Admin with this email already exists.",
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
  });

  // Never return the password
  const { password: _, ...adminWithoutPassword } = admin;

  return adminWithoutPassword;
};

// ===============================
// Login Admin
// ===============================
export const loginAdmin = async ({
  email,
  password,
}) => {
  const admin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (!admin) {
    throw {
      status: 401,
      message: "Invalid email or password.",
    };
  }

  const passwordMatch = await bcrypt.compare(
    password,
    admin.password
  );

  if (!passwordMatch) {
    throw {
      status: 401,
      message: "Invalid email or password.",
    };
  }

  return admin;
};