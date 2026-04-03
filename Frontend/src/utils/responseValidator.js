/**
 * API RESPONSE VALIDATOR
 * Ensures data integrity and prevents crashes from malformed server responses
 * 
 * Enterprise Patterns:
 * - Strict response schema validation
 * - Fallback values for missing fields
 * - Type checking and coercion
 * - Nested object validation
 */

/**
 * Validate that a value is of expected type
 * @param {*} value - Value to check
 * @param {string|string[]} expectedType - Expected type(s)
 * @returns {boolean}
 */
const isType = (value, expectedType) => {
  const types = Array.isArray(expectedType) ? expectedType : [expectedType];
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  return types.includes(actualType);
};

/**
 * Get safe value with fallback
 * @param {*} value - Value to check
 * @param {*} fallback - Fallback value
 * @param {string} expectedType - Expected type
 * @returns {*} Value if correct type, otherwise fallback
 */
const getSafeValue = (value, fallback, expectedType) => {
  if (expectedType && !isType(value, expectedType)) {
    return fallback;
  }
  return value;
};

/**
 * Validate a single borrow record response
 * @param {Object} record - Record to validate
 * @returns {Object} Validated record with safe defaults
 */
export const validateBorrowRecordResponse = (record) => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  return {
    _id: getSafeValue(record._id, null, 'string') || getSafeValue(record.id, null, 'string'),
    bookId: getSafeValue(record.bookId, null, 'string') || getSafeValue(record.book_id, null, 'string'),
    bookTitle: getSafeValue(record.bookTitle, 'Untitled Book', 'string'),
    bookAuthor: getSafeValue(record.bookAuthor, 'Unknown Author', 'string'),      bookImage: record.bookImage || record.book?.image || null,    userId: getSafeValue(record.userId, null, 'string') || getSafeValue(record.user_id, null, 'string'),
    userName: getSafeValue(record.userName, 'Unknown User', 'string'),
    userEmail: getSafeValue(record.userEmail, null, 'string'),
    status: getSafeValue(record.status, 'unknown', 'string'),
    createdAt: validateDateField(record.createdAt) || validateDateField(record.requestDate) || validateDateField(record.borrowDate),
    dueDate: validateDateField(record.dueDate),
    returnDate: validateDateField(record.returnDate),
    borrowDate: validateDateField(record.borrowDate),
    requestDate: validateDateField(record.requestDate),
    remarks: getSafeValue(record.remarks, null, 'string'),
    overdueDays: getSafeValue(record.overdueDays, 0, 'number'),
  };
};

/**
 * Validate a date field and return as Date object or null
 * @param {*} dateValue - Value to validate
 * @returns {Date|null} Valid date or null
 */
const validateDateField = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue._seconds) return new Date(dateValue._seconds * 1000);

  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

/**
 * Validate an array of borrow records
 * @param {Array} records - Records to validate
 * @returns {Array} Validated records with nulls filtered out
 */
export const validateBorrowRecordsArray = (records) => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map(record => validateBorrowRecordResponse(record))
    .filter(record => record !== null && record._id);
};

/**
 * Validate a book response
 * @param {Object} book - Book to validate
 * @returns {Object} Validated book with safe defaults
 */
export const validateBookResponse = (book) => {
  if (!book || typeof book !== 'object') {
    return null;
  }

  return {
    _id: getSafeValue(book._id, null, 'string') || getSafeValue(book.id, null, 'string'),
    title: getSafeValue(book.title, 'Untitled Book', 'string'),
    author: getSafeValue(book.author, 'Unknown Author', 'string'),
    isbn: getSafeValue(book.isbn, null, 'string'),
    category: getSafeValue(book.category, 'General', 'string'),
    description: getSafeValue(book.description, '', 'string'),
    image: getSafeValue(book.image, null, 'object') || getSafeValue(book.imageUrl, null, 'string'),
    availableCopies: Math.max(0, getSafeValue(book.availableCopies, 0, 'number')),
    totalCopies: Math.max(1, getSafeValue(book.totalCopies, 1, 'number')),
    status: getSafeValue(book.status, 'unknown', 'string'),
  };
};

/**
 * Validate a user response
 * @param {Object} user - User to validate
 * @returns {Object} Validated user with safe defaults
 */
