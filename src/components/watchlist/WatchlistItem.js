import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { WatchlistContext } from '../../context/WatchlistContext';

const WatchlistItem = ({ item, index, scrollY, onPress }) => {
  const { animatedValues, removeItem } = useContext(WatchlistContext);

  if (!animatedValues[item.id]) {
    animatedValues[item.id] = new Animated.Value(1);
  }

  // Calcoli per le animazioni
  const itemHeight = 200;
  // Correzione: Assicuriamo che l'inputRange sia sempre crescente
  const inputRange = [
    -1,
    0,
    itemHeight * Math.max(0, index - 0.3), // Garantisce che sia sempre >= 0
    itemHeight * index,
    itemHeight * (index + 0.5),
    itemHeight * (index + 1),
    itemHeight * (index + 2)
  ];

  // Animazione opacità più pronunciata
  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 1, 1, 0.8, 0.6, 0.4], // Valori più bassi per un effetto più evidente
    extrapolate: 'clamp',
  });

  // Effetto di scaling più pronunciato
  const scale = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 1, 1, 0.95, 0.9, 0.85], // Riduzione di scala più evidente
    extrapolate: 'clamp',
  });

  // Movimento verticale più accentuato
  const translateY = scrollY.interpolate({
    inputRange,
    outputRange: [0, 0, 0, 0, -15, -30, -45], // Spostamento verticale maggiore
    extrapolate: 'clamp',
  });

  // Rotazione più evidente per un effetto 3D più pronunciato
  const rotate = scrollY.interpolate({
    inputRange,
    outputRange: ['0deg', '0deg', '0deg', '0deg', '1deg', '2deg', '3deg'], // Rotazione più accentuata
    extrapolate: 'clamp',
  });

  // Rotazione Y per un effetto ancora più pronunciato
  const rotateY = scrollY.interpolate({
    inputRange,
    outputRange: ['0deg', '0deg', '0deg', '0deg', '-1deg', '-2deg', '-3deg'], // Leggera rotazione sull'asse Y
    extrapolate: 'clamp',
  });

  // Shadow effect più evidente durante lo scroll
  const shadowOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.25, 0.25, 0.25, 0.25, 0.35, 0.45, 0.1], // Ombre più evidenti durante la transizione
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    opacity: Animated.multiply(animatedValues[item.id], opacity),
    transform: [
      { 
        translateX: animatedValues[item.id].interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
      { scale: Animated.multiply(animatedValues[item.id], scale) },
      { translateY },
      { rotateX: rotate },
      { rotateY: rotateY }, // Aggiunto rotateY per effetto 3D più evidente
      { perspective: 1000 } // Applicato direttamente qui per migliorare l'effetto 3D
    ],
    shadowOpacity: shadowOpacity,
  };

  const renderRightActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteContainer}>
        <Animated.View 
          style={[
            styles.deleteButton,
            { transform: [{ translateX }], opacity }
          ]}
        >
          <MaterialIcons name="delete" size={28} color="#E50914" />
          <Text style={styles.deleteText}>Elimina</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.itemWrapper, animatedStyle]}>
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX)}
        onSwipeableRightOpen={() => removeItem(item.id)}
        rightThreshold={50}
        containerStyle={styles.swipeableContainer}
        useNativeAnimations={true}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
          <View style={styles.item}>
            <View style={styles.itemContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {item.year && <Text style={styles.year}>({item.year})</Text>}
              </View>
              <View style={styles.contentRow}>
                {item.posterUrl && (
                  <Image
                    source={{ uri: item.posterUrl }}
                    style={styles.poster}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.itemTextContent}>
                  <View style={styles.itemTopRow}>
                    {item.rating && (
                      <View style={styles.ratingContainer}>
                        <MaterialIcons name="star" size={16} color="#FFD700" />
                        <Text style={styles.rating}>{item.rating}</Text>
                      </View>
                    )}
                    {item.totalSeasons && (
                      <View style={styles.seasonsContainer}>
                        <MaterialIcons name="tv" size={16} color="#aaa" />
                        <Text style={styles.seasons}>{item.totalSeasons} stagioni</Text>
                      </View>
                    )}
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  {item.genre && (
                    <View style={styles.genreContainer}>
                      <Text style={styles.genre}>{item.genre}</Text>
                    </View>
                  )}
                  {item.description && (
                    <Text style={styles.description} numberOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    marginVertical: 10, // Aumentato per dare più spazio alle animazioni
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 }, // Ombre più pronunciate
    shadowRadius: 12,
  },
  swipeableContainer: {
    backgroundColor: 'transparent',
  },
  item: {
    backgroundColor: "#1f1f1f",
    marginVertical: 4,
    borderRadius: 16, // Bordi più arrotondati
    elevation: 8, // Elevazione maggiore per Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Ombra più pronunciata
    shadowOpacity: 0.3, // Opacità dell'ombra aumentata
    shadowRadius: 6, // Raggio dell'ombra aumentato
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    backfaceVisibility: 'hidden', // Migliora gli effetti 3D
  },
  itemContent: {
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  year: {
    color: '#aaa',
    fontSize: 13,
    flexShrink: 0,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  itemTextContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 14,
  },
  seasonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seasons: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  itemCategory: {
    color: "#aaa",
    fontSize: 11,
    backgroundColor: "#333",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  deleteContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: 'transparent',
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 20,
  },
  deleteText: {
    color: '#E50914',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  genreContainer: {
    marginBottom: 8,
  },
  genre: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default WatchlistItem;