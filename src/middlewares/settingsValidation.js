const settingsValidation = (req, res, next) => {
  const {
    associationName,
    monthlyContributionAmount,
    currency,
    financialYearStart,
    financialYearEnd,
    receiptPrefix,
    contributionPrefix,
    expensePrefix,
  } = req.body;

  if (
    associationName !== undefined &&
    associationName.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Association name cannot be empty.",
    });
  }

  if (
    monthlyContributionAmount !== undefined &&
    (typeof monthlyContributionAmount !== "number" ||
      monthlyContributionAmount < 0)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Monthly contribution amount must be a positive number.",
    });
  }

  if (
    currency !== undefined &&
    currency.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Currency cannot be empty.",
    });
  }

  if (
    financialYearStart !== undefined &&
    financialYearEnd !== undefined &&
    financialYearStart > financialYearEnd
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Financial year start cannot be greater than financial year end.",
    });
  }

  const prefixes = [
    {
      value: receiptPrefix,
      name: "Receipt prefix",
    },
    {
      value: contributionPrefix,
      name: "Contribution prefix",
    },
    {
      value: expensePrefix,
      name: "Expense prefix",
    },
  ];

  for (const prefix of prefixes) {
    if (
      prefix.value !== undefined &&
      prefix.value.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: `${prefix.name} cannot be empty.`,
      });
    }
  }

  next();
};

export default settingsValidation;