export const validateUserResponse = (user) => {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    _id: getSafeValue(user._id, null, 'string') || getSafeValue(user.id, null, 'string'),
    name: getSafeValue(user.name, 'Unknown User', 'string'),
    email: getSafeValue(user.email, null, 'string'),
    role: getSafeValue(user.role, 'User', 'string'),
    avatar: getSafeValue(user.avatar, null, 'string'),
    phone: getSafeValue(user.phone, null, 'string'),
    isActive: getSafeValue(user.isActive, true, 'boolean'),
    createdAt: validateDateField(user.createdAt),
  };
};

/**
 * Validate API list response wrapper
 * @param {Object} response - Response object
 * @param {string} dataPath - Path to data (e.g., 'data.borrowings')
 * @returns {Array} Validated array or empty array
 */
export const validateListResponse = (response, dataPath = 'data') => {
  if (!response) {
    return [];
  }

  // Navigate the data path
  let data = response;
  const pathSegments = dataPath.split('.');

  for (const segment of pathSegments) {
    data = data?.[segment];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
};

/**
 * Validate API success response wrapper
 * @param {Object} response - Response object
 * @param {string} dataPath - Path to data
 * @returns {Object} Validated data or null
 */
export const validateSuccessResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  return {
    success: getSafeValue(response.success, true, 'boolean'),
    message: getSafeValue(response.message, 'Operation successful', 'string'),
    data: response.data || null,
    timestamp: validateDateField(response.timestamp),
  };
};

/**
 * Validate error response wrapper
 * @param {Object} errorResponse - Error response object
 * @returns {Object} Validated error object
 */
export const validateErrorResponse = (errorResponse) => {
  if (!errorResponse || typeof errorResponse !== 'object') {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      status: 500
    };
  }

  return {
    code: getSafeValue(errorResponse.code || errorResponse.error, 'ERROR', 'string'),
    message: getSafeValue(errorResponse.message, 'An error occurred', 'string'),
    status: getSafeValue(errorResponse.status, 500, 'number'),
    details: getSafeValue(errorResponse.details, null, 'object'),
    timestamp: validateDateField(errorResponse.timestamp),
  };
};

/**
 * Validate pagination metadata
 * @param {Object} pagination - Pagination object
 * @returns {Object} Validated pagination
 */
export const validatePaginationResponse = (pagination) => {
  if (!pagination || typeof pagination !== 'object') {
    return {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    };
  }

  return {
    page: Math.max(1, getSafeValue(pagination.page, 1, 'number')),
    limit: Math.max(1, getSafeValue(pagination.limit, 10, 'number')),
    total: Math.max(0, getSafeValue(pagination.total, 0, 'number')),
    pages: Math.max(0, getSafeValue(pagination.pages, 0, 'number')),
  };
};

/**
 * Deep validate nested object structure
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Schema defining structure
 * @returns {Object} Validated object
 */
export const validateAgainstSchema = (obj, schema) => {
  if (!obj || typeof obj !== 'object' || !schema || typeof schema !== 'object') {
    return null;
  }

  const result = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    let { type, required = false, fallback = null, validator = null } = rules;

    // Type check
    if (value !== undefined && value !== null) {
      if (!isType(value, type)) {
        result[key] = fallback;
        continue;
      }

      // Custom validator
      if (validator && typeof validator === 'function') {
        result[key] = validator(value) ? value : fallback;
      } else {
        result[key] = value;
      }
    } else if (required) {
      result[key] = fallback;
    } else {
      result[key] = null;
    }
  }

  return result;
};

/**
 * Check if a response contains expected data structure
 * @param {Object} response - Response to check
 * @returns {boolean} True if response looks like it has valid data
 */
export const hasValidDataStructure = (response) => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Check common response patterns
  const hasData = response.data !== undefined;
  const hasSuccess = response.success !== undefined;
  const hasBorrowings = Array.isArray(response.borrowings);
  const hasBooks = Array.isArray(response.books);
  const hasUsers = Array.isArray(response.users);

  return hasData || hasSuccess || hasBorrowings || hasBooks || hasUsers;
};

export default {
  validateBorrowRecordResponse,
  validateBorrowRecordsArray,
  validateBookResponse,
  validateUserResponse,
  validateListResponse,
  validateSuccessResponse,
  validateErrorResponse,
  validatePaginationResponse,
  validateAgainstSchema,
  hasValidDataStructure,
};
