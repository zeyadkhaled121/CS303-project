import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { toast } from "react-toastify";

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
    allUsers: [],
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
      state.user = action.payload.data?.user || null;
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
      state.isAuthenticated = false;
      state.user = null;
    },
    getUserRequest(state) {
        state.loading = true;
        state.error = null;
        state.message = null;
    },
    getUserSuccess(state, action) {
        state.loading = false;
        state.user = action.payload.data?.user || null;
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
        // sendToken returns { success, message, data: { user, token } }
        if (action.payload.data?.token) {
          localStorage.setItem("token", action.payload.data.token);
        }
        if (action.payload.data?.user) {
          state.user = action.payload.data.user;
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
        state.loading = false;
      },
      getAllUsersRequest(state) {
  state.loading = true;
},
getAllUsersSuccess(state, action) {
  state.loading = false;
  state.allUsers = action.payload; // تخزين الأعضاء هنا
},
getAllUsersFailed(state, action) {
  state.loading = false;
  state.error = action.payload;
},
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
    .then((res) => {
      // Store token for Bearer auth on subsequent requests
      const token = res.data.data?.token;
      if (token) localStorage.setItem("token", token);
      dispatch(authSlice.actions.loginSuccess(res.data));
      toast.success(res.data.message || "Logged in successfully.", { position: "bottom-right" });
      dispatch(authSlice.actions.resetAuthSlice());
    })
    .catch((error) => dispatch(authSlice.actions.loginFailed(getErrorMsg(error))));
};

// 4. User Logout
export const logout = () => (dispatch) => {
  dispatch(authSlice.actions.logoutRequest());
  api
    .get("/api/v1/user/logout")
    .then((res) => {
      localStorage.removeItem("token");
      dispatch(authSlice.actions.logoutSuccess(res.data.message));
      toast.success("Logged out successfully");
    })
    .catch((error) => {
      localStorage.removeItem("token");
      dispatch(authSlice.actions.logoutFailed(getErrorMsg(error)));
      toast.error(getErrorMsg(error));
    });
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
export const getAllUsers = () => (dispatch) => {
  dispatch(authSlice.actions.getAllUsersRequest());
  api
    .get("/api/v1/user/admin/users")
    .then((res) => dispatch(authSlice.actions.getAllUsersSuccess(res.data.data.users)))
    .catch((error) => dispatch(authSlice.actions.getAllUsersFailed(getErrorMsg(error))));
};

// 9. Reset transient state
export const resetAuthSlice = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export default authSlice.reducer;
