const errorHandler = (err, req, res, next) => {
  console.error(err);

  // =====================================
  // Custom Application Errors
  // =====================================
  const status = err.statusCode || err.status;

  if (status) {
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }

  // =====================================
  // Prisma Unique Constraint Error
  // =====================================
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists.",
      target: err.meta?.target || null,
    });
  }

  // =====================================
  // Prisma Record Not Found
  // =====================================
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  // =====================================
  // Prisma Validation Error
  // =====================================
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
  }

  // =====================================
  // JWT Errors
  // =====================================
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired.",
    });
  }

  // =====================================
  // Default Error
  // =====================================
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

export default errorHandler;