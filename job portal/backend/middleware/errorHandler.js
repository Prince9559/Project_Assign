//  backend/middleware/errorHandler.js

/**
 * Global Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
  console.error("[ErrorHandler] Caught error:");
  console.error("[ErrorHandler] Message:", err.message);
  console.error("[ErrorHandler] Stack:", err.stack);

  // Determine status code
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
    console.error("[ErrorHandler] Sequelize validation error:", message);
  }

  // Sequelize database errors
  if (err.name === "SequelizeDatabaseError") {
    statusCode = 500;
    message = "Database error occurred";
    console.error("[ErrorHandler] Database error:", err.parent?.message || err.message);
  }

  // Sequelize foreign key constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid reference: Related record does not exist";
    console.error("[ErrorHandler] Foreign key constraint error");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    console.error("[ErrorHandler] JWT error");
  }

  // Custom application errors
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    console.error("[ErrorHandler] Operational error");
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Not Found Handler
 */
function notFoundHandler(req, res, next) {
  console.log(`[ErrorHandler] Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Async Handler Wrapper
 * Catches async errors and passes to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
};