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
// Start of month
// ------------------------------------------------------------

const startOfMonth = (year, monthNumber) => {
  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );
};

// ------------------------------------------------------------
// Get months between two dates
// Inclusive.
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
// Get current contribution month
// ------------------------------------------------------------

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthNumber: now.getMonth() + 1,
  };
};

// ============================================================
// FINANCIAL PERIOD HELPERS
// ============================================================

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
// CREATE CONTRIBUTION
// ============================================================

export const createContribution = async (data) => {
  const contribution = await prisma.contribution.create({
    data: {
      memberId: data.memberId,

      monthNumber: Number(data.monthNumber),

      year: Number(data.year),

      amount: toNumber(data.amount),

      // Only PAID / APPROVED are treated as confirmed payments.
      status: data.status || "PAID",

      paymentDate: data.paymentDate
        ? new Date(data.paymentDate)
        : new Date(),
    },

    include: {
      member: true,
    },
  });

  return contribution;
};

// ============================================================
// GET ALL CONTRIBUTIONS
// ============================================================

export const getContributions = async () => {
  return await prisma.contribution.findMany({
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
        paymentDate: "desc",
      },
    ],
  });
};

// ============================================================
// GET CONTRIBUTION BY ID
// ============================================================

export const getContributionById = async (id) => {
  return await prisma.contribution.findUnique({
    where: {
      id,
    },

    include: {
      member: true,
    },
  });
};

// ============================================================
// GET CONTRIBUTIONS BY MEMBER
// ============================================================

