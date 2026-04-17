import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { recordBorrowBook } from '../store/slices/borrowSlice';
import {
  normalizeBook,
  normalizeBorrowRecord,
  isBorrowPending,
  isBorrowActive,
} from '../utils/dataShapeNormalizer';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../shared/designTokens';

export default function BookDetailsScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userBorrowedBooks = [] } = useSelector((state) => state.borrow);
  const [borrowing, setBorrowing] = useState(false);

  const incomingBook = route?.params?.book;
  const book = useMemo(() => normalizeBook(incomingBook || {}), [incomingBook]);

  const availableCopies = Number(book?.availableCopies);
  const hasStockCount = Number.isFinite(availableCopies);
  const status = (book?.status || '').toLowerCase();
  const isAvailable = hasStockCount ? availableCopies > 0 : status === 'available';

  const currentBorrowRecord = useMemo(() => {
    if (!isAuthenticated || !book?.id) return null;

    return userBorrowedBooks.find((record) => {
      const normalized = normalizeBorrowRecord(record);
      const sameBook = normalized.bookId === book.id;
      if (!sameBook) return false;
      return isBorrowPending(normalized) || isBorrowActive(normalized);
    }) || null;
  }, [book?.id, isAuthenticated, userBorrowedBooks]);

  const isPending = isBorrowPending(currentBorrowRecord);
  const isBorrowed = isBorrowActive(currentBorrowRecord);

  const hasOverdueBooks = useMemo(() => {
    if (!isAuthenticated) return false;
    return userBorrowedBooks.some((record) => {
      const normalized = normalizeBorrowRecord(record);
      return (normalized.status || '').toLowerCase() === 'overdue';
    });
  }, [isAuthenticated, userBorrowedBooks]);

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to borrow this book.', [
        {
          text: 'Go to Login',
          onPress: () => navigation.navigate('Login'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (hasOverdueBooks) {
      Alert.alert(
        'Borrowing blocked',
        'You have overdue books. Please return them before borrowing a new one.',
      );
      return;
    }

    if (isPending) {
      Alert.alert('Request pending', 'You already have a pending request for this book.');
      return;
    }

    if (isBorrowed) {
      Alert.alert('Already borrowed', 'You already have this book borrowed.');
      return;
    }

    if (!isAvailable) {
      Alert.alert('Out of stock', 'This book is currently unavailable.');
      return;
    }

    if (!book.id) {
      Alert.alert('Invalid book', 'This book record is incomplete. Please refresh and try again.');
      return;
    }

    setBorrowing(true);
    try {
      const result = await dispatch(recordBorrowBook(book.id));
      if (!result?.ok) {
        Alert.alert('Request failed', result?.error || 'Unable to submit borrow request.');
        return;
      }

      Alert.alert('Success', 'Borrow request submitted.', [
        {
          text: 'Open My Library',
          onPress: () => {
            const routeNames = navigation.getState?.()?.routeNames || [];
            if (routeNames.includes('UserTabs')) {
              navigation.navigate('UserTabs', { screen: 'MyBorrowedBooks' });
              return;
            }
            if (routeNames.includes('MyBorrowedBooks')) {
              navigation.navigate('MyBorrowedBooks');
              return;
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Request failed', 'Unexpected error while submitting borrow request.');
    } finally {
      setBorrowing(false);
    }
  };

  if (!book?.title) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Book not found</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.goBack()}>
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const buttonDisabled = borrowing || hasOverdueBooks || isPending || isBorrowed || !isAvailable;
  const buttonText = borrowing
    ? 'Submitting Request...'
    : hasOverdueBooks
      ? 'Blocked - Overdue Books'
      : isBorrowed
        ? 'Already Borrowed'
        : isPending
          ? 'Request Pending'
          : !isAvailable
            ? 'Out of Stock'
            : 'Borrow Book';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {book.imageUrl ? (
            <Image source={{ uri: book.imageUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderIcon}>BOOK</Text>
            </View>
          )}

          <View style={styles.statusPillWrap}>
            <View style={[styles.statusPill, isAvailable ? styles.availablePill : styles.unavailablePill]}>
              <Text style={[styles.statusPillText, isAvailable ? styles.availableText : styles.unavailableText]}>
                {isAvailable
                  ? `${hasStockCount ? `${availableCopies} available` : 'Available'}`
                  : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>by {book.author || 'Unknown Author'}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Genre</Text>
              <Text style={styles.metaValue}>{book.genre || 'General'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Copies</Text>
              <Text style={styles.metaValue}>{book.totalCopies ?? 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Edition</Text>
              <Text style={styles.metaValue}>{book.edition || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ISBN</Text>
              <Text style={styles.metaValue}>{book.isbn || 'N/A'}</Text>
            </View>
          </View>

          {!!book.publisher && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Publisher</Text>
              <Text style={styles.detailValue}>{book.publisher}</Text>
            </View>
          )}

          {!!book.description && (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{book.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.borrowButton, buttonDisabled && styles.borrowButtonDisabled]}
          onPress={handleBorrow}
          disabled={buttonDisabled}
        >
          {borrowing ? (
            <ActivityIndicator color={COLORS.text.onBrand} size="small" />
          ) : (
            <Text style={styles.borrowButtonText}>{buttonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.lg,
  },
  heroCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  coverImage: {
    width: '100%',
    height: 320,
  },
  coverPlaceholder: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}10`,
  },
  coverPlaceholderIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  statusPillWrap: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
  },
  statusPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
  },
  availablePill: {
    backgroundColor: `${COLORS.status.success}1A`,
    borderColor: `${COLORS.status.success}4D`,
  },
  unavailablePill: {
    backgroundColor: `${COLORS.status.warning}1A`,
    borderColor: `${COLORS.status.warning}4D`,
  },
  statusPillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  availableText: {
    color: COLORS.status.success,
  },
  unavailableText: {
    color: COLORS.status.warning,
  },
  detailsCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  bookTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bookAuthor: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metaItem: {
    width: '48%',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  metaLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metaValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
  },
  detailRow: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.sm,
  },
  detailLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  detailValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs,
  },
  descriptionBlock: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  descriptionTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    padding: SPACING.lg,
  },
  borrowButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  borrowButtonDisabled: {
    backgroundColor: COLORS.neutral[400],
  },
  borrowButtonText: {
    color: COLORS.text.onBrand,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background.secondary,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  emptyButtonText: {
    color: COLORS.text.onBrand,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
