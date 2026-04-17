import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers, promoteUser, demoteUser, deleteUser, resetUserSlice } from '../store/slices/userSlice';
import Toast from 'react-native-toast-message';

export default function UsersScreen({ navigation }) {
  const dispatch = useDispatch();
  const { users, loading, error, message } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Role validation - Admin only
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
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

  const [searchTerm, setSearchTerm] = useState('');
  const isSuperAdmin = currentUser?.role === "Super Admin";
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllUsers());
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      Toast.show({ type: 'success', text1: 'Success', text2: message });
      dispatch(resetUserSlice());
      dispatch(fetchAllUsers()); 
    }
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetUserSlice());
    }
  }, [message, error, dispatch]);

  const handlePromote = (id, name) => {
    Alert.alert("Confirm Promote", `Promote "${name}" to Admin?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Promote", onPress: () => dispatch(promoteUser(id)) }
    ]);
  };

  const handleDemote = (id, name) => {
    Alert.alert("Confirm Demote", `Demote "${name}" to User?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Demote", style: "destructive", onPress: () => dispatch(demoteUser(id)) }
    ]);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Confirm Delete", `Delete "${name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteUser(id)) }
    ]);
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={[styles.roleBadge, item.role === 'Super Admin' ? styles.bgPurple : item.role === 'Admin' ? styles.bgEmerald : styles.bgGray]}>
            <Text style={[styles.roleText, item.role === 'Super Admin' ? styles.textPurple : item.role === 'Admin' ? styles.textEmerald : styles.textGray]}>{item.role}</Text>
          </View>
        </View>
      </View>

      {/* Control Buttons for Super Admin only */}
      {isSuperAdmin && item.role !== "Super Admin" && (
        <View style={styles.actions}>
          {item.role === "User" && (
            <TouchableOpacity style={[styles.actionBtn, styles.promoteBtn]} onPress={() => handlePromote(item.id || item._id, item.name)}>
              <Text style={styles.promoteText}>⬆️ Promote</Text>
            </TouchableOpacity>
          )}
          {item.role === "Admin" && (
            <TouchableOpacity style={[styles.actionBtn, styles.demoteBtn]} onPress={() => handleDemote(item.id || item._id, item.name)}>
              <Text style={styles.demoteText}>⬇️ Demote</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id || item._id, item.name)}>
            <Text style={styles.deleteText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}><Text style={{color: '#358a74', fontWeight: 'bold'}}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Users Management</Text>
        <Text style={styles.subtitle}>View and manage system members.</Text>
      </View>

      <View style={styles.searchContainer}>
         <TextInput 
           style={styles.searchInput} 
           placeholder="Search users by name or email..." 
           value={searchTerm} 
           onChangeText={setSearchTerm} 
         />
      </View>

      {loading && !users.length ? (
         <ActivityIndicator size="large" color="#358a74" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id || item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {/* Floating Action Button for Add Admin */}
      {isSuperAdmin && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AddNewAdmin')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 10 },
  card: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 16, padding: 15, elevation: 2 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#358a74', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  email: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  roleText: { fontSize: 12, fontWeight: 'bold' },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bgPurple: { backgroundColor: '#f3e8ff' },
  textPurple: { color: '#9333ea' },
  bgEmerald: { backgroundColor: '#d1fae5' },
  textEmerald: { color: '#059669' },
  bgGray: { backgroundColor: '#f3f4f6' },
  textGray: { color: '#4b5563' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 15 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  promoteBtn: { backgroundColor: '#d1fae5', flex: 1 },
  promoteText: { color: '#059669', fontWeight: 'bold' },
  demoteBtn: { backgroundColor: '#fee2e2', flex: 1 },
  demoteText: { color: '#ef4444', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#fee2e2', flex: 1 },
  deleteText: { color: '#ef4444', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#358a74', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: -2 }
});