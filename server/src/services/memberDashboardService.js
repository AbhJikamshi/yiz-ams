import prisma from "../config/prisma.js";

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_CONTRIBUTION_START_MONTH = 12;
const DEFAULT_CONTRIBUTION_START_YEAR = 2024;

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ------------------------------------------------------------
// Month key
// ------------------------------------------------------------

const getMonthKey = (year, monthNumber) => {
  return `${Number(year)}-${String(
    Number(monthNumber)
  ).padStart(2, "0")}`;
};

// ------------------------------------------------------------
// Month label
// ------------------------------------------------------------

const getMonthLabel = (monthNumber, year) => {
  const date = new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );

  return date.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
};

// ------------------------------------------------------------
// Get months between two periods
// Inclusive
// ------------------------------------------------------------

const getMonthsBetween = (
  startYear,
  startMonth,
  endYear,
  endMonth
) => {
  const months = [];

  let year = Number(startYear);
  let month = Number(startMonth);

  const finalYear = Number(endYear);
  const finalMonth = Number(endMonth);

  while (
    year < finalYear ||
    (year === finalYear && month <= finalMonth)
  ) {
    months.push({
      year,
      monthNumber: month,
      key: getMonthKey(year, month),
      month: getMonthLabel(month, year),
    });

    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
};

// ------------------------------------------------------------
// Contribution collection start
// ------------------------------------------------------------

const getContributionStart = (settings) => {
  const month = Number(
    settings?.contributionStartMonth ||
      DEFAULT_CONTRIBUTION_START_MONTH
  );

  const year = Number(
    settings?.contributionStartYear ||
      DEFAULT_CONTRIBUTION_START_YEAR
  );

  return {
    monthNumber:
      month >= 1 && month <= 12
        ? month
        : DEFAULT_CONTRIBUTION_START_MONTH,

    year:
      year >= 2000
        ? year
        : DEFAULT_CONTRIBUTION_START_YEAR,
  };
};

// ------------------------------------------------------------
// Current contribution period
// ------------------------------------------------------------

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthNumber: now.getMonth() + 1,
  };
};

// ============================================================
// MEMBER EFFECTIVE CONTRIBUTION START
// ============================================================

const getMemberContributionStart = (
  member,
  associationStart
) => {
  let effectiveStartYear =
    associationStart.year;

  let effectiveStartMonth =
    associationStart.monthNumber;

  // ----------------------------------------------------------
  // 1. Explicit member contribution start date
  // ----------------------------------------------------------

  if (member.contributionStartDate) {
    const memberStartDate = new Date(
      member.contributionStartDate
    );

    if (!Number.isNaN(memberStartDate.getTime())) {
      effectiveStartYear =
        memberStartDate.getFullYear();

      effectiveStartMonth =
        memberStartDate.getMonth() + 1;
    }

    return {
      year: effectiveStartYear,
      monthNumber: effectiveStartMonth,
    };
  }

  // ----------------------------------------------------------
  // 2. Fall back to member createdAt
  // ----------------------------------------------------------

  if (member.createdAt) {
    const memberCreatedAt = new Date(
      member.createdAt
    );

    if (!Number.isNaN(memberCreatedAt.getTime())) {
      const memberYear =
        memberCreatedAt.getFullYear();

      const memberMonth =
        memberCreatedAt.getMonth() + 1;

      const memberJoinedAfterAssociationStart =
        memberYear > associationStart.year ||
        (
          memberYear === associationStart.year &&
          memberMonth >
            associationStart.monthNumber
        );

      if (
        memberJoinedAfterAssociationStart
      ) {
        effectiveStartYear =
          memberYear;

        effectiveStartMonth =
          memberMonth;
      }
    }
  }

  return {
    year: effectiveStartYear,
    monthNumber: effectiveStartMonth,
  };
};

// ============================================================
// GET MEMBER DASHBOARD
// ============================================================

