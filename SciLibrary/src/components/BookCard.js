import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function BookCard({ cover, title, author, onPress, onBorrow }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: cover }} style={styles.cover} />
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.author}>{author}</Text>
        <TouchableOpacity style={styles.borrowBtn} onPress={onBorrow}>
          <Text style={styles.borrowText}>Borrow</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cover: {
    width: 72,
    height: 96,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  borrowBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#358a74',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  borrowText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
