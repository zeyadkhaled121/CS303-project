/**
 * Unified validation and sanitization helpers.
 */

const MAX_REMARKS_LENGTH = 500;
const MAX_BORROW_WINDOW_DAYS = 60;

const xssPattern = /<script|javascript:|on\w+\s*=|<iframe|data:text\/html/i;
const sqlInjectionPattern = /(;|--|\/\*|\*\/|\b(drop|delete|truncate|alter|insert|update|union|select)\b)/i;

const daysBetween = (a, b) => {
  const ms = Math.abs(a.getTime() - b.getTime());
  return ms / (24 * 60 * 60 * 1000);
};

const unpackBorrowPayload = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return { bookId: value };
};

const unpackDirectPayload = (userOrPayload, bookId, dueDate) => {
  if (userOrPayload && typeof userOrPayload === 'object' && !Array.isArray(userOrPayload)) {
    return {
      userId: userOrPayload.userId,
      bookId: userOrPayload.bookId,
      dueDate: userOrPayload.dueDate,
    };
  }

  return { userId: userOrPayload, bookId, dueDate };
};

const unpackApprovePayload = (borrowOrPayload, dueDate) => {
  if (borrowOrPayload && typeof borrowOrPayload === 'object' && !Array.isArray(borrowOrPayload)) {
    return {
      borrowId: borrowOrPayload.borrowId,
      dueDate: borrowOrPayload.dueDate,
    };
  }

  return { borrowId: borrowOrPayload, dueDate };
};

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Safe, cleaned string
 */
export const sanitizeString = (input) => {
  if (input === undefined || input === null) return "";
  if (typeof input !== "string") {
    return String(input);
  }

  // Basic XSS prevention: remove script tags and dangerous patterns
  const dangerous = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const eventHandlers = /on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi;
  const javascriptProtocol = /javascript:/gi;
  let cleaned = input
    .replace(dangerous, "")
    .replace(eventHandlers, "")
    .replace(javascriptProtocol, "")
    .trim();
  return cleaned;
};

export const sanitizeInput = sanitizeString;

export const checkXSSPatterns = (input) => {
  if (input === undefined || input === null) return false;
  return xssPattern.test(String(input));
};

/**
 * Validate that a string is a valid MongoDB ObjectId
 * Pattern: 24 hex characters
 */
export const isValidObjectId = (id) => {
  return typeof id === "string" && /^[a-f0-9]{24}$/.test(id.toLowerCase());
};

/**
 * Validate that a value is a valid ISO date or can be converted to one
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  return !Number.isNaN(date.getTime());
};

/**
 * Validate that a date is in the future
 * @param {string|Date} dateInput - Date to validate
 * @returns {boolean}
 */
export const isFutureDate = (dateInput) => {
  if (!isValidDate(dateInput)) return false;
  const inputDate = new Date(dateInput);
  const now = new Date();
  return inputDate > now;
};

/**
 * Validate book borrow request
 * @param {string} bookId - Book identifier
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateBorrowBookRequest = (bookId) => {
  const payload = unpackBorrowPayload(bookId);
  const rawId = payload?.bookId;

  if (!rawId) {
    return { isValid: false, error: "Book ID is required", reason: "Book ID is required" };
  }

  const cleaned = String(rawId).trim();
  if (cleaned.length === 0) {
    return { isValid: false, error: "Book ID cannot be empty", reason: "Book ID cannot be empty" };
  }
  if (cleaned.length > 100) {
    return { isValid: false, error: "Book ID is too long", reason: "Book ID is too long" };
  }
  if (checkXSSPatterns(cleaned) || sqlInjectionPattern.test(cleaned)) {
    return { isValid: false, error: "Book ID contains unsafe characters", reason: "Book ID contains unsafe characters" };
  }

  return { isValid: true };
};

/**
 * Validate direct borrow record request (admin)
 * @param {string} userId - User identifier
 * @param {string} bookId - Book identifier
 * @param {string|Date} dueDate - Due date
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateDirectBorrowRequest = (userId, bookId, dueDate) => {
  const payload = unpackDirectPayload(userId, bookId, dueDate);
  if (!payload.userId || String(payload.userId).trim().length === 0) {
    return { isValid: false, error: "User ID is required" };
  }
  if (!payload.bookId || String(payload.bookId).trim().length === 0) {
    return { isValid: false, error: "Book ID is required" };
  }
  if (checkXSSPatterns(payload.userId) || checkXSSPatterns(payload.bookId)) {
    return { isValid: false, error: "Identifiers contain unsafe characters" };
  }
  if (!isValidDate(payload.dueDate)) {
    return { isValid: false, error: "Invalid due date format" };
  }
  if (!isFutureDate(payload.dueDate)) {
    return { isValid: false, error: "Due date must be in the future" };
  }
  if (daysBetween(new Date(payload.dueDate), new Date()) > MAX_BORROW_WINDOW_DAYS) {
    return { isValid: false, error: `Due date cannot exceed ${MAX_BORROW_WINDOW_DAYS} days` };
  }
  return { isValid: true };
};

/**
 * Validate borrow approval request
 * @param {string} borrowId - Borrow record ID
 * @param {string|Date} dueDate - New due date
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateApproveBorrowRequest = (borrowId, dueDate) => {
  const payload = unpackApprovePayload(borrowId, dueDate);

  if (!payload.borrowId || String(payload.borrowId).trim().length === 0) {
    return { isValid: false, error: "Borrow record ID is required" };
  }
  if (!isValidDate(payload.dueDate)) {
    return { isValid: false, error: "Invalid due date format" };
  }
  if (!isFutureDate(payload.dueDate)) {
    return { isValid: false, error: "Due date must be in the future" };
  }
  if (daysBetween(new Date(payload.dueDate), new Date()) > MAX_BORROW_WINDOW_DAYS) {
    return { isValid: false, error: `Due date cannot exceed ${MAX_BORROW_WINDOW_DAYS} days` };
  }
  return { isValid: true };
};

/**
 * Validate reject request remarks
 * @param {string} remarks - Rejection remarks
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateRejectRemarks = (remarks) => {
  if (!remarks || String(remarks).trim().length === 0) {
    return { isValid: false, error: "Rejection reason is required" };
  }
  const cleaned = String(remarks).trim();
  if (cleaned.length > MAX_REMARKS_LENGTH) {
    return { isValid: false, error: `Remarks are too long (max ${MAX_REMARKS_LENGTH} characters)` };
  }
  if (checkXSSPatterns(cleaned)) {
    return { isValid: false, error: "Remarks contain unsafe content" };
  }
  return { isValid: true };
};

/**
 * Centralized error message extractor
 * Safely pulls message from any error format
 * @param {Error|Object|any} error - Error object from any source
 * @param {string} fallback - Default message if none found
 * @returns {string} Safe error message
 */
