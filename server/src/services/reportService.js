import prisma from "../config/prisma.js";

import { generateContributionExcel } from "../excel/contributionExcel.js";
import { generateMemberExcel } from "../excel/memberExcel.js";
import { generateExpenseExcel } from "../excel/expenseExcel.js";
import { generateFinancialSummaryExcel } from "../excel/financialSummaryExcel.js";

// =====================================================
// Financial Summary
// =====================================================

export const getFinancialSummary = async () => {
  // ---------------------------------------------------
  // LOAD ASSOCIATION SETTINGS
  // ---------------------------------------------------

  const settings = await prisma.setting.findFirst();

  const monthlyContribution =
    Number(settings?.monthlyContributionAmount ?? 0);

  const financialYearStart =
    Number(settings?.financialYearStart ?? new Date().getFullYear());

  const financialYearEnd =
    Number(settings?.financialYearEnd ?? financialYearStart);

  // ---------------------------------------------------
  // ACTIVE MEMBERS
  // ---------------------------------------------------

  const totalMembers = await prisma.member.count({
    where: {
      status: "ACTIVE",
    },
  });

  // ---------------------------------------------------
  // DETERMINE NUMBER OF MONTHS IN FINANCIAL YEAR
  // ---------------------------------------------------

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let monthsElapsed = 0;

  if (financialYearStart === financialYearEnd) {
    // Financial year is within the same calendar year.
    //
    // Example:
    // Start: 2026
    // End:   2026

    if (currentYear >= financialYearStart) {
      monthsElapsed = currentMonth;
    }
  } else if (financialYearEnd > financialYearStart) {
    // Financial year spans multiple years.
    //
    // Example:
    // Start: 2025
    // End:   2026

    if (currentYear < financialYearStart) {
      monthsElapsed = 0;
    } else if (currentYear > financialYearEnd) {
      monthsElapsed = 12;
    } else {
      monthsElapsed =
        (currentYear - financialYearStart) * 12 +
        currentMonth;
    }
  } else {
    // -------------------------------------------------
    // HANDLE A FINANCIAL YEAR THAT CROSSES YEAR-END
    // -------------------------------------------------
    //
    // Example:
    // Start: 2025
    // End:   2026
    //
    // This branch also protects against unusual settings.

    if (currentYear >= financialYearStart) {
      monthsElapsed =
        (currentYear - financialYearStart) * 12 +
        currentMonth;
    }
  }

  // Keep the value within a reasonable range.
  monthsElapsed = Math.max(
    0,
    Math.min(monthsElapsed, 12)
  );

  // ---------------------------------------------------
  // EXPECTED CONTRIBUTIONS
  // ---------------------------------------------------

  const expectedContributions =
    totalMembers *
    monthlyContribution *
    monthsElapsed;

  // ---------------------------------------------------
  // ACTUAL CONTRIBUTIONS RECEIVED
  // ---------------------------------------------------

  const contributionAggregate =
    await prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
    });

  const receivedContributions =
    Number(
      contributionAggregate._sum.amount ?? 0
    );

  // ---------------------------------------------------
  // TOTAL EXPENSES
  // ---------------------------------------------------

  const expenseAggregate =
    await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

  const totalExpenses =
    Number(
      expenseAggregate._sum.amount ?? 0
    );

  // ---------------------------------------------------
  // OUTSTANDING CONTRIBUTIONS
  // ---------------------------------------------------

  const outstandingContributions =
    Math.max(
      expectedContributions -
        receivedContributions,
      0
    );

  // ---------------------------------------------------
  // AVAILABLE BALANCE
  // ---------------------------------------------------

  const availableBalance =
    receivedContributions -
    totalExpenses;

  // ---------------------------------------------------
  // COLLECTION RATE
  // ---------------------------------------------------

  const collectionRate =
    expectedContributions === 0
      ? 0
      : Number(
          (
            (receivedContributions /
              expectedContributions) *
            100
          ).toFixed(2)
        );

  // ---------------------------------------------------
  // RETURN FINANCIAL SUMMARY
  // ---------------------------------------------------

  return {
    totalMembers,

    monthlyContribution,

    financialYearStart,

    financialYearEnd,

    monthsElapsed,

    expectedContributions,

    receivedContributions,

    outstandingContributions,

    totalExpenses,

    availableBalance,

    netIncome: availableBalance,

    collectionRate,
  };
};
// =====================================================
// Contribution Report
// =====================================================

