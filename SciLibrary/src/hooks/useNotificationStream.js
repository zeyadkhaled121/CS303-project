import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  fetchNotifications,
  addNotification,
  setSseConnected,
  setFallbackPolling,
} from '../store/slices/notificationSlice';
import config from '../config/config';

export const useNotificationStream = (enabled = true) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const appStateRef = useRef(AppState.currentState);
  
  const pollingIntervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetriesRef = useRef(3);
  const reconnectTimeoutRef = useRef(null);


  const activateFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; 
    
    console.log('[Notifications] Activating fallback polling');
    dispatch(setFallbackPolling(true));
    
    // Initial fetch
    dispatch(fetchNotifications());
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      console.log('[Notifications] Fallback polling...');
      dispatch(fetchNotifications());
    }, 30000);
  }, [dispatch]);

  const deactivateFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('[Notifications] Deactivating fallback polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      dispatch(setFallbackPolling(false));
    }
  }, [dispatch]);

  const connectToStream = useCallback(async () => {
    if (!isAuthenticated || !enabled) return;

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        console.warn('[Notifications] No token found');
        return;
      }

      console.log('[Notifications] React Native environment detected - using polling only');
      console.log('[Notifications] SSE not supported in React Native, falling back to polling');

      
      dispatch(setSseConnected(false));
      activateFallbackPolling();
    } catch (error) {
      console.error('[Notifications] Connection Error:', error);
      dispatch(setSseConnected(false));
      activateFallbackPolling();
    }
  }, [isAuthenticated, enabled, dispatch, activateFallbackPolling]);

  const closeStream = useCallback(() => {
    console.log('[Notifications] Closing notification stream');
    deactivateFallbackPolling();
    dispatch(setSseConnected(false));
  }, [dispatch, deactivateFallbackPolling]);

  // Main effect: Connect on auth change or when enabled
  useEffect(() => {
    if (!isAuthenticated || !enabled) {
      closeStream();
      return;
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Connect immediately
    connectToStream();

    // Also fetch initial notifications
    dispatch(fetchNotifications());

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, enabled, connectToStream, closeStream, dispatch]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (!isAuthenticated || !enabled) return;

    const subscription = AppState.addEventListener('change', (state) => {
      appStateRef.current = state;

      if (state === 'active') {
        console.log('[Notifications] App returned to foreground');
        connectToStream();
        dispatch(fetchNotifications());
      } else if (state === 'background') {
        console.log('[Notifications] App moved to background');
        
      }
    });

    return () => {
      subscription?.remove?.();
    };
  }, [isAuthenticated, enabled, connectToStream, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);
};

export const useRefreshNotifications = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
};
