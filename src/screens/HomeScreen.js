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
  const { filteredWatchlist, filterAnimation } = useContext(WatchlistContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

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
            <Text style={styles.header}>zWatch</Text>
          </View>

          <CategoryFilter />
          
          <Animated.View 
            style={{ transform: [{ scale: filterAnimation }], flex: 1 }}  
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
              scrollEventThrottle={8}
              contentContainerStyle={{ paddingBottom: 100 }}
              decelerationRate="fast"
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
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    color: "#E50914",
    fontSize: 32,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: Platform.OS === "ios" ? "Georgia-Italic" : "serif",
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