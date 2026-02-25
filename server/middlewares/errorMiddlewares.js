class Errorhandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  console.log(err);

  if (err.code === 11000) {
    const statusCode = 400; 
    const message = `Duplicate Field Value Entered`;
    err = new Errorhandler(message, statusCode);
  }

  if (err.name === "JsonWebTokenError") {
    const statusCode = 400;
    const message = `Json Web Token is invalid, Try again.`;
    err = new Errorhandler(message, statusCode);
  }

  if (err.name === "TokenExpiredError") {
    const statusCode = 400;
    const message = `Json Web Token is expired, Try again.`;
    err = new Errorhandler(message, statusCode);
  }

  if (err.name === "CastError") {
    const statusCode = 400;
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new Errorhandler(message, statusCode);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default Errorhandler;
