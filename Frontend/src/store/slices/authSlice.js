import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Helper to safely extract error message from Axios errors
const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || "Something went wrong";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    error: null,
    message: null,
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    // Registration
    registerRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // OTP Verification
    otpVerificationRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    otpVerificationSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      // Backend verifyEmail returns { success, message } only — no user/token.
      // User must log in after verification.
    },
    otpVerificationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // Login
    loginRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    // Logout
    logoutRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    getUserRequest(state) {
        state.loading = true;
        state.error = null;
        state.message = null;
    },
    getUserSuccess(state, action) {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
    },
    getUserFailed(state) {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
    },
    //forgot password
  forgotPasswordRequest(state) {
        state.loading = true;
        state.error = null;
        state.message = null;
    },
    forgotPasswordSuccess(state, action) {
        state.loading = false;
        state.message = action.payload.message;
        // Backend returns { success, message } only — no user data.
    },
    forgotPasswordFailed(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    // reset password
    resetPasswordRequest(state) {
        state.loading = true;
        state.error = null;
        state.message = null;
    },
    resetPasswordSuccess(state, action) {
        state.loading = false;
        state.message = action.payload.message;
    },
    resetPasswordFailed(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    // update password
    updatePasswordRequest(state) {
        state.loading = true;
        state.error = null;
        state.message = null;
    },
    updatePasswordSuccess(state, action) {
        state.loading = false;
        state.message = action.payload.message;
        // sendToken returns { success, message, user, token }
        if (action.payload.user) {
          state.user = action.payload.user;
        }
    },
    updatePasswordFailed(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    // Reset Auth Slice
    resetAuthSlice(state) {
        state.error = null;
        state.message = null;
        state.user = state.user;
        state.loading = false
        state.isAuthenticated = state.isAuthenticated
      }
  },
});

// --- Async Actions ---

// 1. User Registration
export const register = (data) => (dispatch) => {
  dispatch(authSlice.actions.registerRequest());
  api
    .post("/api/v1/user/register", data)
    .then((res) => dispatch(authSlice.actions.registerSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.registerFailed(getErrorMsg(error))));
};

// 2. OTP / Email Verification
export const otpVerification = (email, otp) => (dispatch) => {
  dispatch(authSlice.actions.otpVerificationRequest());
  api
    .post("/api/v1/user/verify-email", { email, otp })
    .then((res) => dispatch(authSlice.actions.otpVerificationSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.otpVerificationFailed(getErrorMsg(error))));
};

// 3. User Login
export const login = (data) => (dispatch) => {
  dispatch(authSlice.actions.loginRequest());
  api
    .post("/api/v1/user/login", data)
    .then((res) => dispatch(authSlice.actions.loginSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.loginFailed(getErrorMsg(error))));
};

// 4. User Logout
export const logout = () => (dispatch) => {
  dispatch(authSlice.actions.logoutRequest());
  api
    .get("/api/v1/user/logout")
    .then((res) => dispatch(authSlice.actions.logoutSuccess(res.data.message)))
    .catch((error) => dispatch(authSlice.actions.logoutFailed(getErrorMsg(error))));
};

// 5. Get User (restore session from cookie on page refresh)
export const getUser = () => (dispatch) => {
  dispatch(authSlice.actions.getUserRequest());
  api
    .get("/api/v1/user/me")
    .then((res) => dispatch(authSlice.actions.getUserSuccess(res.data)))
    .catch(() => dispatch(authSlice.actions.getUserFailed()));
};

// 6. Forgot Password
export const forgotPassword = (email) => (dispatch) => {
  dispatch(authSlice.actions.forgotPasswordRequest());
  api
    .post("/api/v1/user/password/forgot", { email })
    .then((res) => dispatch(authSlice.actions.forgotPasswordSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.forgotPasswordFailed(getErrorMsg(error))));
};

// 7. Reset Password
export const resetPassword = (data) => (dispatch) => {
  dispatch(authSlice.actions.resetPasswordRequest());
  api
    .put("/api/v1/user/password/reset", data)
    .then((res) => dispatch(authSlice.actions.resetPasswordSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.resetPasswordFailed(getErrorMsg(error))));
};

// 8. Update Password
export const updatePassword = (data) => (dispatch) => {
  dispatch(authSlice.actions.updatePasswordRequest());
  api
    .put("/api/v1/user/password/update", data)
    .then((res) => dispatch(authSlice.actions.updatePasswordSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.updatePasswordFailed(getErrorMsg(error))));
};

// 9. Reset transient state
export const resetAuthSlice = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export default authSlice.reducer;