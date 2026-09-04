import prisma from "../config/prisma.js";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEFAULT_CONTRIBUTION_START_MONTH = 12;
const DEFAULT_CONTRIBUTION_START_YEAR = 2024;

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatMonth = (monthNumber, year) => {
  const monthName =
    MONTH_NAMES[Number(monthNumber)] || "Unknown Month";

  return `${monthName} ${year}`;
};

const getMonthKey = (year, monthNumber) => {
  return `${Number(year)}-${String(
    Number(monthNumber)
  ).padStart(2, "0")}`;
};

const getMonthLabel = (monthNumber, year) => {
  return formatMonth(monthNumber, year);
};

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

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthNumber: now.getMonth() + 1,
  };
};

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
// GET MEMBER CONTRIBUTION PERIOD
// ============================================================

const getMemberDueMonths = (member, settings) => {
  const currentPeriod = getCurrentPeriod();

  const contributionStart =
    getContributionStart(settings);

  let effectiveStartYear =
    contributionStart.year;

  let effectiveStartMonth =
    contributionStart.monthNumber;

  if (member.contributionStartDate) {
    const memberStartDate =
      new Date(member.contributionStartDate);

    effectiveStartYear =
      memberStartDate.getFullYear();

    effectiveStartMonth =
      memberStartDate.getMonth() + 1;
  } else {
    const memberCreatedAt =
      new Date(member.createdAt);

    const memberYear =
      memberCreatedAt.getFullYear();

    const memberMonth =
      memberCreatedAt.getMonth() + 1;

    const memberJoinedAfterStart =
      memberYear > contributionStart.year ||
      (
        memberYear === contributionStart.year &&
        memberMonth > contributionStart.monthNumber
      );

    if (memberJoinedAfterStart) {
      effectiveStartYear = memberYear;
      effectiveStartMonth = memberMonth;
    }
  }

  if (
    effectiveStartYear > currentPeriod.year ||
    (
      effectiveStartYear === currentPeriod.year &&
      effectiveStartMonth > currentPeriod.monthNumber
    )
  ) {
    return [];
  }

  return getMonthsBetween(
    effectiveStartYear,
    effectiveStartMonth,
    currentPeriod.year,
    currentPeriod.monthNumber
  );
};

// ============================================================
// GET MEMBER PAYMENT SUMMARY
// ============================================================

const getMemberPaymentSummary = async (
  memberId,
  organizationId
) => {
  const member = await prisma.member.findFirst({
    where: {
      id: Number(memberId),
      ...(organizationId
        ? {
            organizationId: Number(organizationId),
          }
        : {}),
    },
  });

  if (!member) {
    const error = new Error("Member not found.");
    error.status = 404;
    throw error;
  }

  const settings = await prisma.setting.findFirst({
    where: organizationId
      ? {
          organizationId: Number(organizationId),
        }
      : undefined,
    orderBy: {
      id: "asc",
    },
  });

  const monthlyAmount = toNumber(
    settings?.monthlyContributionAmount
  );

  if (monthlyAmount <= 0) {
    const error = new Error(
      "The monthly contribution amount has not been configured."
    );
    error.status = 400;
    throw error;
  }

  const dueMonths = getMemberDueMonths(
    member,
    settings
  );

  const contributions =
    await prisma.contribution.findMany({
      where: {
        memberId: Number(memberId),
        ...(organizationId
          ? {
              organizationId: Number(organizationId),
            }
          : {}),
      },
      select: {
        id: true,
        year: true,
        monthNumber: true,
        amount: true,
        status: true,
      },
    });

  const paidMap = new Map();

  for (const contribution of contributions) {
    const status = String(
      contribution.status || ""
    ).toUpperCase();

    if (
      status !== "PAID" &&
      status !== "APPROVED"
    ) {
      continue;
    }

    const key = getMonthKey(
      contribution.year,
      contribution.monthNumber
    );

    paidMap.set(key, contribution);
  }

  const outstandingMonths = [];

  let outstandingAmount = 0;

  for (const dueMonth of dueMonths) {
    const paid = paidMap.get(dueMonth.key);

    const paidAmount = paid
      ? toNumber(paid.amount)
      : 0;

    const remaining =
      Math.max(
        monthlyAmount - paidAmount,
        0
      );

    if (remaining > 0.01) {
      outstandingAmount += remaining;

      outstandingMonths.push({
        year: dueMonth.year,
        monthNumber: dueMonth.monthNumber,
        month: dueMonth.month,
        amount: remaining,
      });
    }
  }

  return {
    monthlyContributionAmount: monthlyAmount,
    outstandingAmount,
    outstandingMonths,
    totalOutstandingMonths:
      outstandingMonths.length,
  };
};

