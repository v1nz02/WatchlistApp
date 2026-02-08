import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Animated, PanResponder } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WatchlistContext } from '../../context/WatchlistContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 10;
const ITEM_WIDTH = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;
const SWIPE_THRESHOLD = 80;

const WatchlistGridItem = ({ item, onPress }) => {
    const { toggleWatched, removeItem } = useContext(WatchlistContext);
    const pan = useRef(new Animated.ValueXY()).current;
    // Scale animation for when dragging starts
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [dragging, setDragging] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Activate only on horizontal movement larger than a small threshold
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
            },
            onPanResponderGrant: () => {
                setDragging(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Animated.spring(scaleAnim, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }).start();
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value
                });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                pan.flattenOffset();
                setDragging(false);

                // Swipe Right -> Toggle Watched
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Animated.timing(pan, {
                        toValue: { x: width, y: 0 },
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        toggleWatched(item.id);
                        // Reset position instantly
                        pan.setValue({ x: 0, y: 0 });
                        scaleAnim.setValue(1);
                    });
                }
                // Swipe Left -> Delete
                else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    Animated.timing(pan, {
                        toValue: { x: -width, y: 0 },
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        removeItem(item.id);
                        // Reset needed if item removal doesn't unmount component immediately 
                        // (though usually it does for delete)
                    });
                }
                // Return to original position
                else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        friction: 5,
                        useNativeDriver: true
                    }).start();
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    // Interpolations for background color/icons based on drag
    const rotate = pan.x.interpolate({
        inputRange: [-200, 0, 200],
        outputRange: ['-10deg', '0deg', '10deg']
    });

    const overlayOpacityRight = pan.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const overlayOpacityLeft = pan.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.wrapper}>
            {/* Background Actions Hints */}
            <View style={[styles.actionBackground, { justifyContent: 'space-between', flexDirection: 'row' }]}>
                {/* Left side (Delete hint, visible when swiping left) */}
                <View style={[styles.actionIconContainer, { left: 10 }]}>
                    {/* Placeholder, actually handled by overlay on top for smoother effect */}
                </View>
            </View>

            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [
                            { translateX: pan.x },
                            { translateY: pan.y },
                            { rotate: rotate },
                            { scale: scaleAnim }
                        ],
                        zIndex: dragging ? 100 : 1
                    }
                ]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => !dragging && onPress(item)}
                    style={styles.touchableContent}
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

                        {/* Drag Overlays */}
                        {/* Green Overlay for Watched (Right Swipe) */}
                        <Animated.View style={[styles.dragOverlay, { backgroundColor: 'rgba(76, 175, 80, 0.7)', opacity: overlayOpacityRight }]}>
                            <Ionicons name={item.watched ? "eye-off" : "checkmark-circle"} size={40} color="#fff" />
                            <Text style={styles.overlayText}>{item.watched ? "Non Visto" : "Visto"}</Text>
                        </Animated.View>

                        {/* Red Overlay for Delete (Left Swipe) */}
                        <Animated.View style={[styles.dragOverlay, { backgroundColor: 'rgba(229, 9, 20, 0.7)', opacity: overlayOpacityLeft }]}>
                            <Ionicons name="trash" size={40} color="#fff" />
                            <Text style={styles.overlayText}>Elimina</Text>
                        </Animated.View>

                        {item.watched && (
                            <View style={styles.watchedOverlay}>
                                <MaterialIcons name="check-circle" size={32} color="#E50914" />
                            </View>
                        )}

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
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: ITEM_WIDTH,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: ITEM_WIDTH * 1.5 + 40, // Reserve space
    },
    container: {
        width: ITEM_WIDTH,
        alignItems: 'center',
    },
    touchableContent: {
        width: '100%',
        alignItems: 'center',
    },
    posterContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        backgroundColor: '#1f1f1f',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    posterWatched: {
        opacity: 0.4,
    },
    placeholderPoster: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    watchedOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 5,
    },
    dragOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        zIndex: 10,
    },
    overlayText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5,
        fontSize: 14,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 3,
    },
    ratingBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        zIndex: 6,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: 'bold',
    },
    title: {
        color: '#ddd',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
        width: '100%',
    },
    actionBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
});

export default WatchlistGridItem;
