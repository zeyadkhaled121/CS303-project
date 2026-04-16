import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const fetchUnpaidFines = createAsyncThunk(
  "fine/fetchUnpaidFines",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/fines?status=unpaid");
      return response.data.fines || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unpaid fines");
    }
  }
);

export const confirmFinePayment = createAsyncThunk(
  "fine/confirmPayment",
  async (fineId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/admin/fines/${fineId}/confirm-payment`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to confirm payment");
    }
  }
);

export const fetchUserFines = createAsyncThunk(
  "fine/fetchUserFines",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/users/me/fines");
      return response.data.fines || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user fines");
    }
  }
);

const initialState = {
  unpaidFines: [],
  userFines: [],
  isLoading: false,
  error: null,
};

const fineSlice = createSlice({
  name: "fine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch unpaid fines (Admin)
      .addCase(fetchUnpaidFines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnpaidFines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unpaidFines = action.payload;
      })
      .addCase(fetchUnpaidFines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Confirm payment (Admin)
      .addCase(confirmFinePayment.fulfilled, (state, action) => {
        state.unpaidFines = state.unpaidFines.filter(
          (fine) => fine._id !== action.meta.arg
        );
      })
      
      // Fetch user fines
      .addCase(fetchUserFines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userFines = action.payload;
      })
      .addCase(fetchUserFines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default fineSlice.reducer;
