import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../src/api/axios';
import * as SecureStore from 'expo-secure-store';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
};

// Async thunk for logging in
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post('/api/v1/user/login', { email, password });
            const { user, token } = res.data.data;
            // persist token securely
            await SecureStore.setItemAsync('token', token);
            return { user, token };
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
