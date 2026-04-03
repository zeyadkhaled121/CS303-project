/**
 * Data shape adapter for mixed backend payload formats.
 */

/**
 * Safely extract value from object, trying multiple keys
 * @param {Object} obj - Object to extract from
 * @param {string[]} keys - Keys to try in order
 * @param {*} fallback - Fallback value if not found
 * @returns {*} Found value or fallback
 */
const safeExtract = (obj, keys, fallback = null) => {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }

  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return fallback;
};

const safeString = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback;
  }
  try {
    return String(value).trim() || fallback;
  } catch {
    return fallback;
  }
};

const safeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const safeDate = (value) => {
  if (!value) {
    return null;
  }
  if (value && value._seconds) {
    return new Date(value._seconds * 1000);
  }
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Extract book ID from any book structure
 * Supports: book._id, book.id, bookId, book_id strings
 */
const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return undefined;
};

export const extractBookId = (book) => {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    return undefined;
  }

  return firstNonEmpty(
    book.bookId,
    book.book_id,
    book._id,
    book.id,
    book.book?.bookId,
    book.book?.book_id,
    book.book?._id,
    book.book?.id
  );
};

/**
 * Extract book title from any book structure
 */
export const extractBookTitle = (book) => {
  if (!book || typeof book !== 'object') return 'Unknown Title';

  return (
    firstNonEmpty(
      book.book_title,
      book.bookTitle,
      book.title,
      book.name,
      book.book?.book_title,
      book.book?.bookTitle,
      book.book?.title,
      book.book?.name
    ) || 'Unknown Title'
  );
};

/**
 * Extract book image from any book structure
 */
export const extractBookImage = (book) => {
  const imageObj = safeExtract(book, ['image', 'bookImage'], null);
  if (imageObj && typeof imageObj === 'object') {
    return safeString(safeExtract(imageObj, ['url', 'uri', 'secure_url'], null), null);
  }
  return safeString(safeExtract(book, ['imageUrl', 'image_url', 'coverImage', 'bookImage'], null), null);
};

/**
 * Extract book availability from any book structure
 * Returns: true if available (copies > 0), false otherwise
 */
export const isBookAvailable = (book) => {
  if (!book || typeof book !== 'object') {
    return false;
  }

  // Try to get available copies
  let copies = safeExtract(book, ['availableCopies', 'available_copies', 'copiesAvailable'], null);
  
  if (copies !== null) {
    const numCopies = safeNumber(copies, -1);
    if (numCopies >= 0) {
      return numCopies > 0;
    }
  }

  // Fallback to status check
  const status = safeString(safeExtract(book, ['status'], ''), '').toLowerCase();
  return status === 'available';
};

/**
 * Extract user ID from any user/borrower structure
 * Supports: user._id, user.id, userId, user_id strings
 */
export const extractUserId = (user) => {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return undefined;
  }

  return firstNonEmpty(
    user.userId,
    user.user_id,
    user._id,
    user.id,
    user.user?.userId,
    user.user?.user_id,
    user.user?._id,
    user.user?.id
  );
};

/**
 * Extract user name from any user structure
 */
export const extractUserName = (user) => {
  if (!user || typeof user !== 'object') return 'Unknown';

  return (
    firstNonEmpty(
      user.name,
      user.userName,
      user.username,
      user.fullName,
      user.full_name,
      user.user_name,
      user.user?.name,
      user.user?.userName,
      user.user?.username
    ) || 'Unknown'
  );
};

/**
 * Extract user role from any user structure
 */
export const extractUserRole = (user) => {
  return safeString(
    safeExtract(user, ['role', 'userRole', 'user_role'], null),
    'User'
  );
};

/**
 * Normalize a borrow record to standard internal format
 * Converts any payload shape to our canonical structure
 * With comprehensive data corruption guardrails
 */
