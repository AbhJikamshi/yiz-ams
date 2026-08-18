import express from "express";
import * as memberPaymentController from "../controllers/memberPaymentController.js";
import memberAuthMiddleware from "../middlewares/memberAuthMiddleware.js";

const router = express.Router();

// ========================================
// PAYMENT HISTORY
// ========================================

router.get(
  "/payments",
  memberAuthMiddleware,
  memberPaymentController.paymentHistory
);

// ========================================
// DOWNLOAD PERSONAL RECEIPT
// ========================================

router.get(
  "/receipt/:contributionId/pdf",
  memberAuthMiddleware,
  memberPaymentController.downloadReceipt
);

export default router;