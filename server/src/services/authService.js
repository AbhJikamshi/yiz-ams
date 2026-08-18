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
  // Basic validation
  if (!fullName || !email || !password) {
    throw {
      status: 400,
      message: "Full name, email and password are required.",
    };
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
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
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
  });

  // Never return password
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
  // Basic validation
  if (!email || !password) {
    throw {
      status: 400,
      message: "Email and password are required.",
    };
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!admin) {
    throw {
      status: 401,
      message: "Invalid email or password.",
    };
  }

  // Compare password
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

  // Return admin without password
  const { password: _, ...adminWithoutPassword } = admin;

  return adminWithoutPassword;
};