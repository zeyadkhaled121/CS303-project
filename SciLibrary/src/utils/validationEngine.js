
// USER & AUTHENTICATION VALIDATORS

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email?.trim()) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
};

export const validatePassword = (password, minLength = 8, maxLength = 16) => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }
  if (password.length > maxLength) {
    return { valid: false, error: `Password cannot exceed ${maxLength} characters` };
  }
  // Optional: Check for complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  // At least 3 of 4 complexity rules
  const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (complexityScore < 3) {
    return {
      valid: false,
      error: 'Password should contain uppercase, lowercase, numbers, and special characters',
      warning: true, 
    };
  }

  return { valid: true };
};

export const validatePasswordMatch = (password1, password2) => {
  if (!password1 || !password2) {
    return { valid: false, error: 'Both password fields are required' };
  }
  if (password1 !== password2) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
};

export const validateUsername = (username) => {
  if (!username?.trim()) return { valid: false, error: 'Username is required' };
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 50) {
    return { valid: false, error: 'Username cannot exceed 50 characters' };
  }
  if (!/^[a-zA-Z0-9_\s-]+$/.test(username)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, spaces, underscores, and hyphens',
    };
  }
  return { valid: true };
};

export const validatePhoneNumber = (phone) => {
  if (!phone?.trim()) return { valid: true };
  const phoneRegex = /^[0-9\+\-\s\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { valid: false, error: 'Phone number must contain at least 10 digits' };
  }
  return { valid: true };
};

export const validateOTP = (otp) => {
  if (!otp?.trim()) return { valid: false, error: 'OTP is required' };
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'OTP must be exactly 6 digits' };
  }
  return { valid: true };
};

// BOOK & CATALOG VALIDATORS

export const validateISBN = (isbn) => {
  if (!isbn?.trim()) return { valid: true }; 
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  // ISBN-10 or ISBN-13
  if (cleanISBN.length === 10) {
    if (!/^\d{9}[\dX]$/.test(cleanISBN)) {
      return { valid: false, error: 'Invalid ISBN-10 format' };
    }
  } else if (cleanISBN.length === 13) {
    if (!/^\d{13}$/.test(cleanISBN)) {
      return { valid: false, error: 'Invalid ISBN-13 format' };
    }
  } else {
    return { valid: false, error: 'ISBN must be 10 or 13 digits' };
  }

  return { valid: true };
};

export const validateBookTitle = (title) => {
  if (!title?.trim()) return { valid: false, error: 'Book title is required' };
  if (title.length < 2) return { valid: false, error: 'Title must be at least 2 characters' };
  if (title.length > 200) {
    return { valid: false, error: 'Title cannot exceed 200 characters' };
  }
  return { valid: true };
};

export const validateAuthorName = (author) => {
  if (!author?.trim()) return { valid: false, error: 'Author name is required' };
  if (author.length < 2) {
    return { valid: false, error: 'Author name must be at least 2 characters' };
  }
  if (author.length > 100) {
    return { valid: false, error: 'Author name cannot exceed 100 characters' };
  }
  return { valid: true };
};

export const validateCategory = (category) => {
  const validCategories = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'History',
    'Technology',
    'Business',
    'Biography',
    'Children',
    'Education',
    'Other',
  ];

  if (!category) return { valid: false, error: 'Category is required' };
  if (!validCategories.includes(category)) {
    return {
      valid: false,
      error: `Category must be one of: ${validCategories.join(', ')}`,
    };
  }
  return { valid: true };
};

export const validateQuantity = (quantity) => {
  const num = parseInt(quantity, 10);
  if (isNaN(num)) return { valid: false, error: 'Quantity must be a number' };
  if (num < 1) return { valid: false, error: 'Quantity must be at least 1' };
  if (num > 1000) return { valid: false, error: 'Quantity cannot exceed 1000' };
  return { valid: true };
};

export const validateBookData = (bookData) => {
  const errors = [];

  const titleValidation = validateBookTitle(bookData.title);
  if (!titleValidation.valid) errors.push(titleValidation.error);

  const authorValidation = validateAuthorName(bookData.author);
  if (!authorValidation.valid) errors.push(authorValidation.error);

  const categoryValidation = validateCategory(bookData.category);
  if (!categoryValidation.valid) errors.push(categoryValidation.error);

  const quantityValidation = validateQuantity(bookData.quantity);
  if (!quantityValidation.valid) errors.push(quantityValidation.error);

  const isbnValidation = validateISBN(bookData.isbn);
  if (!isbnValidation.valid) errors.push(isbnValidation.error);

  return {
    valid: errors.length === 0,
    errors,
  };
};

// BORROW REQUEST VALIDATORS

