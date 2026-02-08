import React, { useContext, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistContext } from '../../context/WatchlistContext';
import WatchlistItem from './WatchlistItem';
import WatchlistGridItem from './WatchlistGridItem';

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const WatchlistList = ({
    data,
    isWatched,
    onPress,
    scrollHandler,
    ListEmptyComponent
}) => {
    const {
        viewMode,
        flatListRef,
        watchedFlatListRef,
        filterAnimation,
        listTransitionAnim
    } = useContext(WatchlistContext);

    const scrollY = useRef(new Animated.Value(0)).current;

    // Usa l'handler passato o uno locale se non fornito (per la lista Watched)
    const onScroll = scrollHandler || Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
    );

    const renderItem = ({ item, index }) => {
        if (viewMode === 'grid') {
            return (
                <View style={styles.gridItemContainer}>
                    <WatchlistGridItem
                        item={item}
                        onPress={onPress}
                    />
                </View>
            );
        }

        return (
            <WatchlistItem
                item={item}
                index={index}
                scrollY={scrollY}
                onPress={onPress}
                isWatched={isWatched}
            />
        );
    };

    const key = viewMode; // Force re-render when switching modes

    return (
        <Animated.View
            style={{
                transform: [
                    { scale: filterAnimation },
                    { scale: listTransitionAnim }
                ],
                opacity: listTransitionAnim,
                flex: 1
            }}
            pointerEvents="box-none"
        >
            <AnimatedFlatList
                key={key}
                ref={isWatched ? watchedFlatListRef : flatListRef}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.listContent,
                    viewMode === 'grid' && styles.gridContent
                ]}
                numColumns={viewMode === 'grid' ? 3 : 1}
                decelerationRate="normal"
                snapToAlignment="start"
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={11}
                columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
                ListEmptyComponent={ListEmptyComponent || (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="videocam-outline" size={64} color="#444" />
                        <Text style={styles.emptyText}>
                            {isWatched ? "Nessun elemento visto" : "La tua watchlist è vuota"}
                        </Text>
                    </View>
                )}
                // Animation props defaults
                layoutAnimation={{
                    duration: 300,
                    create: {
                        type: 'spring',
                        property: 'opacity',
                        springDamping: 0.7,
                    },
                    delete: {
                        type: 'spring',
                        property: 'opacity',
                        springDamping: 0.7,
                    },
                }}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100,
        paddingTop: 10,
    },
    gridContent: {
        paddingHorizontal: 0,
    },
    gridItemContainer: {
        flex: 1,
        alignItems: 'center',
        margin: 2,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 20,
        color: '#666',
        fontSize: 18,
        fontFamily: 'Caveat-SemiBold',
    },
});

export default WatchlistList;
