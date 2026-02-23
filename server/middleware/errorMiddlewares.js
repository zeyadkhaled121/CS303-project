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
    const statuscode = 400;
    const message = `Duplicate Field Value Entered`;
    err = new Errorhandler(message, statuscode);
  }

  if (err.name === "JsonWebTokenError") {
    const statuscode = 400;
    const message = `Json Web Token is invalid,Try again.`;
    err = new Errorhandler(message, statuscode);
  }
  if (err.name === "TokenExpiredError") {
    const statuscode = 400;
    const message = `Json Web Token is invalid,Try again.`;
    err = new Errorhandler(message, statuscode);
  }
  if (err.name === "CastError") {
    const statuscode = 400;
    const message = `Resource not found . Invalid:${err.path}`;
    err = new Errorhandler(message, statuscode);
  }
  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;
    return res.status(err.statuscode).json({
        success:false,
        message:errorMessage,
    })
};
export default Errorhandler;