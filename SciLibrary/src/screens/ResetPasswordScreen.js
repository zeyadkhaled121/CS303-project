import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import API from '../api/axios';

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 16) {
      Toast.show({ type: 'error', text1: 'Invalid Password', text2: 'Password must be between 8 and 16 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mismatch', text2: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await API.put('/api/v1/user/password/reset', { email, otp, newPassword, confirmNewPassword: confirmPassword });
      Toast.show({ type: 'success', text1: 'Success', text2: response.data.message || 'Password reset successfully!' });
      navigation.navigate('Login');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to reset password.';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>Enter the OTP sent to {email} and your new password.</Text>

        <TextInput
          style={styles.input}
          placeholder="OTP Code"
          keyboardType="numeric"
          value={otp}
          onChangeText={setOtp}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#358a74';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { marginBottom: 20 },
  backText: { color: PRIMARY, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 15 },
  button: { backgroundColor: PRIMARY, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});