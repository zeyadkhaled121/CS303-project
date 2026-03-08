import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllBooks, resetBookSlice } from '../store/books';
import BookCard from '../components/BookCard';
import CategoryList from '../components/CategoryList';
import Toast from 'react-native-toast-message';

export default function CatalogScreen() {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.book);
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    dispatch(fetchAllBooks());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetBookSlice());
    }
  }, [error, dispatch]);

  const genres = ["All", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filteredBooks = books.filter((book) => 
    selectedGenre === "All" || book.genre === selectedGenre
  );

  if (loading) return <ActivityIndicator size="large" color="#358a74" style={{marginTop: 50}} />;

  return (
    <View style={styles.container}>
      <CategoryList categories={genres} onSelectCategory={setSelectedGenre} />
      
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item._id || item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <BookCard 
            title={item.title}
            author={item.author}
            image={item.image}
            genre={item.genre}
            status={item.status}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa', padding: 10 },
    row: { justifyContent: 'space-between' }
});