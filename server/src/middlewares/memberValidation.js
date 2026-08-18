import { body, validationResult } from "express-validator";

// ============================================================
// CREATE MEMBER VALIDATION
// ============================================================

export const validateMember = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters long."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .matches(/^(0|\+234)[789][01]\d{8}$/)
    .withMessage("Enter a valid Nigerian phone number."),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Enter a valid email address."),

  body("contributionStartDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Enter a valid contribution start date."),

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

// ============================================================
// UPDATE MEMBER VALIDATION
// ============================================================

export const validateMemberUpdate = [
  body("fullName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters long."),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(0|\+234)[789][01]\d{8}$/)
    .withMessage("Enter a valid Nigerian phone number."),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Enter a valid email address."),

  body("status")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Invalid member status."),

  body("contributionStartDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Enter a valid contribution start date."),

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