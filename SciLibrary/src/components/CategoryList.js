import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { COLORS } from '../../shared/designTokens';

export default function CategoryList({ categories = [], onSelectCategory, selectedCategory = 'All' }) {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedCategory === item && styles.chipActive]}
            onPress={() => onSelectCategory(item)}
            activeOpacity={0.9}
          >
            <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  chip: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  chipActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  chipText: {
    color: COLORS.text.secondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 11,
  },
  chipTextActive: {
    color: COLORS.text.onBrand,
  },
});
