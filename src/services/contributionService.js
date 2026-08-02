import prisma from "../config/prisma.js";

// ==========================================
// Create Contribution
// ==========================================
export const createContribution = async (data) => {
  return await prisma.contribution.create({
    data: {
      memberId: data.memberId,
      monthNumber: data.monthNumber,
      year: data.year,
      amount: data.amount,
      status: data.status,
      paymentDate: data.paymentDate
        ? new Date(data.paymentDate)
        : new Date(),
    },
    include: {
      member: true,
    },
  });
};

// ==========================================
// Get All Contributions
// ==========================================
export const getContributions = async () => {
  return await prisma.contribution.findMany({
    include: {
      member: true,
    },
    orderBy: {
      paymentDate: "desc",
    },
  });
};

// ==========================================
// Get Contribution By ID
// ==========================================
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

// ==========================================
// Get Contributions By Member
// ==========================================
export const getContributionsByMember = async (
  memberId
) => {
  return await prisma.contribution.findMany({
    where: {
      memberId,
    },
    orderBy: [
      {
        year: "desc",
      },
      {
        monthNumber: "desc",
      },
    ],
  });
};

// ==========================================
// Update Contribution
// ==========================================
export const updateContribution = async (
  id,
  data
) => {
  return await prisma.contribution.update({
    where: {
      id,
    },
    data: {
      monthNumber: data.monthNumber,
      year: data.year,
      amount: data.amount,
      status: data.status,
      paymentDate: data.paymentDate
        ? new Date(data.paymentDate)
        : undefined,
    },
    include: {
      member: true,
    },
  });
};

// ==========================================
// Delete Contribution
// ==========================================
export const deleteContribution = async (id) => {
  return await prisma.contribution.delete({
    where: {
      id,
    },
  });
};