// ============================================================
// CREATE PAYMENT REQUEST
//
// IMPORTANT:
// Months are NOT assigned here.
// They are assigned only after admin approval.
// ============================================================

export const createPaymentRequest = async (
  memberId,
  data,
  organizationId
) => {
  const parsedMemberId = Number(memberId);

  if (
    !Number.isInteger(parsedMemberId) ||
    parsedMemberId <= 0
  ) {
    const error = new Error(
      "Invalid member."
    );
    error.status = 400;
    throw error;
  }

  const summary =
    await getMemberPaymentSummary(
      parsedMemberId,
      organizationId
    );

  const monthlyAmount =
    summary.monthlyContributionAmount;

  const outstandingAmount =
    summary.outstandingAmount;

  const requestAmount = Number(
    data.amount
  );

  // ----------------------------------------------------------
  // Amount validation
  // ----------------------------------------------------------

  if (
    !Number.isFinite(requestAmount) ||
    requestAmount <= 0
  ) {
    const error = new Error(
      "Please enter a valid payment amount."
    );
    error.status = 400;
    throw error;
  }

  if (
    requestAmount < monthlyAmount
  ) {
    const error = new Error(
      `Payment must be at least ${monthlyAmount.toLocaleString(
        "en-NG"
      )}.`
    );
    error.status = 400;
    throw error;
  }

  const multiple =
    requestAmount / monthlyAmount;

  if (
    Math.abs(multiple - Math.round(multiple)) >
    0.000001
  ) {
    const error = new Error(
      `Payment must be an exact multiple of the monthly contribution (${monthlyAmount.toLocaleString(
        "en-NG"
      )}).`
    );
    error.status = 400;
    throw error;
  }

  if (
    requestAmount >
    outstandingAmount + 0.01
  ) {
    const error = new Error(
      `Payment cannot exceed your outstanding balance of ${outstandingAmount.toLocaleString(
        "en-NG",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}.`
    );
    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // Only one pending request at a time
  // ----------------------------------------------------------

  const existingPending =
    await prisma.paymentRequest.findFirst({
      where: {
        memberId: parsedMemberId,
        status: "PENDING",
        ...(organizationId
          ? {
              organizationId:
                Number(organizationId),
            }
          : {}),
      },
    });

  if (existingPending) {
    const error = new Error(
      "You already have a payment waiting for admin verification."
    );
    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // Validate payment date
  // ----------------------------------------------------------

  const paymentDate = data.paymentDate
    ? new Date(data.paymentDate)
    : new Date();

  if (Number.isNaN(paymentDate.getTime())) {
    const error = new Error(
      "Invalid payment date."
    );
    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // Create request
  //
  // No months.
  // No proof image.
  // ----------------------------------------------------------

  const paymentRequest =
    await prisma.paymentRequest.create({
      data: {
        memberId: parsedMemberId,

        amount: requestAmount,

        transactionReference:
          data.transactionReference?.trim() ||
          null,

        paymentDate,

        proofImage: null,

        bankName: null,
        accountName: null,
        accountNumber: null,

        status: "PENDING",

        ...(organizationId
          ? {
              organizationId:
                Number(organizationId),
            }
          : {}),
      },

      include: {
        months: true,
      },
    });

  return paymentRequest;
};

// ============================================================
// GET MEMBER PAYMENT REQUESTS
// ============================================================

export const getMemberPaymentRequests = async (
  memberId,
  organizationId
) => {
  return await prisma.paymentRequest.findMany({
    where: {
      memberId: Number(memberId),
      ...(organizationId
        ? {
            organizationId:
              Number(organizationId),
          }
        : {}),
    },

    include: {
      months: {
        select: {
          id: true,
          year: true,
          monthNumber: true,
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
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ============================================================
// GET MEMBER PAYMENT PAGE DATA
// ============================================================

export const getMemberPaymentPageData = async (
  memberId,
  organizationId
) => {
  const [
    requests,
    summary,
  ] = await Promise.all([
    getMemberPaymentRequests(
      memberId,
      organizationId
    ),

    getMemberPaymentSummary(
      memberId,
      organizationId
    ),
  ]);

  return {
    requests,
    summary,
  };
};

// ============================================================
// GET PENDING PAYMENT REQUESTS
// ============================================================

export const getPendingPaymentRequests =
  async (organizationId) => {
    return await prisma.paymentRequest.findMany({
      where: {
        status: "PENDING",

        ...(organizationId
          ? {
              organizationId:
                Number(organizationId),
            }
          : {}),
      },

      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },

        months: {
          select: {
            id: true,
            year: true,
            monthNumber: true,
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
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  };

// ============================================================
// APPROVE PAYMENT REQUEST
//
// This is where automatic month allocation happens.
// Oldest unpaid months are paid first.
// ============================================================

export const approvePaymentRequest = async (
  requestId,
  adminId,
  organizationId
) => {
  return await prisma.$transaction(
    async (tx) => {
      const request =
        await tx.paymentRequest.findFirst({
          where: {
            id: Number(requestId),
            status: "PENDING",

            ...(organizationId
              ? {
                  organizationId:
                    Number(organizationId),
                }
              : {}),
          },

          include: {
            member: true,
          },
        });

      if (!request) {
        const error = new Error(
          "Pending payment request not found."
        );
        error.status = 404;
        throw error;
      }

      const settings =
        await tx.setting.findFirst({
          where: organizationId
            ? {
                organizationId:
                  Number(organizationId),
              }
            : undefined,

          orderBy: {
            id: "asc",
          },
        });

      const monthlyAmount =
        toNumber(
          settings?.monthlyContributionAmount
        );

      if (monthlyAmount <= 0) {
        const error = new Error(
          "The monthly contribution amount has not been configured."
        );
        error.status = 400;
        throw error;
      }

      const requestAmount =
        toNumber(request.amount);

      // --------------------------------------------------------
      // Re-check amount rules at approval time
      // --------------------------------------------------------

      if (
        requestAmount < monthlyAmount
      ) {
        const error = new Error(
          "Payment amount is below the monthly contribution."
        );
        error.status = 400;
        throw error;
      }

      const multiple =
        requestAmount / monthlyAmount;

      if (
        Math.abs(
          multiple - Math.round(multiple)
        ) > 0.000001
      ) {
        const error = new Error(
          "Payment amount is not an exact multiple of the monthly contribution."
        );
        error.status = 400;
        throw error;
      }

      // --------------------------------------------------------
      // Build due months
      // --------------------------------------------------------

      const dueMonths =
        getMemberDueMonths(
          request.member,
          settings
        );

      // --------------------------------------------------------
      // Get confirmed contributions
      // --------------------------------------------------------

      const contributions =
        await tx.contribution.findMany({
          where: {
            memberId:
              request.memberId,

            ...(organizationId
              ? {
                  organizationId:
                    Number(organizationId),
                }
              : {}),
          },

          select: {
            id: true,
            year: true,
            monthNumber: true,
            amount: true,
            status: true,
          },
        });

      const paidMap = new Map();

      for (const contribution of contributions) {
        const status = String(
          contribution.status || ""
        ).toUpperCase();

        if (
          status !== "PAID" &&
          status !== "APPROVED"
        ) {
          continue;
        }

        const key = getMonthKey(
          contribution.year,
          contribution.monthNumber
        );

        paidMap.set(key, contribution);
      }

      // --------------------------------------------------------
      // Find oldest unpaid months
      // --------------------------------------------------------

      const unpaidMonths = [];

      for (const dueMonth of dueMonths) {
        const existing =
          paidMap.get(dueMonth.key);

        const paidAmount = existing
          ? toNumber(existing.amount)
          : 0;

        const remaining =
          Math.max(
            monthlyAmount - paidAmount,
            0
          );

        if (remaining > 0.01) {
          unpaidMonths.push({
            year: dueMonth.year,
            monthNumber:
              dueMonth.monthNumber,
            month: dueMonth.month,
            amount: remaining,
          });
        }
      }

      const outstandingAmount =
        unpaidMonths.reduce(
          (total, month) =>
            total + month.amount,
          0
        );

      if (
        requestAmount >
        outstandingAmount + 0.01
      ) {
        const error = new Error(
          `Payment cannot exceed the member's current outstanding balance of ${outstandingAmount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}.`
        );
        error.status = 400;
        throw error;
      }

      const monthsToAllocate = Math.round(
        requestAmount / monthlyAmount
      );

      if (
        unpaidMonths.length <
        monthsToAllocate
      ) {
        const error = new Error(
          "There are not enough unpaid contribution months to allocate this payment."
        );
        error.status = 400;
        throw error;
      }

      const selectedMonths =
        unpaidMonths.slice(
          0,
          monthsToAllocate
        );

      // --------------------------------------------------------
      // Create contribution records
      // --------------------------------------------------------

      const contributionsCreated = [];

      for (const month of selectedMonths) {
        const contribution =
          await tx.contribution.create({
            data: {
              memberId:
                request.memberId,

              year: month.year,

              monthNumber:
                month.monthNumber,

              amount: monthlyAmount,

              paymentDate:
                request.paymentDate,

              status: "PAID",

              ...(organizationId
                ? {
                    organizationId:
                      Number(
                        organizationId
                      ),
                  }
                : {}),
            },
          });

        contributionsCreated.push(
          contribution
        );
      }

      // --------------------------------------------------------
      // Record which months this request covered
      // --------------------------------------------------------

      await tx.paymentRequestMonth.createMany(
        {
          data: selectedMonths.map(
            (month) => ({
              paymentRequestId:
                request.id,

              year: month.year,

              monthNumber:
                month.monthNumber,

              amount:
                monthlyAmount,
            })
          ),
        }
      );

      // --------------------------------------------------------
      // Approve request
      // --------------------------------------------------------

      const updatedRequest =
        await tx.paymentRequest.update({
          where: {
            id: request.id,
          },

          data: {
            status: "APPROVED",

            reviewedById:
              Number(adminId),

            reviewedAt:
              new Date(),
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
        });

      // --------------------------------------------------------
      // Notification
      // --------------------------------------------------------

      const monthText =
        selectedMonths
          .map((month) =>
            formatMonth(
              month.monthNumber,
              month.year
            )
          )
          .join(", ");

      await tx.notification.create({
        data: {
          memberId:
            request.memberId,

          createdById:
            Number(adminId),

          title:
            "Payment Approved",

          message: `Your payment of ₦${requestAmount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )} has been verified and approved. It covers: ${monthText}.`,

          type: "PAYMENT",

          ...(organizationId
            ? {
                organizationId:
                  Number(organizationId),
              }
            : {}),
        },
      });

      return {
        paymentRequest:
          updatedRequest,

        contributions:
          contributionsCreated,
      };
    }
  );
};

// ============================================================
// REJECT PAYMENT REQUEST
// ============================================================

export const rejectPaymentRequest = async (
  requestId,
  adminId,
  remarks,
  organizationId
) => {
  const request =
    await prisma.paymentRequest.findFirst({
      where: {
        id: Number(requestId),
        status: "PENDING",

        ...(organizationId
          ? {
              organizationId:
                Number(organizationId),
            }
          : {}),
      },

      include: {
        member: true,
      },
    });

  if (!request) {
    const error = new Error(
      "Pending payment request not found."
    );
    error.status = 404;
    throw error;
  }

  const cleanRemarks =
    remarks?.trim() || null;

  const updatedRequest =
    await prisma.paymentRequest.update({
      where: {
        id: request.id,
      },

      data: {
        status: "REJECTED",

        reviewedById:
          Number(adminId),

        reviewedAt:
          new Date(),

        remarks:
          cleanRemarks,
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
    });

  await prisma.notification.create({
    data: {
      memberId:
        request.memberId,

      createdById:
        Number(adminId),

      title:
        "Payment Rejected",

      message:
        cleanRemarks ||
        `Your payment request of ₦${Number(
          request.amount
        ).toLocaleString(
          "en-NG",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} was rejected. Please make the payment and submit a new request.`,

      type: "PAYMENT",

      ...(organizationId
        ? {
            organizationId:
              Number(organizationId),
          }
        : {}),
    },
  });

  return updatedRequest;
};