export const normalizeBorrowRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return {};
  }

  try {
    // Extract nested objects safely
    const bookData = safeExtract(record, ['book', 'bookData', 'bookInfo'], {});
    const userData = safeExtract(record, ['user', 'userData', 'userInfo', 'borrower'], {});

    const borrowId = firstNonEmpty(
      record.borrowId,
      record.borrow_id,
      record._id,
      record.id
    );

    const userName = extractUserName(userData);
    const normalized = {
      borrowId,
      _id: borrowId,
      bookId: firstNonEmpty(extractBookId(record), extractBookId(bookData)) || null,
      bookTitle: extractBookTitle(bookData) !== 'Unknown Title' ? extractBookTitle(bookData) : extractBookTitle(record),
      bookImage: extractBookImage(bookData) || extractBookImage(record),
      bookAuthor: safeString(safeExtract(bookData, ['author', 'writer'], null) || safeExtract(record, ['bookAuthor', 'author'], null), 'Unknown Author'),
      userId: firstNonEmpty(extractUserId(record), extractUserId(userData)) || null,
      userName: userName !== 'Unknown' ? userName : extractUserName(record),
      userRole: extractUserRole(userData),
      userEmail: safeString(safeExtract(userData, ['email', 'userEmail', 'emailAddress'], null) || safeExtract(record, ['userEmail'], null), null),
      status: safeString(safeExtract(record, ['status', 'borrowStatus', 'borrow_status', 'state'], null), 'unknown'),
      createdAt: safeDate(safeExtract(record, ['createdAt', 'created_at', 'borrowDate', 'requestDate'], null)),
      dueDate: safeDate(safeExtract(record, ['dueDate', 'due_date', 'returnDueDate'], null)),
      returnDate: safeDate(safeExtract(record, ['returnDate', 'return_date', 'returnedAt'], null)),
      remarks: safeString(safeExtract(record, ['remarks', 'notes', 'reason'], null), null),
      overdueDays: safeNumber(safeExtract(record, ['overdueDays', 'daysOverdue'], null), 0),
    };

    return normalized;
  } catch (error) {
    console.error('[Data Corruption Guard] Error normalizing borrow record:', error, record);
    return {};
  }
};

/**
 * Check if a borrow record is in an "active" state (not yet returned)
 */
export const isBorrowActive = (record) => {
  const status = (record?.status || '').toLowerCase();
  return status === 'active' || status === 'borrowed' || status === 'overdue' || status === 'pending';
};

/**
 * Check if a borrow record is pending approval
 */
export const isBorrowPending = (record) => {
  return (record?.status || "").toLowerCase() === "pending";
};

/**
 * Check if a borrow record is currently borrowed (approved but not returned)
 */
export const isBorrowBorrowedOrOverdue = (record) => {
  const status = (record?.status || '').toLowerCase();
  return status === 'active' || status === 'borrowed' || status === 'overdue';
};

/**
 * Check if a borrow record indicates the book is returned
 */
export const isBorrowReturned = (record) => {
  const status = (record?.status || '').toLowerCase();
  return status === 'returned' || Boolean(record?.returnDate);
};

/**
 * Compare two borrow records for deep equality
 * Useful for detecting if refresh actually changed data
 */
export const areBorrowRecordsEqual = (rec1, rec2) => {
  if (!rec1 || !rec2) return rec1 === rec2;
  const norm1 = normalizeBorrowRecord(rec1);
  const norm2 = normalizeBorrowRecord(rec2);
  return JSON.stringify(norm1) === JSON.stringify(norm2);
};

/**
 * Validate that a borrow record has all critical fields
 * Returns { isValid, errors: [] }
 */
export const validateBorrowRecord = (record) => {
  const errors = [];
  if (!record._id) errors.push("Missing borrow record ID");
  if (!record.bookId) errors.push("Missing book ID");
  if (!record.userId) errors.push("Missing user ID");
  if (!record.status) errors.push("Missing borrow status");
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
