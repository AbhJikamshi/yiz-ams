import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as reportController from "../controllers/reportController.js";

const router = express.Router();

// Financial Summary
router.get(
  "/summary",
  authMiddleware,
  reportController.financialSummary
);

// Contribution Report
router.get(
  "/contributions",
  authMiddleware,
  reportController.contributionReport
);

// Download Contributions Excel
router.get(
  "/contributions/excel",
  authMiddleware,
  reportController.downloadContributionExcel
);

// Expense Report
router.get(
  "/expenses",
  authMiddleware,
  reportController.expenseReport
);

// Member Statement
router.get(
  "/member/:memberId",
  authMiddleware,
  reportController.memberStatement
);

// Contribution Receipt PDF
router.get(
  "/receipt/:contributionId/pdf",
  authMiddleware,
  reportController.downloadReceiptPDF
);

export default router;