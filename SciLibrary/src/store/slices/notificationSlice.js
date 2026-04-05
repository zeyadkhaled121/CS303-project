import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';



export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { unreadOnly = false, skip = 0, limit = 20 } = params;
      const response = await API.get('/api/v1/notifications', {
        params: { unreadOnly, skip, limit }
      });
      return response.data.data || { notifications: [], unreadCount: 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/api/v1/notifications/unread-count');
      return response.data.data?.unreadCount || 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await API.put(`/api/v1/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await API.put('/api/v1/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/v1/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAll',
  async (_, { rejectWithValue }) => {
    try {
      await API.delete('/api/v1/notifications');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notifications');
    }
  }
);



const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  message: null,
  lastFetch: null,
  sseConnected: false,
  fallbackPollingActive: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Receive notification from SSE
    addNotification: (state, action) => {
      if (!action.payload || !action.payload._id) {
        return;
      }
      const exists = state.items.find(n => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    // Update SSE connection status
    setSseConnected: (state, action) => {
      state.sseConnected = action.payload;
      if (action.payload) {
        state.fallbackPollingActive = false;
      }
    },
    // Track fallback polling status
    setFallbackPolling: (state, action) => {
      state.fallbackPollingActive = action.payload;
    },
    // Clear old notifications (keep max 50)
    clearOldNotifications: (state) => {
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    // Reset notification state
    resetNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
      state.message = null;
      state.sseConnected = false;
      state.fallbackPollingActive = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const payload = action.payload || { notifications: [], unreadCount: 0 };
        state.loading = false;
        state.items = Array.isArray(payload.notifications) ? payload.notifications : [];
        state.unreadCount = payload.unreadCount || 0;
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        console.warn('Failed to fetch unread count:', action.payload);
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(n => n._id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.message = 'Notification marked as read';
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Mark All as Read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => (n.read = true));
        state.unreadCount = 0;
        state.message = 'All notifications marked as read';
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const idx = state.items.findIndex(n => n._id === action.payload);
        if (idx >= 0) {
          const wasUnread = !state.items[idx].read;
          state.items.splice(idx, 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.message = 'Notification deleted';
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete All Notifications
    builder
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
        state.message = 'All notifications deleted';
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  addNotification,
  setSseConnected,
  setFallbackPolling,
  clearOldNotifications,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
