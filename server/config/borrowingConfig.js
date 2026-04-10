

const BorrowingConfig = {
  // ===== LOAN SETTINGS =====
  LOAN_PERIOD_DAYS: 14, // Default loan period in days
  MAX_BORROW_LIMIT: 3, // Max concurrent active borrows per user
  MAX_RENEWALS_ALLOWED: 2, // Max times a user can renew a single book


  // ===== NOTIFICATION SETTINGS =====
  NOTIFICATION_RETENTION_DAYS: 30, 
  // ===== OVERDUE SETTINGS =====
  OVERDUE_CHECK_INTERVAL_MS: 24 * 60 * 60 * 1000, // Check every 24 hours
  OVERDUE_NOTIFICATION_ENABLED: true, // Send notification on overdue
  OVERDUE_EMAIL_ENABLED: false, // Send email on overdue (in-app only for now)

  // ===== AUDIT SETTINGS =====
  AUDIT_LOG_RETENTION_DAYS: 90, 
  AUDIT_LOG_ENABLED: true, 

  // ===== RATE LIMITING =====
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute window
  RATE_LIMIT_MAX_REQUESTS: 10, // Max 10 requests per window

  // ===== PAGINATION =====
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // ===== BATCH OPERATION LIMITS =====
  FIRESTORE_BATCH_LIMIT: 450, 

  // ===== STATUS CONSTANTS =====
  BORROW_STATUSES: {
    PENDING: "Pending", // Request submitted
    BORROWED: "Borrowed", // Approved and active loan
    RETURNED: "Returned", // Book returned
    CANCELLED: "Cancelled", // Request cancelled by user
    REJECTED: "Rejected", // Admin rejected request
    OVERDUE: "Overdue", // Past due date
    LOST: "Lost", // Reported as lost
    DAMAGED: "Damaged" // Reported as damaged
  },

  // ===== BOOK STATUS CONSTANTS =====
  BOOK_STATUSES: {
    AVAILABLE: "Available", // All copies available
    BORROWED: "Borrowed" // Some copies borrowed
  },

  // ===== NOTIFICATION TYPES =====
  NOTIFICATION_TYPES: {
    BORROW_APPROVED: "BORROW_APPROVED",
    BORROW_REJECTED: "BORROW_REJECTED",
    BORROW_RETURNED: "BORROW_RETURNED",
    BORROW_OVERDUE: "BORROW_OVERDUE",
    BORROW_LOST_DAMAGED: "BORROW_LOST_DAMAGED",
    BORROW_CANCELLED: "BORROW_CANCELLED"
  },

  // ===== AUDIT ACTION CONSTANTS =====
  AUDIT_ACTIONS: {
    BORROW_REQUEST: "BORROW_REQUEST",
    BORROW_CANCELLED: "BORROW_CANCELLED",
    BORROW_APPROVED: "BORROW_APPROVED",
    BORROW_REJECTED: "BORROW_REJECTED",
    BORROW_RETURNED: "BORROW_RETURNED",
    BORROW_LOST: "BORROW_LOST",
    BORROW_DAMAGED: "BORROW_DAMAGED",
    AUTO_OVERDUE: "AUTO_OVERDUE"
  },

  // ===== FIRESTORE COLLECTIONS =====
  COLLECTIONS: {
    BORROW: "borrow",
    NOTIFICATIONS: "notifications",
    AUDIT_LOGS: "auditLogs",
    BOOKS: "books",
    USERS: "users"
  },


  // Calculate due date from today
  calculateDueDate: (daysFromNow = this.LOAN_PERIOD_DAYS) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    dueDate.setHours(23, 59, 59, 999); // End of day
    return dueDate;
  },

  // Check if date is overdue
  isOverdue: (dueDate) => {
    return new Date() > new Date(dueDate);
  },

  // Check if date is within warning period 
  isWithinWarningPeriod: (dueDate, warningDaysBefore = 3) => {
    const now = new Date();
    const dueDateTime = new Date(dueDate);
    const warningDate = new Date(dueDateTime);
    warningDate.setDate(warningDate.getDate() - warningDaysBefore);
    
    return now >= warningDate && now < dueDateTime;
  },

  // Get days remaining until due date
  getDaysRemaining: (dueDate) => {
    const now = new Date();
    const dueDateTime = new Date(dueDate);
    const diff = dueDateTime - now;
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysRemaining;
  },

  // Get days overdue
  getDaysOverdue: (dueDate) => {
    const now = new Date();
    const dueDateTime = new Date(dueDate);
    const diff = now - dueDateTime;
    const daysOverdue = Math.floor(diff / (1000 * 60 * 60 * 24));
    return daysOverdue > 0 ? daysOverdue : 0;
  }
};

export default BorrowingConfig;

