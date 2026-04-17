import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {
  safeExtractBookTitle,
  safeExtractBorrowerName,
  safeExtractBorrowerEmail,
  calculateDaysOverdue,
  calculateDaysUntilDue,
  formatDateDisplay,
  durationToDateTime,
  formatLoanStatus,
  getStatusColor,
} from '../utils/borrowUtils';
import { COLORS } from '../../shared/designTokens';


export const ApproveRequestModal = ({
  visible,
  borrow,
  loading,
  onClose,
  onConfirm,
}) => {
  const [days, setDays] = useState('7');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');

  const handleConfirm = () => {
    const daysNum = parseInt(days, 10) || 0;
    const hoursNum = parseInt(hours, 10) || 0;
    const minutesNum = parseInt(minutes, 10) || 0;

    // Validate: max 60 days
    const totalMinutes = daysNum * 24 * 60 + hoursNum * 60 + minutesNum;
    const maxMinutes = 60 * 24 * 60;

    if (totalMinutes === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Duration must be at least 1 minute',
      });
      return;
    }

    if (totalMinutes > maxMinutes) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Duration cannot exceed 60 days',
      });
      return;
    }

    const dueDate = durationToDateTime(daysNum, hoursNum, minutesNum);
    onConfirm(dueDate);
  };

  const handleClose = () => {
    setDays('7');
    setHours('0');
    setMinutes('0');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Approve Request</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="x" size={24} color={COLORS.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Book and User Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="book" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Book:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {safeExtractBookTitle(borrow)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="user" size={18} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Borrower:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {safeExtractBorrowerName(borrow)}
                </Text>
              </View>
            </View>

            {/* Duration Input */}
            <Text style={styles.sectionLabel}>Set Borrowing Duration</Text>

            <View style={styles.durationContainer}>
              <View style={styles.durationField}>
                <Text style={styles.fieldLabel}>Days</Text>
                <TextInput
                  style={styles.durationInput}
                  keyboardType="number-pad"
                  value={days}
                  onChangeText={setDays}
                  maxLength={2}
                  editable={!loading}
                />
              </View>
              <View style={styles.durationSeparator}>
                <Text style={styles.separatorText}>:</Text>
              </View>
              <View style={styles.durationField}>
                <Text style={styles.fieldLabel}>Hours</Text>
                <TextInput
                  style={styles.durationInput}
                  keyboardType="number-pad"
                  value={hours}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10) || 0;
                    setHours(Math.min(num, 23).toString());
                  }}
                  maxLength={2}
                  editable={!loading}
                />
              </View>
              <View style={styles.durationSeparator}>
                <Text style={styles.separatorText}>:</Text>
              </View>
              <View style={styles.durationField}>
                <Text style={styles.fieldLabel}>Minutes</Text>
                <TextInput
                  style={styles.durationInput}
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10) || 0;
                    setMinutes(Math.min(num, 59).toString());
                  }}
                  maxLength={2}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Help Text */}
            <View style={styles.helpBox}>
              <Icon name="info" size={16} color={COLORS.status.pending} />
              <Text style={styles.helpText}>Maximum duration: 60 days</Text>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon name="check" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export const ReturnBookModal = ({
  visible,
  borrow,
  loading,
  onClose,
  onConfirm,
}) => {
  const daysOverdue = calculateDaysOverdue(borrow?.dueDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Book Return</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={COLORS.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Return Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Book Title:</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {safeExtractBookTitle(borrow)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Borrower:</Text>
                <Text style={styles.summaryValue}>
                  {safeExtractBorrowerName(borrow)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Due Date:</Text>
                <Text style={styles.summaryValue}>
                  {formatDateDisplay(borrow?.dueDate)}
                </Text>
              </View>

              {daysOverdue > 0 && (
                <View
                  style={[
                    styles.summaryRow,
                    { borderTopWidth: 1, borderTopColor: COLORS.neutral[200], paddingTop: 12 },
                  ]}
                >
                  <Icon name="alert-triangle" size={18} color={COLORS.status.overdue} />
                  <Text style={[styles.summaryValue, { color: COLORS.status.overdue, flex: 1 }]}>
                    {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                  </Text>
                </View>
              )}
            </View>

            {/* Confirmation Message */}
            <View style={styles.confirmationBox}>
              <Icon name="check-circle" size={24} color={COLORS.status.available} />
              <Text style={styles.confirmationText}>
                Mark this book as returned?
              </Text>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon name="check" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Confirm Return</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export const ReportIssueModal = ({
  visible,
  borrow,
  loading,
  onClose,
  onConfirm,
}) => {
  const [issueType, setIssueType] = useState('Lost');
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    if (!remarks.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please provide remarks about the issue',
      });
      return;
    }

    if (remarks.length > 500) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Remarks cannot exceed 500 characters',
      });
      return;
    }

    onConfirm(issueType, remarks);
  };

  const handleClose = () => {
    setIssueType('Lost');
    setRemarks('');
    onClose();
  };

  const charCount = remarks.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Issue</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="x" size={24} color={COLORS.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Book Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="book" size={18} color={COLORS.brand.primary} />
                <Text style={styles.infoValue} numberOfLines={2}>
                  {safeExtractBookTitle(borrow)}
                </Text>
              </View>
            </View>

            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <Icon name="alert-circle" size={20} color={COLORS.status.overdue} />
              <Text style={styles.warningText}>
                Reporting an issue will affect inventory
              </Text>
            </View>

            {/* Issue Type Selection */}
            <Text style={styles.sectionLabel}>Issue Type</Text>
            <View style={styles.optionRow}>
              {['Lost', 'Damaged'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    issueType === type && styles.optionButtonActive,
                  ]}
                  onPress={() => setIssueType(type)}
                  disabled={loading}
                >
                  <Icon
                    name={type === 'Lost' ? 'x-circle' : 'alert-triangle'}
                    size={20}
                    color={issueType === type ? COLORS.text.onBrand : COLORS.neutral[600]}
                  />
                  <Text
                    style={[
                      styles.optionButtonText,
                      issueType === type && styles.optionButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Remarks Textarea */}
            <Text style={styles.sectionLabel}>Details ({charCount}/500)</Text>
            <TextInput
              style={[
                styles.remarksInput,
                charCount > 480 && styles.remarksInputWarning,
              ]}
              placeholder="Describe what happened..."
              multiline
              numberOfLines={4}
              maxLength={500}
              value={remarks}
              onChangeText={setRemarks}
              editable={!loading}
              textAlignVertical="top"
            />

            {charCount > 480 && (
              <Text style={styles.charWarning}>
                {500 - charCount} characters remaining
              </Text>
            )}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                styles.dangerButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon name="alert-triangle" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Report Issue</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export const RejectRequestModal = ({
  visible,
  borrow,
  loading,
  onClose,
  onConfirm,
}) => {
  const [remarks, setRemarks] = useState('');

  const handleConfirm = () => {
    if (!remarks.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please provide a reason for rejection',
      });
      return;
    }

    if (remarks.length > 500) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Remarks cannot exceed 500 characters',
      });
      return;
    }

    onConfirm(remarks);
  };

  const handleClose = () => {
    setRemarks('');
    onClose();
  };

  const charCount = remarks.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="x" size={24} color={COLORS.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Request Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="book" size={18} color={COLORS.brand.primary} />
                <Text style={styles.infoLabel}>Book:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {safeExtractBookTitle(borrow)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="user" size={18} color={COLORS.brand.primary} />
                <Text style={styles.infoLabel}>Requested by:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {safeExtractBorrowerName(borrow)}
                </Text>
              </View>
            </View>

            {/* Rejection Remarks */}
            <Text style={styles.sectionLabel}>Reason ({charCount}/500)</Text>
            <TextInput
              style={[
                styles.remarksInput,
                charCount > 480 && styles.remarksInputWarning,
              ]}
              placeholder="Explain why you're rejecting this request..."
              multiline
              numberOfLines={4}
              maxLength={500}
              value={remarks}
              onChangeText={setRemarks}
              editable={!loading}
              textAlignVertical="top"
            />

            {charCount > 480 && (
              <Text style={styles.charWarning}>
                {500 - charCount} characters remaining
              </Text>
            )}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                styles.dangerButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon name="slash" size={18} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexShrink: 1,
    display: 'flex',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[700],
  },
  modalBody: {
    flexGrow: 1,
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[700],
    flex: 1,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[700],
    flex: 1.5,
    textAlign: 'right',
  },

  // Section Label
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[700],
    marginBottom: 10,
    marginTop: 6,
  },

  // Duration Inputs
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  durationField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  durationInput: {
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  durationSeparator: {
    marginBottom: 2,
    marginHorizontal: 2,
  },
  separatorText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[400],
    textAlign: 'center',
  },

  // Option Buttons
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  optionButtonActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[600],
    marginTop: 6,
  },
  optionButtonTextActive: {
    color: COLORS.text.onBrand,
  },

  // Remarks Input
  remarksInput: {
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.neutral[700],
    minHeight: 100,
  },
  remarksInputWarning: {
    borderColor: COLORS.status.pending,
    backgroundColor: COLORS.neutral[50],
  },

  charWarning: {
    fontSize: 12,
    color: COLORS.status.pending,
    marginTop: 6,
    textAlign: 'right',
  },

  // Buttons
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.brand.primary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.onBrand,
  },
  dangerButton: {
    backgroundColor: COLORS.status.unavailable,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Helper Elements
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.status.pending,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.neutral[700],
    flex: 1,
    fontWeight: '500',
  },
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.status.available,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.status.available,
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.unavailable + '10',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.status.unavailable,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.status.overdue,
    flex: 1,
  },
});
