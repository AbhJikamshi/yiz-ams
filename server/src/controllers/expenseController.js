import * as expenseService from "../services/expenseService.js";

// ===============================
// Create Expense
// ===============================
export const create = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);

    res.status(201).json({
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
    const expenses = await expenseService.getExpenses();

    res.json({
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
export const getById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(
      Number(req.params.id)
    );

    res.json({
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
    const expense = await expenseService.updateExpense(
      Number(req.params.id),
      req.body
    );

    res.json({
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
    const result = await expenseService.deleteExpense(
      Number(req.params.id)
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};