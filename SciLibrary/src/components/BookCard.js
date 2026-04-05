import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../shared/designTokens';

export default function BookCard({
  title,
  author,
  image,
  imageUrl,
  genre,
  status,
  availableCopies,
  totalCopies,
  onPress,
}) {
  const imageUri = image?.url || imageUrl || 'https://via.placeholder.com/300x400?text=No+Cover';
  const stock = Number.isFinite(Number(availableCopies)) ? Number(availableCopies) : 0;
  const total = Number.isFinite(Number(totalCopies)) ? Number(totalCopies) : stock;
  const isAvailable = stock > 0;
  const label = status || (isAvailable ? 'Available' : 'Unavailable');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.genreTag}>
          <Text style={styles.genreText}>{genre || 'Uncategorized'}</Text>
        </View>

        <View style={styles.stockTag}>
          <Text style={styles.stockText}>
            {isAvailable ? `${stock}/${total} available` : 'Out of stock'}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title || 'Unknown Title'}</Text>

        <View style={styles.authorContainer}>
          <MaterialCommunityIcons name="account" size={14} color={COLORS.neutral[500]} />
          <Text style={styles.author} numberOfLines={1}>{author || 'Unknown Author'}</Text>
        </View>

        <View style={[styles.availabilityBar, { 
          backgroundColor: isAvailable ? `${COLORS.status.available}1A` : `${COLORS.status.unavailable}1A`,
        }]}>
          <MaterialCommunityIcons 
            name={isAvailable ? 'check' : 'close'} 
            size={14} 
            color={isAvailable ? COLORS.status.available : COLORS.status.unavailable}
          />
          <Text style={[styles.availabilityText, {
            color: isAvailable ? COLORS.status.available : COLORS.status.unavailable
          }]}>
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 230,
    backgroundColor: COLORS.neutral[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  genreTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ffffffE8',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  genreText: {
    fontSize: 10,
    color: COLORS.brand.primary,
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  stockTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#111827D9',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  stockText: {
    color: COLORS.text.onBrand,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  info: { 
    padding: 14,
  },
  title: { 
    fontSize: 16,
    fontWeight: '900', 
    color: COLORS.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  author: { 
    fontSize: 12,
    color: COLORS.text.secondary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '700',
  },

  availabilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },

  availabilityText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
