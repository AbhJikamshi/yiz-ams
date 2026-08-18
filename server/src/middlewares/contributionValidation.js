const contributionValidation = (req, res, next) => {
  const {
    monthNumber,
    year,
    amount,
    memberId,
    status,
  } = req.body;

  if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({
      success: false,
      message: "Month number must be between 1 and 12.",
    });
  }

  if (!year || year < 2000) {
    return res.status(400).json({
      success: false,
      message: "Valid year is required.",
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than zero.",
    });
  }

  if (!memberId) {
    return res.status(400).json({
      success: false,
      message: "Member ID is required.",
    });
  }

  const allowedStatus = ["PAID", "PENDING", "PARTIAL", "WAIVED"];

  if (status && !allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contribution status.",
    });
  }

  next();
};

export default contributionValidation;