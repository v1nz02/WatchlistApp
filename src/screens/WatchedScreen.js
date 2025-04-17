import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WatchlistContext } from '../context/WatchlistContext';
import CategoryFilter from '../components/watchlist/CategoryFilter';
import WatchlistItem from '../components/watchlist/WatchlistItem';
import DetailModal from '../components/watchlist/DetailModal';

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const WatchedScreen = ({ navigation }) => {
  const { filteredWatchedWatchlist, filterAnimation, listTransitionAnim, setWatchedFlatListRef } = useContext(WatchlistContext);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const watchedFlatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Pass the ref to context
  useEffect(() => {
    if (watchedFlatListRef.current) {
      setWatchedFlatListRef(watchedFlatListRef);
    }
  }, [watchedFlatListRef.current]);

  // Handle screen transitions with animation
  useEffect(() => {
    // Fade in when the screen mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  // Custom back navigation with animation
  const handleGoBack = () => {
    // Fade out and then navigate back
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const openDetail = (item) => {
    setDetailItem(item);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setDetailItem(null);
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={28} color="#E50914" />
              </TouchableOpacity>
              <View style={styles.logoContainer}>
                <View style={styles.logoIconWrapper}>
                  <Ionicons name="checkmark-circle" size={32} color="#E50914" style={styles.logoIcon} />
                </View>
                <Text style={styles.header}>Visti</Text>
              </View>
            </View>

            <CategoryFilter isWatchedScreen={true} />
            
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
                ref={watchedFlatListRef}
                data={filteredWatchedWatchlist}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <WatchlistItem 
                    item={item} 
                    index={index} 
                    scrollY={scrollY}
                    onPress={openDetail}
                    isWatched={true}
                  />
                )}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: true }
                )}
                scrollEventThrottle={4}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                decelerationRate="normal"
                snapToAlignment="start"
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={11}
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
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="videocam-outline" size={64} color="#444" />
                    <Text style={styles.emptyText}>Nessun elemento visto</Text>
                  </View>
                }
              />
            </Animated.View>

            <DetailModal 
              item={detailItem}
              visible={detailModalVisible}
              onClose={closeDetail}
              isWatched={true}
            />
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  headerContainer: {
    marginBottom: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginRight: 46, // Per bilanciare il backbutton
  },
  logoIconWrapper: {
    marginRight: 10,
    elevation: 5,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  logoIcon: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  }
});

export default WatchedScreen;