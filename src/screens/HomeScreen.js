import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WatchlistContext } from '../context/WatchlistContext';
import CategoryFilter from '../components/watchlist/CategoryFilter';
import WatchlistItem from '../components/watchlist/WatchlistItem';
import AddItemModal from '../components/watchlist/AddItemModal';
import DetailModal from '../components/watchlist/DetailModal';

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const HomeScreen = () => {
  const { filteredWatchlist, filterAnimation, listTransitionAnim, flatListRef } = useContext(WatchlistContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Effetto di rotazione per rendere l'icona "corsiva"
  const rotate = scrollY.interpolate({
    inputRange: [0, 50, 100, 150],
    outputRange: ['0deg', '-10deg', '-20deg', '-15deg'],
    extrapolate: 'clamp'
  });

  // Effetto di scala per far "pulsare" leggermente l'icona durante lo scroll
  const scale = scrollY.interpolate({
    inputRange: [0, 75, 150],
    outputRange: [1, 1.2, 1],
    extrapolate: 'clamp'
  });

  // Animazione continua per l'effetto di "corsivo" anche quando non si scorre
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const idleRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg']
  });

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
                <Animated.View 
                  style={{
                    transform: [
                      { rotate: scrollY._value > 0 ? rotate : idleRotation },
                      { scale: scrollY._value > 0 ? scale : scaleAnim }
                    ]
                  }}
                >
                  <AnimatedIcon name="play" size={40} color="#E50914" style={styles.logoIcon} />
                </Animated.View>
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
    marginBottom: 10, // Ridotto da 20 a 10
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
    fontSize: 42, // Increased font size for better visibility
    fontWeight: "normal", // Caveat looks better with normal weight
    textAlign: "center",
    fontFamily: "Caveat-Bold", // Using the Bold variant for more impact
    letterSpacing: 1.2, // Increased letter spacing
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