export const extractErrorMessage = (error, fallback = "An unexpected error occurred") => {
  if (!error) return fallback;

  // Handle string errors
  if (typeof error === "string") {
    const cleaned = sanitizeString(error);
    return cleaned || fallback;
  }

  // Handle Axios response errors
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    if (typeof msg === "string") {
      return sanitizeString(msg);
    }
  }

  // Handle native Error objects
  if (error?.message) {
    const msg = String(error.message);
    return sanitizeString(msg) || fallback;
  }

  return fallback;
};

/**
 * Format error for user-facing toast notifications
 * Ensures message is appropriate for public display
 * @param {Error|string} error - Original error
 * @returns {string} User-friendly message
 */
export const formatErrorForToast = (error, details) => {
  if (typeof error === 'string') {
    if (error === 'VALIDATION_ERROR') {
      return details || 'Validation error. Please review your input.';
    }
    if (error === 'NETWORK_ERROR') {
      return 'network error. Please check your connection.';
    }
    if (error === 'TIMEOUT_ERROR') {
      return 'timeout reached. Please try again.';
    }
  }

  const msg = extractErrorMessage(error);

  // Filter overly technical error messages
  if (msg.includes("Firestore")) return "Database error occurred. Please try again.";
  if (msg.includes("timeout")) return "Request took too long. Please try again.";
  if (msg.includes("ECONNREFUSED")) return "Connection failed. Check your network.";
  if (msg.includes("401") || msg.includes("Unauthorized")) return "Your session expired. Please login again.";
  if (msg.includes("403") || msg.includes("Forbidden")) return "You don't have permission to do this.";
  if (msg.includes("404")) return "The resource was not found.";
  if (msg.includes("500")) return "Server error occurred. Please try again later.";

  return msg;
};

/**
 * Validate multiple conditions before allowing action
 * Returns first error found, or null if all pass
 * @param {Array<{ condition: boolean, error: string }>} checks
 * @returns {{ passed: boolean, error?: string }}
 */
export const validateConditions = (checks) => {
  for (const check of checks) {
    if (!check.condition) {
      return { passed: false, error: check.error };
    }
  }
  return { passed: true };
};

/**
 * Create audit trail entry for sensitive actions
 * Logs user action for security/compliance
 * @param {Object} context - { userId, action, resourceId, resourceType, details }
 */
export const logAuditEvent = (contextOrAction, details, status) => {
  const context =
    contextOrAction && typeof contextOrAction === 'object' && !Array.isArray(contextOrAction)
      ? contextOrAction
      : {
          action: contextOrAction,
          details,
          status,
        };

  const { userId, action, resourceId, resourceType } = context;
  const audit = {
    timestamp: new Date().toISOString(),
    userId: sanitizeString(userId),
    action: sanitizeString(action),
    resourceId: sanitizeString(resourceId),
    resourceType: sanitizeString(resourceType),
    details: context.details || {},
    status: sanitizeString(context.status),
  };

  // In production, send to server audit log endpoint
  console.log("[AUDIT]", JSON.stringify(audit));
  return audit;
};