export const getMemberDashboard = async (
  memberId
) => {
  // ==========================================================
  // MEMBER
  // ==========================================================

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
          {
            paymentDate: "desc",
          },
        ],
      },

      paymentRequests: {
        where: {
          status: "PENDING",
        },

        include: {
          months: {
            orderBy: [
              {
                year: "asc",
              },
              {
                monthNumber: "asc",
              },
            ],
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!member) {
    const error = new Error(
      "Member not found."
    );

    error.status = 404;

    throw error;
  }

  // ==========================================================
  // ASSOCIATION SETTINGS
  // ==========================================================

  const settings =
    await prisma.setting.findFirst({
      orderBy: {
        id: "asc",
      },
    });

  const monthlyContribution =
    toNumber(
      settings?.monthlyContributionAmount
    );

  // ==========================================================
  // CONTRIBUTION PERIOD
  // ==========================================================

  const associationStart =
    getContributionStart(settings);

  const currentPeriod =
    getCurrentPeriod();

  // ==========================================================
  // MEMBER EFFECTIVE START
  // ==========================================================

  const memberStart =
    getMemberContributionStart(
      member,
      associationStart
    );

  // ==========================================================
  // DUE MONTHS
  // ==========================================================

  let dueMonths = [];

  if (
    memberStart.year <
      currentPeriod.year ||
    (
      memberStart.year ===
        currentPeriod.year &&
      memberStart.monthNumber <=
        currentPeriod.monthNumber
    )
  ) {
    dueMonths = getMonthsBetween(
      memberStart.year,
      memberStart.monthNumber,
      currentPeriod.year,
      currentPeriod.monthNumber
    );
  }

  // ==========================================================
  // PAID CONTRIBUTIONS MAP
  // ==========================================================

  const paidMap = new Map();

  let totalPaid = 0;

  let paidMonths = 0;

  let waivedMonths = 0;

  let partialAmount = 0;

  for (
    const contribution
    of member.contributions
  ) {
    const status = String(
      contribution.status || ""
    ).toUpperCase();

    const amount =
      toNumber(
        contribution.amount
      );

    const key = getMonthKey(
      contribution.year,
      contribution.monthNumber
    );

    // --------------------------------------------------------
    // PAID / APPROVED / WAIVED / PARTIAL
    // --------------------------------------------------------

    if (
      status === "PAID" ||
      status === "APPROVED" ||
      status === "WAIVED" ||
      status === "PARTIAL"
    ) {
      paidMap.set(key, {
        id: contribution.id,

        amount,

        status,

        year: Number(
          contribution.year
        ),

        monthNumber: Number(
          contribution.monthNumber
        ),

        paymentDate:
          contribution.paymentDate,
      });

      // ------------------------------------------------------
      // IMPORTANT
      //
      // WAIVED is not money paid.
      // Therefore it must NOT increase totalPaid.
      // ------------------------------------------------------

      if (
        status === "PAID" ||
        status === "APPROVED"
      ) {
        totalPaid += amount;

        paidMonths += 1;
      }

      if (
        status === "PARTIAL"
      ) {
        totalPaid += amount;

        partialAmount += amount;
      }

      if (
        status === "WAIVED"
      ) {
        waivedMonths += 1;
      }
    }
  }

  // ==========================================================
  // PENDING PAYMENT REQUESTS
  // ==========================================================

  const pendingMap = new Map();

  let pendingAmount = 0;

  let pendingRequestCount = 0;

  for (
    const request
    of member.paymentRequests || []
  ) {
    pendingRequestCount += 1;

    for (
      const month
      of request.months || []
    ) {
      const key = getMonthKey(
        month.year,
        month.monthNumber
      );

      const amount =
        toNumber(month.amount);

      // ------------------------------------------------------
      // Avoid counting the same month twice
      // ------------------------------------------------------

      if (!pendingMap.has(key)) {
        pendingMap.set(key, {
          id: month.id,

          requestId:
            request.id,

          year: Number(
            month.year
          ),

          monthNumber: Number(
            month.monthNumber
          ),

          amount,

          month:
            getMonthLabel(
              month.monthNumber,
              month.year
            ),

          transactionReference:
            request.transactionReference,

          paymentDate:
            request.paymentDate,

          proofImage:
            request.proofImage,

          createdAt:
            request.createdAt,

          status:
            request.status,
        });

        pendingAmount += amount;
      }
    }
  }

  // ==========================================================
  // MONTHLY STATUS
  // ==========================================================

  const monthlyStatus = [];

  const outstandingMonths = [];

  const pendingMonths = [];

  let totalExpected = 0;

  let outstanding = 0;

  // ==========================================================
  // PROCESS EVERY DUE MONTH
  // ==========================================================

  for (
    const dueMonth of dueMonths
  ) {
    const key = dueMonth.key;

    const paid =
      paidMap.get(key);

    const pending =
      pendingMap.get(key);

    const paidAmount =
      toNumber(
        paid?.amount
      );

    const pendingAmountForMonth =
      toNumber(
        pending?.amount
      );

    // --------------------------------------------------------
    // WAIVED
    // --------------------------------------------------------

    if (
      paid?.status === "WAIVED"
    ) {
      monthlyStatus.push({
        year:
          dueMonth.year,

        monthNumber:
          dueMonth.monthNumber,

        month:
          dueMonth.month,

        amount: 0,

        expectedAmount:
          monthlyContribution,

        paidAmount: 0,

        pendingAmount:
          pendingAmountForMonth,

        outstandingAmount: 0,

        status: "WAIVED",
      });

      continue;
    }

    // --------------------------------------------------------
    // Expected contribution
    // --------------------------------------------------------

    totalExpected +=
      monthlyContribution;

    // --------------------------------------------------------
    // Remaining balance
    //
    // Same calculation used by Admin:
    //
    // monthly amount
    // - paid
    // - pending
    // --------------------------------------------------------

    let remainingAmount =
      monthlyContribution -
      paidAmount -
      pendingAmountForMonth;

    if (
      remainingAmount < 0
    ) {
      remainingAmount = 0;
    }

    // --------------------------------------------------------
    // Determine status
    // --------------------------------------------------------

    let status = "OVERDUE";

    let displayAmount =
      monthlyContribution;

    // --------------------------------------------------------
    // PAID / APPROVED
    // --------------------------------------------------------

    if (
      paid &&
      (
        paid.status === "PAID" ||
        paid.status === "APPROVED"
      )
    ) {
      status = "PAID";

      displayAmount =
        paidAmount;
    }

    // --------------------------------------------------------
    // PARTIAL
    // --------------------------------------------------------

    else if (
      paid &&
      paid.status === "PARTIAL"
    ) {
      status = "PARTIAL";

      displayAmount =
        paidAmount;
    }

    // --------------------------------------------------------
    // PENDING
    // --------------------------------------------------------

    else if (
      !paid &&
      pending
    ) {
      status = "PENDING";

      displayAmount =
        pendingAmountForMonth;

      pendingMonths.push({
        year:
          dueMonth.year,

        monthNumber:
          dueMonth.monthNumber,

        month:
          dueMonth.month,

        amount:
          pendingAmountForMonth,
      });
    }

    // --------------------------------------------------------
    // OUTSTANDING
    // --------------------------------------------------------

    if (
      remainingAmount > 0.01
    ) {
      outstanding +=
        remainingAmount;

      outstandingMonths.push({
        year:
          dueMonth.year,

        monthNumber:
          dueMonth.monthNumber,

        month:
          dueMonth.month,

        amount:
          remainingAmount,

        paidAmount,

        pendingAmount:
          pendingAmountForMonth,

        status,
      });
    }

    // --------------------------------------------------------
    // MONTHLY STATUS
    // --------------------------------------------------------

    monthlyStatus.push({
      year:
        dueMonth.year,

      monthNumber:
        dueMonth.monthNumber,

      month:
        dueMonth.month,

      amount:
        displayAmount,

      expectedAmount:
        monthlyContribution,

      paidAmount,

      pendingAmount:
        pendingAmountForMonth,

      outstandingAmount:
        remainingAmount,

      status,
    });
  }

  // ==========================================================
  // COMPLETION RATE
  // ==========================================================

  const collectionRate =
    totalExpected > 0
      ? Number(
          Math.min(
            (
              totalPaid /
              totalExpected
            ) * 100,
            100
          ).toFixed(2)
        )
      : 0;

  // ==========================================================
  // AVERAGE CONTRIBUTION
  // ==========================================================

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

  // ==========================================================
  // RECENT PAYMENTS
  // ==========================================================

  const recentPayments =
    member.contributions.slice(
      0,
      5
    );

  // ==========================================================
  // CONTRIBUTION HISTORY
  // ==========================================================

  const contributionHistory =
    member.contributions.map(
      (contribution) => ({
        id:
          contribution.id,

        year:
          Number(
            contribution.year
          ),

        monthNumber:
          Number(
            contribution.monthNumber
          ),

        month:
          getMonthLabel(
            contribution.monthNumber,
            contribution.year
          ),

        amount:
          toNumber(
            contribution.amount
          ),

        status:
          contribution.status,

        paymentDate:
          contribution.paymentDate,
      })
    );

  // ==========================================================
  // PENDING VERIFICATION
  // ==========================================================

  const pendingVerification =
    (
      member.paymentRequests || []
    ).map(
      (request) => ({
        id:
          request.id,

        amount:
          toNumber(
            request.amount
          ),

        paymentDate:
          request.paymentDate,

        transactionReference:
          request.transactionReference,

        proofImage:
          request.proofImage,

        createdAt:
          request.createdAt,

        status:
          request.status,

        months: (
          request.months || []
        ).map(
          (month) => ({
            id:
              month.id,

            year:
              Number(
                month.year
              ),

            monthNumber:
              Number(
                month.monthNumber
              ),

            month:
              getMonthLabel(
                month.monthNumber,
                month.year
              ),

            amount:
              toNumber(
                month.amount
              ),
          })
        ),
      })
    );

  // ==========================================================
  // ASSOCIATION-WIDE CONTRIBUTIONS
  // ==========================================================

  const contributionAggregate =
    await prisma.contribution.aggregate({
      _sum: {
        amount: true,
      },
    });

  const totalAssociationContributions =
    toNumber(
      contributionAggregate
        ._sum.amount
    );

  // ==========================================================
  // ASSOCIATION-WIDE EXPENSES
  // ==========================================================

  const expenseAggregate =
    await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

  const totalAssociationExpenses =
    toNumber(
      expenseAggregate
        ._sum.amount
    );

  // ==========================================================
  // ASSOCIATION BALANCE
  // ==========================================================

  const associationBalance =
    totalAssociationContributions -
    totalAssociationExpenses;

  // ==========================================================
  // ANNOUNCEMENTS
  // ==========================================================

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

  // ==========================================================
  // MEMBER NOTIFICATIONS
  // ==========================================================

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

  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================

  return {
    member: {
      id:
        member.id,

      fullName:
        member.fullName,

      email:
        member.email,

      phone:
        member.phone,

      status:
        member.status,

      createdAt:
        member.createdAt,
    },

    // ========================================================
    // MEMBER FINANCIAL SUMMARY
    // ========================================================

    summary: {
      year:
        currentPeriod.year,

      currentMonth:
        currentPeriod.monthNumber,

      monthlyContribution,

      totalExpected,

      totalPaid,

      outstanding,

      collectionRate,

      contributionCount,

      averageContribution,

      totalDueMonths:
        dueMonths.length,

      paidMonths,

      waivedMonths,

      partialAmount,

      pendingAmount,

      pendingRequests:
        pendingRequestCount,
    },

    // ========================================================
    // CONTRIBUTION PERIOD
    // ========================================================

    contributionPeriod: {
      startYear:
        associationStart.year,

      startMonth:
        associationStart.monthNumber,

      startMonthLabel:
        getMonthLabel(
          associationStart.monthNumber,
          associationStart.year
        ),

      currentYear:
        currentPeriod.year,

      currentMonth:
        currentPeriod.monthNumber,

      currentMonthLabel:
        getMonthLabel(
          currentPeriod.monthNumber,
          currentPeriod.year
        ),

      totalMonths:
        getMonthsBetween(
          associationStart.year,
          associationStart.monthNumber,
          currentPeriod.year,
          currentPeriod.monthNumber
        ).length,
    },

    // ========================================================
    // MEMBER CONTRIBUTION PERIOD
    // ========================================================

    memberContributionStart: {
      year:
        memberStart.year,

      monthNumber:
        memberStart.monthNumber,

      month:
        getMonthLabel(
          memberStart.monthNumber,
          memberStart.year
        ),
    },

    // ========================================================
    // MONTHLY BREAKDOWN
    // ========================================================

    monthlyStatus,

    // ========================================================
    // OUTSTANDING MONTHS
    // ========================================================

    outstandingMonths,

    // ========================================================
    // PENDING MONTHS
    // ========================================================

    pendingMonths,

    // ========================================================
    // HISTORY
    // ========================================================

    contributionHistory,

    // ========================================================
    // PENDING VERIFICATION
    // ========================================================

    pendingVerification,

    // ========================================================
    // RECENT PAYMENTS
    // ========================================================

    recentPayments,

    // ========================================================
    // ASSOCIATION FINANCIALS
    // ========================================================

    associationFinancials: {
      totalContributions:
        totalAssociationContributions,

      totalExpenses:
        totalAssociationExpenses,

      balance:
        associationBalance,
    },

    // ========================================================
    // ANNOUNCEMENTS
    // ========================================================

    announcements,

    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    notifications,
  };
};