export const getContributionReport = async (
  filters = {}
) => {
  const where = {};

  if (filters.memberId) {
    const memberId = Number(filters.memberId);

    if (!Number.isNaN(memberId)) {
      where.memberId = memberId;
    }
  }

  if (filters.year) {
    const year = Number(filters.year);

    if (!Number.isNaN(year)) {
      where.year = year;
    }
  }

  if (filters.monthNumber) {
    const month = Number(filters.monthNumber);

    if (
      !Number.isNaN(month) &&
      month >= 1 &&
      month <= 12
    ) {
      where.monthNumber = month;
    }
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const contributions =
    await prisma.contribution.findMany({
      where,
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

  return {
    records: contributions,
    totalRecords: contributions.length,
    totalAmount: contributions.reduce(
      (sum, contribution) =>
        sum + contribution.amount,
      0
    ),
  };
};

// =====================================================
// Expense Report
// =====================================================

export const getExpenseReport = async (
  filters = {}
) => {
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.year) {
    const year = Number(filters.year);

    if (!Number.isNaN(year)) {
      where.expenseDate = {};

      if (filters.monthNumber) {
        const month = Number(filters.monthNumber);

        if (
          !Number.isNaN(month) &&
          month >= 1 &&
          month <= 12
        ) {
          where.expenseDate.gte = new Date(
            year,
            month - 1,
            1
          );

          where.expenseDate.lt = new Date(
            year,
            month,
            1
          );
        }
      } else {
        where.expenseDate.gte = new Date(
          year,
          0,
          1
        );

        where.expenseDate.lt = new Date(
          year + 1,
          0,
          1
        );
      }
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: {
      expenseDate: "desc",
    },
  });

  return {
    records: expenses,
    totalRecords: expenses.length,
    totalAmount: expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    ),
  };
};

// =====================================================
// Member Statement
// =====================================================

export const getMemberStatement = async (
  memberId
) => {
  const member = await prisma.member.findUnique({
    where: {
      id: Number(memberId),
    },
    include: {
      contributions: {
        orderBy: [
          {
            year: "desc",
          },
          {
            monthNumber: "desc",
          },
        ],
      },
    },
  });

  if (!member) {
    const error = new Error("Member not found.");
    error.statusCode = 404;
    throw error;
  }

  const totalPaid =
    member.contributions.reduce(
      (sum, contribution) =>
        sum + contribution.amount,
      0
    );

  const contributionCount =
    member.contributions.length;

  const averageContribution =
    contributionCount === 0
      ? 0
      : Number(
          (
            totalPaid /
            contributionCount
          ).toFixed(2)
        );

  return {
    member,
    payments: member.contributions,
    totalPaid,
    contributionCount,
    averageContribution,
  };
};

// =====================================================
// Excel Exports
// =====================================================

export const getContributionWorkbook =
  async () => {
    const contributions =
      await prisma.contribution.findMany({
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

    const workbook =
      await generateContributionExcel(
        contributions
      );

    return workbook;
  };

export const getMemberWorkbook =
  async () => {
    const members =
      await prisma.member.findMany({
        orderBy: {
          fullName: "asc",
        },
      });

    const workbook =
      await generateMemberExcel(members);

    return workbook;
  };

export const getExpenseWorkbook =
  async () => {
    const expenses =
      await prisma.expense.findMany({
        orderBy: {
          expenseDate: "desc",
        },
      });

    const workbook =
      await generateExpenseExcel(expenses);

    return workbook;
  };

export const getFinancialSummaryWorkbook =
  async () => {
    const summary =
      await getFinancialSummary();

    const workbook =
      await generateFinancialSummaryExcel(
        summary
      );

    return workbook;
  };




// ========================================
// ADMIN SUMMARY
// ========================================



export const getAdminSummary = async () => {
  const totalMembers = await prisma.member.count();

  const activeMembers = await prisma.member.count({
    where: {
      status: "ACTIVE",
    },
  });

  const inactiveMembers = await prisma.member.count({
    where: {
      status: "INACTIVE",
    },
  });

  const income = await prisma.contribution.aggregate({
    _sum: {
      amount: true,
    },
  });

  const expenses = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  return {
    totalMembers,
    activeMembers,
    inactiveMembers,

    totalIncome:
      income._sum.amount || 0,

    totalExpenses:
      expenses._sum.amount || 0,

    netBalance:
      (income._sum.amount || 0) -
      (expenses._sum.amount || 0),
  };
};
// ========================================
// MONTHLY INCOME
// ========================================
export const getMonthlyIncome = async () => {
  const records =
    await prisma.contribution.groupBy({
      by: ["year", "monthNumber"],

      _sum: {
        amount: true,
      },

      orderBy: [
        {
          year: "asc",
        },
        {
          monthNumber: "asc",
        },
      ],
    });

  return records;
};
// ========================================
// MONTHLY EXPENSES
// ========================================
export const getMonthlyExpenses =
  async () => {
    const expenses =
      await prisma.expense.findMany({
        orderBy: {
          expenseDate: "asc",
        },
      });

    const grouped = {};

    expenses.forEach((expense) => {
      const year =
        expense.expenseDate.getFullYear();

      const month =
        expense.expenseDate.getMonth() + 1;

      const key = `${year}-${month}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          total: 0,
        };
      }

      grouped[key].total += expense.amount;
    });

    return Object.values(grouped);
  };

// ========================================
// OUTSTANDING MEMBERS
// ========================================

export const getOutstandingMembers = async () => {
  // Get association settings
  const setting = await prisma.setting.findFirst();

  if (!setting) {
    throw new Error("Association settings not found");
  }

  const monthlyContribution =
    Number(setting.monthlyContributionAmount) || 0;

  const financialYearStart = Number(setting.financialYearStart);
  const financialYearEnd = Number(setting.financialYearEnd);

  // ---------------------------------------------
  // DETERMINE MONTHS ELAPSED
  // ---------------------------------------------

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let monthsElapsed = 0;

  if (financialYearStart === financialYearEnd) {
    if (currentYear >= financialYearStart) {
      monthsElapsed = currentMonth;
    }
  } else if (financialYearEnd > financialYearStart) {
    if (currentYear < financialYearStart) {
      monthsElapsed = 0;
    } else if (currentYear > financialYearEnd) {
      monthsElapsed = 12;
    } else {
      monthsElapsed =
        (currentYear - financialYearStart) * 12 +
        currentMonth;
    }
  } else {
    // Financial year crosses calendar year boundary
    if (currentYear >= financialYearStart) {
      monthsElapsed =
        (currentYear - financialYearStart) * 12 +
        currentMonth;
    }
  }

  monthsElapsed = Math.max(
    0,
    Math.min(monthsElapsed, 12)
  );

  // ---------------------------------------------
  // GET MEMBERS AND THEIR CONTRIBUTIONS
  // ---------------------------------------------

  const members = await prisma.member.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      contributions: {
        select: {
          id: true,
          amount: true,
          year: true,
          monthNumber: true,
          status: true,
        },
      },
    },
  });

  // ---------------------------------------------
  // CALCULATE OUTSTANDING BALANCE
  // ---------------------------------------------

  const outstandingMembers = members
    .map((member) => {
      const expectedAmount =
        monthlyContribution * monthsElapsed;

      const paidAmount = member.contributions
        .filter((contribution) => {
          if (contribution.status !== "PAID") {
            return false;
          }

          // Same financial year
          if (financialYearStart === financialYearEnd) {
            return (
              contribution.year === financialYearStart
            );
          }

          // Financial year within normal calendar order
          if (financialYearEnd > financialYearStart) {
            return (
              contribution.year >= financialYearStart &&
              contribution.year <= financialYearEnd
            );
          }

          // Financial year crosses year-end
          return (
            contribution.year >= financialYearStart ||
            contribution.year <= financialYearEnd
          );
        })
        .reduce(
          (total, contribution) =>
            total + Number(contribution.amount || 0),
          0
        );

      const outstandingBalance = Math.max(
        0,
        expectedAmount - paidAmount
      );

      return {
        id: member.id,
        fullName: member.fullName,
        phone: member.phone,
        email: member.email,
        status: member.status,
        expectedAmount,
        paidAmount,
        outstandingBalance,
      };
    })
    .filter(
      (member) => member.outstandingBalance > 0
    )
    .sort(
      (a, b) =>
        b.outstandingBalance - a.outstandingBalance
    );

  return outstandingMembers;
};