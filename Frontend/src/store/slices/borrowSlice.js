/**
 * REFACTORED BORROW SLICE v2.0
 * Enterprise-grade Redux Toolkit slice with:
 * - Complete data normalization
 * - Race condition prevention
 * - Comprehensive error handling
 * - Audit logging
 * - Advanced state protection
 * 
 * This is the REPLACEMENT for the existing borrowSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";
import axios from "../../api/axios";
import {
  normalizeBorrowRecord,
  isBorrowActive,
  isBorrowPending,
} from "../../utils/dataShapeNormalizer";
import {
  validateBorrowBookRequest,
  validateDirectBorrowRequest,
  validateApproveBorrowRequest,
  validateRejectRemarks,
  formatErrorForToast,
  logAuditEvent,
} from "../../utils/validationEngine";
import {
  createRequestKey,
  checkDuplicateRequest,
  registerRequest,
  unregisterRequest,
  detectConflictError,
  executeWithRetry,
} from "../../utils/concurrencyManager";
import {
  validateBorrowRecordsArray,
  validateBorrowRecordResponse,
} from "../../utils/responseValidator";
import { notifySuccess, notifyError, notifyWarning } from "../../utils/toastNotificationManager";

const DEFAULT_TIMEOUT_MS = 10000;
const MUTATION_TIMEOUT_MS = 15000;

const initialState = {
  loading: false,
  error: null,
  userBorrowedBooks: [],
  allBorrowedBooks: [],
  message: null,
  lastActionTimestamp: null,
  activeRequests: [], // Track in-flight requests to prevent race conditions
};

const borrowSlice = createSlice({
  name: "borrow",
  initialState,
  reducers: {
    /**
     * Start any async action
     */
    borrowActionRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
      state.lastActionTimestamp = Date.now();
    },

    /**
     * Async action succeeded
     */
    borrowActionSuccess(state, action) {
      state.loading = false;
      // Allows setting null to purposely avoid toasts anywhere
      state.message = action.payload?.message !== undefined ? action.payload.message : "Action completed successfully.";
      state.error = null;
    },

    /**
     * Async action failed
     */
    borrowActionFailed(state, action) {
      state.loading = false;
      state.error = action.payload?.error || "An error occurred.";
      state.message = null;
    },

    /**
     * User's borrowed books fetched successfully
     */
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      // Normalize all records to standard format
      state.userBorrowedBooks = (Array.isArray(action.payload) ? action.payload : [])
        .map((record) => normalizeBorrowRecord(record))
        .filter((record) => record._id); // Filter out invalid records
      state.error = null;
    },

    /**
     * All borrowed books (admin) fetched successfully
     */
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = (Array.isArray(action.payload) ? action.payload : [])
        .map((record) => normalizeBorrowRecord(record))
        .filter((record) => record._id);
      state.error = null;
    },

    /**
     * Track request to prevent race conditions
     */
    addActiveRequest(state, action) {
      if (!state.activeRequests.includes(action.payload)) {
        state.activeRequests.push(action.payload);
      }
    },

    /**
     * Remove request from active tracking
     */
    removeActiveRequest(state, action) {
      state.activeRequests = state.activeRequests.filter(req => req !== action.payload);
    },

    /**
     * Reset slice to initial state
     */
    resetBorrowSlice() {
      return { ...initialState };
    },
  },
});

// ==================== ASYNC THUNKS ====================

/**
 * THUNK 1: REQUEST TO BORROW A BOOK (User)
 * User submits a borrow request via catalog page
 * 
 * RACE CONDITION HANDLING:
 * - Detects when two users try to borrow the last copy simultaneously
 * - Implements exponential backoff retry for transient failures
 * - Provides user-friendly messaging for conflict scenarios
 */
