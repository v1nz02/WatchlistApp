import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { MEDIA_CATEGORIES } from '../../constants/categories';
import { WatchlistContext } from '../../context/WatchlistContext';

const CategoryFilter = () => {
  const { filterCategory, setFilterCategory } = useContext(WatchlistContext);

  return (
    <View style={styles.filterContainer}>
      <View style={styles.categoryFilter}>
        {MEDIA_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat} 
            onPress={() => setFilterCategory(cat === filterCategory ? null : cat)}
          >
            <Text
              style={[
                styles.category,
                filterCategory === cat && styles.selectedCategory,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 5,
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryFilter: {
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#1f1f1f',
  },
  selectedCategory: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
    color: "#fff",
  },
});

export default CategoryFilter;