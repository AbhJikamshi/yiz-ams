import prisma from "../config/prisma.js";

export const getDashboard = async (month, year) => {
  // Build optional contribution filter
  const contributionFilter = {};

  if (month) contributionFilter.month = month;
  if (year) contributionFilter.year = Number(year);

  // Total Members
  const totalMembers = await prisma.member.count();

  // Total Contributions
  const contributionAggregate = await prisma.contribution.aggregate({
    _sum: {
      amount: true,
    },
    where: contributionFilter,
  });

  const totalContributions = contributionAggregate._sum.amount || 0;

  // Total Expenses
  const expenseFilter = {};

  if (year) {
    expenseFilter.expenseDate = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${Number(year) + 1}-01-01`),
    };
  }

  const expenseAggregate = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
    where: expenseFilter,
  });

  const totalExpenses = expenseAggregate._sum.amount || 0;

  // Available Balance
  const availableBalance = totalContributions - totalExpenses;

  // Expected Contributions
  const expectedContributions = totalMembers * 500;

  // Outstanding Contributions
  const outstandingContributions =
    expectedContributions - totalContributions;

  // Members Paid
  const membersPaidThisMonth = await prisma.contribution.groupBy({
    by: ["memberId"],
    where: contributionFilter,
  });

  const paidCount = membersPaidThisMonth.length;

  return {
    availableBalance,
    totalContributions,
    totalExpenses,
    expectedContributions,
    outstandingContributions,
    totalMembers,
    membersPaidThisMonth: paidCount,
    membersYetToPay: totalMembers - paidCount,
  };
};