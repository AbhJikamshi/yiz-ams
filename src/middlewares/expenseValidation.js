const validateExpense = (req, res, next) => {
  const {
    title,
    category,
    amount,
    expenseDate,
  } = req.body;

  if (!title || !category || amount === undefined || !expenseDate) {
    return res.status(400).json({
      success: false,
      message:
        "Title, category, amount and expenseDate are required.",
    });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number.",
    });
  }

  next();
};

export default validateExpense;