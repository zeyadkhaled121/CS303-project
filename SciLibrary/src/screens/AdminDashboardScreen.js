import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks, deleteBook } from '../store/books'; 
import Toast from 'react-native-toast-message';
import API from '../api/axios';
import { COLORS } from '../../shared/designTokens';

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'fines', or 'banned'
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [loadingFines, setLoadingFines] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loadingBanned, setLoadingBanned] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchAllBooks()),
      fetchFines(),
      fetchBannedUsers()
    ]);
    setRefreshing(false);
  };

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

  useEffect(() => {
    dispatch(fetchAllBooks());
    fetchFines();
    fetchBannedUsers();
  }, [dispatch]);

  const fetchFines = async () => {
    setLoadingFines(true);
    try {
      const res = await API.get("/api/admin/fines?status=unpaid");
      setUnpaidFines(res.data.fines || []);
    } catch (err) {
      console.error("Failed to fetch unpaid fines", err);
    } finally {
      setLoadingFines(false);
    }
  };

  const fetchBannedUsers = async () => {
    setLoadingBanned(true);
    try {
      const res = await API.get("/api/admin/banned-users");
      setBannedUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch banned users", err);
    } finally {
      setLoadingBanned(false);
    }
  };

  const handleUnbanUser = (userId) => {
    Alert.alert(
      "Unban User",
      "Are you sure you want to unban this user?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            try {
              await API.patch(`/api/admin/users/${userId}/unban`);
              Toast.show({ type: 'success', text1: 'User Unbanned', text2: 'User access has been restored.' });
              fetchBannedUsers();
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to unban user.' });
            }
          }
        }
      ]
    );
  };

  const handleConfirmPayment = (fineId) => {
    Alert.alert(
      "Confirm Payment",
      "Are you sure you want to mark this fine as paid?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            try {
              await API.patch(`/api/admin/fines/${fineId}/confirm-payment`);
              Toast.show({ type: 'success', text1: 'Payment Confirmed', text2: 'Fine has been marked as paid.' });
              fetchFines();
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to confirm payment.' });
            }
          }
        }
      ]
    );
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            dispatch(deleteBook(id))
              .unwrap()
              .then(() => {
                Toast.show({ type: 'success', text1: 'Deleted', text2: 'Book deleted successfully' });
                dispatch(fetchAllBooks());
              })
              .catch((err) => Toast.show({ type: 'error', text1: 'Error', text2: err }));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.image?.url || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, styles.editBtn]}
            onPress={() => navigation.navigate('AddEditBook', { book: item })}
          >
            <Text style={styles.btnText}>✏️ Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, styles.deleteBtn]}
            onPress={() => handleDelete(item._id || item.id, item.title)}
          >
            <Text style={styles.btnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFineItem = ({ item }) => (
    <View style={styles.fineCard}>
      <View style={styles.fineInfo}>
        <Text style={styles.fineName}>{item.userName || "Unknown"}</Text>
        <Text style={styles.fineEmail}>{item.userEmail}</Text>
        <Text style={styles.fineAmount}>${item.amount || item.fineAmount || 0}</Text>
      </View>
      <TouchableOpacity 
        style={styles.confirmBtn}
        onPress={() => handleConfirmPayment(item.id)}
      >
        <Text style={styles.confirmBtnText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBannedUserItem = ({ item }) => (
    <View style={styles.fineCard}>
      <View style={styles.fineInfo}>
        <Text style={styles.fineName}>{item.name || "Unknown"}</Text>
        <Text style={styles.fineEmail}>{item.email}</Text>
        <Text style={styles.fineAmount}>Offenses: {item.offenseCount || 0}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.confirmBtn, { backgroundColor: COLORS.status.available }]}
        onPress={() => handleUnbanUser(item.id)}
      >
        <Text style={styles.confirmBtnText}>Unban</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage Library & Fines</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
        >
          <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]} numberOfLines={1}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'fines' && styles.activeTab]}
          onPress={() => setActiveTab('fines')}
        >
          <Text style={[styles.tabText, activeTab === 'fines' && styles.activeTabText]} numberOfLines={1}>Fines</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'banned' && styles.activeTab]}
          onPress={() => setActiveTab('banned')}
        >
          <Text style={[styles.tabText, activeTab === 'banned' && styles.activeTabText, { color: activeTab === 'banned' ? COLORS.brand.danger : COLORS.text.secondary }]} numberOfLines={1}>Banned</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {activeTab === 'books' && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Books</Text>
            <Text style={styles.statValue}>{books.length}</Text>
          </View>
        </View>
      )}

      {activeTab === 'fines' && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Unpaid Fines</Text>
            <Text style={styles.statValue}>{unpaidFines.length}</Text>
          </View>
        </View>
      )}

      {activeTab === 'banned' && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Banned Users</Text>
            <Text style={[styles.statValue, { color: COLORS.brand.danger }]}>{bannedUsers.length}</Text>
          </View>
        </View>
      )}

      {/* List */}
      {activeTab === 'books' ? (
        loading ? (
          <ActivityIndicator size="large" color={COLORS.brand.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item._id || item.id?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No books found.</Text>
              </View>
            }
          />
        )
      ) : activeTab === 'fines' ? (
        loadingFines && unpaidFines.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.brand.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={unpaidFines}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderFineItem}
            contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No unpaid fines.</Text>
              </View>
            }
          />
        )
      ) : (
        loadingBanned && bannedUsers.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.brand.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={bannedUsers}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderBannedUserItem}
            contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.brand.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No banned users.</Text>
              </View>
            }
          />
        )
      )}

      {/* Floating Action Button (Add Book) - only for books */}
      {activeTab === 'books' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AddEditBook')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  header: { padding: 20, paddingTop: 50, backgroundColor: COLORS.brand.primary },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.onBrand },
  headerSubtitle: { fontSize: 14, color: COLORS.neutral[200], marginTop: 4 },
  statsContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { backgroundColor: COLORS.background.primary, padding: 15, borderRadius: 12, flex: 1, alignItems: 'center', elevation: 2 },
  statLabel: { fontSize: 12, color: COLORS.text.secondary, fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '900', color: COLORS.brand.primary, marginTop: 4 },
  card: { flexDirection: 'row', backgroundColor: COLORS.background.primary, marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 10, elevation: 2 },
  image: { width: 80, height: 110, borderRadius: 8, backgroundColor: COLORS.neutral[200] },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 4 },
  author: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', flex: 1 },
  editBtn: { backgroundColor: COLORS.neutral[100] },
  deleteBtn: { backgroundColor: COLORS.neutral[100] },
  btnText: { fontSize: 12, fontWeight: 'bold', color: COLORS.text.primary },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: COLORS.text.onBrand, fontWeight: 'bold', marginTop: -2 },
  tabsContainer: { flexDirection: 'row', marginTop: 15, marginHorizontal: 20, backgroundColor: COLORS.neutral[100], borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: COLORS.background.primary, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: COLORS.text.secondary },
  activeTabText: { color: COLORS.brand.primary },
  fineCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background.primary, marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 15, elevation: 2 },
  fineInfo: { flex: 1 },
  fineName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 2 },
  fineEmail: { fontSize: 12, color: COLORS.text.secondary, marginBottom: 6 },
  fineAmount: { fontSize: 16, fontWeight: '900', color: COLORS.brand.danger },
  confirmBtn: { backgroundColor: COLORS.brand.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  confirmBtnText: { color: COLORS.text.onBrand, fontSize: 12, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyStateText: { fontSize: 14, color: COLORS.text.secondary },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  accessDeniedText: { fontSize: 24, fontWeight: 'bold', color: COLORS.brand.danger },
  accessDeniedSubtext: { fontSize: 16, color: COLORS.text.secondary, marginTop: 10 }
});