export const validateBorrowDuration = (days = 0, hours = 0, minutes = 0) => {
  const daysNum = parseInt(days, 10) || 0;
  const hoursNum = parseInt(hours, 10) || 0;
  const minutesNum = parseInt(minutes, 10) || 0;

  const totalMinutes = daysNum * 24 * 60 + hoursNum * 60 + minutesNum;
  const maxMinutes = 60 * 24 * 60; // 60 days

  if (totalMinutes === 0) {
    return { valid: false, error: 'Duration must be at least 1 minute' };
  }

  if (totalMinutes > maxMinutes) {
    return { valid: false, error: 'Maximum loan period is 60 days' };
  }

  return { valid: true };
};

export const validateDueDate = (dueDate) => {
  if (!dueDate) return { valid: false, error: 'Due date is required' };

  const due = new Date(dueDate);
  const now = new Date();

  if (isNaN(due.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (due <= now) {
    return {
      valid: false,
      error: 'Due date must be in the future',
      fatalError: true,
    };
  }

  // Max 60 days from now
  const maxDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  if (due > maxDate) {
    return { valid: false, error: 'Due date cannot exceed 60 days from now' };
  }

  return { valid: true };
};

export const validateBorrowRemarks = (remarks, maxLength = 500) => {
  if (!remarks?.trim()) {
    return { valid: false, error: 'Remarks are required' };
  }

  if (remarks.length > maxLength) {
    return { valid: false, error: `Remarks cannot exceed ${maxLength} characters` };
  }

  return { valid: true };
};

export const validateIssueType = (issueType) => {
  const validTypes = ['Lost', 'Damaged'];

  if (!issueType) return { valid: false, error: 'Issue type is required' };
  if (!validTypes.includes(issueType)) {
    return { valid: false, error: `Issue type must be one of: ${validTypes.join(', ')}` };
  }

  return { valid: true };
};

// FORM FIELD VALIDATORS

export const validateTextInput = (value, fieldName, minLength = 1, maxLength = 255) => {
  if (!value?.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${maxLength} characters`,
    };
  }

  return { valid: true };
};

export const validateNumberInput = (value, fieldName, min = 0, max = Infinity) => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { valid: true };
};

export const validateDateInput = (value, fieldName) => {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  return { valid: true };
};

export const validateSelectInput = (value, fieldName, allowedValues = []) => {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (allowedValues.length > 0 && !allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { valid: true };
};

// COMPOUND VALIDATORS

export const validateLoginForm = (email, password) => {
  const errors = [];

  const emailVal = validateEmail(email);
  if (!emailVal.valid) errors.push(emailVal.error);

  const passwordVal = validatePassword(password);
  if (!passwordVal.valid) errors.push(passwordVal.error);

  return { valid: errors.length === 0, errors };
};

export const validateSignupForm = (email, password, confirmPassword, username) => {
  const errors = [];

  const emailVal = validateEmail(email);
  if (!emailVal.valid) errors.push(emailVal.error);

  const usernameVal = validateUsername(username);
  if (!usernameVal.valid) errors.push(usernameVal.error);

  const passwordVal = validatePassword(password);
  if (!passwordVal.valid) errors.push(passwordVal.error);

  const matchVal = validatePasswordMatch(password, confirmPassword);
  if (!matchVal.valid) errors.push(matchVal.error);

  return { valid: errors.length === 0, errors };
};

export const validatePasswordChangeForm = (oldPassword, newPassword, confirmPassword) => {
  const errors = [];

  if (!oldPassword?.trim()) errors.push('Current password is required');
  if (!newPassword?.trim()) errors.push('New password is required');
  if (!confirmPassword?.trim()) errors.push('Confirm password is required');

  if (newPassword && oldPassword && newPassword === oldPassword) {
    errors.push('New password must be different from current password');
  }

  const passwordVal = validatePassword(newPassword);
  if (newPassword && !passwordVal.valid) errors.push(passwordVal.error);

  const matchVal = validatePasswordMatch(newPassword, confirmPassword);
  if (newPassword && confirmPassword && !matchVal.valid) {
    errors.push(matchVal.error);
  }

  return { valid: errors.length === 0, errors };
};

// BULK VALIDATORS

export const validateAll = (validations) => {
  const errors = [];
  const results = {};

  for (const [key, validation] of Object.entries(validations)) {
    if (!validation.valid) {
      errors.push(validation.error);
      results[key] = validation;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    results,
  };
};

// ERROR NORMALIZATION

export const normalizeValidationError = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;

  // Handle API error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle validation error object
  if (error.error) return error.error;

  // Handle string error
  if (typeof error === 'string') return error;

  // Handle generic error
  return error.message || defaultMessage;
};

export const getFirstError = (validationResult) => {
  if (validationResult?.errors && Array.isArray(validationResult.errors)) {
    return validationResult.errors[0] || 'Validation failed';
  }
  return 'Validation failed';
};

export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return [];
  return errors.filter((e) => e && typeof e === 'string');
};
