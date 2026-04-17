import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather as Icon } from '@expo/vector-icons';
import {
  fetchAllBorrowedBooks,
  approveBorrow,
  rejectBorrow,
  returnBook,
  reportIssue,
} from '../store/slices/borrowSlice';
import Toast from 'react-native-toast-message';
import {
  ApproveRequestModal,
  ReturnBookModal,
  ReportIssueModal,
  RejectRequestModal,
} from '../components/BorrowModals';
import {
  safeExtractBookTitle,
  safeExtractBorrowerName,
  formatLoanStatus,
  getStatusColor,
  calculateDaysOverdue,
  calculateDaysUntilDue,
  formatDateDisplay,
} from '../utils/borrowUtils';
import { COLORS } from '../../shared/designTokens';

export default function BorrowRequestsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { allBorrowedBooks, loading } = useSelector((state) => state.borrow);
  const { user } = useSelector((state) => state.auth);

  // Role validation - Admin only
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>Admin access required</Text>
        </View>
      </View>
    );
  }

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal visibility states
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchAllBorrowedBooks());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllBorrowedBooks());
    setRefreshing(false);
  };

  const handleApproveOpen = (borrow) => {
    setSelectedBorrow(borrow);
    setApproveModalVisible(true);
  };

  const handleApproveConfirm = async (dueDate) => {
    setActionLoading(true);
    try {
      const borrowId = selectedBorrow._id || selectedBorrow.id;
      const result = await dispatch(approveBorrow(borrowId, dueDate));
      if (result.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Request approved successfully',
          duration: 3000,
        });
        setApproveModalVisible(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to approve request',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOpen = (borrow) => {
    setSelectedBorrow(borrow);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async (remarks) => {
    setActionLoading(true);
    try {
      const borrowId = selectedBorrow._id || selectedBorrow.id;
      const result = await dispatch(rejectBorrow(borrowId, remarks));
      if (result.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Request rejected',
          duration: 3000,
        });
        setRejectModalVisible(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to reject request',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOpen = (borrow) => {
    setSelectedBorrow(borrow);
    setReturnModalVisible(true);
  };

  const handleReturnConfirm = async () => {
    setActionLoading(true);
    try {
      const borrowId = selectedBorrow._id || selectedBorrow.id;
      const result = await dispatch(returnBook(borrowId));
      if (result.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Book return confirmed',
          duration: 3000,
        });
        setReturnModalVisible(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to confirm return',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueOpen = (borrow) => {
    setSelectedBorrow(borrow);
    setIssueModalVisible(true);
  };

  const handleIssueConfirm = async (issueType, remarks) => {
    setActionLoading(true);
    try {
      const borrowId = selectedBorrow._id || selectedBorrow.id;
      const result = await dispatch(reportIssue(borrowId, issueType, remarks));
      if (result.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Issue reported successfully',
          duration: 3000,
        });
        setIssueModalVisible(false);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to report issue',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredBorrows = () => {
    switch (activeTab) {
      case 'pending':
        return allBorrowedBooks.filter((b) => b.status === 'Pending');
      case 'active':
        return allBorrowedBooks.filter((b) =>
          ['Borrowed', 'Overdue'].includes(b.status)
        );
      case 'all':
      default:
        return allBorrowedBooks;
    }
  };

  const BorrowRequestCard = ({ item }) => {
    const daysOverdue = calculateDaysOverdue(item.dueDate);
    const daysUntilDue = calculateDaysUntilDue(item.dueDate);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {safeExtractBookTitle(item)}
            </Text>
            <Text style={styles.userInfo} numberOfLines={1}>
              {safeExtractBorrowerName(item)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{formatLoanStatus(item.status)}</Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="calendar" size={14} color={COLORS.neutral[600]} />
            <Text style={styles.detailText}>
              {formatDateDisplay(item.createdAt || item.requestDate || item.borrowDate)}
            </Text>
          </View>

          {item.dueDate && (
            <View style={styles.detailItem}>
              <Icon
                name={item.status === 'Overdue' ? 'alert-circle' : 'clock'}
                size={14}
                color={
                  item.status === 'Overdue' ? COLORS.brand.danger : COLORS.brand.primary
                }
              />
              <Text
                style={[
                  styles.detailText,
                  item.status === 'Overdue' && { color: COLORS.brand.danger },
                ]}
              >
                Due: {formatDateDisplay(item.dueDate)}
                {daysOverdue > 0 && ` (${daysOverdue}d overdue)`}
                {daysUntilDue > 0 &&
                  item.status === 'Borrowed' &&
                  ` (${daysUntilDue}d left)`}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {item.status === 'Pending' && (
            <>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApproveOpen(item)}
                disabled={actionLoading}
              >
                <Icon name="check" size={16} color={COLORS.status.available} />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleRejectOpen(item)}
                disabled={actionLoading}
              >
                <Icon name="x" size={16} color={COLORS.brand.danger} />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {(item.status === 'Borrowed' || item.status === 'Overdue') && (
            <>
              <TouchableOpacity
                style={styles.returnBtn}
                onPress={() => handleReturnOpen(item)}
                disabled={actionLoading}
              >
                <Icon name="corner-down-left" size={16} color={COLORS.brand.primary} />
                <Text style={styles.returnBtnText}>Return</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.issueBtn}
                onPress={() => handleIssueOpen(item)}
                disabled={actionLoading}
              >
                <Icon name="alert-triangle" size={16} color={COLORS.brand.accent} />
                <Text style={styles.issueBtnText}>Report Issue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const filteredBorrows = getFilteredBorrows();

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['pending', 'active', 'all'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && filteredBorrows.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : filteredBorrows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📋</Text>
          <Text style={styles.emptyTitle}>No Requests Found</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'pending' ? 'All pending requests processed' : 'No borrow records'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBorrows}
          renderItem={({ item }) => <BorrowRequestCard item={item} />}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.brand.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Enhanced Modals */}
      <ApproveRequestModal
        visible={approveModalVisible}
        borrow={selectedBorrow}
        loading={actionLoading}
        onClose={() => setApproveModalVisible(false)}
        onConfirm={handleApproveConfirm}
      />

      <ReturnBookModal
        visible={returnModalVisible}
        borrow={selectedBorrow}
        loading={actionLoading}
        onClose={() => setReturnModalVisible(false)}
        onConfirm={handleReturnConfirm}
      />

      <ReportIssueModal
        visible={issueModalVisible}
        borrow={selectedBorrow}
        loading={actionLoading}
        onClose={() => setIssueModalVisible(false)}
        onConfirm={handleIssueConfirm}
      />

      <RejectRequestModal
        visible={rejectModalVisible}
        borrow={selectedBorrow}
        loading={actionLoading}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={handleRejectConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.brand.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  tabTextActive: {
    color: COLORS.brand.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },

  // Card Styles
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Details
  details: {
    marginBottom: 12,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.gray[600],
    flex: 1,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  approveBtn: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  approveBtnText: {
    color: COLORS.status.available,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  rejectBtn: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: {
    color: COLORS.brand.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  returnBtn: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFD3FF',
  },
  returnBtnText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  issueBtn: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  issueBtnText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
