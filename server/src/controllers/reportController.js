import prisma from "../config/prisma.js";
import * as reportService from "../services/reportService.js";
import { generateReceiptPDF } from "../pdf/receiptPdf.js";

// =====================================================
// Financial Summary
// =====================================================

export const financialSummary = async (req, res, next) => {
  try {
    const summary =
      await reportService.getFinancialSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Contribution Report
// =====================================================

export const contributionReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getContributionReport(
        req.query
      );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Expense Report
// =====================================================

export const expenseReport = async (
  req,
  res,
  next
) => {
  try {
    const report =
      await reportService.getExpenseReport(
        req.query
      );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Member Statement
// =====================================================

export const memberStatement = async (
  req,
  res,
  next
) => {
  try {
    const statement =
      await reportService.getMemberStatement(
        req.params.memberId
      );

    return res.status(200).json({
      success: true,
      data: statement,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Contribution Receipt PDF
// =====================================================

export const downloadReceiptPDF = async (
  req,
  res,
  next
) => {
  try {
    const contribution =
      await prisma.contribution.findUnique({
        where: {
          id: Number(req.params.contributionId),
        },
        include: {
          member: true,
        },
      });

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found.",
      });
    }

    return generateReceiptPDF(
      res,
      contribution
    );
  } catch (error) {
    next(error);
  }
};

// =====================================================
// Excel Helper
// =====================================================

const sendWorkbook = async (
  res,
  workbook,
  filename
) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}`
  );

  await workbook.xlsx.write(res);

  res.end();
};

// =====================================================
// Contribution Excel
// =====================================================

export const downloadContributionExcel =
  async (req, res, next) => {
    try {
      const workbook =
        await reportService.getContributionWorkbook();

      await sendWorkbook(
        res,
        workbook,
        "ContributionReport.xlsx"
      );
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// Member Excel
// =====================================================

export const downloadMemberExcel =
  async (req, res, next) => {
    try {
      const workbook =
        await reportService.getMemberWorkbook();

      await sendWorkbook(
        res,
        workbook,
        "MembersReport.xlsx"
      );
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// Expense Excel
// =====================================================

export const downloadExpenseExcel =
  async (req, res, next) => {
    try {
      const workbook =
        await reportService.getExpenseWorkbook();

      await sendWorkbook(
        res,
        workbook,
        "ExpenseReport.xlsx"
      );
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// Financial Summary Excel
// =====================================================

export const downloadFinancialSummaryExcel =
  async (req, res, next) => {
    try {
      const workbook =
        await reportService.getFinancialSummaryWorkbook();

      await sendWorkbook(
        res,
        workbook,
        "FinancialSummary.xlsx"
      );
    } catch (error) {
      next(error);
    }
  };

  // =====================================================
// ADMIN SUMMARY
// =====================================================

export const adminSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getAdminSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MONTHLY INCOME
// =====================================================

export const monthlyIncome = async (req, res, next) => {
  try {
    const income = await reportService.getMonthlyIncome();

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MONTHLY EXPENSES
// =====================================================

export const monthlyExpenses = async (req, res, next) => {
  try {
    const expenses =
      await reportService.getMonthlyExpenses();

    res.json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// OUTSTANDING MEMBERS
// =====================================================

export const outstandingMembers = async (req, res, next) => {
  try {
    const members =
      await reportService.getOutstandingMembers();

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};