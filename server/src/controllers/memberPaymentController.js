import * as memberPaymentService from "../services/memberPaymentService.js";
import { generateReceiptPDF } from "../pdf/receiptPdf.js";

// ========================================
// MEMBER PAYMENT HISTORY
// ========================================

export const paymentHistory = async (req, res, next) => {
  try {
    const history =
      await memberPaymentService.getPaymentHistory(
        req.member.id
      );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DOWNLOAD RECEIPT
// ========================================

export const downloadReceipt = async (req, res, next) => {
  try {
    const contribution =
      await memberPaymentService.getSingleReceipt(
        req.member.id,
        req.params.contributionId
      );

    generateReceiptPDF(res, contribution);
  } catch (error) {
    next(error);
  }
};