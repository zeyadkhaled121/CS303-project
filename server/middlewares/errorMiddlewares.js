class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  console.error(`[${new Date().toISOString()}]`, err);

  if (err.code === 11000 || err.code === 6) {
    err = new ErrorHandler("A record with that value already exists.", 400);
  }

  // ---- JWT errors ----
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Your authentication token is invalid. Please login again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Your session has expired. Please login again.", 401);
  }

  // ---- Bad ObjectId / path ----
  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
  }

  // ---- Validation errors (multiple) ----
  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
    data: null,
    error: process.env.NODE_ENV === "development" ? err.stack : errorMessage,
  });
};

export default ErrorHandler;
