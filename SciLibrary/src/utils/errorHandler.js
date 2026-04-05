

import Toast from 'react-native-toast-message';


// ERROR TYPES & CODES


export const ERROR_TYPES = {
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',

  // Authentication Errors
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NO_INTERNET: 'NO_INTERNET',
  REQUEST_FAILED: 'REQUEST_FAILED',

  // Server Errors
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // Business Logic Errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  OPERATION_FAILED: 'OPERATION_FAILED',
  INVALID_STATE: 'INVALID_STATE',

  // Data Errors
  INVALID_DATA: 'INVALID_DATA',
  DATA_MISMATCH: 'DATA_MISMATCH',
  PARSING_ERROR: 'PARSING_ERROR',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};


// ERROR CLASSIFICATION


export const classifyError = (error) => {
  // Network errors
  if (!error.response) {
    if (error.message === 'Network Error') {
      return ERROR_TYPES.NO_INTERNET;
    }
    if (error.code === 'ECONNABORTED') {
      return ERROR_TYPES.TIMEOUT;
    }
    return ERROR_TYPES.NETWORK_ERROR;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message?.toLowerCase() || '';

  // Authentication errors
  if (status === 401) {
    if (message.includes('expired') || message.includes('token')) {
      return ERROR_TYPES.SESSION_EXPIRED;
    }
    return ERROR_TYPES.UNAUTHORIZED;
  }

  if (status === 403) {
    return ERROR_TYPES.INSUFFICIENT_PERMISSIONS;
  }

  // Not found
  if (status === 404) {
    return ERROR_TYPES.NOT_FOUND;
  }

  // Conflict
  if (status === 409) {
    return ERROR_TYPES.CONFLICT;
  }

  // Rate limiting
  if (status === 429) {
    return ERROR_TYPES.RATE_LIMITED;
  }

  // Validation errors
  if (status === 400) {
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_TYPES.VALIDATION_ERROR;
    }
    return ERROR_TYPES.INVALID_DATA;
  }

  // Server errors
  if (status >= 500) {
    return ERROR_TYPES.SERVER_ERROR;
  }

  return ERROR_TYPES.UNKNOWN_ERROR;
};

// ERROR MESSAGE EXTRACTION

export const extractErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  // API response message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Custom error message
  if (error?.message) {
    return error.message;
  }

  // Validation errors array
  if (Array.isArray(error?.errors)) {
    return error.errors[0] || defaultMessage;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

export const getErrorDetails = (error) => {
  const type = classifyError(error);
  const message = extractErrorMessage(error);
  const status = error?.response?.status;
  const data = error?.response?.data;

  return {
    type,
    message,
    status,
    data,
    originalError: error,
  };
};

// USER-FRIENDLY ERROR MESSAGES

export const getUserFriendlyMessage = (errorType, originalMessage = '') => {
  const userMessages = {
    [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again',
    [ERROR_TYPES.INVALID_EMAIL]: 'Please enter a valid email address',
    [ERROR_TYPES.INVALID_PASSWORD]: 'Password must be 8-16 characters',
    [ERROR_TYPES.PASSWORD_MISMATCH]: 'Passwords do not match',
    [ERROR_TYPES.AUTH_FAILED]: 'Authentication failed. Please try again',
    [ERROR_TYPES.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ERROR_TYPES.SESSION_EXPIRED]: 'Your session has expired. Please login again',
    [ERROR_TYPES.UNAUTHORIZED]: 'You do not have permission to perform this action',
    [ERROR_TYPES.TOKEN_INVALID]: 'Authentication failed. Please login again',
    [ERROR_TYPES.NO_INTERNET]: 'No internet connection. Please check your network',
    [ERROR_TYPES.TIMEOUT]: 'Request timed out. Please try again',
    [ERROR_TYPES.NETWORK_ERROR]: 'Network error. Please check your connection',
    [ERROR_TYPES.REQUEST_FAILED]: 'Request failed. Please try again',
    [ERROR_TYPES.SERVER_ERROR]: 'Server error. Please try again later',
    [ERROR_TYPES.NOT_FOUND]: 'Resource not found',
    [ERROR_TYPES.CONFLICT]: 'This resource already exists',
    [ERROR_TYPES.RATE_LIMITED]: 'Too many requests. Please try again later',
    [ERROR_TYPES.INSUFFICIENT_PERMISSIONS]: 'You do not have permission for this action',
    [ERROR_TYPES.RESOURCE_NOT_FOUND]: 'Resource not found',
    [ERROR_TYPES.OPERATION_FAILED]: 'Operation failed. Please try again',
    [ERROR_TYPES.INVALID_STATE]: 'Invalid state. Please refresh and try again',
    [ERROR_TYPES.INVALID_DATA]: 'Invalid data. Please check your input',
    [ERROR_TYPES.DATA_MISMATCH]: 'Data mismatch. Please refresh and try again',
    [ERROR_TYPES.PARSING_ERROR]: 'Error processing data. Please try again',
    [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred',
  };

  return userMessages[errorType] || originalMessage || userMessages[ERROR_TYPES.UNKNOWN_ERROR];
};

// ERROR HANDLING FUNCTIONS

export const handleError = (error, context = 'Operation') => {
  const details = getErrorDetails(error);
  const userMessage = getUserFriendlyMessage(details.type, details.message);

  console.error(`[${context}] Error:`, {
    type: details.type,
    status: details.status,
    message: details.message,
    originalError: error,
  });

  return {
    type: details.type,
    message: userMessage,
    originalMessage: details.message,
    status: details.status,
  };
};

export const handleValidationErrors = (errors) => {
  const formattedErrors = Array.isArray(errors)
    ? errors.filter((e) => e && typeof e === 'string')
    : [String(errors)];

  return {
    type: ERROR_TYPES.VALIDATION_ERROR,
    errors: formattedErrors,
    message: formattedErrors[0] || 'Validation failed',
  };
};

// TOAST NOTIFICATIONS

export const showErrorToast = (error, context = 'Error') => {
  const handled = handleError(error, context);

  Toast.show({
    type: 'error',
    text1: context,
    text2: handled.message,
    duration: 4000,
  });

  return handled;
};

export const showSuccessToast = (message, duration = 3000) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    duration,
  });
};

