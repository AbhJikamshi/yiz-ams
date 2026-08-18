import prisma from "../config/prisma.js";

// ========================================
// MEMBER PAYMENT HISTORY
// ========================================

export const getPaymentHistory = async (memberId) => {
  const payments = await prisma.contribution.findMany({
    where: {
      memberId: Number(memberId),
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

  const formattedPayments = payments.map((payment) => ({
    id: payment.id,
    memberId: payment.memberId,

    year: payment.year,
    monthNumber: payment.monthNumber,

    amount: Number(payment.amount || 0),

    paymentDate: payment.paymentDate,
    status: payment.status,

    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }));

  const totalPaid = formattedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  return {
    payments: formattedPayments,
    totalPayments: formattedPayments.length,
    totalPaid,
  };
};

// ========================================
// MEMBER DOWNLOADS SINGLE RECEIPT
// ========================================

export const getSingleReceipt = async (
  memberId,
  contributionId
) => {
  const contribution = await prisma.contribution.findFirst({
    where: {
      id: Number(contributionId),
      memberId: Number(memberId),
    },

    include: {
      member: true,
    },
  });

  if (!contribution) {
    const error = new Error("Receipt not found.");
    error.status = 404;
    throw error;
  }

  return contribution;
};