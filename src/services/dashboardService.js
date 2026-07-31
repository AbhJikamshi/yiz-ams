import prisma from "../config/prisma.js";

export const getDashboardSummary = async () => {
  const totalMembers = await prisma.member.count();

  const totalContributions = await prisma.contribution.aggregate({
    _sum: {
      amount: true,
    },
  });

  const totalExpenses = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  const settings = await prisma.setting.findFirst();

  const monthlyContribution =
    settings?.monthlyContributionAmount ?? 0;

  const expectedContributions =
    totalMembers * monthlyContribution;

  const totalContributionAmount =
    totalContributions._sum.amount ?? 0;

  const totalExpenseAmount =
    totalExpenses._sum.amount ?? 0;

  const availableBalance =
    totalContributionAmount - totalExpenseAmount;

  return {
    totalMembers,
    expectedContributions,
    totalContributions: totalContributionAmount,
    totalExpenses: totalExpenseAmount,
    availableBalance,
  };
};