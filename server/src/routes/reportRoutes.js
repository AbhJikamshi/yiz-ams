import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";

import * as reportController from "../controllers/reportController.js";

const router = express.Router();

// =====================================================
// Protect All Report Routes
// =====================================================

router.use(authMiddleware);
router.use(authorize("ADMIN"));

// =====================================================
// Financial Summary
// =====================================================

router.get(
  "/summary",
  reportController.financialSummary
);

router.get(
  "/summary/excel",
  reportController.downloadFinancialSummaryExcel
);

// =====================================================
// Contribution Reports
// =====================================================

router.get(
  "/contributions",
  reportController.contributionReport
);

router.get(
  "/contributions/excel",
  reportController.downloadContributionExcel
);

// =====================================================
// Expense Reports
// =====================================================

router.get(
  "/expenses",
  reportController.expenseReport
);

router.get(
  "/expenses/excel",
  reportController.downloadExpenseExcel
);

// =====================================================
// Member Reports
// =====================================================

router.get(
  "/members/excel",
  reportController.downloadMemberExcel
);

router.get(
  "/members/:memberId",
  reportController.memberStatement
);

// =====================================================
// Contribution Receipt
// =====================================================

router.get(
  "/receipt/:contributionId/pdf",
  reportController.downloadReceiptPDF
);

// =====================================================
// DASHBOARD / CHART REPORTS
// =====================================================

router.get(
  "/admin-summary",
  reportController.adminSummary
);

router.get(
  "/monthly-income",
  reportController.monthlyIncome
);

router.get(
  "/monthly-expenses",
  reportController.monthlyExpenses
);

router.get(
  "/outstanding-members",
  reportController.outstandingMembers
);

export default router;