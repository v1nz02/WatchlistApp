import React, { useRef, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
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
  const [editItem, setEditItem] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const openDetail = (item) => {
    setDetailItem(item);
    setDetailModalVisible(true);
  };

  const closeDetail = () => {
    setDetailModalVisible(false);
    setDetailItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setDetailModalVisible(false);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconWrapper}>
                <Ionicons name="play" size={40} color="#E50914" style={styles.logoIcon} />
              </View>
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
            onClose={() => {
              setModalVisible(false);
              setEditItem(null);
            }} 
            editItem={editItem}
          />

          <DetailModal 
            item={detailItem}
            visible={detailModalVisible}
            onClose={closeDetail}
            onEdit={handleEdit}
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
    marginBottom: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "flex-end",
    paddingRight: 7,
    elevation: 5,
  },
});

export default HomeScreen;