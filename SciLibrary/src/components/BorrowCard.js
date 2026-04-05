import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../shared/designTokens';
import { getStatusColor } from '../utils/statusColorUtils';
import { formatDateDisplay, safeExtractDate } from '../utils/borrowUtils';

export default function BorrowCard({ item, onCancel, onReportIssue }) {
  const calculateDaysLeft = (dueDate) => {
    const due = safeExtractDate(dueDate);
    if (!due) return null;
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = calculateDaysLeft(item.dueDate);
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isNearDue = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  const getStatusIndicator = () => {
    if (isOverdue) return { icon: 'alert-circle', color: COLORS.status.overdue, text: `Overdue by ${Math.abs(daysLeft)} days` };
    if (isNearDue) return { icon: 'clock-alert', color: COLORS.status.pending, text: `${daysLeft} days left` };
    return { icon: 'check-circle', color: COLORS.status.available, text: `${daysLeft} days left` };
  };

  const indicator = getStatusIndicator();

  return (
    <View style={styles.card}>
      {/* Header with book title and status */}
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.bookTitle}>{item.bookId?.title || 'Unknown Book'}</Text>
          <Text style={styles.author}>{item.bookId?.author || 'Unknown Author'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Status indicator */}
      <View style={[styles.statusIndicator, { borderLeftColor: indicator.color }]}>
        <MaterialCommunityIcons name={indicator.icon} size={16} color={indicator.color} />
        <Text style={[styles.indicatorText, { color: indicator.color }]}>{indicator.text}</Text>
      </View>

      {/* Dates section */}
      <View style={styles.datesSection}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Borrowed</Text>
          <Text style={styles.dateValue}>
            {formatDateDisplay(item.borrowDate)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Due Date</Text>
          <Text style={[styles.dateValue, { color: isOverdue || isNearDue ? indicator.color : COLORS.neutral[700] }]}>
            {formatDateDisplay(item.dueDate)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {item.status === 'Active' && !isOverdue && (
          <TouchableOpacity 
            style={[styles.button, styles.returnButton]}
            onPress={(onCancel)}
          >
            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
            <Text style={styles.buttonText}>Return Book</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.issueButton]}
          onPress={onReportIssue}
        >
          <MaterialCommunityIcons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Overdue warning */}
      {isOverdue && (
        <View style={styles.overdueWarning}>
          <MaterialCommunityIcons name="alert-circle" size={14} color={COLORS.status.overdue} />
          <Text style={styles.overdueText}>
            This book is overdue! Please return it as soon as possible.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  titleSection: {
    flex: 1,
    marginRight: 10,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLORS.neutral[300],
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.neutral[50],
    borderLeftWidth: 3,
    gap: 8,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  datesSection: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.neutral[100],
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  returnButton: {
    backgroundColor: COLORS.status.available,
  },
  issueButton: {
    backgroundColor: COLORS.status.unavailable,
  },
  buttonText: {
    color: COLORS.text.onBrand,
    fontSize: 12,
    fontWeight: '600',
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.unavailable + '10',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.status.unavailable + '30',
    gap: 8,
  },
  overdueText: {
    fontSize: 12,
    color: COLORS.status.overdue,
    fontWeight: '500',
    flex: 1,
  },
});