import { z } from "zod";
import ErrorHandler from "./errorMiddlewares.js";



const BorrowRequestSchema = z.object({
  bookId: z
    .string()
    .min(1, "Book ID is required")
    .refine((val) => val.trim().length > 0, "Book ID cannot be empty")
});


const ApproveBorrowSchema = z.object({
  dueDate: z
    .string()
    .datetime("Due date must be a valid ISO 8601 date string")
    .refine(
      (date) => new Date(date) > new Date(new Date().setHours(0, 0, 0, 0)),
      "Due date must be in the future"
    )
});

const RejectBorrowSchema = z.object({
  remarks: z
    .string()
    .min(1, "Remarks are required")
    .max(500, "Remarks cannot exceed 500 characters")
    .refine((val) => val.trim().length > 0, "Remarks cannot be just whitespace")
    .transform((val) => sanitizeHTML(val)) // Remove HTML tags
});

const ReportIssueSchema = z.object({
  issueType: z
    .enum(["Lost", "Damaged"], {
      errorMap: () => ({ message: "Issue type must be 'Lost' or 'Damaged'" })
    }),
  remarks: z
    .string()
    .min(1, "Remarks are required")
    .max(500, "Remarks cannot exceed 500 characters")
    .refine((val) => val.trim().length > 0, "Remarks cannot be just whitespace")
    .transform((val) => sanitizeHTML(val)) 
});


const sanitizeHTML = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ===== VALIDATION MIDDLEWARE FUNCTIONS =====


export const validateBorrowRequest = (req, res, next) => {
  try {
    const validated = BorrowRequestSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || "Validation failed";
      return next(new ErrorHandler(message, 400));
    }
    return next(new ErrorHandler("Invalid request data", 400));
  }
};


export const validateApprove = (req, res, next) => {
  try {
    const validated = ApproveBorrowSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || "Validation failed";
      return next(new ErrorHandler(message, 400));
    }
    return next(new ErrorHandler("Invalid request data", 400));
  }
};


export const validateReject = (req, res, next) => {
  try {
    const validated = RejectBorrowSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || "Validation failed";
      return next(new ErrorHandler(message, 400));
    }
    return next(new ErrorHandler("Invalid request data", 400));
  }
};


export const validateReportIssue = (req, res, next) => {
  try {
    const validated = ReportIssueSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || "Validation failed";
      return next(new ErrorHandler(message, 400));
    }
    return next(new ErrorHandler("Invalid request data", 400));
  }
};

export default {
  validateBorrowRequest,
  validateApprove,
  validateReject,
  validateReportIssue,
  sanitizeHTML
};