export const showWarningToast = (message, duration = 3000) => {
  Toast.show({
    type: 'error',
    text1: 'Warning',
    text2: message,
    duration,
  });
};

export const showInfoToast = (message, duration = 3000) => {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    duration,
  });
};

// RETRY LOGIC

export const retryableOperation = async (
  operation,
  maxRetries = 3,
  delayMs = 1000,
  context = 'Operation'
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry for validation or permission errors
      const errorType = classifyError(error);
      if (
        [
          ERROR_TYPES.VALIDATION_ERROR,
          ERROR_TYPES.UNAUTHORIZED,
          ERROR_TYPES.INSUFFICIENT_PERMISSIONS,
          ERROR_TYPES.NOT_FOUND,
          ERROR_TYPES.INVALID_DATA,
        ].includes(errorType)
      ) {
        throw error;
      }

      // Don't retry last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.log(`[${context}] Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// ERROR RECOVERY

export const shouldRetryError = (error) => {
  const type = classifyError(error);
  const retriableTypes = [
    ERROR_TYPES.TIMEOUT,
    ERROR_TYPES.NETWORK_ERROR,
    ERROR_TYPES.SERVER_ERROR,
    ERROR_TYPES.RATE_LIMITED,
  ];

  return retriableTypes.includes(type);
};

export const shouldClearSession = (error) => {
  const type = classifyError(error);
  const sessionClearingTypes = [ERROR_TYPES.SESSION_EXPIRED, ERROR_TYPES.UNAUTHORIZED];

  return sessionClearingTypes.includes(type);
};

export const isFatalError = (error) => {
  const type = classifyError(error);
  const fatalTypes = [ERROR_TYPES.INSUFFICIENT_PERMISSIONS];

  return fatalTypes.includes(type);
};

// FORM ERROR HANDLING

export const handleFormValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) {
    return [];
  }

  return errors.map((error) => ({
    message: error,
    type: 'error',
  }));
};

export const mapFieldErrors = (apiErrorData) => {
  const fieldErrors = {};

  if (apiErrorData?.errors) {
    Object.entries(apiErrorData.errors).forEach(([field, message]) => {
      fieldErrors[field] = message;
    });
  }

  return fieldErrors;
};

// ERROR LOGGING & MONITORING

export const logError = (error, context = 'Unknown') => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    type: classifyError(error),
    message: extractErrorMessage(error),
    status: error?.response?.status,
    url: error?.response?.config?.url,
    method: error?.response?.config?.method,
  };

  console.error('[ERROR LOG]', errorLog);

  
};

export const createErrorReport = (error, context = 'Unknown') => {
  return {
    timestamp: new Date().toISOString(),
    context,
    errorType: classifyError(error),
    message: extractErrorMessage(error),
    status: error?.response?.status,
    url: error?.response?.config?.url,
    method: error?.response?.config?.method,
    stack: error?.stack,
  };
};

// CUSTOM ERROR CLASS

export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, ERROR_TYPES.VALIDATION_ERROR, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, ERROR_TYPES.AUTH_FAILED, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ERROR_TYPES.INSUFFICIENT_PERMISSIONS, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, ERROR_TYPES.NOT_FOUND, 404);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred') {
    super(message, ERROR_TYPES.NETWORK_ERROR, 0);
  }
}
