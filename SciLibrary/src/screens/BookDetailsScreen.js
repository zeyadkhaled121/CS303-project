import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function BookDetailsScreen({ route, navigation }) {
  const { book } = route.params;

  if (!book) return null;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {book.image?.url ? (
          <Image source={{ uri: book.image.url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}><Text style={{fontSize: 50}}>📖</Text></View>
        )}
        <View style={[styles.statusBadge, book.status === "Available" ? styles.bgGreen : styles.bgAmber]}>
          <Text style={[styles.statusText, book.status === "Available" ? styles.textGreen : styles.textAmber]}>
            {book.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{book.title}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Author:</Text>
          <Text style={styles.infoValue}>{book.author}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Genre:</Text>
          <Text style={styles.infoValue}>{book.genre}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Edition:</Text>
          <Text style={styles.infoValue}>{book.edition}</Text>
        </View>

        <TouchableOpacity style={styles.borrowButton} onPress={() => alert('Borrow feature coming soon!')}>
          <Text style={styles.borrowButtonText}>Borrow Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 8 },
  backButtonText: { fontWeight: 'bold', color: '#358a74' },
  imageContainer: { width: '100%', height: height * 0.45, backgroundColor: '#f3f4f6', position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { position: 'absolute', bottom: -15, right: 20, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  bgGreen: { backgroundColor: '#dcfce7' },
  bgAmber: { backgroundColor: '#fef3c7' },
  textGreen: { color: '#15803d', fontWeight: 'bold' },
  textAmber: { color: '#b45309', fontWeight: 'bold' },
  detailsContainer: { padding: 24, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: '900', color: '#1f2937', marginBottom: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 12 },
  infoLabel: { fontSize: 13, color: '#6b7280', width: 70, fontWeight: 'bold', textTransform: 'uppercase' },
  infoValue: { fontSize: 15, color: '#111', fontWeight: '600', flex: 1 },
  borrowButton: { backgroundColor: '#358a74', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  borrowButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});