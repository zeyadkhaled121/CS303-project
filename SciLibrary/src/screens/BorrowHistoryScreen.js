import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState, LoadingSpinner } from '../components/UITemplates';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../shared/designTokens';
import { formatDateDisplay, safeExtractDate } from '../utils/borrowUtils';


export default function BorrowHistoryScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { books: borrowedBooks } = useSelector(state => state.borrow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    loadBorrowHistory();
  }, []);

  const loadBorrowHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      
      if (borrowedBooks && borrowedBooks.length > 0) {
        
        const history = borrowedBooks.map(book => ({
          id: book._id || book.id,
          book: book,
          borrowDate: book.borrowedAt || book.createdAt,
          returnDate: book.returnedAt || null,
          dueDate: book.dueDate,
          status: getBookStatus(book),
          fine: book.fine || 0,
        }));
        setHistoryList(history);
      } else {
        
        const response = await fetch(`http://192.168.1.5:5000/api/v1/borrow/history`);
        if (response.ok) {
          const data = await response.json();
          setHistoryList(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading borrow history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBookStatus = (book) => {
    if (book.returnedAt) return 'Returned';
    const dueDateObj = safeExtractDate(book.dueDate);
    if (dueDateObj && dueDateObj < new Date()) return 'Overdue';
    return 'Active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Returned':
        return COLORS.status.returned;
      case 'Active':
        return COLORS.status.pending;
      case 'Overdue':
        return COLORS.status.overdue;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Returned':
        return 'check-circle';
      case 'Active':
        return 'clock-outline';
      case 'Overdue':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  if (loading && historyList.length === 0) return <LoadingSpinner message="Loading history..." />;

  if (!loading && (!historyList || historyList.length === 0)) {
    return (
      <EmptyState
        icon="history"
        title="No Borrow History"
        subtitle="Your borrowed books will appear here"
        actionLabel="Browse Books"
        onActionPress={() => navigation.navigate('Catalog')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={historyList}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={({ item }) => <BorrowHistoryItem item={item} navigation={navigation} />}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadBorrowHistory}
        ListHeaderComponent={<HistoryHeader count={historyList.length} />}
      />
    </View>
  );
}

const HistoryHeader = ({ count }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Borrow History</Text>
    <Text style={styles.headerSubtitle}>{count} book{count !== 1 ? 's' : ''}</Text>
  </View>
);

const BorrowHistoryItem = ({ item, navigation }) => {
  const book = item.book;
  const isOverdue = item.status === 'Overdue';
  const itemDueDate = safeExtractDate(item.dueDate);
  const daysOverdue = (isOverdue && itemDueDate)
    ? Math.floor((new Date() - itemDueDate) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <TouchableOpacity
      style={[styles.item, isOverdue && styles.itemOverdue]}
      onPress={() => navigation.navigate('BookDetails', { book })}
      activeOpacity={0.7}
    >
      {/* Left: Book Icon */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="book"
          size={32}
          color={getStatusColor(item.status)}
        />
      </View>

      {/* Center: Book Info */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title || 'Unknown Book'}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author || 'Unknown Author'}
        </Text>

        {/* Dates */}
        <View style={styles.dateRow}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={12}
            color={COLORS.text.tertiary}
          />
          <Text style={styles.dateLabel}>Borrowed:</Text>
          <Text style={styles.dateValue}>
            {formatDate(item.borrowDate)}
          </Text>
        </View>

        {item.returnDate ? (
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={12}
              color={COLORS.status.returned}
            />
            <Text style={styles.dateLabel}>Returned:</Text>
            <Text style={styles.dateValue}>
              {formatDate(item.returnDate)}
            </Text>
          </View>
        ) : (
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-alert"
              size={12}
              color={getStatusColor(item.status)}
            />
            <Text style={styles.dateLabel}>Due:</Text>
            <Text style={[styles.dateValue, isOverdue && styles.overdueText]}>
              {formatDate(item.dueDate)}
              {isOverdue && ` (${daysOverdue}d overdue)`}
            </Text>
          </View>
        )}
      </View>

      {/* Right: Status Badge */}
      <View style={styles.rightSection}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>

        {item.fine > 0 && (
          <View style={styles.fineContainer}>
            <Text style={styles.fineText}>Fine: ${item.fine}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper Functions


const formatDate = (dateString) => { 
  return formatDateDisplay(dateString); 
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Returned':
      return COLORS.status.returned;
    case 'Active':
      return COLORS.status.pending;
    case 'Overdue':
      return COLORS.status.overdue;
    default:
      return COLORS.text.secondary;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Returned':
      return 'check-circle';
    case 'Active':
      return 'clock-outline';
    case 'Overdue':
      return 'alert-circle';
    default:
      return 'help-circle';
  }
};

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  listContent: {
    padding: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand.primary,
    ...SHADOWS.sm,
  },
  itemOverdue: {
    borderLeftColor: COLORS.status.overdue,
    backgroundColor: COLORS.status.overdue + '08',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  author: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  overdueText: {
    color: COLORS.status.overdue,
    fontWeight: '700',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  fineContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.status.danger + '20',
    borderRadius: BORDER_RADIUS.sm,
  },
  fineText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: COLORS.status.danger,
  },
});
