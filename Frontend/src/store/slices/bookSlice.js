import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchBooks = createAsyncThunk("book/fetchBooks", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/v1/book/getall");
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch books");
  }
});

export const addBook = createAsyncThunk("book/addBook", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/v1/book/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || " fail to add book");
  }
});

export const deleteBook = createAsyncThunk("book/deleteBook", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/v1/book/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "failed");
  }
});

const bookSlice = createSlice({
  name: "book",
  initialState: { books: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBooks.pending, (state) => { state.loading = true; })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books || action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addBook.pending, (state) => { state.loading = true; })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        const newBook = action.payload.book || action.payload;
        state.books.unshift(newBook);
      })
      // Delete
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => b._id !== action.payload);
      });
  },
});

export default bookSlice.reducer;