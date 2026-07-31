import prisma from "../config/prisma.js";

// ===============================
// Create Expense
// ===============================
export const createExpense = async (data) => {
  return await prisma.expense.create({
    data,
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
  const expense = await prisma.expense.findUnique({
    where: {
      id: Number(id),
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
  await getExpenseById(id);

  return await prisma.expense.update({
    where: {
      id: Number(id),
    },
    data,
  });
};

// ===============================
// Delete Expense
// ===============================
export const deleteExpense = async (id) => {
  await getExpenseById(id);

  await prisma.expense.delete({
    where: {
      id: Number(id),
    },
  });

  return {
    message: "Expense deleted successfully.",
  };
};