import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import API from '../api/axios';
import { COLORS } from '../../shared/designTokens';


export default function StatsScreen({ navigation }) {
  const dispatch = useDispatch();
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

  const [stats, setStats] = useState({
    totalPending: 0,
    totalBorrowed: 0,
    totalOverdue: 0,
    totalReturned: 0,
    totalBooks: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const response = await API.get('/api/v1/borrow/admin/stats', {
        timeout: 10000,
      });

      const data = response?.data?.data || {};
      setStats({
        totalPending: data.totalPending || 0,
        totalBorrowed: data.totalBorrowed || 0,
        totalOverdue: data.totalOverdue || 0,
        totalReturned: data.totalReturned || 0,
        totalBooks: data.totalBooks || 0,
        totalUsers: data.totalUsers || 0,
      });
      setError(null);
    } catch (err) {
      console.error('Stats fetch error:', err);
      const message = err.response?.data?.message || 'Failed to fetch stats. Please try again.';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  // Calculate loan rate
  const totalCopies = stats.totalBooks || 1;
  const activeLoans = stats.totalBorrowed;
  const loanRate = ((activeLoans / totalCopies) * 100).toFixed(1);

  // Metric cards data
  const metricCards = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      icon: 'book',
      color: COLORS.brand.primary,
    },
    {
      label: 'Active Loans',
      value: stats.totalBorrowed,
      icon: 'hand-paper-o',
      color: COLORS.brand.accent,
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: 'users',
      color: COLORS.brand.secondary,
    },
    {
      label: 'Returned Items',
      value: stats.totalReturned,
      icon: 'history',
      color: COLORS.status.available,
    },
  ];

  const availableBooks = Math.max(0, totalCopies - activeLoans);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.brand.primary]} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Library Analytics</Text>
          <Text style={styles.subtitle}>Live Dashboard</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.headerStat}>
            <Text style={styles.statLabel}>LOAN RATE</Text>
            <Text style={styles.loanRate}>{loanRate}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.headerStat}>
            <Text style={styles.statLabel}>MEMBERS</Text>
            <Text style={styles.memberCount}>{stats.totalUsers}</Text>
          </View>
        </View>
      </View>

      {/* Metric Cards Grid (2 columns) */}
      <View style={styles.cardsGrid}>
        {metricCards.map((card, idx) => (
          <View key={idx} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: card.color + '20' }]}>
              <Icon name={card.icon} size={22} color={card.color} />
            </View>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
          </View>
        ))}
      </View>

      {/* Status Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Overview</Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { borderLeftColor: COLORS.orange }]}>
            <View style={styles.statusTop}>
              <Icon name="clock" size={20} color={COLORS.orange} />
              <Text style={styles.statusLabel}>Pending</Text>
            </View>
            <Text style={[styles.statusValue, { color: COLORS.orange }]}>
              {stats.totalPending}
            </Text>
            <Text style={styles.statusHint}>Awaiting Approval</Text>
          </View>

          <View style={[styles.statusCard, { borderLeftColor: COLORS.red }]}>
            <View style={styles.statusTop}>
              <Icon name="exclamation-circle" size={20} color={COLORS.red} />
              <Text style={styles.statusLabel}>Overdue</Text>
            </View>
            <Text style={[styles.statusValue, { color: COLORS.red }]}>
              {stats.totalOverdue}
            </Text>
            <Text style={styles.statusHint}>Past Due Date</Text>
          </View>
        </View>
      </View>

      {/* Availability Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability Status</Text>

        <View style={styles.availabilityBox}>
          <View style={styles.availabilityItem}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.brand.primary }]} />
            <View style={styles.availabilityText}>
              <Text style={styles.availabilityLabel}>Borrowed</Text>
              <Text style={styles.availabilityValue}>
                {activeLoans} ({loanRate}%)
              </Text>
            </View>
          </View>

          <View style={[styles.progressBar, { marginVertical: 12 }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${loanRate}%`,
                  backgroundColor: COLORS.brand.primary,
                },
              ]}
            />
          </View>

          <View style={styles.availabilityItem}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.brand.accent }]} />
            <View style={styles.availabilityText}>
              <Text style={styles.availabilityLabel}>Available</Text>
              <Text style={styles.availabilityValue}>
                {availableBooks} ({(100 - loanRate).toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>

        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatBox}>
            <Text style={styles.quickStatLabel}>Total Transactions</Text>
            <Text style={styles.quickStatValue}>
              {stats.totalReturned + stats.totalBorrowed + stats.totalPending}
            </Text>
          </View>

          <View style={styles.quickStatBox}>
            <Text style={styles.quickStatLabel}>Success Rate</Text>
            <Text style={styles.quickStatValue}>
              {stats.totalReturned + stats.totalBorrowed + stats.totalPending > 0
                ? (
                    ((stats.totalReturned + stats.totalBorrowed) /
                      (stats.totalReturned + stats.totalBorrowed + stats.totalPending)) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </Text>
          </View>
        </View>
      </View>

      {/* Last Updated Info */}
      <View style={styles.footer}>
        <Icon name="info-circle" size={14} color={COLORS.text.secondary} />
        <Text style={styles.footerText}>Last updated: Just now • Pull to refresh</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // Header
  header: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStat: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loanRate: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.brand.primary,
    marginTop: 2,
  },
  memberCount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },

  // Cards Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text.primary,
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
  },

  // Status Overview
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: 6,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  statusHint: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },

  // Availability
  availabilityBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  availabilityText: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  availabilityValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Quick Stats
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickStatBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.brand.primary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});
