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
// Current contribution period
// ------------------------------------------------------------

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthNumber: now.getMonth() + 1,
  };
};

// ------------------------------------------------------------
// Association contribution start
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

// ============================================================
// MEMBER CONTRIBUTION START
// ============================================================

const getMemberContributionStart = (
  member,
  contributionStart
) => {
  let year = contributionStart.year;
  let monthNumber =
    contributionStart.monthNumber;

  // ----------------------------------------------------------
  // 1. Explicit member contribution start date
  // ----------------------------------------------------------

  if (member.contributionStartDate) {
    const startDate = new Date(
      member.contributionStartDate
    );

    if (!Number.isNaN(startDate.getTime())) {
      year = startDate.getFullYear();
      monthNumber = startDate.getMonth() + 1;
    }

    return {
      year,
      monthNumber,
    };
  }

  // ----------------------------------------------------------
  // 2. Member createdAt
  // ----------------------------------------------------------

  if (member.createdAt) {
    const createdAt = new Date(
      member.createdAt
    );

    if (!Number.isNaN(createdAt.getTime())) {
      const memberYear =
        createdAt.getFullYear();

      const memberMonth =
        createdAt.getMonth() + 1;

      const memberJoinedAfterAssociationStart =
        memberYear > contributionStart.year ||
        (
          memberYear ===
            contributionStart.year &&
          memberMonth >
            contributionStart.monthNumber
        );

      if (
        memberJoinedAfterAssociationStart
      ) {
        year = memberYear;
        monthNumber = memberMonth;
      }
    }
  }

  return {
    year,
    monthNumber,
  };
};

// ============================================================
// GET MEMBER STATEMENT
// ============================================================

