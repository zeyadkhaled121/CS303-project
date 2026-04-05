import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';
import * as SecureStore from 'expo-secure-store';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
    message: null,
};

// Helper to safely extract error message from axios errors
const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || 'Something went wrong';

// ==================== ASYNC THUNKS ====================

// 1. Register
export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/v1/user/register', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// 2. OTP Verification
export const otpVerification = createAsyncThunk(
  'auth/otpVerification',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/v1/user/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// 3. Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post('/api/v1/user/login', { email, password });
            const { user, token } = res.data.data;
            // Persist token securely
            if (token) {
              await SecureStore.setItemAsync('token', token);
            }
            return { user, token, message: res.data.message };
        } catch (err) {
            const message = getErrorMsg(err);
            return rejectWithValue(message);
        }
    }
);

// 4. Get current user (session restore)
export const getUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/api/v1/user/me');
      const user = response.data.data?.user || null;
      return { user, isAuthenticated: !!user };
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// 5. Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await API.get('/api/v1/user/logout');
      await SecureStore.deleteItemAsync('token');
      return { message: 'Logged out successfully' };
    } catch (error) {
      // Still logout even if API fails
      await SecureStore.deleteItemAsync('token');
      return { message: 'Logged out' };
    }
  }
);

// 6. Forgot Password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/v1/user/password/forgot', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// 7. Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.put('/api/v1/user/password/reset', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// 8. Update Password
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await API.put('/api/v1/user/password/update', data);
      if (response.data.data?.token) {
        await SecureStore.setItemAsync('token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMsg(error));
    }
  }
);

// Note: User management (fetchAllUsers, promoteUser, demoteUser, deleteUser)
// is handled in userSlice.js to keep concerns separated

// ==================== REDUX SLICE ====================

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthMessages(state) {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
          .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
          })
          .addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.message = action.payload?.message || 'Registration successful. Please verify your email.';
          })
          .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });

        // OTP Verification
        builder
          .addCase(otpVerification.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
          })
          .addCase(otpVerification.fulfilled, (state, action) => {
            state.loading = false;
            state.message = action.payload?.message || 'Email verified successfully. Please login.';
          })
          .addCase(otpVerification.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.message = action.payload.message || 'Logged in successfully';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
                state.isAuthenticated = false;
            });

        // Get User
        builder
          .addCase(getUser.pending, (state) => {
            state.loading = true;
          })
          .addCase(getUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.isAuthenticated;
          })
          .addCase(getUser.rejected, (state) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
          });

        // Logout
        builder
          .addCase(logout.pending, (state) => {
            state.loading = true;
          })
          .addCase(logout.fulfilled, (state) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
            state.message = 'Logged out successfully';
          })
          .addCase(logout.rejected, (state) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
          });

        // Forgot Password
        builder
          .addCase(forgotPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
          })
          .addCase(forgotPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.message = action.payload?.message || 'Check your email for password reset instructions.';
          })
          .addCase(forgotPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });

        // Reset Password
        builder
          .addCase(resetPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
          })
          .addCase(resetPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.message = action.payload?.message || 'Password reset successfully. Please login.';
          })
          .addCase(resetPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });

        // Update Password
        builder
          .addCase(updatePassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
          })
          .addCase(updatePassword.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.data?.user) {
              state.user = action.payload.data.user;
            }
            state.message = action.payload?.message || 'Password updated successfully.';
          })
          .addCase(updatePassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          });

        // User management is handled in userSlice.js
    },
});

export const { resetAuthMessages } = authSlice.actions;
export default authSlice.reducer;
