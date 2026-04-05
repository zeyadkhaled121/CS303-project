import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks, deleteBook } from '../store/books'; 
import Toast from 'react-native-toast-message';
import { COLORS } from '../../shared/designTokens';

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const { user } = useSelector((state) => state.auth);

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
  }, [dispatch]);

  const handleDelete = (id, title) => {
    Alert.alert(
      "حذف كتاب",
      `هل أنت متأكد أنك تريد حذف كتاب "${title}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "حذف", 
          style: "destructive",
          onPress: () => {
            dispatch(deleteBook(id))
              .unwrap()
              .then(() => {
                Toast.show({ type: 'success', text1: 'تم الحذف', text2: 'تم حذف الكتاب بنجاح' });
                dispatch(fetchAllBooks());
              })
              .catch((err) => Toast.show({ type: 'error', text1: 'خطأ', text2: err }));
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage Library Books</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Books</Text>
          <Text style={styles.statValue}>{books.length}</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.brand.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id || item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Floating Action Button (Add Book) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditBook')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  fabText: { fontSize: 30, color: COLORS.text.onBrand, fontWeight: 'bold', marginTop: -2 }
});