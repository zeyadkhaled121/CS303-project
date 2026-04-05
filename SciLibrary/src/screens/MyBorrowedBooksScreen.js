import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { cancelBorrow, fetchUserBorrowedBooks } from '../store/slices/borrowSlice';
import { COLORS } from '../../shared/designTokens';
import {
  formatDate,
  isBorrowActive,
  isBorrowPending,
  normalizeBorrowRecord,
} from '../utils/dataShapeNormalizer';
import { safeExtractDate } from '../utils/borrowUtils';

const STATUS_THEME = {
  Pending: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  Borrowed: { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  Overdue: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  Returned: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  Rejected: { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  Lost: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' },
  Damaged: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
};

const statusThemeFor = (status) => STATUS_THEME[status] || { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' };

const toDate = (value) => {
  return safeExtractDate(value);
};

export default function MyBorrowedBooksScreen({ navigation }) {
  const dispatch = useDispatch();
  const { userBorrowedBooks, loading } = useSelector((state) => state.borrow);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchUserBorrowedBooks());
  }, [dispatch]);

  const records = useMemo(
    () => (userBorrowedBooks || []).map((item) => normalizeBorrowRecord(item)),
    [userBorrowedBooks]
  );

  const activeCount = useMemo(() => records.filter((item) => isBorrowActive(item)).length, [records]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserBorrowedBooks());
    setRefreshing(false);
  };

  const onCancel = (record) => {
    Alert.alert('Cancel request', 'Are you sure you want to cancel this borrow request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: () => dispatch(cancelBorrow(record._id || record.id)),
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const theme = statusThemeFor(item.status);
    const dueDate = toDate(item.dueDate);
    const overdue = dueDate ? dueDate < new Date() && isBorrowActive(item) : false;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemTop}>
          <View style={[styles.coverPlaceholder, { backgroundColor: COLORS.neutral[100] }]}>
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={COLORS.brand.primary} />
          </View>

          <View style={styles.itemBody}>
            <View style={[styles.statusPill, { backgroundColor: theme.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.dot }]} />
              <Text style={[styles.statusPillText, { color: theme.text }]}>{item.status}</Text>
            </View>

            <Text style={styles.bookTitle} numberOfLines={2}>{item.bookTitle}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{item.bookAuthor}</Text>

            <View style={styles.datesWrap}>
              <Text style={styles.dateLabel}>Requested</Text>
              <Text style={styles.dateValue}>{formatDate(item.requestDate)}</Text>
            </View>

            <View style={styles.datesWrap}>
              <Text style={styles.dateLabel}>Return By</Text>
              <Text style={[styles.dateValue, overdue && styles.overdueDate]}>
                {item.status === 'Pending' ? 'Awaiting Approval' : formatDate(item.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {isBorrowPending(item) && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(item)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => {
              navigation.navigate('BookDetails', {
                book: {
                  _id: item.bookId,
                  id: item.bookId,
                  title: item.bookTitle,
                  author: item.bookAuthor,
                  image: item.bookImage ? { url: item.bookImage } : null,
                },
              });
            }}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>My Digital Shelf</Text>
        <Text style={styles.heroSubtitle}>Manage your personal collection and returns</Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Reading Progress</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>{activeCount}</Text>
          <Text style={styles.progressValueSuffix}>books active</Text>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Your Shelf is Empty</Text>
              <Text style={styles.emptySubtitle}>Browse catalog and borrow your first book.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 28,
    padding: 18,
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.text.onBrand,
    fontWeight: '900',
    fontSize: 30,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: '#ccfbf1',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    padding: 16,
    marginBottom: 12,
  },
  progressLabel: {
    color: COLORS.brand.primary,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  progressValue: {
    color: COLORS.text.primary,
    fontWeight: '900',
    fontSize: 42,
    lineHeight: 44,
  },
  progressValueSuffix: {
    color: COLORS.text.secondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  itemCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    padding: 12,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  coverPlaceholder: {
    width: 64,
    height: 84,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginBottom: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '900',
  },
  bookTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  bookAuthor: {
    marginTop: 2,
    color: COLORS.text.secondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  datesWrap: {
    marginTop: 8,
  },
  dateLabel: {
    color: COLORS.neutral[400],
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '900',
  },
  dateValue: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  overdueDate: {
    color: COLORS.status.unavailable,
  },
  actionsRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    color: COLORS.status.unavailable,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  detailsButtonText: {
    color: COLORS.brand.primary,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyState: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  emptySubtitle: {
    marginTop: 4,
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
});
