import { body, validationResult } from "express-validator";

// ===============================
// Contribution Validation Rules
// ===============================
export const validateContribution = [
  body("month")
    .trim()
    .notEmpty()
    .withMessage("Month is required."),

  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Enter a valid year."),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero."),

  body("memberId")
    .isInt({ gt: 0 })
    .withMessage("Valid member ID is required."),

  body("status")
    .optional()
    .isIn(["PAID", "PENDING"])
    .withMessage("Status must be either PAID or PENDING."),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    next();
  },
];