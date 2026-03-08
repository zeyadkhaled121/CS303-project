import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';


export const fetchAllUsers = createAsyncThunk("user/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await API.get("/api/v1/user/admin/users");
        return response.data.data.users;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
});

// Promote user
export const promoteUser = createAsyncThunk("user/promote", async (userId, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/v1/user/admin/user/promote/${userId}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to promote user");
    }
});

// Demote user
export const demoteUser = createAsyncThunk("user/demote", async (userId, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/v1/user/admin/user/demote/${userId}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to demote user");
    }
});

// Delete user
export const deleteUser = createAsyncThunk("user/delete", async (userId, { rejectWithValue }) => {
    try {
        const response = await API.delete(`/api/v1/user/admin/user/delete/${userId}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
});

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {
        resetUserSlice: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload || [];
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Promote
            .addCase(promoteUser.pending, (state) => { state.loading = true; })
            .addCase(promoteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(promoteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Demote
            .addCase(demoteUser.pending, (state) => { state.loading = true; })
            .addCase(demoteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(demoteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteUser.pending, (state) => { state.loading = true; })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetUserSlice } = userSlice.actions;
export default userSlice.reducer;