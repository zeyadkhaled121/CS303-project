import { createSlice } from '@reduxjs/toolkit';

const popupSlice = createSlice({
  name: 'popup',
  initialState: {
    borrowModalVisible: false,
    returnModalVisible: false,
    settingsModalVisible: false,
    addBookModalVisible: false,
    confirmModalVisible: false,
    confirmModalData: {
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    },
  },
  reducers: {
    toggleBorrowModal(state) {
      state.borrowModalVisible = !state.borrowModalVisible;
    },
    openBorrowModal(state) {
      state.borrowModalVisible = true;
    },
    closeBorrowModal(state) {
      state.borrowModalVisible = false;
    },

    toggleReturnModal(state) {
      state.returnModalVisible = !state.returnModalVisible;
    },
    openReturnModal(state) {
      state.returnModalVisible = true;
    },
    closeReturnModal(state) {
      state.returnModalVisible = false;
    },

    toggleSettingsModal(state) {
      state.settingsModalVisible = !state.settingsModalVisible;
    },
    openSettingsModal(state) {
      state.settingsModalVisible = true;
    },
    closeSettingsModal(state) {
      state.settingsModalVisible = false;
    },

    toggleAddBookModal(state) {
      state.addBookModalVisible = !state.addBookModalVisible;
    },
    openAddBookModal(state) {
      state.addBookModalVisible = true;
    },
    closeAddBookModal(state) {
      state.addBookModalVisible = false;
    },

    openConfirmModal(state, action) {
      state.confirmModalVisible = true;
      state.confirmModalData = {
        title: action.payload?.title || 'Confirm',
        message: action.payload?.message || 'Are you sure?',
        onConfirm: action.payload?.onConfirm || null,
        onCancel: action.payload?.onCancel || null,
      };
    },
    closeConfirmModal(state) {
      state.confirmModalVisible = false;
      state.confirmModalData = {
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      };
    },

    closeAllModals(state) {
      state.borrowModalVisible = false;
      state.returnModalVisible = false;
      state.settingsModalVisible = false;
      state.addBookModalVisible = false;
      state.confirmModalVisible = false;
    },
  },
});

export const {
  toggleBorrowModal,
  openBorrowModal,
  closeBorrowModal,
  toggleReturnModal,
  openReturnModal,
  closeReturnModal,
  toggleSettingsModal,
  openSettingsModal,
  closeSettingsModal,
  toggleAddBookModal,
  openAddBookModal,
  closeAddBookModal,
  openConfirmModal,
  closeConfirmModal,
  closeAllModals,
} = popupSlice.actions;

export default popupSlice.reducer;
