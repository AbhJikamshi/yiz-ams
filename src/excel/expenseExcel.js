import ExcelJS from "exceljs";

export const generateExpenseExcel = async (expenses) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "YIZ-AMS";
  workbook.company = "Ya Isa Zama Association";
  workbook.subject = "Expense Report";
  workbook.title = "Expense Report";

  const worksheet = workbook.addWorksheet("Expenses");

  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = "YA ISA ZAMA ASSOCIATION";
  worksheet.getCell("A1").font = {
    bold: true,
    size: 18,
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
  };

  worksheet.mergeCells("A2:E2");
  worksheet.getCell("A2").value = "Expense Report";
  worksheet.getCell("A2").font = {
    bold: true,
    size: 14,
  };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
  };

  worksheet.columns = [
    { header: "Expense ID", key: "id", width: 15 },
    { header: "Category", key: "category", width: 25 },
    { header: "Description", key: "description", width: 40 },
    { header: "Amount", key: "amount", width: 18 },
    { header: "Date", key: "date", width: 20 },
  ];

  const headerRow = worksheet.getRow(4);

  headerRow.values = [
    "Expense ID",
    "Category",
    "Description",
    "Amount",
    "Date",
  ];

  headerRow.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF",
    },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "C00000",
    },
  };

  headerRow.alignment = {
    horizontal: "center",
  };

  let total = 0;

  expenses.forEach((expense) => {
    total += Number(expense.amount);

    worksheet.addRow({
      id: expense.id,
      category: expense.category,
      description: expense.description ?? "",
      amount: expense.amount,
      date: new Date(expense.expenseDate).toLocaleDateString(),
    });
  });

  worksheet.addRow([]);

  const totalRow = worksheet.addRow({
    description: "TOTAL EXPENSES",
    amount: total,
  });

  totalRow.font = {
    bold: true,
  };

  return workbook;
};