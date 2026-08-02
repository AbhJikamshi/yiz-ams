import prisma from "../config/prisma.js";

// ===============================
// Dashboard Summary
// ===============================
export const getDashboardSummary = async () => {
  const [
    totalMembers,
    activeMembers,
    contributionAggregate,
    expenseAggregate,
    settings,
  ] = await Promise.all([
    prisma.member.count(),

    prisma.member.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    }),

    prisma.setting.findFirst(),
  ]);

  const monthlyContribution =
    settings?.monthlyContributionAmount ?? 0;

  const expectedContributions =
    totalMembers * monthlyContribution;

  const totalContributionAmount =
    contributionAggregate._sum.amount ?? 0;

  const totalExpenseAmount =
    expenseAggregate._sum.amount ?? 0;

  const availableBalance =
    totalContributionAmount - totalExpenseAmount;

  return {
    totalMembers,
    activeMembers,
    expectedContributions,
    totalContributions: totalContributionAmount,
    totalExpenses: totalExpenseAmount,
    availableBalance,
  };
};