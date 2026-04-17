

/**
 * Convert Firestore timestamp to JavaScript Date
 * @param {object|string|number} firebaseTimestamp - Firestore timestamp or ISO string
 * @returns {Date} JavaScript Date object
 */
const convertFirebaseTimestamp = (firebaseTimestamp) => {
  if (!firebaseTimestamp) return new Date();

  // If it's already a Date, return it
  if (firebaseTimestamp instanceof Date) {
    return firebaseTimestamp;
  }

  // If it's a Firestore timestamp object with _seconds
  if (firebaseTimestamp._seconds !== undefined) {
    return new Date(firebaseTimestamp._seconds * 1000);
  }

  // If it's an ISO string
  if (typeof firebaseTimestamp === 'string') {
    return new Date(firebaseTimestamp);
  }

  // If it's a millisecond timestamp
  if (typeof firebaseTimestamp === 'number') {
    return firebaseTimestamp > 10000000000 
      ? new Date(firebaseTimestamp) 
      : new Date(firebaseTimestamp * 1000);
  }

  return new Date();
};

/**
 * Normalize a single notification object
 * @param {object} notification - Raw notification from API
 * @returns {object} Normalized notification
 */
export const normalizeNotification = (notification) => {
  if (!notification) return null;

  return {
    _id: notification._id || notification.id,
    id: notification._id || notification.id,
    message: notification.message || '',
    type: notification.type || 'INFO',
    severity: notification.severity || 'info',
    read: notification.read === true,
    readAt: notification.readAt ? convertFirebaseTimestamp(notification.readAt) : null,
    timestamp: convertFirebaseTimestamp(notification.createdAt),
    createdAt: convertFirebaseTimestamp(notification.createdAt),
    actionUrl: notification.actionUrl || null,
    title: notification.title || 'Notification',
    metadata: notification.metadata || {},
    borrowId: notification.metadata?.borrowId,
    bookId: notification.metadata?.bookId,
    userId: notification.userId,
  };
};

/**
 * Normalize array of notifications
 * @param {array} notifications - Array of raw notifications
 * @returns {array} Array of normalized notifications
 */
export const normalizeNotifications = (notifications = []) => {
  if (!Array.isArray(notifications)) {
    console.warn('[Normalizer] Expected array, received:', typeof notifications);
    return [];
  }

  return notifications
    .map(normalizeNotification)
    .filter(n => n !== null)
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first
};

/**
 * Map notification actionUrl to navigation route
 * @param {string} actionUrl - URL path from notification
 * @returns {object} Navigation route object
 */
export const mapNotificationUrlToRoute = (actionUrl) => {
  if (!actionUrl) return null;

  // Map patterns: /borrow/all → { screen: 'MyBorrowedBooks', params: {} }
  const patterns = {
    '/borrow': { screen: 'MyBorrowedBooks', params: {} },
    '/borrow/all': { screen: 'MyBorrowedBooks', params: { tab: 'all' } },
    '/borrow/borrowed': { screen: 'MyBorrowedBooks', params: { tab: 'borrowed' } },
    '/borrow/pending': { screen: 'MyBorrowedBooks', params: { tab: 'pending' } },
    '/borrow/returned': { screen: 'MyBorrowedBooks', params: { tab: 'returned' } },
    '/catalog': { screen: 'Catalog', params: {} },
    '/books': { screen: 'Books', params: {} },// Admin matches 'Books' tab
    '/admin/requests': { screen: 'Requests', params: {} },
    '/admin/borrowLogistics': { screen: 'Requests', params: {} },
    '/admin/dashboard': { screen: 'Books', params: {} },
    '/admin/stats': { screen: 'Stats', params: {} },
    '/profile': { screen: 'Profile', params: {} },
    '/settings': { screen: 'Settings', params: {} },
  };

  // Check for exact match first
  if (patterns[actionUrl]) {
    return patterns[actionUrl];
  }

  // Check for partial match
  for (const [path, route] of Object.entries(patterns)) {
    if (actionUrl.startsWith(path)) {
      return route;
    }
  }

  // Default fallback
  console.warn('[Notifications] Unknown actionUrl:', actionUrl);
  return null;
};

/**
 * Format timestamp for display
 * @param {Date} timestamp - JavaScript Date object
 * @returns {string} Formatted time string (e.g., "2 hours ago", "Yesterday")
 */
export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  // For older notifications, show date string
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? '2-digit' : undefined,
  });
};

/**
 * Get color for notification type
 * @param {string} type - Notification type
 * @returns {string} Color hex code
 */
export const getNotificationColor = (type, severity = 'info') => {
  const typeColors = {
    BORROW_APPROVED: '#4CAF50', 
    BORROW_REJECTED: '#F44336', 
    BORROW_OVERDUE: '#FF9800', 
    BORROW_REMINDER: '#2196F3',
    BOOK_RETURNED: '#4CAF50', 
    ISSUE_REPORTED: '#FF5722', 
    BOOK_AVAILABLE: '#2196F3', 
    USER_PROMOTED: '#9C27B0', 
    INFO: '#2196F3', 
    SUCCESS: '#4CAF50', 
    WARNING: '#FF9800', 
    ERROR: '#F44336', 
  };

  return typeColors[type] || typeColors[severity] || typeColors.INFO;
};

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon name for react-native-vector-icons
 */
export const getNotificationIcon = (type) => {
  const typeIcons = {
    BORROW_APPROVED: 'check-circle',
    BORROW_REJECTED: 'x-circle',
    BORROW_OVERDUE: 'alert-circle',
    BORROW_REMINDER: 'clock',
    BOOK_RETURNED: 'check',
    ISSUE_REPORTED: 'alert-triangle',
    BOOK_AVAILABLE: 'book',
    USER_PROMOTED: 'star',
    INFO: 'info',
    SUCCESS: 'check',
    WARNING: 'alert-circle',
    ERROR: 'x',
  };

  return typeIcons[type] || 'bell';
};

/**
 * Get display text for notification type
 * @param {string} type - Notification type
 * @returns {string} Display label
 */
export const getNotificationTypeLabel = (type) => {
  const labels = {
    BORROW_APPROVED: 'Borrow Approved',
    BORROW_REJECTED: 'Borrow Rejected',
    BORROW_OVERDUE: 'Book Overdue',
    BORROW_REMINDER: 'Borrow Reminder',
    BOOK_RETURNED: 'Book Returned',
    ISSUE_REPORTED: 'Issue Reported',
    BOOK_AVAILABLE: 'Book Available',
    USER_PROMOTED: 'Promoted to Admin',
  };

  return labels[type] || type;
};
