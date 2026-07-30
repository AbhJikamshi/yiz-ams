import { body, validationResult } from "express-validator";

// Validation rules for creating/updating a member
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