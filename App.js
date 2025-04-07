import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Image,
  Platform,
  Easing,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const categories = ["Film", "Serie TV", "Anime","Giochi"];
const OMDB_API_KEY = "ef20483f";
const RAWG_API_KEY = "431d33ae6fe04c3d9e05499752c17bf9"; // Replace with your RAWG API key
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function App() {
  const [watchlist, setWatchlist] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [filterCategory, setFilterCategory] = useState(null);
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const animatedValues = useRef({}).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const filterAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    console.log("filterCategory changed:", filterCategory);
    Animated.sequence([
      Animated.timing(filterAnimation, {
        toValue: 0.7, // Scala più piccola per evidenziare il "pop out"
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(filterAnimation, {
        toValue: 1,
        friction: 3, // Riduci la friction per un "pop in" più accentuato
        useNativeDriver: true,
      }),
    ]).start();
  }, [filterCategory]);

  const loadWatchlist = async () => {
    try {
      const savedWatchlist = await AsyncStorage.getItem('watchlist');
      if (savedWatchlist) {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        setWatchlist(parsedWatchlist);
        parsedWatchlist.forEach(item => {
          animatedValues[item.id] = new Animated.Value(1);
        });
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const saveWatchlist = async (newWatchlist) => {
    try {
      await AsyncStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  };

  const fetchMediaInfo = async (title) => {
    if (selectedCategory === "Film" || selectedCategory === "Serie TV") {
      setIsLoadingPoster(true);
      try {
        const type = selectedCategory === "Film" ? "movie" : "series";
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&type=${type}&plot=full`
        );
        const data = await response.json();
        if (data.Response === "True") {
          setPosterUrl(data.Poster !== "N/A" ? data.Poster : null);
          return {
            posterUrl: data.Poster !== "N/A" ? data.Poster : null,
            year: data.Year,
            rating: data.imdbRating,
            totalSeasons: data.totalSeasons,
            genre: data.Genre,
            actors: data.Actors,
            plot: data.Plot,
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching media info:", error);
        return null;
      } finally {
        setIsLoadingPoster(false);
      }
    } else if (selectedCategory === "Giochi") {
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${RAWG_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const game = data.results[0];
          setPosterUrl(game.background_image ? game.background_image : null);
          return {
            posterUrl: game.background_image && game.background_image !== "N/A" ? game.background_image : null,
            year: game.released ? game.released.substring(0, 4) : "",
            rating: game.rating,
            genre: game.genres ? game.genres.map((g) => g.name).join(", ") : "",
            plot: "", // RAWG non fornisce una sinossi
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching game info:", error);
        return null;
      }
    } else if (selectedCategory === "Anime") {
      try {
        // Utilizziamo Jikan API per cercare un anime 
        const response = await fetch(
          `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`
        );
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const anime = data.data[0];
          setPosterUrl(anime.images.jpg.large_image_url || null);
          return {
            posterUrl: anime.images.jpg.large_image_url && anime.images.jpg.large_image_url !== "N/A" ? anime.images.jpg.large_image_url : null,
            year: anime.aired && anime.aired.prop.from.year ? anime.aired.prop.from.year : "",
            rating: anime.score,
            genre: anime.genres ? anime.genres.map(g => g.name).join(", ") : "",
            plot: anime.synopsis || "",
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching anime info:", error);
        return null;
      } finally {
        setIsLoadingPoster(false);
      }
    }
    return null;
  };

  const removeItem = (id) => {
    const newWatchlist = watchlist.filter((item) => item.id !== id);
    
    Animated.timing(animatedValues[id], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      const remainingItems = newWatchlist.map((item, index) => {
        if (!animatedValues[item.id]) {
          animatedValues[item.id] = new Animated.Value(1);
        }
        return {
          ...item,
          animatedValue: animatedValues[item.id]
        };
      });

      remainingItems.forEach((item, index) => {
        item.animatedValue.setValue(0.8);
        const delay = index * 50;
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.spring(item.animatedValue, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(item.animatedValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            })
          ])
        ]).start();
      });

      setWatchlist(newWatchlist);
      saveWatchlist(newWatchlist);
      delete animatedValues[id];
    });
  };

  const addItem = async () => {
    const id = Date.now().toString();
    animatedValues[id] = new Animated.Value(0);
    
    let mediaData = null;
    if (selectedCategory === "Film" || selectedCategory === "Serie TV" || selectedCategory === "Giochi" || selectedCategory === "Anime") {
      mediaData = await fetchMediaInfo(title);
    }

    const newWatchlist = [{
      id,
      title,
      description: description || mediaData?.plot || "",
      category: selectedCategory,
      createdAt: new Date().toISOString(),
      posterUrl: mediaData?.posterUrl,
      year: mediaData?.year,
      rating: mediaData?.rating,
      totalSeasons: mediaData?.totalSeasons,
      genre: mediaData?.genre,
      actors: mediaData?.actors
    }, ...watchlist];
    
    setWatchlist(newWatchlist);
    saveWatchlist(newWatchlist);
    setTitle("");
    setDescription("");
    setPosterUrl(null);
    setModalVisible(false);

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    Animated.timing(animatedValues[id], {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      setModalVisible(false);
      setTitle("");
      setDescription("");
      setSelectedCategory(categories[0]);
      setPosterUrl(null);
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

  const getSortedAndFilteredList = () => {
    return filterCategory
      ? watchlist.filter((item) => item.category === filterCategory)
      : watchlist;
  };

  const renderRightActions = (progress, dragX, itemId) => {
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

  const renderItem = ({ item, index }) => {
    if (!animatedValues[item.id]) {
      animatedValues[item.id] = new Animated.Value(1);
    }

    const itemHeight = 200;
    const inputRange = [
      -1,
      0,
      itemHeight * index,
      itemHeight * (index + 1),
      itemHeight * (index + 2)
    ];

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5, 0],
      extrapolate: 'clamp',
    });

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.95, 0.9],
      extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [0, 0, 0, -10, -20],
      extrapolate: 'clamp',
    });

    const animatedStyle = {
      opacity: Animated.multiply(animatedValues[item.id], opacity),
      transform: [
        { 
          translateX: animatedValues[item.id].interpolate({
            inputRange: [0, 1],
            outputRange: [-100, 0],
          })
        },
        { 
          scale: Animated.multiply(
            animatedValues[item.id].interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [0.8, 1.05, 1],
            }),
            scale
          )
        },
        { translateY }
      ],
    };

    return (
      <Animated.View style={[styles.itemWrapper, animatedStyle]}>
        <Swipeable
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
          onSwipeableRightOpen={() => removeItem(item.id)}
          onSwipeableRightWillOpen={() => {
            Animated.timing(animatedValues[item.id], {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.in(Easing.ease),
            }).start();
          }}
          rightThreshold={50}
          friction={2.5}
          overshootFriction={12}
          enableTrackpadTwoFingerGesture={false}
          containerStyle={styles.swipeableContainer}
          useNativeAnimations={true}
          shouldActivateOnStart={false}
          direction="right"
          dragOffsetFromLeftEdge={25}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={() => openDetail(item)}>
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.year && (
                      <Text style={styles.year}>({item.year})</Text>
                    )}
                  </View>
                  <View style={styles.contentRow}>
                    {item.posterUrl ? (
                      <Image
                        source={{ uri: item.posterUrl }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : null}
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
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>zWatch</Text>
          </View>
          <View style={styles.filterContainer}>
            <View style={styles.categoryFilter}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat} 
                  onPress={() => setFilterCategory(cat === filterCategory ? null : cat)}
                >
                  <Text
                    style={[
                      styles.category,
                      filterCategory === cat && styles.selectedCategory,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Animated.View 
            style={{ transform: [{ scale: filterAnimation }], flex: 1 }}  
            pointerEvents="box-none"
          >
            <AnimatedFlatList
              ref={flatListRef}
              data={getSortedAndFilteredList()}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
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
            onPress={openModal}
          >
            <Ionicons name="add-circle" size={64} color="#E50914" />
          </TouchableOpacity>

          <Modal 
            animationType="none" 
            transparent 
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <Animated.View 
                style={[
                  styles.modalView,
                  {
                    transform: [
                      {
                        translateY: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [600, 0],
                        })
                      }
                    ],
                    opacity: modalAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.5, 1],
                    }),
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Aggiungi elemento</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Titolo"
                  placeholderTextColor="#777"
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descrizione"
                  placeholderTextColor="#777"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalCategories}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.category,
                          selectedCategory === cat && styles.selectedCategory,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Annulla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={addItem}>
                    <Ionicons name="save-outline" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Salva</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent
            visible={detailModalVisible}
            onRequestClose={closeDetail}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalView, { maxHeight: "80%" }]}>
                <Text style={styles.modalTitle}>{detailItem?.title}</Text>
                {detailItem?.posterUrl && (
                  <Image
                    source={{ uri: detailItem.posterUrl }}
                    style={{ width: 120, height: 180, alignSelf: "center", borderRadius: 8, marginVertical: 10 }}
                    resizeMode="cover"
                  />
                )}
                <Text style={{ color: "#aaa", marginVertical: 8 }}>{detailItem?.description}</Text>
                {detailItem?.year && (
                  <Text style={{ color: "#fff" }}>Year: {detailItem.year}</Text>
                )}
                {detailItem?.rating && (
                  <Text style={{ color: "#FFD700" }}>Rating: {detailItem.rating}</Text>
                )}
                {detailItem?.genre && (
                  <Text style={{ color: "#aaa" }}>Genre: {detailItem.genre}</Text>
                )}
                <TouchableOpacity style={[styles.cancelButton, { marginTop: 20 }]} onPress={closeDetail}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    color: "#E50914", // Rosso elegante
    fontSize: 32,
    fontWeight: "bold",
    fontStyle: "italic", // Font in corsivo
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: Platform.OS === "ios" ? "Georgia-Italic" : "serif", // Usa un font corsivo su iOS
  },
  filterContainer: {
    marginBottom: 10,
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryFilter: {
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#1f1f1f',
  },
  selectedCategory: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
    color: "#fff",
  },
  item: {
    backgroundColor: "#1f1f1f",
    marginVertical: 4,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    transform: [{ scale: 1 }],
  },
  itemContent: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'column',
    gap: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 16,
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
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
  addButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "flex-end",
    paddingRight: 7,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    color: "#fff",
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalCategories: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    minWidth: 120,
    flexDirection: "row",
    backgroundColor: "#555",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginRight: 10,
  },
  saveButton: {
    minWidth: 120,
    flexDirection: "row",
    backgroundColor: "#E50914",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
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
  itemWrapper: {
    marginVertical: 6,
    transform: [{ perspective: 1000 }],
  },
  swipeableContainer: {
    backgroundColor: 'transparent',
  },
});
