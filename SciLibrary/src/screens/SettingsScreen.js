import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import api from '../api/axios';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../shared/designTokens';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const role = user?.role || 'Reader';
  const isAdmin = role === 'Admin' || role === 'Super Admin';
  const isSuperAdmin = role === 'Super Admin';

  const walletBalance = useMemo(() => Number(user?.walletBalance ?? user?.wallet ?? 0), [user]);
  const fineAmount = useMemo(() => Number(user?.fine ?? user?.fines ?? 0), [user]);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill out all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await api.put('/api/v1/user/password/update', {
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      Alert.alert('Password updated', 'Your password was updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert(
        'Update failed',
        error.response?.data?.message || 'Unable to update password right now. Please try again.',
      );
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>ACCOUNT</Text>
          <Text style={styles.title}>{user?.name || 'Library Member'}</Text>
          <Text style={styles.subtitle}>{user?.email || 'No email available'}</Text>

          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{role}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Snapshot</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{role}</Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.sectionTitle}>Library Wallet</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <Text style={styles.balanceValue}>${walletBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Current Fines</Text>
              <Text style={[styles.balanceValue, fineAmount > 0 && styles.fineValue]}>
                ${fineAmount.toFixed(2)}
              </Text>
            </View>
          </View>
          <Text style={styles.walletHint}>
            Fines and wallet values are synced from the backend account profile.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Text style={styles.inputLabel}>Current password</Text>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter current password"
            placeholderTextColor={COLORS.text.secondary}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>New password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={COLORS.text.secondary}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Confirm new password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={COLORS.text.secondary}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSubmittingPassword && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={isSubmittingPassword}
          >
            {isSubmittingPassword ? (
              <ActivityIndicator color={COLORS.text.onBrand} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>

            {isSuperAdmin && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('AddNewAdmin')}
              >
                <Text style={styles.secondaryButtonText}>Create Admin Account</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  headerCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    backgroundColor: `${COLORS.primary}15`,
    borderColor: `${COLORS.primary}33`,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  rolePillText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  section: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  infoLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  infoValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  walletCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.accent}33`,
    ...SHADOWS.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  balanceLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  fineValue: {
    color: COLORS.status.warning,
  },
  walletHint: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.md,
  },
  inputLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  primaryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.text.onBrand,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dangerButton: {
    backgroundColor: COLORS.brand.danger,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: COLORS.text.onDanger,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default SettingsScreen;
