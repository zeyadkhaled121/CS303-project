import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { books } from '../store/books';

export default function HomeScreen({ navigation }) {
  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image
        source={{ uri: item.cover }}
        style={styles.bookCover}
      />
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>
      <TouchableOpacity style={styles.borrowButton}>
        <Text style={styles.borrowButtonText}>Borrow</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to E-Library</Text>
      
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  bookCard: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  bookCover: {
    width: 120,
    height: 140,
    borderRadius: 5,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  borrowButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  borrowButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