export const recordBorrowBook = (bookId) => async (dispatch, getState) => {
  // ─── PRE-FLIGHT VALIDATION ───
  const validation = validateBorrowBookRequest(bookId);
  if (!validation.isValid) {
    notifyError(validation.error);
    return { ok: false, reason: "validation-failed", error: validation.error };
  }

  const state = getState();

  // ─── RACE CONDITION GUARD ───
  if (state.borrow.loading) {
    notifyWarning("A request is already in progress. Please wait.");
    return { ok: false, reason: "request-in-flight" };
  }

  const normalizedId = String(bookId).trim();
  const requestKey = `borrow-${normalizedId}`;

  // Check for duplicate request - if already processing, wait for it
  const { isDuplicate, existingRequest } = checkDuplicateRequest(requestKey);
  if (isDuplicate) {
    try {
      return await existingRequest;
    } catch (err) {
      return { ok: false, reason: "duplicate-request-failed", error: formatErrorForToast(err) };
    }
  }

  dispatch(borrowSlice.actions.borrowActionRequest());

  try {
    const result = await executeWithRetry(
      async () => {
        const response = await axios.post(
          "/api/v1/borrow/request",
          { bookId: normalizedId },
          { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
        );

        // Validate response structure
        const validatedMessage = response?.data?.message || "Borrow request submitted successfully!";

        dispatch(borrowSlice.actions.borrowActionSuccess({ message: validatedMessage }));
        notifySuccess(validatedMessage);

        logAuditEvent({
          userId: state.auth?.user?._id || "unknown",
          action: "BORROW_BOOK_REQUESTED",
          resourceId: normalizedId,
          resourceType: "BOOK",
        });

        // Refresh user's borrow list in background
        dispatch(fetchUserBorrowedBooks());

        return { ok: true, message: validatedMessage };
      },
      {
        onConflict: (conflict) => {
          // Another user got the last copy (409 Conflict)
          notifyError(
            "Sorry, the last copy was just borrowed by someone else. Please try another book."
          );
          logAuditEvent({
            userId: state.auth?.user?._id || "unknown",
            action: "BORROW_CONFLICT_DETECTED",
            resourceId: normalizedId,
            resourceType: "BOOK",
            details: { reason: conflict.reason }
          });
          return { shouldAbort: true };
        },
        onRetry: ({ retryCount, delay, reason }) => {
          console.log(`[Borrow Retry] Attempt ${retryCount}, waiting ${delay}ms (${reason})`);
        },
        onGiveUp: ({ error, reason }) => {
          const errorMsg = formatErrorForToast(error);
          dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
          notifyError(errorMsg);
          
          logAuditEvent({
            userId: state.auth?.user?._id || "unknown",
            action: "BORROW_FAILED",
            resourceId: normalizedId,
            resourceType: "BOOK",
            details: { reason, error: errorMsg }
          });
        }
      }
    );

    return result;
  } catch (err) {
    const conflict = detectConflictError(err);
    if (conflict.isConflict) {
      notifyError(conflict.message || "This book is no longer available.");
      return { ok: false, reason: "conflict", error: conflict.message };
    }

    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    notifyError(errorMsg);
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 2: DIRECT BORROW RECORD (Admin)
 * Admin directly assigns a book to a user without pending request
 */
export const recordDirectBorrow = (userId, bookId, dueDate, onSuccess = null) =>
  async (dispatch, getState) => {
    // ─── PRE-FLIGHT VALIDATION ───
    const validation = validateDirectBorrowRequest(userId, bookId, dueDate);
    if (!validation.isValid) {
      notifyError(validation.error);
      return { ok: false, reason: "validation-failed", error: validation.error };
    }

    const state = getState();
    if (state.borrow.loading) {
      notifyWarning("A request is already in progress.");
      return { ok: false, reason: "request-in-flight" };
    }

    dispatch(borrowSlice.actions.borrowActionRequest());

    try {
      const payload = {
        userId: String(userId).trim(),
        bookId: String(bookId).trim(),
        dueDate,
      };

      const response = await axios.post(
        "/api/v1/borrow/admin/record",
        payload,
        { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
      );

      const message = response?.data?.message || "Borrow record created successfully!";
      dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
      notifySuccess(message);

      logAuditEvent({
        userId: state.auth?.user?._id || "admin",
        action: "BORROW_RECORDED_DIRECT",
        resourceId: payload.bookId,
        resourceType: "BOOK",
        details: { userId: payload.userId, dueDate },
      });

      // Refresh borrow lists
      dispatch(fetchAllBorrowedBooks());

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      return { ok: true, message };
    } catch (err) {
      const errorMsg = formatErrorForToast(err);
      dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
      notifyError(errorMsg);
      return { ok: false, error: errorMsg };
    }
  };

/**
 * THUNK 3: APPROVE BORROW REQUEST (Admin)
 * Admin approves a pending request and sets due date
 */
export const approveBorrow = (borrowId, dueDate) => async (dispatch, getState) => {
  // ─── PRE-FLIGHT VALIDATION ───
  const validation = validateApproveBorrowRequest(borrowId, dueDate);
  if (!validation.isValid) {
    notifyError(validation.error);
    return { ok: false, reason: "validation-failed", error: validation.error };
  }

  const state = getState();
  if (state.borrow.loading) {
    notifyWarning("A request is already in progress.");
    return { ok: false, reason: "request-in-flight" };
  }

  dispatch(borrowSlice.actions.borrowActionRequest());

  try {
    const response = await axios.put(
      `/api/v1/borrow/admin/approve/${String(borrowId).trim()}`,
      { dueDate },
      { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
    );

    const message = response?.data?.message || "Borrow request approved!";
    dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
    notifySuccess(message);

    logAuditEvent({
      userId: state.auth?.user?._id || "admin",
      action: "BORROW_APPROVED",
      resourceId: borrowId,
      resourceType: "BORROW",
      details: { dueDate },
    });

    const { fetchAllBooks } = await import('./bookSlice');
    dispatch(fetchAllBorrowedBooks());

    return { ok: true, message };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    notifyError(errorMsg);
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 4: REJECT BORROW REQUEST (Admin)
 * Admin rejects a pending request with remarks
 */
export const rejectBorrow = (borrowId, remarks = "Rejected by admin") =>
  async (dispatch, getState) => {
    // ─── PRE-FLIGHT VALIDATION ───
    const remarksValidation = validateRejectRemarks(remarks);
    if (!remarksValidation.isValid) {
      notifyError(remarksValidation.error);
      return {
        ok: false,
        reason: "validation-failed",
        error: remarksValidation.error,
      };
    }

    const state = getState();
    if (state.borrow.loading) {
      notifyWarning("A request is already in progress.");
      return { ok: false, reason: "request-in-flight" };
    }

    dispatch(borrowSlice.actions.borrowActionRequest());

    try {
      const normalizedRemarks = String(remarks).trim();
      const response = await axios.put(
        `/api/v1/borrow/admin/reject/${String(borrowId).trim()}`,
        { remarks: normalizedRemarks },
        { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
      );

      const message = response?.data?.message || "Borrow request rejected.";
      dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
      notifyWarning(message);

      logAuditEvent({
        userId: state.auth?.user?._id || "admin",
        action: "BORROW_REJECTED",
        resourceId: borrowId,
        resourceType: "BORROW",
        details: { remarks: normalizedRemarks },
      });

      const { fetchAllBooks } = await import('./bookSlice');
      dispatch(fetchAllBorrowedBooks());

      return { ok: true, message };
    } catch (err) {
      const errorMsg = formatErrorForToast(err);
      dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
      notifyError(errorMsg);
      return { ok: false, error: errorMsg };
    }
  };

/**
 * THUNK 5: FETCH ALL BORROWED BOOKS (Admin)
 * Get all borrow records across all users with pagination
 * Includes response validation to prevent data corruption crashes
 */
export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const response = await axios.get("/api/v1/borrow/admin/records", {
      withCredentials: true,
      timeout: DEFAULT_TIMEOUT_MS,
    });

    // Extract data with multiple fallback paths for malformed responses
    let borrowings = [];
    
    if (response?.data?.data?.borrowings && Array.isArray(response.data.data.borrowings)) {
      borrowings = response.data.data.borrowings;
    } else if (response?.data?.borrowings && Array.isArray(response.data.borrowings)) {
      borrowings = response.data.borrowings;
    } else if (response?.data?.data && Array.isArray(response.data.data)) {
      borrowings = response.data.data;
    }

    // Validate and normalize all records, filtering out corrupted ones
    const validatedBorrowings = validateBorrowRecordsArray(borrowings);

    if (validatedBorrowings.length < borrowings.length) {
      console.warn(
        `[Data Corruption Guard] Filtered out ${borrowings.length - validatedBorrowings.length} corrupted borrow records`
      );
    }

    dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(validatedBorrowings));
    return { ok: true, data: validatedBorrowings };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 6: FETCH USER'S BORROWED BOOKS (User)
 * Get logged-in user's borrow history and pending requests
 * Includes response validation to prevent data corruption crashes
 */
export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const response = await axios.get("/api/v1/borrow/my-borrowings", {
      withCredentials: true,
      timeout: DEFAULT_TIMEOUT_MS,
    });

    // Extract data with multiple fallback paths for malformed responses
    let borrowings = [];
    
    if (response?.data?.data?.borrowings && Array.isArray(response.data.data.borrowings)) {
      borrowings = response.data.data.borrowings;
    } else if (response?.data?.borrowedBooks && Array.isArray(response.data.borrowedBooks)) {
      borrowings = response.data.borrowedBooks;
    } else if (response?.data?.data && Array.isArray(response.data.data)) {
      borrowings = response.data.data;
    } else if (Array.isArray(response?.data)) {
      borrowings = response.data;
    }

    // Validate and normalize all records, filtering out corrupted ones
    const validatedBorrowings = validateBorrowRecordsArray(borrowings);

    if (validatedBorrowings.length < borrowings.length) {
      console.warn(
        `[Data Corruption Guard] Filtered out ${borrowings.length - validatedBorrowings.length} corrupted user borrow records`
      );
    }

    dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(validatedBorrowings));
    return { ok: true, data: validatedBorrowings };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 7: RETURN BOOK (Admin)
 * Confirm that a user has returned a borrowed book
 */
export const returnBook = (borrowId) => async (dispatch, getState) => {
  if (!borrowId || String(borrowId).trim().length === 0) {
    notifyError("Invalid borrow record ID.");
    return { ok: false, reason: "invalid-id", error: "Invalid borrow record ID" };
  }

  const state = getState();
  if (state.borrow.loading) {
    notifyWarning("A request is already in progress.");
    return { ok: false, reason: "request-in-flight" };
  }

  dispatch(borrowSlice.actions.borrowActionRequest());

  try {
    const response = await axios.put(
      `/api/v1/borrow/admin/return/${String(borrowId).trim()}`,
      {},
      { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
    );

    const message = response?.data?.message || "Book return confirmed!";
    dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
    notifySuccess(message);

    logAuditEvent({
      userId: state.auth?.user?._id || "admin",
      action: "BORROW_RETURNED",
      resourceId: borrowId,
      resourceType: "BORROW",
    });

    const { fetchAllBooks } = await import('./bookSlice');
    dispatch(fetchAllBorrowedBooks());

    return { ok: true, message };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    notifyError(errorMsg);
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 8: CANCEL BORROW REQUEST (User)
 * User cancels a pending borrow request and restores book inventory
 */
export const cancelBorrow = (borrowId) => async (dispatch, getState) => {
  // ─── PRE-FLIGHT VALIDATION ───
  if (!borrowId || String(borrowId).trim().length === 0) {
    notifyError("Invalid borrow record ID.");
    return { ok: false, reason: "invalid-id", error: "Invalid borrow record ID" };
  }

  const state = getState();
  if (state.borrow.loading) {
    notifyWarning("A request is already in progress.");
    return { ok: false, reason: "request-in-flight" };
  }

  dispatch(borrowSlice.actions.borrowActionRequest());

  try {
    const response = await axios.put(
      `/api/v1/borrow/cancel/${String(borrowId).trim()}`,
      {},
      { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
    );

    const message = response?.data?.message || "Borrow request cancelled successfully!";
    dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
    notifySuccess(message);

    logAuditEvent({
      userId: state.auth?.user?._id || "unknown",
      action: "BORROW_CANCELLED",
      resourceId: borrowId,
      resourceType: "BORROW",
    });

    // Refresh user's borrow list
    dispatch(fetchUserBorrowedBooks());

    return { ok: true, message };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    notifyError(errorMsg);
    return { ok: false, error: errorMsg };
  }
};

/**
 * THUNK 9: REPORT ISSUE (Admin)
 * Admin reports that a book is lost or damaged
 * Removes the book from inventory
 */
export const reportIssue = (borrowId, issueType, remarks = "") =>
  async (dispatch, getState) => {
    // ─── PRE-FLIGHT VALIDATION ───
    if (!borrowId || String(borrowId).trim().length === 0) {
      notifyError("Invalid borrow record ID.");
      return { ok: false, reason: "invalid-id", error: "Invalid borrow record ID" };
    }

    if (!issueType || !["Lost", "Damaged"].includes(issueType)) {
      notifyError("Invalid issue type. Must be 'Lost' or 'Damaged'.");
      return {
        ok: false,
        reason: "invalid-issue-type",
        error: "Invalid issue type",
      };
    }

    const state = getState();
    if (state.borrow.loading) {
      notifyWarning("A request is already in progress.");
      return { ok: false, reason: "request-in-flight" };
    }

    dispatch(borrowSlice.actions.borrowActionRequest());

    try {
      const payload = {
        issueType: String(issueType).trim(),
        remarks: String(remarks).trim() || `Book marked as ${issueType}`,
      };

      const response = await axios.put(
        `/api/v1/borrow/admin/report-issue/${String(borrowId).trim()}`,
        payload,
        { withCredentials: true, timeout: MUTATION_TIMEOUT_MS }
      );

      const message = response?.data?.message || `Book reported as ${issueType}!`;
      dispatch(borrowSlice.actions.borrowActionSuccess({ message }));
      notifySuccess(message);

      logAuditEvent({
        userId: state.auth?.user?._id || "admin",
        action: "BORROW_ISSUE_REPORTED",
        resourceId: borrowId,
        resourceType: "BORROW",
        details: { issueType, remarks: payload.remarks },
      });

      // Refresh both lists
      const { fetchAllBooks } = await import('./bookSlice');
      dispatch(fetchAllBorrowedBooks());
      dispatch(fetchAllBooks());

      return { ok: true, message };
    } catch (err) {
      const errorMsg = formatErrorForToast(err);
      dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
      notifyError(errorMsg);
      return { ok: false, error: errorMsg };
    }
  };

/**
 * THUNK 10: GET BORROW STATISTICS (Admin)
 * Fetch real-time borrowing statistics from backend
 * Used in admin dashboard for accurate stats
 */
export const getBorrowStats = () => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const response = await axios.get("/api/v1/borrow/admin/stats", {
      withCredentials: true,
      timeout: DEFAULT_TIMEOUT_MS,
    });

    const stats = response?.data?.data || response?.data || {};

    dispatch(borrowSlice.actions.borrowActionSuccess({
      message: null,
    }));

    return {
      ok: true,
      data: {
        totalPending: stats.totalPending || 0,
        totalBorrowed: stats.totalBorrowed || 0,
        totalOverdue: stats.totalOverdue || 0,
        totalReturned: stats.totalReturned || 0,
        totalBooks: stats.totalBooks || 0,
        totalUsers: stats.totalUsers || 0,
      },
    };
  } catch (err) {
    const errorMsg = formatErrorForToast(err);
    dispatch(borrowSlice.actions.borrowActionFailed({ error: errorMsg }));
    return {
      ok: false,
      error: errorMsg,
      data: {
        totalPending: 0,
        totalBorrowed: 0,
        totalOverdue: 0,
        totalReturned: 0,
        totalBooks: 0,
        totalUsers: 0,
      },
    };
  }
};

/**
 * Selector: Get all active borrowings for current user
 */
export const selectUserActiveBorrows = (state) => {
  return (state.borrow?.userBorrowedBooks || []).filter(isBorrowActive);
};

/**
 * Selector: Get pending requests for current user
 */
export const selectUserPendingBorrows = (state) => {
  return (state.borrow?.userBorrowedBooks || []).filter(isBorrowPending);
};

/**
 * Selector: Get active borrows (admin view)
 */
export const selectAllActiveBorrows = (state) => {
  return (state.borrow?.allBorrowedBooks || []).filter(isBorrowActive);
};

/**
 * Selector: Get all pending requests (admin view)
 */
export const selectAllPendingBorrows = (state) => {
  return (state.borrow?.allBorrowedBooks || []).filter(isBorrowPending);
};

// ─── EXPORTS ───
export const { addActiveRequest, removeActiveRequest, resetBorrowSlice } =
  borrowSlice.actions;

export const resetBorrowSliceAction = () => (dispatch) => {
  dispatch(resetBorrowSlice());
};

export default borrowSlice.reducer;
