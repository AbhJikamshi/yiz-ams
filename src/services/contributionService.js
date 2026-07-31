import prisma from "../config/prisma.js";

export const createContribution = async (data) => {
  const existingContribution = await prisma.contribution.findFirst({
    where: {
      memberId: data.memberId,
      monthNumber: data.monthNumber,
      year: data.year,
    },
  });

  if (existingContribution) {
    const error = new Error(
      `This member has already paid for month ${data.monthNumber}, ${data.year}.`
    );
    error.status = 409;
    throw error;
  }

  return await prisma.contribution.create({
    data: {
      monthNumber: data.monthNumber,
      year: data.year,
      amount: data.amount,
      status: data.status ?? "PAID",
      memberId: data.memberId,
    },
    include: {
      member: true,
    },
  });
};

export const getContributions = async () => {
  return await prisma.contribution.findMany({
    include: {
      member: true,
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

export const getContributionById = async (id) => {
  const contribution = await prisma.contribution.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      member: true,
    },
  });

  if (!contribution) {
    const error = new Error("Contribution not found.");
    error.status = 404;
    throw error;
  }

  return contribution;
};

export const getContributionsByMember = async (memberId) => {
  return await prisma.contribution.findMany({
    where: {
      memberId: Number(memberId),
    },
    include: {
      member: true,
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

export const updateContribution = async (id, data) => {
  return await prisma.contribution.update({
    where: {
      id: Number(id),
    },
    data: {
      monthNumber: data.monthNumber,
      year: data.year,
      amount: data.amount,
      status: data.status,
      memberId: data.memberId,
    },
    include: {
      member: true,
    },
  });
};

export const deleteContribution = async (id) => {
  return await prisma.contribution.delete({
    where: {
      id: Number(id),
    },
  });
};