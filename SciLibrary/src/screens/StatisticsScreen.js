import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../api/axios';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/designTokens';
import {
  Card,
  Badge,
  LoadingSpinner,
  ErrorState,
  SectionHeader,
  Divider,
  EmptyState,
} from '../components/UITemplates';

const StatisticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { borrowedBooks = [], borrowHistory = [] } = useSelector((state) => state.borrow || {});

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

  // State
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); 

  
  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/users/statistics', {
        params: { timeRange },
      });

      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={{ width: 24 }} />
        </View>
        <LoadingSpinner message="Loading your statistics..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ErrorState
            title="Failed to Load Statistics"
            message={error}
            onRetry={fetchStatistics}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || (borrowedBooks.length === 0 && borrowHistory.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Statistics</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <EmptyState
            icon="bar-chart-outline"
            title="No Statistics Yet"
            subtitle="Borrow books to see your reading statistics"
            actionLabel="Browse Catalog"
            onActionPress={() => navigation.navigate('Catalog')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoryStats = stats?.categories || [];
  const monthlyTrends = stats?.monthlyTrends || [];
  const achievements = stats?.achievements || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <TouchableOpacity
          onPress={fetchStatistics}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh" size={20} color={COLORS.brand.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Filter */}
        <View style={styles.timeRangeContainer}>
          {[
            { key: 'all', label: 'All Time' },
            { key: '3months', label: '3 Months' },
            { key: '6months', label: '6 Months' },
            { key: '1year', label: '1 Year' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeRangeButton,
                timeRange === option.key && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(option.key)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  timeRange === option.key && styles.timeRangeButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Total Books Borrowed */}
          <Card style={[styles.statCard, styles.primaryCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="book"
                size={32}
                color={COLORS.brand.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Books Borrowed</Text>
              <Text style={styles.statValue}>{stats?.totalBorrowed || 0}</Text>
            </View>
          </Card>

          {/* Books Currently Borrowed */}
          <Card style={[styles.statCard, styles.secondaryCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="bookmark"
                size={32}
                color={COLORS.status.pending}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Currently Borrowed</Text>
              <Text style={styles.statValue}>{borrowedBooks?.length || 0}</Text>
            </View>
          </Card>

          {/* Books Returned */}
          <Card style={[styles.statCard, styles.successCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="checkmark-circle"
                size={32}
                color={COLORS.status.available}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Books Returned</Text>
              <Text style={styles.statValue}>{stats?.totalReturned || 0}</Text>
            </View>
          </Card>

          {/* Books Overdue */}
          <Card style={[styles.statCard, stats?.overdueBooks > 0 ? styles.dangerCard : styles.neutralCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="alert-circle"
                size={32}
                color={stats?.overdueBooks > 0 ? COLORS.status.unavailable : COLORS.neutral[400]}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Overdue Books</Text>
              <Text style={styles.statValue}>{stats?.overdueBooks || 0}</Text>
            </View>
          </Card>

          {/* Total Fines */}
          <Card style={[styles.statCard, stats?.totalFines > 0 ? styles.warningCard : styles.neutralCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="wallet"
                size={32}
                color={stats?.totalFines > 0 ? COLORS.status.warning : COLORS.neutral[400]}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Total Fines</Text>
              <Text style={styles.statValue}>₹{stats?.totalFines?.toFixed(2) || '0.00'}</Text>
            </View>
          </Card>

          {/* Reading Streak */}
          <Card style={[styles.statCard, styles.infoCard]}>
            <View style={styles.statCardContent}>
              <Ionicons
                name="flame"
                size={32}
                color={COLORS.brand.accent}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>Reading Streak</Text>
              <Text style={styles.statValue}>{stats?.readingStreak || 0} days</Text>
            </View>
          </Card>
        </View>

        {/* Category Distribution */}
        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top Categories"
              icon="folder-outline"
            />
            {categoryStats.map((category, index) => (
              <View key={category.name || index}>
                <View style={styles.categoryItemContainer}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>{category.count} books</Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width:
                            (category.count /
                              Math.max(...categoryStats.map((c) => c.count))) *
                            100 +
                            '%',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                </View>
                {index < categoryStats.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        )}

        {/* Monthly Trends */}
        {monthlyTrends.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Monthly Trends"
              icon="trending-up-outline"
            />
            <View style={styles.trendChart}>
              {monthlyTrends.map((month, index) => {
                const maxBorrows = Math.max(...monthlyTrends.map((m) => m.borrows));
                const height = (month.borrows / maxBorrows) * 120;

                return (
                  <View key={month.month || index} style={styles.trendBar}>
                    <View
                      style={[
                        styles.trendBarFill,
                        { height: Math.max(height, 8) },
                      ]}
                    />
                    <Text style={styles.trendLabel}>{month.month}</Text>
                    <Text style={styles.trendValue}>{month.borrows}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Achievements & Badges */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Achievements"
              icon="trophy-outline"
            />
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <Card key={achievement.name || index} style={styles.achievementBadge}>
                  <View style={styles.achievementContent}>
                    <Ionicons
                      name={achievement.icon || 'star'}
                      size={28}
                      color={COLORS.brand.accent}
                      style={styles.achievementIcon}
                    />
                    <Text style={styles.achievementName} numberOfLines={2}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDescription} numberOfLines={1}>
                      {achievement.description}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Reading Goal Progress */}
        {stats?.readingGoal && (
          <View style={styles.section}>
            <SectionHeader
              title="Reading Goal"
              icon="target-outline"
            />
            <Card style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>
                  {stats.totalBorrowed}/{stats.readingGoal.target} books
                </Text>
                <Badge
                  label={`${Math.min(
                    ((stats.totalBorrowed / stats.readingGoal.target) * 100).toFixed(0),
                    100,
                  )}%`}
                  variant="warning"
                />
              </View>
              <View style={styles.goalProgressBar}>
                <View
                  style={[
                    styles.goalProgressFill,
                    {
                      width: `${Math.min(
                        (stats.totalBorrowed / stats.readingGoal.target) * 100,
                        100,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalSubtitle}>
                {Math.max(0, stats.readingGoal.target - stats.totalBorrowed)} books remaining
              </Text>
            </Card>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight['700'],
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  timeRangeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.secondary,
  },
  timeRangeButtonTextActive: {
    color: COLORS.neutral[0],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  statCard: {
    width: '48%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  primaryCard: {
    backgroundColor: `${COLORS.brand.primary}15`,
  },
  secondaryCard: {
    backgroundColor: `${COLORS.status.pending}15`,
  },
  successCard: {
    backgroundColor: `${COLORS.status.available}15`,
  },
  dangerCard: {
    backgroundColor: `${COLORS.status.unavailable}15`,
  },
  warningCard: {
    backgroundColor: `${COLORS.status.warning}15`,
  },
  neutralCard: {
    backgroundColor: COLORS.neutral[50],
  },
  infoCard: {
    backgroundColor: `${COLORS.brand.accent}15`,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight['700'],
    color: COLORS.text.primary,
  },
  section: {
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  categoryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  categoryInfo: {
    width: 100,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  categoryBar: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryPercentage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
    width: 45,
    textAlign: 'right',
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs,
  },
  trendBarFill: {
    width: 20,
    backgroundColor: COLORS.brand.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  trendLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  trendValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  achievementBadge: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: `${COLORS.brand.accent}10`,
  },
  achievementContent: {
    alignItems: 'center',
  },
  achievementIcon: {
    marginBottom: SPACING.sm,
  },
  achievementName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  goalCard: {
    padding: SPACING.lg,
    backgroundColor: `${COLORS.brand.secondary}10`,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight['700'],
    color: COLORS.text.primary,
  },
  goalProgressBar: {
    height: 12,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.brand.secondary,
    borderRadius: BORDER_RADIUS.full,
  },
  goalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
});

export default StatisticsScreen;
