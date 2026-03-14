import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchAllBooks } from "./bookSlice"; 
import { toast } from "react-toastify";

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    loading: false,
    error: null,
    userBorrowedBooks: [], 
    allBorrowedBooks: [],  
    message: null,
  },
  reducers: {
    borrowActionRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    borrowActionSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    borrowActionFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUserBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.userBorrowedBooks = action.payload;
    },
    fetchAllBorrowedBooksSuccess(state, action) {
      state.loading = false;
      state.allBorrowedBooks = action.payload;
    },
    resetBorrowSlice(state) {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

// --- Thunk Actions ---

export const recordBorrowBook = (bookId) => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.post(
      "/api/v1/borrow/request",
      { bookId },
      { withCredentials: true }
    );
    dispatch(borrowSlice.actions.borrowActionSuccess(res.data.message));
    toast.success(res.data.message || "Borrow request sent!");
    
    dispatch(fetchAllBooks()); 
    dispatch(fetchUserBorrowedBooks());
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Request Failed";
    dispatch(borrowSlice.actions.borrowActionFailed(errorMsg));
    toast.error(errorMsg);
  }
};

export const approveBorrow = (userId, bookId, dueDate) => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.post(
      "/api/v1/borrow/admin/approve",
      { userId, bookId, dueDate },
      { withCredentials: true }
    );
    dispatch(borrowSlice.actions.borrowActionSuccess(res.data.message));
    toast.success("Request Approved! Book status updated to Borrowed.");
    
    dispatch(fetchAllBooks());
    dispatch(fetchAllBorrowedBooks());
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Approval Failed";
    dispatch(borrowSlice.actions.borrowActionFailed(errorMsg));
    toast.error(errorMsg);
  }
};

export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.get("/api/v1/borrow/admin/records", { withCredentials: true });
    dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(res.data.borrowedBooks));
  } catch (err) {
    dispatch(borrowSlice.actions.borrowActionFailed(err.response?.data?.message || "Error fetching records"));
  }
};

export const returnBook = (id) => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.put(`/api/v1/borrow/admin/return/${id}`, {}, { withCredentials: true });
    dispatch(borrowSlice.actions.borrowActionSuccess(res.data.message));
    toast.success("Book Returned Successfully!");
    
    dispatch(fetchAllBooks());
    dispatch(fetchAllBorrowedBooks());
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Return Failed";
    dispatch(borrowSlice.actions.borrowActionFailed(errorMsg));
    toast.error(errorMsg);
  }
};

export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.get("/api/v1/borrow/my-borrowings", { withCredentials: true });
    dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(res.data.borrowedBooks));
  } catch (err) {
    dispatch(borrowSlice.actions.borrowActionFailed(err.response?.data?.message || "Error fetching your books"));
  }
};

export const rejectBorrow = (id) => async (dispatch) => {
  dispatch(borrowSlice.actions.borrowActionRequest());
  try {
    const res = await axios.put(
      `/api/v1/borrow/admin/reject/${id}`, 
      {},
      { withCredentials: true }
    );
    dispatch(borrowSlice.actions.borrowActionSuccess(res.data.message));
    toast.warn(res.data.message || "Request Rejected");
    
    dispatch(fetchAllBorrowedBooks());
    dispatch(fetchAllBooks()); 
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Rejection Failed";
    dispatch(borrowSlice.actions.borrowActionFailed(errorMsg));
    toast.error(errorMsg);
  }
};

export const resetBorrowSliceAction = () => (dispatch) => dispatch(borrowSlice.actions.resetBorrowSlice());

export default borrowSlice.reducer;