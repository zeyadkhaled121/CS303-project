import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice'; 
import Toast from 'react-native-toast-message';
import API from '../api/axios';

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all password fields' });
      return;
    }
    setLoading(true);
    try {
      await API.put('/api/v1/user/password/update', { oldPassword, newPassword, confirmNewPassword: newPassword });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated successfully' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Account Settings</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Admin Controls */}
      {user?.role === "Super Admin" && (
        <TouchableOpacity style={styles.adminCard} onPress={() => navigation.navigate('AddNewAdmin')}>
          <Text style={styles.adminTitle}>🛡️ Admin Management</Text>
          <Text style={styles.adminSub}>Add new system managers</Text>
        </TouchableOpacity>
      )}

      {(user?.role === "Admin" || user?.role === "Super Admin") && (
        <TouchableOpacity style={styles.adminCard} onPress={() => navigation.navigate('AllUsers')}>
          <Text style={styles.adminTitle}>👥 Users Directory</Text>
          <Text style={styles.adminSub}>Manage member records and roles</Text>
        </TouchableOpacity>
      )}

      {/* Wallet / Fines */}
      <View style={[styles.walletCard, user?.fines > 0 ? styles.walletDanger : styles.walletSafe]}>
        <View>
          <Text style={styles.walletTitle}>Library Wallet</Text>
          <Text style={styles.walletSub}>{user?.fines > 0 ? 'Outstanding balance' : 'No pending liabilities'}</Text>
        </View>
        <Text style={[styles.walletAmount, user?.fines > 0 ? styles.textDanger : styles.textSafe]}>
          ${user?.fines ? Number(user.fines).toFixed(2) : "0.00"}
        </Text>
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
        <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', marginTop: 40, marginBottom: 20 },
  profileCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#358a74', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  roleBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  role: { fontSize: 12, color: '#358a74', fontWeight: 'bold' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 10 },
 
  adminCard: { backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#d1fae5', elevation: 1 },
  adminTitle: { fontSize: 16, fontWeight: 'bold', color: '#065f46', marginBottom: 4 },
  adminSub: { fontSize: 12, color: '#047857' },

  walletCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
  walletSafe: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  walletDanger: { backgroundColor: '#fffbeb', borderColor: '#fef3c7' },
  walletTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  walletSub: { fontSize: 12, marginTop: 4, color: '#6b7280' },
  walletAmount: { fontSize: 24, fontWeight: '900' },
  textSafe: { color: '#358a74' },
  textDanger: { color: '#d97706' },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, marginBottom: 12 },
  btn: { backgroundColor: '#358a74', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { padding: 16, alignItems: 'center', marginBottom: 40 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});