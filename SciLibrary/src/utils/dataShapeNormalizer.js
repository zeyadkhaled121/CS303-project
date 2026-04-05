import { formatDateDisplay, safeExtractDate } from './borrowUtils';

export const normalizeBook = (raw = {}) => {
  const id = raw._id || raw.id || null;
  const title = raw.title || 'Untitled';
  const author = raw.author || 'Unknown Author';
  const genre = raw.genre || raw.category || 'Uncategorized';
  const totalCopies = Number.isFinite(Number(raw.totalCopies))
    ? Number(raw.totalCopies)
    : Number.isFinite(Number(raw.quantity))
      ? Number(raw.quantity)
      : 0;

  const availableCopies = Number.isFinite(Number(raw.availableCopies))
    ? Number(raw.availableCopies)
    : Number.isFinite(Number(raw.quantity))
      ? Number(raw.quantity)
      : totalCopies;

  const imageUrl = raw.image?.url || raw.imageUrl || raw.image || null;
  const status = raw.status || (availableCopies > 0 ? 'Available' : 'Unavailable');

  return {
    ...raw,
    _id: id,
    id,
    title,
    author,
    genre,
    imageUrl,
    totalCopies,
    availableCopies,
    status,
    isAvailable: availableCopies > 0,
  };
};

export const normalizeBorrowRecord = (raw = {}) => {
  const id = raw._id || raw.id || null;

  const bookId =
    raw.book_id ||
    raw.bookId?._id ||
    raw.bookId?.id ||
    raw.bookId ||
    raw.book?.id ||
    raw.book?._id ||
    null;

  const bookTitle =
    raw.bookTitle ||
    raw.book_title ||
    raw.bookId?.title ||
    raw.book?.title ||
    'Unknown Title';

  const bookAuthor =
    raw.bookAuthor ||
    raw.book_author ||
    raw.bookId?.author ||
    raw.book?.author ||
    'Unknown Author';

  const bookImage =
    raw.bookImage?.url ||
    raw.bookImage ||
    raw.book?.image?.url ||
    raw.bookId?.image?.url ||
    null;

  const userId = raw.user_id || raw.userId || raw.user?._id || raw.user?.id || null;
  const status = raw.status || 'Pending';
  const requestDate = raw.requestDate || raw.createdAt || null;
  const dueDate = raw.dueDate || raw.due_date || null;
  const returnDate = raw.returnDate || raw.return_date || null;

  return {
    ...raw,
    _id: id,
    id,
    bookId,
    bookTitle,
    bookAuthor,
    bookImage,
    userId,
    status,
    requestDate,
    dueDate,
    returnDate,
  };
};

export const isBorrowPending = (record) => (record?.status || '').toLowerCase() === 'pending';

export const isBorrowActive = (record) => {
  const s = (record?.status || '').toLowerCase();
  return s === 'borrowed' || s === 'overdue' || s === 'active';
};

export const isBorrowReturned = (record) => (record?.status || '').toLowerCase() === 'returned';

export const isBorrowCancelled = (record) => (record?.status || '').toLowerCase() === 'cancelled';

export const formatDate = (value) => {
  return formatDateDisplay(value);
};

export const isOverdue = (dueDate) => {
  const date = safeExtractDate(dueDate);
  if (!date) return false;

  return date < new Date();
};
