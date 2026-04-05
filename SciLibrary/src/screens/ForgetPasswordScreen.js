import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import API from '../api/axios';

export default function ForgetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isValidEmail = (value) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  };

  const handleResetPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/v1/user/password/forgot', { email });

      Toast.show({ type: 'success', text1: 'Reset link sent', text2: 'Check your email for the OTP or reset link.' });
      navigation.navigate('OTP', { email });
    } catch (err) {
      console.log('Forgot password error:', err?.response?.data || err.message);
      const message = err?.response?.data?.message || 'Unable to send reset link. Please try again later.';
      setError(message);
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.description}>Enter your email to receive a password reset link</Text>

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(t) => setEmail(t)}
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading ? styles.buttonDisabled : null]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const PRIMARY = '#358a74';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: PRIMARY,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
