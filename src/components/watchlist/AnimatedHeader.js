import React, { useContext } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WatchlistContext } from '../../context/WatchlistContext';

const AnimatedHeader = ({
    toggleWatchedView,
    slideAnim,
    watchTitle,
    watchedTitle,
    showWatched
}) => {
    const navigation = useNavigation();
    const {
        sortAnimation,
        sortByRating,
        toggleSortByRating,
        viewMode,
        toggleViewMode
    } = useContext(WatchlistContext);

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.watchedButton}
                onPress={toggleWatchedView}
            >
                <View style={styles.iconContainer}>
                    <Animated.View style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        opacity: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0]
                        }),
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Ionicons name="checkmark-circle-outline" size={40} color="#E50914" />
                    </Animated.View>
                    <Animated.View style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        opacity: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                        }),
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Ionicons name="play-circle-outline" size={40} color="#E50914" />
                    </Animated.View>
                </View>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <View style={styles.titleContainer}>
                    {/* Titolo "zWatch" che sfuma e scorre verso il basso */}
                    <Animated.Text style={[
                        styles.header,
                        {
                            position: 'absolute',
                            width: '100%',
                            textAlign: 'center',
                            opacity: slideAnim.interpolate({
                                inputRange: [0, 0.3, 0.5],
                                outputRange: [1, 0, 0]
                            }),
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 0.5],
                                    outputRange: [0, 20]
                                })
                            }]
                        }
                    ]}>
                        {watchTitle}
                    </Animated.Text>

                    {/* Titolo "Visti" che appare dal basso */}
                    <Animated.Text style={[
                        styles.header,
                        {
                            position: 'absolute',
                            width: '100%',
                            textAlign: 'center',
                            opacity: slideAnim.interpolate({
                                inputRange: [0.5, 0.7, 1],
                                outputRange: [0, 0, 1]
                            }),
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0.5, 1],
                                    outputRange: [-20, 0]
                                })
                            }]
                        }
                    ]}>
                        {watchedTitle}
                    </Animated.Text>
                </View>
            </View>

            <View style={styles.headerActions}>
                {/* Toggle Grid/List View */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleViewMode}
                >
                    <Ionicons
                        name={viewMode === 'grid' ? "list" : "grid"}
                        size={24}
                        color="#666"
                    />
                </TouchableOpacity>

                {/* Statistics Button */}


                {/* Sort Button */}
                <Animated.View style={{
                    transform: [{ scale: sortAnimation }]
                }}>
                    <TouchableOpacity
                        style={[styles.sortButton, sortByRating && styles.sortButtonActive]}
                        onPress={toggleSortByRating}
                    >
                        <Ionicons
                            name="star"
                            size={24}
                            color={sortByRating ? "#FFD700" : "#666"}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    watchedButton: {
        padding: 8,
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    titleContainer: {
        position: 'relative',
        width: 150,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginLeft: -15, // Compensate for left button width visually
    },
    header: {
        color: "#E50914",
        fontSize: 42,
        fontWeight: "normal",
        textAlign: "center",
        fontFamily: "Caveat-Bold",
        letterSpacing: 1.2,
        textShadowColor: '#000',
        textShadowOffset: { width: 1.5, height: 1.5 },
        textShadowRadius: 3,
        width: '100%',
        paddingLeft: 0,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    sortButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    sortButtonActive: {
        backgroundColor: '#2a2a2a',
        borderColor: '#FFD700',
    },
});

export default AnimatedHeader;
