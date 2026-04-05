

export const safeExtractBookTitle = (loan) => {
  if (!loan) return 'Unknown Book';
  return (
    loan?.book?.title ||
    loan?.bookData?.title ||
    loan?.book_title ||
    loan?.bookTitle ||
    'Unknown Book'
  );
};

export const safeExtractBorrowerName = (loan) => {
  if (!loan) return 'Unknown User';
  return (
    loan?.user?.name ||
    loan?.userData?.name ||
    loan?.user_name ||
    loan?.userName ||
    'Unknown User'
  );
};

export const safeExtractBorrowerEmail = (loan) => {
  if (!loan) return '';
  return (
    loan?.user?.email ||
    loan?.userData?.email ||
    loan?.user_email ||
    loan?.userEmail ||
    ''
  );
};

export const safeExtractLoanId = (loan) => {
  if (!loan) return null;
  return loan?._id || loan?.id || null;
};

export const safeExtractBookId = (loan) => {
  if (!loan) return null;
  return (
    loan?.book?._id ||
    loan?.book?.id ||
    loan?.bookId ||
    loan?.book_id ||
    null
  );
};

export const safeExtractUserId = (loan) => {
  if (!loan) return null;
  return (
    loan?.user?._id ||
    loan?.user?.id ||
    loan?.userId ||
    loan?.user_id ||
    null
  );
};


export const safeExtractDate = (dateValue) => {
  if (!dateValue || dateValue === 'Invalid Date') return null;

  let parsedDate = null;

  // If it's already a Date object
  if (dateValue instanceof Date) {
    parsedDate = dateValue;
  }
  // If it's a Firestore timestamp object { _seconds: number }
  else if (typeof dateValue === 'object' && dateValue._seconds) {
    parsedDate = new Date(dateValue._seconds * 1000);
  }
  // If it's an ISO string or Unix timestamp number
  else if (typeof dateValue === 'number') {
    parsedDate = new Date(dateValue * 1000);
  }
  else if (typeof dateValue === 'string') {
    parsedDate = new Date(dateValue);
  }

  if (parsedDate && !isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  
  return null;
};


export const calculateDaysOverdue = (dueDate) => {
  const due = safeExtractDate(dueDate);
  if (!due) return 0;

  const now = new Date();
  const diffMs = now - due;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};


export const calculateDaysUntilDue = (dueDate) => {
  const due = safeExtractDate(dueDate);
  if (!due) return 0;

  const now = new Date();
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};


export const formatDateDisplay = (dateValue) => {
  const date = safeExtractDate(dateValue);
  if (!date) return 'N/A';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


export const formatDateTimeDisplay = (dateValue) => {
  const date = safeExtractDate(dateValue);
  if (!date) return 'N/A';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Convert duration (days/hours/minutes) to ISO datetime string
 
export const durationToDateTime = (days = 0, hours = 0, minutes = 0) => {
  const now = new Date();
  const ms = (days * 24 * 60 + hours * 60 + minutes) * 60 * 1000;
  const dueDate = new Date(now.getTime() + ms);
  return dueDate.toISOString();
};

// Validate borrow data before API call
 
export const validateBorrowData = (loan) => {
  const errors = [];

  if (!safeExtractLoanId(loan)) {
    errors.push('Invalid loan ID');
  }

  if (!safeExtractBookId(loan)) {
    errors.push('Invalid book ID');
  }

  if (!safeExtractUserId(loan)) {
    errors.push('Invalid user ID');
  }

  return { isValid: errors.length === 0, errors };
};

// Format loan status for UI display
 
export const formatLoanStatus = (status) => {
  if (!status) return 'Unknown';

  const statusMap = {
    pending: 'Pending Approval',
    approved: 'Approved',
    borrowed: 'Borrowed',
    returned: 'Returned',
    overdue: 'Overdue',
    lost: 'Lost',
    damaged: 'Damaged',
    rejected: 'Rejected',
  };

  return statusMap[status?.toLowerCase()] || status;
};

// Get status color for badge display

export const getStatusColor = (status) => {
  if (!status) return '#6B7280';

  const colorMap = {
    pending: '#F59E0B',
    approved: '#3B82F6',
    borrowed: '#10B981',
    returned: '#8B5CF6',
    overdue: '#EF4444',
    lost: '#DC2626',
    damaged: '#F97316',
    rejected: '#6B7280',
  };

  return colorMap[status?.toLowerCase()] || '#6B7280';
};
