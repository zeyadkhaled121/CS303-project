import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../api/axios';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/designTokens';
import {
  Badge,
  EmptyState,
  ErrorState,
  LoadingSpinner,
  Button,
  Card,
  SectionHeader,
} from '../components/UITemplates';


const AdvancedSearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.catalog || {});

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [yearRange, setYearRange] = useState({ min: 1990, max: new Date().getFullYear() });
  const [availability, setAvailability] = useState('all'); 
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance'); 

  // Category options
  const categoryOptions = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Mystery',
    'Romance',
    'Self-Help',
    'Academic',
  ];

 
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/books/search', {
        params: {
          q: searchQuery,
          category: selectedCategory,
          minYear: yearRange.min,
          maxYear: yearRange.max,
          availability: availability !== 'all' ? availability : null,
          minRating: minRating,
          sortBy: sortBy,
        },
      });

      setSearchResults(response.data.books || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search books');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

 
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, yearRange, availability, minRating, sortBy]);

  
  const handleBookPress = (book) => {
    navigation.navigate('BookDetails', { book });
  };

  
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setYearRange({ min: 1990, max: new Date().getFullYear() });
    setAvailability('all');
    setMinRating(0);
    setSortBy('relevance');
    setSearchResults([]);
  };

  
  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.cardContent}>
        {/* Book Header */}
        <View style={styles.bookHeader}>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.brand.warning} />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCount}>({item.reviews?.length || 0} reviews)</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            <Badge
              label={item.available ? 'Available' : 'Unavailable'}
              variant={item.available ? 'success' : 'error'}
              size="sm"
            />
          </View>
        </View>

        {/* Book Metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Ionicons name="book-outline" size={12} color={COLORS.neutral[500]} />
            <Text style={styles.metadataLabel}>{item.category}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.neutral[500]} />
            <Text style={styles.metadataLabel}>{item.publicationYear}</Text>
          </View>
          {item.totalCopies && (
            <View style={styles.metadataItem}>
              <Ionicons name="layers-outline" size={12} color={COLORS.neutral[500]} />
              <Text style={styles.metadataLabel}>
                {item.borrowedCopies}/{item.totalCopies} borrowed
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <TouchableOpacity
          onPress={handleResetFilters}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh" size={20} color={COLORS.brand.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={COLORS.neutral[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors..."
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!isLoading}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <SectionHeader
            title="Filters"
            icon="funnel-outline"
          />

          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categoryOptions.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Year Range Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Publication Year</Text>
            <View style={styles.yearRangeContainer}>
              <View style={styles.yearInput}>
                <Text style={styles.yearLabel}>From</Text>
                <TextInput
                  style={styles.yearField}
                  placeholder="1990"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={yearRange.min.toString()}
                  onChangeText={(val) =>
                    setYearRange({ ...yearRange, min: parseInt(val) || 1990 })
                  }
                />
              </View>
              <Text style={styles.yearSeparator}>to</Text>
              <View style={styles.yearInput}>
                <Text style={styles.yearLabel}>To</Text>
                <TextInput
                  style={styles.yearField}
                  placeholder={new Date().getFullYear().toString()}
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={yearRange.max.toString()}
                  onChangeText={(val) =>
                    setYearRange({ ...yearRange, max: parseInt(val) || new Date().getFullYear() })
                  }
                />
              </View>
            </View>
          </View>

          {/* Availability Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Availability</Text>
            <View style={styles.toggleGroup}>
              {['all', 'available', 'unavailable'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.toggleButton,
                    availability === opt && styles.toggleButtonActive,
                  ]}
                  onPress={() => setAvailability(opt)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      availability === opt && styles.toggleButtonTextActive,
                    ]}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <View style={styles.ratingFilterContainer}>
              {[0, 2, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    minRating === rating && styles.ratingButtonActive,
                  ]}
                  onPress={() => setMinRating(minRating === rating ? 0 : rating)}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color={
                      minRating === rating ? COLORS.brand.primary : COLORS.neutral[400]
                    }
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      minRating === rating && styles.ratingButtonTextActive,
                    ]}
                  >
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortContainer}>
              {['relevance', 'title', 'rating', 'year'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortButton,
                    sortBy === option && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option && styles.sortButtonTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <SectionHeader
            title={`Results ${searchResults.length > 0 ? `(${searchResults.length})` : ''}`}
            icon="list-outline"
          />

          {isLoading ? (
            <LoadingSpinner message="Searching..." />
          ) : error ? (
            <ErrorState
              title="Search Failed"
              message={error}
              onRetry={performSearch}
            />
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title={searchQuery ? 'No Results Found' : 'Start Searching'}
              subtitle={
                searchQuery
                  ? 'Try different keywords or adjust filters'
                  : 'Enter a search term to get started'
              }
              actionLabel="Clear Filters"
              onActionPress={handleResetFilters}
            />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderBookItem}
              keyExtractor={(item) => item._id || item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['lg'],
    fontWeight: TYPOGRAPHY.fontWeight['700'],
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
  },
  filtersSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterGroup: {
    marginBottom: SPACING.lg,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight['500'],
  },
  categoryChipTextActive: {
    color: COLORS.neutral[0],
  },
  yearRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  yearInput: {
    flex: 1,
  },
  yearLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  yearField: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    backgroundColor: COLORS.neutral[50],
  },
  yearSeparator: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  toggleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight['500'],
  },
  toggleButtonTextActive: {
    color: COLORS.neutral[0],
  },
  ratingFilterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: COLORS.status.warning,
    borderColor: COLORS.status.warning,
  },
  ratingButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight['500'],
    marginTop: 2,
  },
  ratingButtonTextActive: {
    color: COLORS.neutral[0],
  },
  sortContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sortButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: COLORS.brand.secondary,
    borderColor: COLORS.brand.secondary,
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight['500'],
  },
  sortButtonTextActive: {
    color: COLORS.neutral[0],
  },
  resultsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  bookCard: {
    marginBottom: SPACING.md,
  },
  cardContent: {
    padding: SPACING.md,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  bookInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bookTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight['700'],
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight['600'],
    color: COLORS.text.primary,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  statusBadgeContainer: {
    justifyContent: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: SPACING.sm,
  },
});

export default AdvancedSearchScreen;
