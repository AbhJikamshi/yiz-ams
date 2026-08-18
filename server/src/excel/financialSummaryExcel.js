import ExcelJS from "exceljs";

export const generateFinancialSummaryExcel = async (summary) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "YIZ-AMS";
  workbook.company = "Ya Isa Zama Association";
  workbook.subject = "Financial Summary";
  workbook.title = "Financial Summary";

  const sheet = workbook.addWorksheet("Summary");

  sheet.columns = [
    { width: 40 },
    { width: 25 },
  ];

  sheet.mergeCells("A1:B1");
  sheet.getCell("A1").value = "YA ISA ZAMA ASSOCIATION";
  sheet.getCell("A1").font = {
    bold: true,
    size: 18,
  };
  sheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  sheet.mergeCells("A2:B2");
  sheet.getCell("A2").value = "FINANCIAL SUMMARY";
  sheet.getCell("A2").font = {
    bold: true,
    size: 14,
  };
  sheet.getCell("A2").alignment = {
    horizontal: "center",
  };

  sheet.addRow([]);

  const rows = [
    ["Total Members", summary.totalMembers],
    ["Expected Contributions", summary.expectedContributions],
    ["Received Contributions", summary.receivedContributions],
    ["Outstanding Contributions", summary.outstandingContributions],
    ["Total Expenses", summary.totalExpenses],
    ["Available Balance", summary.availableBalance],
    ["Collection Rate", `${summary.collectionRate}%`],
  ];

  rows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);

    row.getCell(1).font = {
      bold: true,
    };

    row.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "D9EAD3",
      },
    };
  });

  return workbook;
};