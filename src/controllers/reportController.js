import * as reportService from "../services/reportService.js";
import prisma from "../config/prisma.js";
import { generateReceiptPDF } from "../pdf/receiptPdf.js";
export const financialSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getFinancialSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const contributionReport = async (req, res, next) => {
  try {
    const report = await reportService.getContributionReport(req.query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const expenseReport = async (req, res, next) => {
  try {
    const report = await reportService.getExpenseReport(req.query);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const memberStatement = async (req, res, next) => {
  try {
    const statement = await reportService.getMemberStatement(
      req.params.memberId
    );

    res.json({
      success: true,
      data: statement,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReceiptPDF = async (req, res, next) => {
  try {
    const contribution = await prisma.contribution.findUnique({
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

    generateReceiptPDF(res, contribution);
  } catch (error) {
    next(error);
  }
};
export const downloadContributionExcel = async (req, res, next) => {
  try {
    const workbook = await reportService.getContributionWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ContributionReport.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    next(error);
  }
};
export const downloadMemberExcel = async (req, res, next) => {
  try {
    const workbook = await reportService.getMemberWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=MembersReport.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    next(error);
  }
};
export const downloadExpenseExcel = async (req, res, next) => {
  try {
    const workbook = await reportService.getExpenseWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ExpenseReport.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    next(error);
  }
};