import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  keyGenerator: (req, res) => {
    
    // This ensures per-user rate limiting
    return req.user?.id || req.ip;
  },
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Too many borrow requests. Please try again in 1 minute.",
  statusCode: 429,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req, res) => {
    // Skip rate limiting for admins (Super Admin only)
    return req.user?.role === "Super Admin";
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many borrow requests. Please try again in 1 minute.",
      data: null,
      error: "Rate limit exceeded"
    });
  }
});

export default rateLimiter;

