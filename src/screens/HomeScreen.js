import React, { useRef, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WatchlistContext } from '../context/WatchlistContext';
import CategoryFilter from '../components/watchlist/CategoryFilter';
import WatchlistItem from '../components/watchlist/WatchlistItem';
import AddItemModal from '../components/watchlist/AddItemModal';
import DetailModal from '../components/watchlist/DetailModal';

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const HomeScreen = () => {
  const { filteredWatchlist, filterAnimation, listTransitionAnim, flatListRef } = useContext(WatchlistContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const openDetail = (item) => {
    setDetailItem(item);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setDetailItem(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="film" size={34} color="#E50914" style={styles.logoIcon} />
              <Text style={styles.header}>zWatch</Text>
            </View>
          </View>

          <CategoryFilter />
          
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
              ref={flatListRef}
              data={filteredWatchlist}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <WatchlistItem 
                  item={item} 
                  index={index} 
                  scrollY={scrollY}
                  onPress={openDetail}
                />
              )}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={4} // Ridotto da 8 a 4 per un tracking più preciso dello scrolling
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }} // Aggiunto padding superiore
              decelerationRate="normal" // Cambio da "fast" a "normal" per uno scrolling più naturale
              snapToAlignment="start" // Aggiunto per migliorare lo snapping quando ci si ferma
              initialNumToRender={5} // Rendering iniziale di più item per prestazioni migliori
              maxToRenderPerBatch={10} // Numero massimo di item da renderizzare in un batch
              windowSize={11} // Aumentato da default a 11 per migliorare le prestazioni di scrolling
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

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={64} color="#E50914" />
          </TouchableOpacity>

          <AddItemModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
          />

          <DetailModal 
            item={detailItem}
            visible={detailModalVisible}
            onClose={closeDetail}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
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
    marginBottom: 10, // Ridotto da 20 a 10
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
    transform: [{ rotateY: '180deg' }],
    alignSelf: 'center',
  },
  header: {
    color: "#E50914",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Black" : "sans-serif-medium",
    letterSpacing: 0.8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "flex-end",
    paddingRight: 7,
    elevation: 5,
  },
});

export default HomeScreen;