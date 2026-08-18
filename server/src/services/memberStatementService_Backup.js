import prisma from "../config/prisma.js";

export const getMemberStatement = async (memberId) => {
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

  const settings = await prisma.setting.findFirst();

  const totalPaid = member.contributions.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    association: settings,
    member,
    payments: member.contributions,
    summary: {
      totalPayments: member.contributions.length,
      totalPaid,
    },
  };
};