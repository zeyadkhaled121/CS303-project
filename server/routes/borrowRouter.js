import express from "express";
import {
  requestBorrow,
  getMyBorrowings,
  cancelBorrow,
  getAllBorrowings,
  approveBorrow,
  recordDirectBorrow,
  rejectBorrow,
  confirmReturn,
  reportIssue,
  getBorrowStats
} from "../controllers/borrowController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import { validateBorrowRequest, validateApprove, validateReject, validateReportIssue } from "../middlewares/validate.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();


// ===== USER ENDPOINTS  =====

// 1. REQUEST TO BORROW A BOOK
// User requests to borrow a book
// Rate limited to prevent spam 
router.post(
  "/request",
  isAuthenticatedUser,
  authorizeRoles("User"),
  rateLimiter, // Max 10 req/min per user
  validateBorrowRequest,
  requestBorrow
);

// 2. GET USER'S BORROWINGS
// User views their own borrow records (Pending, Borrowed, Returned, etc.)
// Query params: status (optional), skip, limit
router.get(
  "/my-borrowings",
  isAuthenticatedUser,
  getMyBorrowings
);

// 3. CANCEL BORROW REQUEST
// User cancels a Pending request (only allowed before approval)
router.put(
  "/cancel/:id",
  isAuthenticatedUser,
  cancelBorrow
);

// ===== ADMIN ENDPOINTS (Authenticated + Admin/Super Admin Role) =====

// 4. GET ALL BORROW RECORDS
// Admin views all borrow records across all users
// Query params: status (optional), userId (optional), skip, limit
router.get(
  "/admin/records",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  getAllBorrowings
);

// 4.5 RECORD A LOAN DIRECTLY
// Admin directly assigns a book to a user without a pending request
router.post(
  "/admin/record",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  recordDirectBorrow
);

// 5. APPROVE BORROW REQUEST
// Admin approves a Pending request and sets due date
// Pending → Borrowed (status collapsed in spec)
// Body: { dueDate: ISO string }
router.put(
  "/admin/approve/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  validateApprove,
  approveBorrow
);

// 6. REJECT BORROW REQUEST
// Admin rejects a Pending request with remarks
// Pending → Rejected
// Body: { remarks: string }
router.put(
  "/admin/reject/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  validateReject,
  rejectBorrow
);

// 7. CONFIRM RETURN
// Admin confirms that a user has returned the book
// Borrowed/Overdue → Returned
// Body: (empty) - just confirmation action
router.put(
  "/admin/return/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  confirmReturn
);

// 8. REPORT ISSUE (Lost/Damaged)
// Admin reports that a book is lost or damaged
// Updates book's totalCopies (book is gone from inventory)
// Body: { issueType: "Lost" | "Damaged", remarks: string }
router.put(
  "/admin/report-issue/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  validateReportIssue,
  reportIssue
);

// 9. GET BORROW STATISTICS
// Admin dashboard endpoint
// Returns: totalPending, totalBorrowed, totalOverdue, totalReturned, totalBooks, totalUsers
router.get(
  "/admin/stats",
  isAuthenticatedUser,
  authorizeRoles("Admin", "Super Admin"),
  getBorrowStats
);

export default router;

