import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  console.log("Login password:", password);

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