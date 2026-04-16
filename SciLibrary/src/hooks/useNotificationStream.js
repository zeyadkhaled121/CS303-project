import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  addNotification,
  setSseConnected,
} from '../store/slices/notificationSlice';
import EventSource from 'react-native-sse';
import config from '../config/config';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { mapNotificationUrlToRoute } from '../utils/notificationNormalizer';
import { navigate } from '../navigation/navigationRef';

export const useNotificationStream = (enabled = true) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  
  const esRef = useRef(null);

  const connectToStream = useCallback(async () => {
    if (!isAuthenticated || !enabled || !user?.id) return;

    const token = await SecureStore.getItemAsync('token');
    if (!token) return;

    if (esRef.current) {
      esRef.current.close();
    }

    console.log('[Notifications] Connecting to SSE Stream for user:', user.id);
    const url = `${config.apiUrl}/api/v1/notifications/stream`;
    
    esRef.current = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    esRef.current.addEventListener('open', () => {
      console.log('[Notifications] SSE Stream Connected');
      dispatch(setSseConnected(true));
      dispatch(fetchNotifications());
    });

    // We saw event is 'notification_changed'
    esRef.current.addEventListener('notification_changed', (event) => {
      if (event.data) {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.reason === 'created' && parsed.notification) {
            const data = parsed.notification;
            const notification = {
              _id: parsed.notificationId,
              ...data,
            };

            dispatch(addNotification(notification));

            Toast.show({
              type: 'info',
              text1: notification.title || 'New Notification',
              text2: notification.message,
              visibilityTime: 4000,
              onPress: () => {
                Toast.hide();
                if (notification.actionUrl) {
                  const targetRoute = mapNotificationUrlToRoute(notification.actionUrl);
                  if (targetRoute) {
                    navigate(targetRoute.screen, targetRoute.params);
                  }
                }
              }
            });
          }
        } catch (e) {
          console.error('[Notifications] Failed to parse SSE message:', e);
        }
      }
    });

    esRef.current.addEventListener('error', (err) => {
      console.error('[Notifications] SSE Error:', err);
      dispatch(setSseConnected(false));
      
      // Auto reconnect after brief pause
      if (esRef.current?.readyState !== EventSource.CLOSED) {
        setTimeout(connectToStream, 5000);
      }
    });

  }, [isAuthenticated, enabled, user, dispatch]);

  const closeStream = useCallback(() => {
    if (esRef.current) {
      console.log('[Notifications] Disconnecting SSE Stream');
      esRef.current.close();
      esRef.current = null;
    }
    dispatch(setSseConnected(false));
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !enabled || !user) {
      closeStream();
      return;
    }
    connectToStream();
    return () => closeStream();
  }, [isAuthenticated, enabled, user, connectToStream, closeStream]);
};

export const useRefreshNotifications = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
};
