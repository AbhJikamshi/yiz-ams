import prisma from "../config/prisma.js";

// ===============================
// Create Contribution
// ===============================
export const createContribution = async (data) => {
  // Check if this member has already paid for the same month and year
  const existingContribution = await prisma.contribution.findFirst({
    where: {
      memberId: data.memberId,
      month: data.month,
      year: data.year,
    },
  });

  if (existingContribution) {
    const error = new Error(
      `This member has already paid for ${data.month} ${data.year}.`
    );

    error.statusCode = 409;

    throw error;
  }

  return await prisma.contribution.create({
    data,
    include: {
      member: true,
    },
  });
};
// ===============================
// Get All Contributions
// ===============================
export const getContributions = async () => {
  return await prisma.contribution.findMany({
    include: {
      member: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ===============================
// Get Contribution by ID
// ===============================
export const getContributionById = async (id) => {
  return await prisma.contribution.findUnique({
    where: {
      id,
    },
    include: {
      member: true,
    },
  });
};

// ===============================
// Get Contributions by Member
// ===============================
export const getContributionsByMember = async (memberId) => {
  return await prisma.contribution.findMany({
    where: {
      memberId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ===============================
// Update Contribution
// ===============================
export const updateContribution = async (id, data) => {
  return await prisma.contribution.update({
    where: {
      id,
    },
    data,
    include: {
      member: true,
    },
  });
};

// ===============================
// Delete Contribution
// ===============================
export const deleteContribution = async (id) => {
  return await prisma.contribution.delete({
    where: {
      id,
    },
  });
};