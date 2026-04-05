import { createSlice } from '@reduxjs/toolkit';
import API from '../../api/axios';

const initialState = {
  userBorrowedBooks: [],
  allBorrowedBooks: [],
  pendingRequests: [],
  loading: false,
  error: null,
  message: null,
  stats: {
    totalPending: 0,
    totalBorrowed: 0,
    totalOverdue: 0,
    totalBooks: 0,
    totalUsers: 0,
  },
};

const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    // General request/success/failed patterns
    borrowActionRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    borrowActionSuccess(state, action) {
      state.loading = false;
      state.message = action.payload?.message || 'Action completed successfully';
      state.error = null;
    },
    borrowActionFailed(state, action) {
      state.loading = false;
      state.error = action.payload?.error || 'An error occurred';
      state.message = null;
    },

    // Fetch user borrowed books
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.userBorrowedBooks = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },

    // Fetch all borrowed books (admin)
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
    },

    // Set stats
    setStatsSuccess(state, action) {
      state.stats = action.payload || initialState.stats;
      state.loading = false;
      state.error = null;
    },

    // Reset slice
    resetBorrowSlice() {
      return initialState;
    },
  },
});

// Action creators
const {
  borrowActionRequest,
  borrowActionSuccess,
  borrowActionFailed,
  fetchUserBorrowedBooksSuccess,
  fetchAllBorrowedBooksSuccess,
  setStatsSuccess,
} = borrowSlice.actions;

// Utility function to extract error message
const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || 'Something went wrong';



// Request to borrow a book (User action)
 
export const recordBorrowBook = (bookId) => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.post('/api/v1/borrow/request', { bookId });
    dispatch(borrowActionSuccess({ message: response.data.message }));
    // Refresh user's borrow list
    dispatch(fetchUserBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Direct borrow record (Admin action)
export const recordDirectBorrow = (userId, bookId, dueDate) => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.post('/api/v1/borrow/admin/record', {
      userId,
      bookId,
      dueDate,
    });
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchAllBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Approve borrow request (Admin action)
 
export const approveBorrow = (borrowId, dueDate) => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.put(`/api/v1/borrow/admin/approve/${borrowId}`, {
      dueDate,
    });
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchAllBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Reject borrow request (Admin action)
 
export const rejectBorrow = (borrowId, remarks = 'Rejected by admin') => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.put(`/api/v1/borrow/admin/reject/${borrowId}`, {
      remarks,
    });
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchAllBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Fetch user's borrowed books
 
export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.get('/api/v1/borrow/my-borrowings');
    const borrowings = response.data.data?.borrowings || response.data.data || [];
    dispatch(fetchUserBorrowedBooksSuccess(borrowings));
    return { ok: true, data: borrowings };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Fetch all borrowed books (Admin)
 
export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.get('/api/v1/borrow/admin/records');
    const borrowings = response.data.data?.borrowings || response.data.data || [];
    dispatch(fetchAllBorrowedBooksSuccess(borrowings));
    return { ok: true, data: borrowings };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Return a book (Admin action)
export const returnBook = (borrowId) => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.put(`/api/v1/borrow/admin/return/${borrowId}`, {});
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchAllBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Cancel a borrow request (User action)
 
export const cancelBorrow = (borrowId) => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.put(`/api/v1/borrow/cancel/${borrowId}`, {});
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchUserBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Report issue with book (Admin action)
 
export const reportIssue = (borrowId, issueType, remarks = '') => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.put(`/api/v1/borrow/admin/report-issue/${borrowId}`, {
      issueType,
      remarks,
    });
    dispatch(borrowActionSuccess({ message: response.data.message }));
    dispatch(fetchAllBorrowedBooks());
    return { ok: true, message: response.data.message };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

// Get borrow statistics (Admin)
 
export const getBorrowStats = () => async (dispatch) => {
  dispatch(borrowActionRequest());
  try {
    const response = await API.get('/api/v1/borrow/admin/stats');
    const stats = response.data.data || {};
    dispatch(setStatsSuccess(stats));
    return { ok: true, data: stats };
  } catch (error) {
    const errorMsg = getErrorMsg(error);
    dispatch(borrowActionFailed({ error: errorMsg }));
    return { ok: false, error: errorMsg };
  }
};

export default borrowSlice.reducer;
