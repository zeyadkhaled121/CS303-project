import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
      state.isAuthenticated = true;
      state.user = action.payload.user;
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
      state.message = action.payload.message;
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
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
        state.message = action.payload;
    },
    updatePasswordFailed(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    // Get User Details
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

// --- Async Actions Using .then() and .catch() ---

// 1. User Registration
export const register = (data) => (dispatch) => {
  dispatch(authSlice.actions.registerRequest());
  axios.post("http://localhost:4000/api/v1/auth/register", data, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.registerSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.registerFailed(error.response.data.message));
  });
};

// 2. OTP Verification
export const otpVerification = (email, otp) => (dispatch) => {
  dispatch(authSlice.actions.otpVerificationRequest());
  axios.post("http://localhost:4000/api/v1/auth/verify-otp", { email, otp }, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.otpVerificationSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.otpVerificationFailed(error.response.data.message));
  });
};

// 3. User Login
export const login = (data) => (dispatch) => {
  dispatch(authSlice.actions.loginRequest());
  axios.post("http://localhost:4000/api/v1/auth/login", data, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.loginSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.loginFailed(error.response.data.message));
  });
};

// 4. User Logout
export const logout = () => (dispatch) => {
    
  dispatch(authSlice.actions.logoutRequest());
  axios.get("http://localhost:4000/api/v1/auth/logout", {
    withCredentials: true,
  })
  .then((res) => {
    dispatch(authSlice.actions.logoutSuccess(res.data.message));
        dispatch(authSlice.actions.resetAuthSlice());

  })
  .catch((error) => {
    dispatch(authSlice.actions.logoutFailed(error.response.data.message));
  });
};

//5. reset auth slice
export const resetAuthSlice = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};
// 6. Get User Details
export const getUser = () => (dispatch) => {
    
  dispatch(authSlice.actions.getUserRequest());
  axios.get("http://localhost:4000/api/v1/auth/me", {
    withCredentials: true,
  })
  .then((res) => {
    dispatch(authSlice.actions.getUserSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.getUserFailed(error.response.data.message));
  });
};
// 7. Forgot Password
export const forgotPassword = (email) => (dispatch) => {
  dispatch(authSlice.actions.forgotPasswordRequest());
  axios.post("http://localhost:4000/api/v1/auth/password/forgot", { email }, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.forgotPasswordSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.forgotPasswordFailed(error.response.data.message));
  });
};
// 8. Reset Password
export const resetPassword = (token, data) => (dispatch) => {
  dispatch(authSlice.actions.resetPasswordRequest());
  axios.put(`http://localhost:4000/api/v1/auth/password/reset/${token}`, { data }, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.resetPasswordSuccess(res.data));
  })
  .catch((error) => {
    dispatch(authSlice.actions.resetPasswordFailed(error.response.data.message));
  });
};
// 9. Update Password
export const updatePassword = (data) => (dispatch) => {
  dispatch(authSlice.actions.updatePasswordRequest());
  axios.put("http://localhost:4000/api/v1/auth/password/update", data, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
  .then((res) => {
    dispatch(authSlice.actions.updatePasswordSuccess(res.data.message));
  })
  .catch((error) => {
    dispatch(authSlice.actions.updatePasswordFailed(error.response.data.message));
  });
};
// Default Export
export default authSlice.reducer;