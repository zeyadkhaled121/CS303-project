import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

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
    authRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    
    authSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user || action.payload.data?.user || action.payload;
      state.message = action.payload.message || null;
    },

    authFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    sideActionSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message || action.payload;
    },

    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.message = action.payload || "Logged out successfully";
    },

    resetAuthSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    }
  },
});

export const { resetAuthSlice } = authSlice.actions;


export const register = (data) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.post("/api/v1/user/register", data)
    .then((res) => dispatch(authSlice.actions.sideActionSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const otpVerification = (email, otp) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.post("/api/v1/user/verify-email", { email, otp })
    .then((res) => dispatch(authSlice.actions.sideActionSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const login = (data) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.post("/api/v1/user/login", data)
    .then((res) => dispatch(authSlice.actions.authSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const logout = () => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.get("/api/v1/user/logout")
    .then((res) => dispatch(authSlice.actions.logoutSuccess(res.data.message)))
    .catch(() => {
      dispatch(authSlice.actions.logoutSuccess("Logged out"));
    });
};

export const getUser = () => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.get("/api/v1/user/me")
    .then((res) => dispatch(authSlice.actions.authSuccess(res.data)))
    .catch(() => {
      dispatch(authSlice.actions.resetAuthSlice());
    });
};

export const forgotPassword = (email) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.post("/api/v1/user/password/forgot", { email })
    .then((res) => dispatch(authSlice.actions.sideActionSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const resetPassword = (data) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.put("/api/v1/user/password/reset", data)
    .then((res) => dispatch(authSlice.actions.sideActionSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const updatePassword = (data) => (dispatch) => {
  dispatch(authSlice.actions.authRequest());
  api.put("/api/v1/user/password/update", data)
    .then((res) => dispatch(authSlice.actions.authSuccess(res.data)))
    .catch((error) => dispatch(authSlice.actions.authFailed(getErrorMsg(error))));
};

export const clearAuthErrors = () => (dispatch) => {
  dispatch(authSlice.actions.resetAuthSlice());
};

export default authSlice.reducer;