import prisma from "../config/prisma.js";

// ===============================
// Create Expense
// ===============================
export const createExpense = async (data) => {
  return await prisma.expense.create({
    data: {
      ...data,
      expenseDate: data.expenseDate
        ? new Date(data.expenseDate)
        : undefined,
    },
  });
};

// ===============================
// Get All Expenses
// ===============================
export const getExpenses = async () => {
  return await prisma.expense.findMany({
    orderBy: {
      expenseDate: "desc",
    },
  });
};

// ===============================
// Get Expense By ID
// ===============================
export const getExpenseById = async (id) => {
  const expenseId = Number(id);

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
  });

  if (!expense) {
    const error = new Error("Expense not found.");
    error.statusCode = 404;
    throw error;
  }

  return expense;
};

// ===============================
// Update Expense
// ===============================
export const updateExpense = async (id, data) => {
  const expenseId = Number(id);

  await getExpenseById(expenseId);

  return await prisma.expense.update({
    where: {
      id: expenseId,
    },
    data: {
      ...data,
      expenseDate: data.expenseDate
        ? new Date(data.expenseDate)
        : undefined,
    },
  });
};

// ===============================
// Delete Expense
// ===============================
export const deleteExpense = async (id) => {
  const expenseId = Number(id);

  await getExpenseById(expenseId);

  await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });

  return {
    message: "Expense deleted successfully.",
  };
};