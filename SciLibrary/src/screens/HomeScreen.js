import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks } from '../store/books';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { books, loading } = useSelector((state) => state.book);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  const filteredBooks = books.filter((book) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      book.title?.toLowerCase().includes(term) ||
      book.author?.toLowerCase().includes(term) ||
      book.genre?.toLowerCase().includes(term)
    );
  });

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {isAuthenticated ? `Welcome, ${user?.name}!` : 'Library Catalog'}
          </Text>
          <Text style={styles.subGreeting}>
            {isAuthenticated ? 'Discover your next great read.' : 'Login to borrow books'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.iconBtn}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
          )}
          
          {isAuthenticated ? (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SearchBar 
        value={searchTerm} 
        onChangeText={setSearchTerm} 
        placeholder="Search for books, authors..." 
      />

      <View style={styles.listContainer}>
        {loading && books.length === 0 ? (
          <ActivityIndicator size="large" color="#358a74" style={{ marginTop: 50 }} />
        ) : filteredBooks.length === 0 ? (
          <Text style={styles.emptyText}>No books found.</Text>
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item._id || item.id?.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <BookCard 
                  title={item.title} 
                  author={item.author} 
                  image={item.image} 
                  genre={item.genre}
                  status={item.status} 
                  onPress={() => navigation.navigate('BookDetails', { book: item })} 
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  subGreeting: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { backgroundColor: '#fff', padding: 8, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  loginBtn: { backgroundColor: '#358a74', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listContainer: { flex: 1, marginTop: 10 },
  row: { justifyContent: 'space-between' },
  cardWrapper: { width: '48%' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 50, fontSize: 16 },
});
