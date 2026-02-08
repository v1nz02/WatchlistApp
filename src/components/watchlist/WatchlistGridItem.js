import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StarRating from '../StarRating';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 10;
const ITEM_WIDTH = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

const WatchlistGridItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(item)}
            style={styles.container}
        >
            <View style={styles.posterContainer}>
                {item.posterUrl ? (
                    <Image
                        source={{ uri: item.posterUrl }}
                        style={[
                            styles.poster,
                            item.watched && styles.posterWatched
                        ]}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.poster, styles.placeholderPoster]}>
                        <MaterialIcons name="movie" size={40} color="#333" />
                    </View>
                )}

                {item.watched && (
                    <View style={styles.watchedOverlay}>
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                    </View>
                )}

                {/* Rating Badge */}
                {(item.userRating || item.rating) && (
                    <View style={styles.ratingBadge}>
                        <MaterialIcons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {item.userRating || item.rating}
                        </Text>
                    </View>
                )}
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        marginBottom: 15,
    },
    posterContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 5,
        backgroundColor: '#1f1f1f',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    posterWatched: {
        opacity: 0.6,
    },
    placeholderPoster: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    watchedOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    ratingBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default WatchlistGridItem;
