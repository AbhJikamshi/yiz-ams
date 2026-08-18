import prisma from "../config/prisma.js";

export const getMemberDashboard = async (memberId) => {
  // ========================================
  // MEMBER INFORMATION
  // ========================================

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

  // ========================================
  // ASSOCIATION SETTINGS
  // ========================================

  const settings = await prisma.setting.findFirst();

  const monthlyContribution =
    settings?.monthlyContributionAmount ?? 0;

  // ========================================
  // MEMBER CONTRIBUTION SUMMARY
  // ========================================

  const totalPaid = member.contributions.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const contributionCount = member.contributions.length;

  const averageContribution =
    contributionCount === 0
      ? 0
      : Number(
          (totalPaid / contributionCount).toFixed(2)
        );

  const currentYear = new Date().getFullYear();

  const expectedContribution =
    monthlyContribution * 12;

  const outstanding = Math.max(
    expectedContribution - totalPaid,
    0
  );

  const collectionRate =
    expectedContribution === 0
      ? 0
      : Number(
          (
            (totalPaid / expectedContribution) *
            100
          ).toFixed(2)
        );

  // ========================================
  // RECENT MEMBER PAYMENTS
  // ========================================

  const recentPayments =
    member.contributions.slice(0, 5);

  // ========================================
  // ASSOCIATION-WIDE CONTRIBUTIONS
  // ========================================

  const contributionAggregate =
    await prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
    });

  const totalAssociationContributions =
    Number(
      contributionAggregate._sum.amount ?? 0
    );

  // ========================================
  // ASSOCIATION-WIDE EXPENSES
  // ========================================

  const expenseAggregate =
    await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

  const totalAssociationExpenses =
    Number(
      expenseAggregate._sum.amount ?? 0
    );

  // ========================================
  // ASSOCIATION BALANCE
  // ========================================

  const associationBalance =
    totalAssociationContributions -
    totalAssociationExpenses;

  // ========================================
  // ANNOUNCEMENTS
  // ========================================

  const announcements =
    await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

  // ========================================
  // MEMBER NOTIFICATIONS
  // ========================================

  const notifications =
    await prisma.notification.findMany({
      where: {
        memberId: member.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

  // ========================================
  // RESPONSE
  // ========================================

  return {
    member: {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      status: member.status,
    },

    // Personal financial information
    summary: {
      year: currentYear,
      monthlyContribution,
      totalPaid,
      outstanding,
      collectionRate,
      contributionCount,
      averageContribution,
    },

    // Association-wide financial information
    associationFinancials: {
      totalContributions:
        totalAssociationContributions,

      totalExpenses:
        totalAssociationExpenses,

      balance:
        associationBalance,
    },

    recentPayments,

    announcements,

    notifications,
  };
};