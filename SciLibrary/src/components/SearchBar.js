import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../shared/designTokens';

export default function SearchBar({ value, onChangeText, placeholder = 'Search books...' }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    fontSize: 15,
  },
});
