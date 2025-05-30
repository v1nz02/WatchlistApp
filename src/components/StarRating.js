import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ rating, onRatingChange, size = 25, isUserRating = false, readOnly = false, compact = false }) => {
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getStarIcon = (star) => {
    if (star <= rating) {
      return isUserRating ? 'star-sharp' : 'star';
    }
    return isUserRating ? 'star-outline' : 'star-outline';
  };

  const getStarColor = (star) => {
    if (star <= rating) {
      return isUserRating ? '#FFA500' : '#FFD700'; // Orange for user ratings, gold for regular ratings
    }
    return '#888';
  };

  if (compact) {
    if (!rating) {
      return (
        <View style={styles.container}>
          <Text style={[styles.noRatingText, { color: '#888' }]}>Non valutato</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Ionicons
          name={getStarIcon(rating)}
          size={size}
          color={getStarColor(rating)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <View key={star} style={styles.starButton}>
          {readOnly ? (
            <Ionicons
              name={getStarIcon(star)}
              size={size}
              color={getStarColor(star)}
            />
          ) : (
            <TouchableOpacity
              onPress={() => onRatingChange(star)}
            >
              <Ionicons
                name={getStarIcon(star)}
                size={size}
                color={getStarColor(star)}
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    flexWrap: 'nowrap',
    maxWidth: '100%',
  },
  starButton: {
    padding: 1,
  },
  noRatingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default StarRating; 