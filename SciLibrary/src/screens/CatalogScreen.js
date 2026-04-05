import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks, resetBookSlice } from '../store/books';
import BookCard from '../components/BookCard';
import CategoryList from '../components/CategoryList';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../shared/designTokens';
import { normalizeBook } from '../utils/dataShapeNormalizer';

export default function CatalogScreen({ navigation }) {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.book);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetBookSlice());
    }
  }, [error, dispatch]);

  const normalizedBooks = useMemo(() => (books || []).map((book) => normalizeBook(book)), [books]);

  const genres = useMemo(
    () => ['All', ...new Set(normalizedBooks.map((book) => book.genre).filter(Boolean))],
    [normalizedBooks]
  );

  const filteredBooks = useMemo(() => {
    return normalizedBooks.filter((book) => {
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.genre.toLowerCase().includes(q);

      return matchesGenre && matchesSearch;
    });
  }, [normalizedBooks, selectedGenre, searchTerm]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
        <Text style={styles.loadingText}>Loading library catalog...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Library Catalog</Text>
        <Text style={styles.heroSubtitle}>Discover and borrow your next read</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by title, author, or genre"
          placeholderTextColor={COLORS.neutral[400]}
        />
      </View>

      <CategoryList
        categories={genres}
        onSelectCategory={setSelectedGenre}
        selectedCategory={selectedGenre}
      />

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => String(item._id || item.id)}
        numColumns={1}
        renderItem={({ item }) => (
          <BookCard
            {...item}
            onPress={() => navigation.navigate('BookDetails', { book: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No books found</Text>
            <Text style={styles.emptySubtitle}>Try a different keyword or genre</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 4,
    color: COLORS.text.secondary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  searchWrap: {
    marginBottom: 8,
  },
  searchInput: {
    borderRadius: 14,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
    gap: 12,
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontWeight: '900',
    fontSize: 18,
  },
  emptySubtitle: {
    color: COLORS.text.secondary,
    marginTop: 4,
    fontWeight: '600',
  },
});