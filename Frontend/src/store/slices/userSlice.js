import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || "Something went wrong";

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    // Fetch all users
    fetchUsersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(state, action) {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Promote user
    promoteUserRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    promoteUserSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    promoteUserFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Demote user
    demoteUserRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    demoteUserSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    demoteUserFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete user
    deleteUserRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    deleteUserSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    deleteUserFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    resetUserSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
  },
});

// ── Async Actions ──

export const fetchAllUsers = () => (dispatch) => {
  dispatch(userSlice.actions.fetchUsersRequest());
  api
    .get("/api/v1/user/admin/users")
    .then((res) =>
      dispatch(userSlice.actions.fetchUsersSuccess(res.data.data.users))
    )
    .catch((error) =>
      dispatch(userSlice.actions.fetchUsersFailed(getErrorMsg(error)))
    );
};

export const promoteUser = (userId) => (dispatch) => {
  dispatch(userSlice.actions.promoteUserRequest());
  api
    .put(`/api/v1/user/admin/user/promote/${userId}`)
    .then((res) =>
      dispatch(userSlice.actions.promoteUserSuccess(res.data.message))
    )
    .catch((error) =>
      dispatch(userSlice.actions.promoteUserFailed(getErrorMsg(error)))
    );
};

export const demoteUser = (userId) => (dispatch) => {
  dispatch(userSlice.actions.demoteUserRequest());
  api
    .put(`/api/v1/user/admin/user/demote/${userId}`)
    .then((res) =>
      dispatch(userSlice.actions.demoteUserSuccess(res.data.message))
    )
    .catch((error) =>
      dispatch(userSlice.actions.demoteUserFailed(getErrorMsg(error)))
    );
};

export const deleteUser = (userId) => (dispatch) => {
  dispatch(userSlice.actions.deleteUserRequest());
  api
    .delete(`/api/v1/user/admin/user/delete/${userId}`)
    .then((res) =>
      dispatch(userSlice.actions.deleteUserSuccess(res.data.message))
    )
    .catch((error) =>
      dispatch(userSlice.actions.deleteUserFailed(getErrorMsg(error)))
    );
};

export const resetUserSlice = () => (dispatch) => {
  dispatch(userSlice.actions.resetUserSlice());
};

export default userSlice.reducer;