export const getContributionsByMember = async (memberId) => {
  return await prisma.contribution.findMany({
    where: {
      memberId,
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
};

// ============================================================
// GET CONTRIBUTIONS OVERVIEW FOR ADMIN
// ============================================================

export const getContributionsOverview = async () => {
  const [settings, members] = await Promise.all([
    prisma.setting.findFirst({
      orderBy: {
        id: "asc",
      },
    }),

    prisma.member.findMany({
      where: {
        status: "ACTIVE",
      },

      orderBy: {
        fullName: "asc",
      },
    }),
  ]);

  const monthlyAmount = toNumber(
    settings?.monthlyContributionAmount
  );

  const currentPeriod = getCurrentPeriod();

  const contributionStart =
    getContributionStart(settings);

  // ----------------------------------------------------------
  // Overall collection period
  // ----------------------------------------------------------

  const collectionMonths = getMonthsBetween(
    contributionStart.year,
    contributionStart.monthNumber,
    currentPeriod.year,
    currentPeriod.monthNumber
  );

  const collectionMonthsCount =
    collectionMonths.length;

  // ----------------------------------------------------------
  // Process each member
  // ----------------------------------------------------------

  const result = await Promise.all(
    members.map(async (member) => {
      const contributions =
        await prisma.contribution.findMany({
          where: {
            memberId: member.id,
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

      const paymentRequests =
        await prisma.paymentRequest.findMany({
          where: {
            memberId: member.id,

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
        });

      // --------------------------------------------------------
      // Member contribution start
      // --------------------------------------------------------

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

        const memberIsAfterCollectionStart =
          memberYear > contributionStart.year ||
          (
            memberYear ===
              contributionStart.year &&
            memberMonth >
              contributionStart.monthNumber
          );

        if (memberIsAfterCollectionStart) {
          effectiveStartYear = memberYear;
          effectiveStartMonth = memberMonth;
        }
      }

      // --------------------------------------------------------
      // Due months
      // --------------------------------------------------------

      let dueMonths = [];

      if (
        effectiveStartYear < currentPeriod.year ||
        (
          effectiveStartYear ===
            currentPeriod.year &&
          effectiveStartMonth <=
            currentPeriod.monthNumber
        )
      ) {
        dueMonths = getMonthsBetween(
          effectiveStartYear,
          effectiveStartMonth,
          currentPeriod.year,
          currentPeriod.monthNumber
        );
      }

      // --------------------------------------------------------
      // CONFIRMED PAID CONTRIBUTIONS
      //
      // Only PAID and APPROVED count.
      //
      // PARTIAL and WAIVED are deliberately ignored.
      // --------------------------------------------------------

      const paidMap = new Map();

      let totalPaid = 0;

      let paidMonths = 0;

      for (const contribution of contributions) {
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

        if (
          status === "PAID" ||
          status === "APPROVED"
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

          paidMonths += 1;
        }
      }

      // --------------------------------------------------------
      // PENDING PAYMENT REQUESTS
      //
      // Pending payments are NOT confirmed payments.
      // They are shown separately and are not subtracted
      // from the outstanding balance.
      // --------------------------------------------------------

      const pendingMap = new Map();

      let pendingAmount = 0;

      let pendingRequestCount = 0;

      for (const request of paymentRequests) {
        pendingRequestCount += 1;

        for (const month of request.months || []) {
          const key = getMonthKey(
            month.year,
            month.monthNumber
          );

          const amount = toNumber(
            month.amount
          );

          if (!pendingMap.has(key)) {
            pendingMap.set(key, {
              id: month.id,

              requestId: request.id,

              year: Number(month.year),

              monthNumber: Number(
                month.monthNumber
              ),

              amount,

              month: getMonthLabel(
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

      // --------------------------------------------------------
      // MONTHLY STATUS
      // --------------------------------------------------------

      const monthlyStatus = [];

      const outstandingMonths = [];

      const pendingMonths = [];

      let outstandingAmount = 0;

      for (const dueMonth of dueMonths) {
        const key = dueMonth.key;

        const paid = paidMap.get(key);

        const pending = pendingMap.get(key);

        const paidAmount =
          toNumber(paid?.amount);

        const pendingMonthAmount =
          toNumber(pending?.amount);

        // ------------------------------------------------------
        // IMPORTANT:
        //
        // Outstanding is based ONLY on confirmed payments.
        //
        // monthlyAmount
        //      -
        // confirmed PAID/APPROVED amount
        //
        // Pending payments remain outstanding until approved.
        // ------------------------------------------------------

        let remainingAmount =
          monthlyAmount -
          paidAmount;

        if (remainingAmount < 0) {
          remainingAmount = 0;
        }

        let status = "OVERDUE";

        let amount = monthlyAmount;

        // ------------------------------------------------------
        // CONFIRMED PAID
        // ------------------------------------------------------

        if (paid) {
          status = "PAID";

          amount = paidAmount;

          remainingAmount =
            Math.max(
              monthlyAmount -
                paidAmount,
              0
            );
        }

        // ------------------------------------------------------
        // PENDING
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // OUTSTANDING
        // ------------------------------------------------------

        if (remainingAmount > 0.01) {
          outstandingAmount +=
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
              pendingMonthAmount,

            status,
          });
        }

        monthlyStatus.push({
          year:
            dueMonth.year,

          monthNumber:
            dueMonth.monthNumber,

          month:
            dueMonth.month,

          amount,

          expectedAmount:
            monthlyAmount,

          paidAmount,

          pendingAmount:
            pendingMonthAmount,

          outstandingAmount:
            remainingAmount,

          status,
        });
      }

      // --------------------------------------------------------
      // EXPECTED CONTRIBUTION
      // --------------------------------------------------------

      const totalExpected =
        dueMonths.length *
        monthlyAmount;

      // --------------------------------------------------------
      // CONTRIBUTION PERCENTAGE
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // CONTRIBUTION HISTORY
      // --------------------------------------------------------

      const contributionHistory =
        contributions.map(
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

      // --------------------------------------------------------
      // PENDING VERIFICATION
      // --------------------------------------------------------

      const pendingVerification =
        paymentRequests.map(
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

            months:
              (
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

      // --------------------------------------------------------
      // RETURN MEMBER FINANCIAL SUMMARY
      // --------------------------------------------------------

      return {
        member: {
          id:
            member.id,

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
        },

        monthlyContributionAmount:
          monthlyAmount,

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

        memberContributionStart: {
          year:
            effectiveStartYear,

          monthNumber:
            effectiveStartMonth,

          month:
            getMonthLabel(
              effectiveStartMonth,
              effectiveStartYear
            ),
        },

        totalExpected,

        totalDueMonths:
          dueMonths.length,

        totalPaid,

        paidMonths,

        pendingAmount,

        pendingRequests:
          pendingRequestCount,

        outstandingAmount,

        outstandingMonths,

        pendingMonths,

        paymentCompletionPercentage,

        monthlyStatus,

        contributionHistory,

        pendingVerification,
      };
    })
  );

  // ==========================================================
  // OVERALL SUMMARY
  // ==========================================================

  const summary = result.reduce(
    (total, item) => {
      total.expected +=
        item.totalExpected;

      total.paid +=
        item.totalPaid;

      total.outstanding +=
        item.outstandingAmount;

      total.pending +=
        item.pendingAmount;

      total.paidMonths +=
        item.paidMonths;

      total.dueMonths +=
        item.totalDueMonths;

      if (item.totalPaid > 0) {
        total.membersWithPayments += 1;
      }

      if (
        item.outstandingAmount >
        0.01
      ) {
        total.membersWithOutstanding +=
          1;
      }

      if (
        item.pendingAmount >
        0.01
      ) {
        total.membersWithPending +=
          1;
      }

      return total;
    },
    {
      expected: 0,

      paid: 0,

      outstanding: 0,

      pending: 0,

      paidMonths: 0,

      dueMonths: 0,

      membersWithPayments: 0,

      membersWithOutstanding: 0,

      membersWithPending: 0,
    }
  );

  // ==========================================================
  // RETURN ADMIN OVERVIEW
  // ==========================================================

  return {
    year:
      currentPeriod.year,

    currentMonth:
      currentPeriod.monthNumber,

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

    // --------------------------------------------------------
    // Financial year settings
    // --------------------------------------------------------

    financialYear: {
      startYear:
        Number(
          settings?.financialYearStart ||
            contributionStart.year
        ),

      endYear:
        Number(
          settings?.financialYearEnd ||
            currentPeriod.year
        ),
    },

    // --------------------------------------------------------
    // Contribution collection period
    // --------------------------------------------------------

    contributionPeriod: {
      startYear:
        contributionStart.year,

      startMonth:
        contributionStart.monthNumber,

      startMonthLabel:
        getMonthLabel(
          contributionStart.monthNumber,
          contributionStart.year
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
        collectionMonthsCount,
    },

    monthlyAmount,

    summary: {
      totalMembers:
        members.length,

      expected:
        summary.expected,

      paid:
        summary.paid,

      outstanding:
        summary.outstanding,

      pending:
        summary.pending,

      dueMonths:
        summary.dueMonths,

      paidMonths:
        summary.paidMonths,

      membersWithPayments:
        summary.membersWithPayments,

      membersWithOutstanding:
        summary.membersWithOutstanding,

      membersWithPending:
        summary.membersWithPending,

      collectionCompletionPercentage:
        summary.expected > 0
          ? Math.min(
              Math.round(
                (
                  summary.paid /
                  summary.expected
                ) * 100
              ),
              100
            )
          : 0,
    },

    members: result,
  };
};

// ============================================================
// GET MEMBER CONTRIBUTION OVERVIEW
// ============================================================

export const getContributionOverview = async () => {
  const [settings, members] =
    await Promise.all([
      prisma.setting.findFirst({
        orderBy: {
          id: "asc",
        },
      }),

      prisma.member.findMany({
        where: {
          status: "ACTIVE",
        },

        orderBy: {
          fullName: "asc",
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
      }),
    ]);

  const monthlyAmount =
    toNumber(
      settings?.monthlyContributionAmount
    );

  const currentPeriod =
    getCurrentPeriod();

  const currentYear =
    currentPeriod.year;

  const currentMonth =
    currentPeriod.monthNumber;

  const contributionStart =
    getContributionStart(settings);

  // ----------------------------------------------------------
  // Process members
  // ----------------------------------------------------------

  return members.map((member) => {
    const contributions =
      member.contributions || [];

    const paymentRequests =
      member.paymentRequests || [];

    // --------------------------------------------------------
    // Member contribution start
    // --------------------------------------------------------

    let effectiveStartYear =
      contributionStart.year;

    let effectiveStartMonth =
      contributionStart.monthNumber;

    if (member.contributionStartDate) {
      const memberStartDate =
        new Date(
          member.contributionStartDate
        );

      effectiveStartYear =
        memberStartDate.getFullYear();

      effectiveStartMonth =
        memberStartDate.getMonth() + 1;
    } else {
      const memberCreatedAt =
        new Date(
          member.createdAt
        );

      const memberYear =
        memberCreatedAt.getFullYear();

      const memberMonth =
        memberCreatedAt.getMonth() + 1;

      const memberJoinedAfterStart =
        memberYear >
          contributionStart.year ||
        (
          memberYear ===
            contributionStart.year &&
          memberMonth >
            contributionStart.monthNumber
        );

      if (memberJoinedAfterStart) {
        effectiveStartYear =
          memberYear;

        effectiveStartMonth =
          memberMonth;
      }
    }

    // --------------------------------------------------------
    // Due months
    // --------------------------------------------------------

    let dueMonths = [];

    if (
      effectiveStartYear <
        currentYear ||
      (
        effectiveStartYear ===
          currentYear &&
        effectiveStartMonth <=
          currentMonth
      )
    ) {
      dueMonths =
        getMonthsBetween(
          effectiveStartYear,
          effectiveStartMonth,
          currentYear,
          currentMonth
        );
    }

    // --------------------------------------------------------
    // CONFIRMED PAID CONTRIBUTIONS
    //
    // Only PAID and APPROVED count.
    //
    // PARTIAL and WAIVED are ignored.
    // --------------------------------------------------------

    const paidContributionMap =
      new Map();

    let totalPaid = 0;

    let paidMonths = 0;

    for (
      const contribution of
        contributions
    ) {
      const status =
        String(
          contribution.status || ""
        ).toUpperCase();

      const amount =
        toNumber(
          contribution.amount
        );

      const key =
        getMonthKey(
          contribution.year,
          contribution.monthNumber
        );

      if (
        status === "PAID" ||
        status === "APPROVED"
      ) {
        paidContributionMap.set(
          key,
          {
            id:
              contribution.id,

            amount,

            status,

            year:
              Number(
                contribution.year
              ),

            monthNumber:
              Number(
                contribution.monthNumber
              ),

            paymentDate:
              contribution.paymentDate,
          }
        );

        totalPaid += amount;

        paidMonths += 1;
      }
    }

    // --------------------------------------------------------
    // PENDING MAP
    // --------------------------------------------------------

    const pendingMonthMap =
      new Map();

    let pendingAmount = 0;

    for (
      const request of
        paymentRequests
    ) {
      for (
        const month of
          request.months || []
      ) {
        const key =
          getMonthKey(
            month.year,
            month.monthNumber
          );

        const amount =
          toNumber(
            month.amount
          );

        if (
          !pendingMonthMap.has(key)
        ) {
          pendingMonthMap.set(
            key,
            {
              id:
                month.id,

              requestId:
                request.id,

              year:
                Number(
                  month.year
                ),

              monthNumber:
                Number(
                  month.monthNumber
                ),

              amount,

              month:
                getMonthLabel(
                  month.monthNumber,
                  month.year
                ),
            }
          );

          pendingAmount +=
            amount;
        }
      }
    }

    // --------------------------------------------------------
    // OUTSTANDING
    // --------------------------------------------------------

    const outstandingMonths = [];

    let outstandingAmount = 0;

    for (
      const dueMonth of
        dueMonths
    ) {
      const key =
        dueMonth.key;

      const paid =
        paidContributionMap.get(
          key
        );

      const pending =
        pendingMonthMap.get(
          key
        );

      const paidAmount =
        toNumber(
          paid?.amount
        );

      const pendingMonthAmount =
        toNumber(
          pending?.amount
        );

      // ------------------------------------------------------
      // IMPORTANT:
      //
      // Pending is NOT a confirmed payment.
      //
      // Therefore outstanding is calculated using only
      // confirmed PAID / APPROVED contributions.
      // ------------------------------------------------------

      let remaining =
        monthlyAmount -
        paidAmount;

      if (remaining < 0) {
        remaining = 0;
      }

      if (
        remaining > 0.01
      ) {
        outstandingAmount +=
          remaining;

        outstandingMonths.push({
          year:
            dueMonth.year,

          monthNumber:
            dueMonth.monthNumber,

          month:
            dueMonth.month,

          amount:
            remaining,

          paidAmount,

          pendingAmount:
            pendingMonthAmount,
        });
      }
    }

    // --------------------------------------------------------
    // EXPECTED
    // --------------------------------------------------------

    const totalExpected =
      dueMonths.length *
      monthlyAmount;

    // --------------------------------------------------------
    // PENDING MONTHS
    // --------------------------------------------------------

    const pendingMonths =
      Array.from(
        pendingMonthMap.values()
      );

    // --------------------------------------------------------
    // CONTRIBUTION HISTORY
    // --------------------------------------------------------

    const contributionHistory =
      contributions.map(
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

    // --------------------------------------------------------
    // PENDING VERIFICATION
    // --------------------------------------------------------

    const pendingVerification =
      paymentRequests.map(
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

          months:
            (
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

    // --------------------------------------------------------
    // RETURN
    // --------------------------------------------------------

    return {
      member: {
        id:
          member.id,

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
      },

      monthlyContributionAmount:
        monthlyAmount,

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

      memberContributionStart: {
        year:
          effectiveStartYear,

        monthNumber:
          effectiveStartMonth,

        month:
          getMonthLabel(
            effectiveStartMonth,
            effectiveStartYear
          ),
      },

      totalExpected,

      totalPaid,

      paidMonths,

      totalDueMonths:
        dueMonths.length,

      outstandingAmount,

      outstandingMonths,

      pendingAmount,

      pendingMonths,

      contributionHistory,

      pendingVerification,
    };
  });
};

// ============================================================
// UPDATE CONTRIBUTION
// ============================================================

export const updateContribution = async (
  id,
  data
) => {
  return await prisma.contribution.update({
    where: {
      id,
    },

    data: {
      monthNumber:
        data.monthNumber !== undefined
          ? Number(data.monthNumber)
          : undefined,

      year:
        data.year !== undefined
          ? Number(data.year)
          : undefined,

      amount:
        data.amount !== undefined
          ? toNumber(data.amount)
          : undefined,

      status:
        data.status !== undefined
          ? data.status
          : undefined,

      paymentDate:
        data.paymentDate
          ? new Date(data.paymentDate)
          : undefined,
    },

    include: {
      member: true,
    },
  });
};

// ============================================================
// DELETE CONTRIBUTION
// ============================================================

export const deleteContribution = async (
  id
) => {
  return await prisma.contribution.delete({
    where: {
      id,
    },
  });
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