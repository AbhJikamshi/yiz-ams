const settingsValidation = (req, res, next) => {
  const {
    associationName,
    monthlyContributionAmount,
    currency,
    financialYearStart,
    financialYearEnd,
  } = req.body;

  if (!associationName || associationName.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Association name is required.",
    });
  }

  if (
    monthlyContributionAmount !== undefined &&
    monthlyContributionAmount < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Monthly contribution amount cannot be negative.",
    });
  }

  if (!currency || currency.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Currency is required.",
    });
  }

  if (
    financialYearStart &&
    financialYearEnd &&
    financialYearStart > financialYearEnd
  ) {
    return res.status(400).json({
      success: false,
      message: "Financial year start cannot be greater than financial year end.",
    });
  }

  next();
};

export default settingsValidation;