import prisma from "../config/prisma.js";

// ========================================
// DASHBOARD SUMMARY
// ========================================

export const getDashboardSummary = async () => {
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [
    totalMembers,
    activeMembers,
    contributionAggregate,
    monthlyContributionAggregate,
    expenseAggregate,
    pendingPaymentRequests,
    recentPaymentRequests,
    recentExpenses,
    announcements,
    settings,
  ] = await Promise.all([
    // ------------------------------------
    // 1. TOTAL MEMBERS
    // ------------------------------------
    prisma.member.count(),

    // ------------------------------------
    // 2. ACTIVE MEMBERS
    // ------------------------------------
    prisma.member.count({
      where: {
        status: "ACTIVE",
      },
    }),

    // ------------------------------------
    // 3. TOTAL CONTRIBUTIONS
    // ------------------------------------
    prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
    }),

    // ------------------------------------
    // 4. CURRENT MONTH CONTRIBUTIONS
    // ------------------------------------
    prisma.contribution.aggregate({
      where: {
        year: currentYear,
        monthNumber: currentMonth,
      },
      _sum: {
        amount: true,
      },
    }),

    // ------------------------------------
    // 5. TOTAL EXPENSES
    // ------------------------------------
    prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    }),

    // ------------------------------------
    // 6. PENDING PAYMENT REQUESTS
    // ------------------------------------
    prisma.paymentRequest.count({
      where: {
        status: "PENDING",
      },
    }),

    // ------------------------------------
    // 7. RECENT PAYMENT REQUESTS
    // ------------------------------------
    prisma.paymentRequest.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),

    // ------------------------------------
    // 8. RECENT EXPENSES
    // ------------------------------------
    prisma.expense.findMany({
      take: 5,
      orderBy: {
        expenseDate: "desc",
      },
    }),

    // ------------------------------------
    // 9. RECENT ANNOUNCEMENTS
    // ------------------------------------
    prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),

    // ------------------------------------
    // 10. ASSOCIATION SETTINGS
    // ------------------------------------
    prisma.setting.findFirst(),
  ]);

  // ========================================
  // CALCULATIONS
  // ========================================

  const monthlyContribution =
    settings?.monthlyContributionAmount ?? 0;

  const expectedContributions =
    activeMembers * monthlyContribution;

  const totalContributionAmount =
    contributionAggregate._sum.amount ?? 0;

  const monthlyContributionAmount =
    monthlyContributionAggregate._sum.amount ?? 0;

  const totalExpenseAmount =
    expenseAggregate._sum.amount ?? 0;

  const availableBalance =
    totalContributionAmount - totalExpenseAmount;

  // ========================================
  // RETURN DASHBOARD DATA
  // ========================================

  return {
    // Member statistics
    totalMembers,
    activeMembers,

    // Contribution statistics
    expectedContributions,
    monthlyContributions: monthlyContributionAmount,
    totalContributions: totalContributionAmount,

    // Payment statistics
    pendingPaymentRequests,

    // Financial statistics
    totalIncome: totalContributionAmount,
    totalExpenses: totalExpenseAmount,
    availableBalance,

    // Recent activity
    recentPaymentRequests,
    recentExpenses,
    announcements,

    // Current period
    currentYear,
    currentMonth,

    // Association settings
    associationName: settings?.associationName ?? "YIZ-AMS",
    currency: settings?.currency ?? "NGN",
  };
};