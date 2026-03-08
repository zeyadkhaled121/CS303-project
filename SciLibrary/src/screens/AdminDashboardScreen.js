import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks, deleteBook } from '../store/books'; 
import Toast from 'react-native-toast-message';

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);

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
        <ActivityIndicator size="large" color="#358a74" style={{ marginTop: 50 }} />
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
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#358a74' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#e2e8f0', marginTop: 4 },
  statsContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center', elevation: 2 },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#358a74', marginTop: 4 },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 15, borderRadius: 12, padding: 10, elevation: 2 },
  image: { width: 80, height: 110, borderRadius: 8, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  author: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', flex: 1 },
  editBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
  btnText: { fontSize: 12, fontWeight: 'bold', color: '#111' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#358a74', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: -2 }
});