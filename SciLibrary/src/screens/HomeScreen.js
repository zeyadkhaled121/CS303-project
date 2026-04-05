import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBooks } from '../store/books';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { fetchUserBorrowedBooks } from '../store/slices/borrowSlice';
import { COLORS } from '../../shared/designTokens';
import { isBorrowActive, normalizeBorrowRecord } from '../utils/dataShapeNormalizer';
import { safeExtractDate } from '../utils/borrowUtils';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books } = useSelector((state) => state.book);
  const { userBorrowedBooks } = useSelector((state) => state.borrow);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);

  const refreshAll = async () => {
    await Promise.all([
      dispatch(fetchAllBooks()),
      dispatch(fetchUserBorrowedBooks()),
      dispatch(fetchNotifications()),
    ]);
  };

  useEffect(() => {
    refreshAll();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const normalizedBorrows = useMemo(
    () => (userBorrowedBooks || []).map((item) => normalizeBorrowRecord(item)),
    [userBorrowedBooks]
  );

  const stats = useMemo(() => {
    const active = normalizedBorrows.filter((item) => isBorrowActive(item));
    const dueToday = active.filter((item) => {
      if (!item.dueDate) return false;
      const due = safeExtractDate(item.dueDate);
      if (!due) return false;
      return due.toDateString() === new Date().toDateString();
    }).length;

    const overdue = active.filter((item) => {
      if (!item.dueDate) return false;
      const due = safeExtractDate(item.dueDate);
      if (!due) return false;
      return due < new Date();
    }).length;

    return {
      totalActive: active.length,
      dueToday,
      overdue,
      availableBooks: books?.length || 0,
      unread: unreadCount || notifications?.filter((n) => !n.read).length || 0,
    };
  }, [normalizedBorrows, unreadCount, notifications, books]);

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.statIcon, { backgroundColor: `${color}1A` }]}> 
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.neutral[300]} />
    </TouchableOpacity>
  );

  const ActionCard = ({ icon, label, onPress, color, badge }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.actionIconWrap, { backgroundColor: `${color}14` }]}> 
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        {!!badge && badge > 0 && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroRow}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>My Digital Shelf</Text>
          <Text style={styles.heroSubtitle}>Manage your personal collection and returns</Text>
          <View style={styles.heroUserRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>Hello, {user?.name || 'Reader'}!</Text>
              <Text style={styles.userMeta}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Library Collection</Text>
          <Text style={styles.progressValue}>{stats.availableBooks}</Text>
          <Text style={styles.progressCaption}>books available</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Library Activity</Text>
        <StatCard
          icon="book-open-page-variant"
          label="Books Borrowed"
          value={stats.totalActive}
          color={COLORS.brand.primary}
          onPress={() => navigation.navigate('MyBorrowedBooks')}
        />
        <StatCard
          icon="clock-alert"
          label="Due Today"
          value={stats.dueToday}
          color={stats.dueToday > 0 ? COLORS.brand.accent : COLORS.status.available}
          onPress={() => navigation.navigate('MyBorrowedBooks')}
        />
        <StatCard
          icon="alert-circle"
          label="Overdue Books"
          value={stats.overdue}
          color={stats.overdue > 0 ? COLORS.brand.danger : COLORS.status.available}
          onPress={() => navigation.navigate('MyBorrowedBooks')}
        />
        <StatCard
          icon="wallet"
          label="Library Wallet"
          value={`$${Number(user?.fines || 0).toFixed(2)}`}
          color={Number(user?.fines || 0) > 0 ? COLORS.brand.accent : COLORS.brand.primary}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <ActionCard
            icon="library-shelves"
            label="Browse Catalog"
            color={COLORS.brand.primary}
            onPress={() => navigation.navigate('Catalog')}
          />
          <ActionCard
            icon="book-multiple"
            label="My Library"
            color={COLORS.status.pending}
            onPress={() => navigation.navigate('MyBorrowedBooks')}
          />
          <ActionCard
            icon="bell"
            label="Notifications"
            color={COLORS.brand.accent}
            badge={stats.unread}
            onPress={() => navigation.navigate('NotificationCenter')}
          />
          <ActionCard
            icon="cog"
            label="Settings"
            color={COLORS.brand.secondary}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NotificationCenter')}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {(notifications || []).slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.notificationCard}
            onPress={() => navigation.navigate('NotificationCenter')}
            activeOpacity={0.9}
          >
            <View style={styles.notificationIcon}>
              <MaterialCommunityIcons name="bell-outline" size={18} color={COLORS.brand.primary} />
            </View>
            <View style={styles.notificationTextWrap}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title || 'Notification'}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={1}>
                {item.message || 'You have an update'}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {(!notifications || notifications.length === 0) && (
          <View style={styles.emptyNotifications}>
            <Text style={styles.emptyNotificationsText}>No recent notifications</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  heroRow: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 28,
    padding: 20,
  },
  heroTitle: {
    color: COLORS.text.onBrand,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    color: '#c9f2e6',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroUserRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.text.onBrand,
    fontWeight: '900',
    fontSize: 18,
  },
  userName: {
    color: COLORS.text.onBrand,
    fontSize: 15,
    fontWeight: '800',
  },
  userMeta: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
  },
  progressLabel: {
    color: COLORS.brand.primary,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressValue: {
    color: COLORS.text.primary,
    fontSize: 42,
    lineHeight: 46,
    marginTop: 8,
    fontWeight: '900',
  },
  progressCaption: {
    color: COLORS.text.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  section: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text.primary,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  viewAll: {
    color: COLORS.brand.primary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statTextWrap: {
    flex: 1,
  },
  statLabel: {
    color: COLORS.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.text.primary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionCard: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  actionLabel: {
    color: COLORS.text.primary,
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeWrap: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: COLORS.brand.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  badgeText: {
    color: COLORS.text.onBrand,
    fontSize: 9,
    fontWeight: '900',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
    marginBottom: 8,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    marginRight: 10,
  },
  notificationTextWrap: {
    flex: 1,
  },
  notificationTitle: {
    color: COLORS.text.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  notificationMessage: {
    color: COLORS.text.secondary,
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand.primary,
    marginLeft: 8,
  },
  emptyNotifications: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyNotificationsText: {
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
});
