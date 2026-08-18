import prisma from "../config/prisma.js";

export const uploadPaymentProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: {
        id: Number(id),
        memberId: req.member.id,
      },
    });

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: "Payment request not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const updated = await prisma.paymentRequest.update({
      where: {
        id: Number(id),
      },
      data: {
       proofImage: `payment-proofs/${req.file.filename}`,
      },
    });

    res.json({
      success: true,
      message: "Payment proof uploaded successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};