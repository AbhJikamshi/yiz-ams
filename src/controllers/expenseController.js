import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../services/expenseService.js";

// ===============================
// Create Expense
// ===============================
export const create = async (req, res, next) => {
  try {
    const expense = await createExpense(req.body);

    return res.status(201).json({
      success: true,
      message: "Expense recorded successfully.",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Get All Expenses
// ===============================
export const getAll = async (req, res, next) => {
  try {
    const expenses = await getExpenses();

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Get Expense By ID
// ===============================
export const getOne = async (req, res, next) => {
  try {
    const expense = await getExpenseById(req.params.id);

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Update Expense
// ===============================
export const update = async (req, res, next) => {
  try {
    const expense = await updateExpense(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// Delete Expense
// ===============================
export const remove = async (req, res, next) => {
  try {
    const result = await deleteExpense(req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};