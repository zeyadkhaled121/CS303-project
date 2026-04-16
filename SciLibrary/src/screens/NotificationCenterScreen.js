import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Feather as Icon } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../store/slices/notificationSlice';
import {
  formatNotificationTime,
  getNotificationColor,
  getNotificationIcon,
  getNotificationTypeLabel,
  mapNotificationUrlToRoute,
} from '../utils/notificationNormalizer';


export default function NotificationCenter({ navigation }) {
  const dispatch = useDispatch();
  const { items, unreadCount, loading, error, fallbackPollingActive } = useSelector(
    state => state.notifications
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  };

  const navigateFromNotification = useCallback(
    (route) => {
      if (!route?.screen) return;

      const rootRouteNames = navigation.getState?.()?.routeNames || [];
      const userTabScreens = new Set(['Home', 'Catalog', 'MyBorrowedBooks', 'Settings']);
      const userStackScreens = new Set(['BookDetails']);
      const adminStackScreens = new Set([
        'AdminDashboard',
        'BorrowRequests',
        'BookDetails',
        'MyBorrowedBooks',
        'AddEditBook',
        'AllUsers',
        'AddNewAdmin',
        'Stats',
        'Settings',
      ]);

      if (rootRouteNames.includes('UserStackScreen')) {
        if (userTabScreens.has(route.screen)) {
          navigation.navigate('UserStackScreen', {
            screen: 'UserTabs',
            params: {
              screen: route.screen,
              params: route.params,
            },
          });
          return;
        }

        if (userStackScreens.has(route.screen)) {
          navigation.navigate('UserStackScreen', {
            screen: route.screen,
            params: route.params,
          });
          return;
        }

        navigation.navigate('UserStackScreen', {
          screen: 'UserTabs',
          params: { screen: 'Home' },
        });
        return;
      }

      if (rootRouteNames.includes('AdminStackScreen')) {
        const targetScreen = adminStackScreens.has(route.screen)
          ? route.screen
          : 'AdminDashboard';

        navigation.navigate('AdminStackScreen', {
          screen: targetScreen,
          params: route.params,
        });
        return;
      }

      navigation.navigate(route.screen, route.params);
    },
    [navigation]
  );

  useEffect(() => {
    // Fetch notifications on screen load
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    // Show error toast if fetch fails
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        duration: 3000,
      });
    }
  }, [error]);

  const handleNotificationPress = useCallback(
    async (notification) => {
      const notificationId = notification?._id || notification?.id;

      // Mark as read if not already
      if (!notification.read && notificationId) {
        dispatch(markNotificationAsRead(notificationId));
      }

      // Navigate if actionUrl exists
      if (notification.actionUrl) {
        const route = mapNotificationUrlToRoute(notification.actionUrl);
        if (route) {
          navigateFromNotification(route);
        }
      }
    },
    [dispatch, navigateFromNotification]
  );

  const handleDeleteNotification = useCallback(
    (notificationId) => {
      Alert.alert(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              dispatch(deleteNotification(notificationId));
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Notification deleted',
              });
            },
          },
        ]
      );
    },
    [dispatch]
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Toast.show({
        type: 'info',
        text1: 'All notifications already read',
      });
      return;
    }

    dispatch(markAllAsRead());
    Toast.show({
      type: 'success',
      text1: 'Marked all as read',
    });
  }, [dispatch, unreadCount]);

  const handleDeleteAll = useCallback(() => {
    if (items.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No notifications to delete',
      });
      return;
    }

    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteAllNotifications());
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'All notifications deleted',
            });
          },
        },
      ]
    );
  }, [dispatch, items.length]);

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: getNotificationColor(item.type, item.severity) },
          ]}
        >
          <Icon
            name={getNotificationIcon(item.type)}
            size={18}
            color="#fff"
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.typeLabel}>
          {getNotificationTypeLabel(item.type)}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {formatNotificationTime(item.timestamp)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item._id || item.id)}
      >
        <Icon name="trash-2" size={16} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inbox" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Status Indicator */}
      {fallbackPollingActive && (
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Using fallback mode (30-second sync)
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {items.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, unreadCount > 0 ? styles.buttonEnabled : styles.buttonDisabled]}
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Icon
              name="check"
              size={16}
              color={unreadCount > 0 ? '#10B981' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.actionButtonText,
                unreadCount > 0 ? styles.buttonTextEnabled : styles.buttonTextDisabled,
              ]}
            >
              Mark All Read
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeleteAll}
          >
            <Icon name="trash-2" size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
              Delete All
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => String(item._id || item.id)}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.flatListContent}
          scrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flatListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  buttonEnabled: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonTextEnabled: {
    color: '#10B981',
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },

  // Notification Card
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
