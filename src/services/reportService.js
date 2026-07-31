import prisma from "../config/prisma.js";
import { generateContributionExcel } from "../excel/contributionExcel.js";
export const getFinancialSummary = async () => {
  const settings = await prisma.setting.findFirst();

  const totalMembers = await prisma.member.count();

  const contributionAggregate = await prisma.contribution.aggregate({
    _sum: {
      amount: true,
    },
  });

  const expenseAggregate = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  const receivedContributions = contributionAggregate._sum.amount ?? 0;
  const totalExpenses = expenseAggregate._sum.amount ?? 0;

  const monthlyContribution =
    settings?.monthlyContributionAmount ?? 0;

  const expectedContributions =
    totalMembers * monthlyContribution;

  const outstandingContributions =
    Math.max(expectedContributions - receivedContributions, 0);

  const availableBalance =
    receivedContributions - totalExpenses;

  const collectionRate =
    expectedContributions === 0
      ? 0
      : Number(
          (
            (receivedContributions / expectedContributions) *
            100
          ).toFixed(2)
        );

  return {
    totalMembers,
    expectedContributions,
    receivedContributions,
    outstandingContributions,
    totalExpenses,
    availableBalance,
    collectionRate,
  };
};

export const getContributionReport = async (filters) => {
  const where = {};

  if (filters.memberId)
    where.memberId = Number(filters.memberId);

  if (filters.year)
    where.year = Number(filters.year);

  if (filters.monthNumber)
    where.monthNumber = Number(filters.monthNumber);

  if (filters.status)
    where.status = filters.status;

  return await prisma.contribution.findMany({
    where,
    include: {
      member: true,
    },
    orderBy: [
      { year: "desc" },
      { monthNumber: "desc" },
    ],
  });
};

export const getExpenseReport = async (filters) => {
  const where = {};

  if (filters.category)
    where.category = filters.category;

  if (filters.year || filters.monthNumber) {
    where.expenseDate = {};

    if (filters.year) {
      const year = Number(filters.year);

      if (filters.monthNumber) {
        const month = Number(filters.monthNumber);

        where.expenseDate.gte = new Date(year, month - 1, 1);
        where.expenseDate.lt = new Date(year, month, 1);
      } else {
        where.expenseDate.gte = new Date(year, 0, 1);
        where.expenseDate.lt = new Date(year + 1, 0, 1);
      }
    }
  }

  return await prisma.expense.findMany({
    where,
    orderBy: {
      expenseDate: "desc",
    },
  });
};

export const getMemberStatement = async (memberId) => {
  const member = await prisma.member.findUnique({
    where: {
      id: Number(memberId),
    },
    include: {
      contributions: {
        orderBy: [
          { year: "desc" },
          { monthNumber: "desc" },
        ],
      },
    },
  });

  if (!member) {
    const error = new Error("Member not found.");
    error.status = 404;
    throw error;
  }
  const totalPaid = member.contributions.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    member,
    payments: member.contributions,
    totalPaid,
  };
};
export const getContributionWorkbook = async () => {
  const contributions = await prisma.contribution.findMany({
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
      {
        createdAt: "desc",
      },
    ],
  });

  return await generateContributionExcel(contributions);
};