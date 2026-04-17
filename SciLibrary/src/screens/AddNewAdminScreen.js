import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import API from '../api/axios';

export default function AddNewAdminScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);

  // Role validation - Super Admin only
  const isSuperAdmin = user?.role === 'Super Admin';
  if (!isSuperAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>Super Admin access required</Text>
        </View>
      </View>
    );
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !adminSecret) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields' });
      return;
    }
    if (password.length < 8 || password.length > 16) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Password must be between 8 and 16 characters' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/v1/user/register", {
        name, email, password, adminSecret,
      });
      Toast.show({ type: 'success', text1: 'Success', text2: res.data.message || 'Admin registered successfully!' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.response?.data?.message || 'Failed to register admin' });
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

        <Text style={styles.title}>🛡️ Add New Admin</Text>
        <Text style={styles.subtitle}>Register a new administrator account.</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password (8-16 chars)" secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Admin Secret Key" secureTextEntry value={adminSecret} onChangeText={setAdminSecret} />

          <Text style={styles.hint}>The new admin account will be verified automatically.</Text>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register Admin</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 50 },
  backButton: { marginBottom: 20 },
  backText: { color: '#358a74', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 30 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 2 },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', padding: 14, borderRadius: 12, marginBottom: 15, fontSize: 15 },
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 20, textAlign: 'center' },
  btn: { backgroundColor: '#358a74', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});