export const getMemberStatement = async (
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
            year: "asc",
          },
          {
            monthNumber: "asc",
          },
          {
            paymentDate: "asc",
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
  // SETTINGS
  // ==========================================================

  const settings =
    await prisma.setting.findFirst({
      orderBy: {
        id: "asc",
      },
    });

  const monthlyContributionAmount =
    toNumber(
      settings?.monthlyContributionAmount
    );

  // ==========================================================
  // CONTRIBUTION PERIOD
  // ==========================================================

  const contributionStart =
    getContributionStart(settings);

  const currentPeriod =
    getCurrentPeriod();

  // ==========================================================
  // MEMBER CONTRIBUTION START
  // ==========================================================

  const memberStart =
    getMemberContributionStart(
      member,
      contributionStart
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
    const contribution of
      member.contributions
  ) {
    const status = String(
      contribution.status || ""
    ).toUpperCase();

    const amount = toNumber(
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

      totalPaid += amount;

      if (
        status === "PAID" ||
        status === "APPROVED"
      ) {
        paidMonths += 1;
      }

      if (status === "WAIVED") {
        waivedMonths += 1;
      }

      if (status === "PARTIAL") {
        partialAmount += amount;
      }
    }
  }

  // ==========================================================
  // PENDING PAYMENT REQUESTS
  // ==========================================================

  const pendingMap = new Map();

  let pendingAmount = 0;
  let pendingRequests = 0;

  for (
    const request of
      member.paymentRequests || []
  ) {
    pendingRequests += 1;

    for (
      const month of
        request.months || []
    ) {
      const key = getMonthKey(
        month.year,
        month.monthNumber
      );

      const amount = toNumber(
        month.amount
      );

      // Avoid counting the same month twice
      if (!pendingMap.has(key)) {
        pendingMap.set(key, {
          id: month.id,

          requestId: request.id,

          year: Number(
            month.year
          ),

          monthNumber: Number(
            month.monthNumber
          ),

          month: getMonthLabel(
            month.monthNumber,
            month.year
          ),

          amount,

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

  let outstandingAmount = 0;

  for (
    const dueMonth of dueMonths
  ) {
    const key = dueMonth.key;

    const paid = paidMap.get(key);

    const pending =
      pendingMap.get(key);

    const paidAmount =
      toNumber(paid?.amount);

    const pendingMonthAmount =
      toNumber(pending?.amount);

    // --------------------------------------------------------
    // Default
    // --------------------------------------------------------

    let status = "OVERDUE";

    let amount =
      monthlyContributionAmount;

    let remainingAmount =
      monthlyContributionAmount -
      paidAmount -
      pendingMonthAmount;

    if (remainingAmount < 0) {
      remainingAmount = 0;
    }

    // --------------------------------------------------------
    // WAIVED
    // --------------------------------------------------------

    if (
      paid &&
      paid.status === "WAIVED"
    ) {
      status = "WAIVED";

      amount = 0;

      remainingAmount = 0;
    }

    // --------------------------------------------------------
    // PAID / APPROVED
    // --------------------------------------------------------

    else if (
      paid &&
      (
        paid.status === "PAID" ||
        paid.status === "APPROVED"
      )
    ) {
      if (
        paidAmount >=
        monthlyContributionAmount
      ) {
        status = "PAID";

        amount = paidAmount;

        remainingAmount = 0;
      } else {
        status = "PARTIAL";

        amount = paidAmount;
      }
    }

    // --------------------------------------------------------
    // PARTIAL
    // --------------------------------------------------------

    else if (
      paid &&
      paid.status === "PARTIAL"
    ) {
      status = "PARTIAL";

      amount = paidAmount;
    }

    // --------------------------------------------------------
    // PENDING
    // --------------------------------------------------------

    if (!paid && pending) {
      status = "PENDING";

      amount = pendingMonthAmount;

      pendingMonths.push({
        year: dueMonth.year,

        monthNumber:
          dueMonth.monthNumber,

        month: dueMonth.month,

        amount:
          pendingMonthAmount,
      });
    }

    // --------------------------------------------------------
    // OUTSTANDING
    // --------------------------------------------------------

    if (
      remainingAmount > 0.01
    ) {
      outstandingAmount +=
        remainingAmount;

      outstandingMonths.push({
        year: dueMonth.year,

        monthNumber:
          dueMonth.monthNumber,

        month: dueMonth.month,

        amount:
          remainingAmount,

        paidAmount,

        pendingAmount:
          pendingMonthAmount,

        status,
      });
    }

    // --------------------------------------------------------
    // MONTHLY RECORD
    // --------------------------------------------------------

    monthlyStatus.push({
      year: dueMonth.year,

      monthNumber:
        dueMonth.monthNumber,

      month: dueMonth.month,

      expectedAmount:
        monthlyContributionAmount,

      amount,

      paidAmount,

      pendingAmount:
        pendingMonthAmount,

      outstandingAmount:
        remainingAmount,

      status,

      paymentDate:
        paid?.paymentDate || null,

      transactionReference:
        pending?.transactionReference ||
        null,
    });
  }

  // ==========================================================
  // TOTAL EXPECTED
  // ==========================================================

  const totalExpected =
    dueMonths.length *
    monthlyContributionAmount;

  // ==========================================================
  // COMPLETION %
  // ==========================================================

  const paymentCompletionPercentage =
    totalExpected > 0
      ? Math.min(
          Math.round(
            (
              totalPaid /
              totalExpected
            ) * 100
          ),
          100
        )
      : 0;

  // ==========================================================
  // CONTRIBUTION HISTORY
  // ==========================================================

  const contributionHistory =
    member.contributions.map(
      (contribution) => ({
        id: contribution.id,

        year: Number(
          contribution.year
        ),

        monthNumber: Number(
          contribution.monthNumber
        ),

        month: getMonthLabel(
          contribution.monthNumber,
          contribution.year
        ),

        amount: toNumber(
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
        id: request.id,

        amount: toNumber(
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
            id: month.id,

            year: Number(
              month.year
            ),

            monthNumber: Number(
              month.monthNumber
            ),

            month: getMonthLabel(
              month.monthNumber,
              month.year
            ),

            amount: toNumber(
              month.amount
            ),
          })
        ),
      })
    );

  // ==========================================================
  // RETURN MEMBER STATEMENT
  // ==========================================================

  return {
    // --------------------------------------------------------
    // Association
    // --------------------------------------------------------

    association: settings,

    // --------------------------------------------------------
    // Member
    // --------------------------------------------------------

    member: {
      id: member.id,

      fullName:
        member.fullName,

      phone:
        member.phone,

      email:
        member.email,

      status:
        member.status,

      createdAt:
        member.createdAt,

      contributionStartDate:
        member.contributionStartDate,
    },

    // --------------------------------------------------------
    // Contribution settings
    // --------------------------------------------------------

    contributionSettings: {
      monthlyContributionAmount,

      contributionStart: {
        year:
          contributionStart.year,

        monthNumber:
          contributionStart.monthNumber,

        month:
          getMonthLabel(
            contributionStart.monthNumber,
            contributionStart.year
          ),
      },

      currentPeriod: {
        year:
          currentPeriod.year,

        monthNumber:
          currentPeriod.monthNumber,

        month:
          getMonthLabel(
            currentPeriod.monthNumber,
            currentPeriod.year
          ),
      },

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
    },

    // --------------------------------------------------------
    // Summary
    // --------------------------------------------------------

    summary: {
      totalPayments:
        member.contributions.length,

      totalDueMonths:
        dueMonths.length,

      totalExpected,

      totalPaid,

      outstandingAmount,

      pendingAmount,

      paidMonths,

      waivedMonths,

      partialAmount,

      pendingRequests,

      paymentCompletionPercentage,
    },

    // --------------------------------------------------------
    // Monthly status
    // --------------------------------------------------------

    monthlyStatus,

    // --------------------------------------------------------
    // Outstanding
    // --------------------------------------------------------

    outstandingMonths,

    // --------------------------------------------------------
    // Pending
    // --------------------------------------------------------

    pendingMonths,

    // --------------------------------------------------------
    // Contribution history
    // --------------------------------------------------------

    payments:
      contributionHistory,

    contributionHistory,

    // --------------------------------------------------------
    // Pending verification
    // --------------------------------------------------------

    pendingVerification,
  };
};

// ============================================================
// EXPORT HELPERS
// ============================================================

export {
  getMonthKey,
  getMonthLabel,
  getMonthsBetween,
  getContributionStart,
};