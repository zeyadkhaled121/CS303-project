import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import CategoryList from '../components/CategoryList';
import BookCard from '../components/BookCard';
import { books as allBooks } from '../store/books';
import Toast from 'react-native-toast-message';

 function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = useMemo(() => ['All', 'Fiction', 'Non-Fiction', 'Science', 'History'], []);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBooks.filter((b) => {
      const matchesQuery = q ? (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) : true;
      const matchesCategory = selectedCategory && selectedCategory !== 'All' ? (b?.category === selectedCategory) : true;
      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory]);

  const popularBooks = useMemo(() => filteredBooks.slice(0, 4), [filteredBooks]);
  const recentlyAdded = useMemo(() => filteredBooks.slice().reverse().slice(0, 6), [filteredBooks]);

  const handleBorrow = (book) => {
    Toast.show({ type: 'info', text1: 'Borrow', text2: `Requested to borrow: ${book.title}` });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.subtitle}>Find your next read</Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      <CategoryList categories={categories} onSelectCategory={(c) => setSelectedCategory(c)} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Books</Text>
          <TouchableOpacity onPress={() => Toast.show({ text1: 'View All', text2: 'Open popular books list' })}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={popularBooks}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <BookCard
              cover={item.cover}
              title={item.title}
              author={item.author}
              onPress={() => navigation.navigate('Home')}
              onBorrow={() => handleBorrow(item)}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
        </View>

        <FlatList
          data={recentlyAdded}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookCard
              cover={item.cover}
              title={item.title}
              author={item.author}
              onPress={() => navigation.navigate('Home')}
              onBorrow={() => handleBorrow(item)}
            />
          )}
        />
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f9f9f9',
  },
  headerRow: {
    marginTop: 6,
    marginBottom: 6,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  viewAll: {
    color: '#358a74',
    fontWeight: '600',
  },
});
export default HomeScreen ; 