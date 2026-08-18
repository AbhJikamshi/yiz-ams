import ExcelJS from "exceljs";

import { formatCurrency } from "../utils/formatCurrency.js";
import { getMonthName } from "../utils/monthName.js";

export const generateContributionExcel = async (contributions) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "YIZ-AMS";
  workbook.company = "Ya Isa Zama Association";
  workbook.subject = "Contribution Report";

  const worksheet = workbook.addWorksheet("Contributions");

  worksheet.columns = [
    { header: "Receipt No", key: "receipt", width: 18 },
    { header: "Member", key: "member", width: 30 },
    { header: "Month", key: "month", width: 15 },
    { header: "Year", key: "year", width: 10 },
    { header: "Amount", key: "amount", width: 18 },
    { header: "Status", key: "status", width: 15 },
  ];

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1F4E78" },
  };

  worksheet.getRow(1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  let total = 0;

  contributions.forEach((contribution) => {
    total += Number(contribution.amount);

    worksheet.addRow({
      receipt: `RC-${String(contribution.id).padStart(6, "0")}`,
      member: contribution.member.fullName,
      month: getMonthName(contribution.monthNumber),
      year: contribution.year,
      amount: formatCurrency(contribution.amount),
      status: contribution.status,
    });
  });

  worksheet.addRow([]);

  const totalRow = worksheet.addRow({
    member: "TOTAL",
    amount: formatCurrency(total),
  });

  totalRow.font = {
    bold: true,
  };

  return workbook;
};