import prisma from "../config/prisma.js";

// ============================================================
// MONTH NAMES
// ============================================================

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

// ============================================================
// HELPER: FORMAT MONTH
// ============================================================

const formatMonth = (monthNumber, year) => {
  const monthName =
    MONTH_NAMES[Number(monthNumber)] || "Unknown Month";

  return `${monthName} ${year}`;
};

// ============================================================
// MEMBER SUBMITS PAYMENT REQUEST
// ============================================================

export const createPaymentRequest = async (
  memberId,
  data
) => {
  const months = Array.isArray(data.months)
    ? data.months
    : [];

  // ----------------------------------------------------------
  // 1. At least one month is required
  // ----------------------------------------------------------

  if (months.length === 0) {
    const error = new Error(
      "Please select at least one contribution month."
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 2. Validate total payment amount
  // ----------------------------------------------------------

  const requestAmount = Number(data.amount);

  if (
    !Number.isFinite(requestAmount) ||
    requestAmount <= 0
  ) {
    const error = new Error(
      "Please provide a valid payment amount."
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 3. Clean selected months
  // ----------------------------------------------------------

  const cleanedMonths = months.map((month) => ({
    monthNumber: Number(month.monthNumber),
    year: Number(month.year),
  }));

  // ----------------------------------------------------------
  // 4. Validate every month
  // ----------------------------------------------------------

  for (const month of cleanedMonths) {
    if (
      !Number.isInteger(month.monthNumber) ||
      month.monthNumber < 1 ||
      month.monthNumber > 12 ||
      !Number.isInteger(month.year) ||
      month.year < 2000
    ) {
      const error = new Error(
        "One or more contribution months are invalid."
      );

      error.status = 400;
      throw error;
    }
  }

  // ----------------------------------------------------------
  // 5. Prevent duplicate months inside same request
  // ----------------------------------------------------------

  const uniqueMonths = new Set(
    cleanedMonths.map(
      (month) =>
        `${month.year}-${month.monthNumber}`
    )
  );

  if (
    uniqueMonths.size !==
    cleanedMonths.length
  ) {
    const error = new Error(
      "The same contribution month cannot be selected more than once."
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 6. Calculate amount per month
  // ----------------------------------------------------------

  const monthlyAmount =
    requestAmount / cleanedMonths.length;

  if (
    !Number.isFinite(monthlyAmount) ||
    monthlyAmount <= 0
  ) {
    const error = new Error(
      "Unable to calculate the contribution amount for the selected months."
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 7. Check existing PAID contributions
  // ----------------------------------------------------------

  const existingContributions =
    await prisma.contribution.findMany({
      where: {
        memberId,
        OR: cleanedMonths.map((month) => ({
          monthNumber: month.monthNumber,
          year: month.year,
        })),
      },

      select: {
        monthNumber: true,
        year: true,
      },
    });

  if (existingContributions.length > 0) {
    const alreadyPaid =
      existingContributions
        .map((item) =>
          formatMonth(
            item.monthNumber,
            item.year
          )
        )
        .join(", ");

    const error = new Error(
      `Contribution for ${alreadyPaid} has already been recorded.`
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 8. Check existing PENDING payment requests
  // ----------------------------------------------------------

  const pendingRequests =
    await prisma.paymentRequest.findMany({
      where: {
        memberId,
        status: "PENDING",

        months: {
          some: {
            OR: cleanedMonths.map((month) => ({
              monthNumber: month.monthNumber,
              year: month.year,
            })),
          },
        },
      },

      include: {
        months: true,
      },
    });

  if (pendingRequests.length > 0) {
    const pendingMonths = [];

    for (const request of pendingRequests) {
      for (const month of request.months) {
        const exists = cleanedMonths.some(
          (selected) =>
            selected.monthNumber ===
              month.monthNumber &&
            selected.year === month.year
        );

        if (exists) {
          pendingMonths.push(
            formatMonth(
              month.monthNumber,
              month.year
            )
          );
        }
      }
    }

    const uniquePendingMonths = [
      ...new Set(pendingMonths),
    ];

    const error = new Error(
      `One or more selected contribution months already have a pending payment request: ${uniquePendingMonths.join(
        ", "
      )}.`
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 9. Create payment request
  // ----------------------------------------------------------

  const paymentRequest =
    await prisma.paymentRequest.create({
      data: {
        memberId,

        amount: requestAmount,

        bankName:
          data.bankName || null,

        accountName:
          data.accountName || null,

        accountNumber:
          data.accountNumber || null,

        transactionReference:
          data.transactionReference || null,

        paymentDate: new Date(
          data.paymentDate
        ),

        proofImage:
          data.proofImage || null,

        months: {
          create: cleanedMonths.map(
            (month) => ({
              year: month.year,
              monthNumber:
                month.monthNumber,
              amount: monthlyAmount,
            })
          ),
        },
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

  return paymentRequest;
};

// ============================================================
// MEMBER VIEWS OWN PAYMENT REQUESTS
// ============================================================

export const getMemberPaymentRequests = async (
  memberId
) => {
  return await prisma.paymentRequest.findMany({
    where: {
      memberId,
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
// ADMIN / TREASURER VIEWS PENDING REQUESTS
// ============================================================

export const getPendingPaymentRequests =
  async () => {
    return await prisma.paymentRequest.findMany({
      where: {
        status: "PENDING",
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
// ============================================================

export const approvePaymentRequest = async (
  requestId,
  adminId
) => {
  return await prisma.$transaction(
    async (tx) => {
      // ------------------------------------------------------
      // 1. Get payment request and months
      // ------------------------------------------------------

      const request =
        await tx.paymentRequest.findUnique({
          where: {
            id: Number(requestId),
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

      if (!request) {
        const error = new Error(
          "Payment request not found."
        );

        error.status = 404;
        throw error;
      }

      // ------------------------------------------------------
      // 2. Make sure request is still pending
      // ------------------------------------------------------

      if (request.status !== "PENDING") {
        const error = new Error(
          "Payment request has already been processed."
        );

        error.status = 400;
        throw error;
      }

      // ------------------------------------------------------
      // 3. Make sure months exist
      // ------------------------------------------------------

      if (
        !request.months ||
        request.months.length === 0
      ) {
        const error = new Error(
          "This payment request has no contribution months."
        );

        error.status = 400;
        throw error;
      }

      // ------------------------------------------------------
      // 4. Calculate total of selected months
      // ------------------------------------------------------

      const monthsTotal =
        request.months.reduce(
          (total, month) =>
            total +
            Number(month.amount || 0),
          0
        );

      const requestAmount =
        Number(request.amount || 0);

      // ------------------------------------------------------
      // 5. Verify request amount
      // ------------------------------------------------------

      if (
        Math.abs(
          monthsTotal - requestAmount
        ) > 0.01
      ) {
        const error = new Error(
          "Payment request amount does not match the selected contribution months."
        );

        error.status = 400;
        throw error;
      }

      // ------------------------------------------------------
      // 6. Check every requested month
      //    for existing contributions
      // ------------------------------------------------------

      const alreadyRecorded = [];

      for (const month of request.months) {
        const existingContribution =
          await tx.contribution.findFirst({
            where: {
              memberId:
                request.memberId,

              year: month.year,

              monthNumber:
                month.monthNumber,
            },
          });

        if (existingContribution) {
          alreadyRecorded.push(
            formatMonth(
              month.monthNumber,
              month.year
            )
          );
        }
      }

      if (alreadyRecorded.length > 0) {
        const error = new Error(
          `The following contribution month(s) have already been recorded: ${alreadyRecorded.join(
            ", "
          )}.`
        );

        error.status = 400;
        throw error;
      }

      // ------------------------------------------------------
      // 7. Create one Contribution record
      //    for EACH requested month
      // ------------------------------------------------------

      const contributions = [];

      for (const month of request.months) {
        const contribution =
          await tx.contribution.create({
            data: {
              memberId:
                request.memberId,

              year: month.year,

              monthNumber:
                month.monthNumber,

              amount: Number(
                month.amount
              ),

              paymentDate:
                request.paymentDate,

              status: "PAID",
            },
          });

        contributions.push(
          contribution
        );
      }

      // ------------------------------------------------------
      // 8. Mark payment request APPROVED
      // ------------------------------------------------------

      const updatedRequest =
        await tx.paymentRequest.update({
          where: {
            id: request.id,
          },

          data: {
            status: "APPROVED",

            reviewedById: adminId,

            reviewedAt: new Date(),
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

      // ------------------------------------------------------
      // 9. Notify member
      // ------------------------------------------------------

      const monthCount =
        request.months.length;

      const monthText =
        request.months
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

          createdById: adminId,

          title: "Payment Approved",

          message: `Your payment of ₦${requestAmount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )} covering ${monthCount} contribution ${
            monthCount === 1
              ? "month"
              : "months"
          } (${monthText}) has been verified and approved successfully.`,

          type: "PAYMENT",
        },
      });

      // ------------------------------------------------------
      // 10. Return complete result
      // ------------------------------------------------------

      return {
        paymentRequest:
          updatedRequest,

        contributions,
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
  remarks
) => {
  // ----------------------------------------------------------
  // 1. Find request
  // ----------------------------------------------------------

  const request =
    await prisma.paymentRequest.findUnique({
      where: {
        id: Number(requestId),
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

  if (!request) {
    const error = new Error(
      "Payment request not found."
    );

    error.status = 404;
    throw error;
  }

  // ----------------------------------------------------------
  // 2. Make sure request is pending
  // ----------------------------------------------------------

  if (request.status !== "PENDING") {
    const error = new Error(
      "Payment request has already been processed."
    );

    error.status = 400;
    throw error;
  }

  // ----------------------------------------------------------
  // 3. Update request
  // ----------------------------------------------------------

  const updatedRequest =
    await prisma.paymentRequest.update({
      where: {
        id: request.id,
      },

      data: {
        status: "REJECTED",

        reviewedById: adminId,

        reviewedAt: new Date(),

        remarks:
          remarks?.trim() || null,
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

  // ----------------------------------------------------------
  // 4. Build month information
  // ----------------------------------------------------------

  const monthText =
    request.months?.length > 0
      ? request.months
          .map((month) =>
            formatMonth(
              month.monthNumber,
              month.year
            )
          )
          .join(", ")
      : "the selected contribution months";

  // ----------------------------------------------------------
  // 5. Notify member
  // ----------------------------------------------------------

  await prisma.notification.create({
    data: {
      memberId:
        request.memberId,

      createdById: adminId,

      title: "Payment Rejected",

      message:
        remarks?.trim() ||
        `Your payment request covering ${monthText} was rejected. Please review the payment details and submit a new request.`,

      type: "PAYMENT",
    },
  });

  return updatedRequest;
};