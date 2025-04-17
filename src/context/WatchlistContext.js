import React, { createContext, useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { loadWatchlist, saveWatchlist } from '../services/storageService';
import { fetchMediaInfo } from '../services/mediaService';

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);
  const animatedValues = useRef({}).current;
  const filterAnimation = useRef(new Animated.Value(1)).current;
  const listTransitionAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);
  const watchedFlatListRef = useRef(null);

  // Funzione per impostare il riferimento alla FlatList della schermata Watched
  const setWatchedFlatListRef = (ref) => {
    watchedFlatListRef.current = ref;
  };

  useEffect(() => {
    loadWatchlistData();
  }, []);

  useEffect(() => {
    // Run animations when the filter category changes
    Animated.sequence([
      // First, scale down the list slightly
      Animated.timing(listTransitionAnim, {
        toValue: 0.96,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      
      // Then scale up and add a small bounce effect
      Animated.spring(listTransitionAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      })
    ]).start();

    // Also run the filter button animation
    Animated.sequence([
      Animated.timing(filterAnimation, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(filterAnimation, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Scroll to top when filter changes for both flatLists
    setTimeout(() => {
      // Controlla che il riferimento esista e che abbia il metodo scrollToOffset
      if (flatListRef.current && typeof flatListRef.current.scrollToOffset === 'function') {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
      
      // Controlla che il riferimento esista e che abbia il metodo scrollToOffset
      if (watchedFlatListRef.current && typeof watchedFlatListRef.current.scrollToOffset === 'function') {
        watchedFlatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    }, 100);
  }, [filterCategory]);

  const loadWatchlistData = async () => {
    const loadedWatchlist = await loadWatchlist();
    setWatchlist(loadedWatchlist);
    
    // Initialize animation values
    loadedWatchlist.forEach(item => {
      animatedValues[item.id] = new Animated.Value(1);
    });
  };

  const addItem = async (title, description, category) => {
    const id = Date.now().toString();
    animatedValues[id] = new Animated.Value(0);
    
    let mediaData = null;
    mediaData = await fetchMediaInfo(title, category);

    const newWatchlist = [{
      id,
      title,
      description: description || mediaData?.plot || "",
      category,
      watched: false,
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
    
    // Reset filter to show the new item if in a different category
    if (filterCategory !== null && filterCategory !== category) {
      setFilterCategory(null);
    }
    
    // Scroll to top to show the new item
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 300);
    }
    
    Animated.timing(animatedValues[id], {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
    
    return id;
  };

  const removeItem = (id) => {
    const newWatchlist = watchlist.filter((item) => item.id !== id);
    
    Animated.timing(animatedValues[id], {
      toValue: 0,
      duration: 350, // Durata leggermente aumentata per un'animazione più fluida
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      const remainingItems = newWatchlist.map((item) => {
        if (!animatedValues[item.id]) {
          animatedValues[item.id] = new Animated.Value(1);
        }
        return {
          ...item,
          animatedValue: animatedValues[item.id]
        };
      });

      remainingItems.forEach((item, index) => {
        item.animatedValue.setValue(0.85); // Valore iniziale più alto per un'animazione più sottile
        const delay = index * 40; // Delay ridotto per un'animazione più veloce
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(item.animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 60, // Tensione aumentata
            friction: 6,  // Attrito ridotto per un leggero rimbalzo
            overshootClamping: false, // Consente un leggero overshoot per un effetto più naturale
          })
        ]).start();
      });

      setWatchlist(newWatchlist);
      saveWatchlist(newWatchlist);
      delete animatedValues[id];
    });
  };

  const updateItem = async (updatedItem) => {
    const newWatchlist = watchlist.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setWatchlist(newWatchlist);
    saveWatchlist(newWatchlist);
    
    // Reset filter se necessario per mostrare l'elemento aggiornato
    if (filterCategory !== null && filterCategory !== updatedItem.category) {
      setFilterCategory(null);
    }
    
    return updatedItem.id;
  };

  const toggleWatched = (id) => {
    const itemToUpdate = watchlist.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    // Toglia il valore watched
    const updatedItem = {
      ...itemToUpdate,
      watched: !itemToUpdate.watched,
      watchedAt: !itemToUpdate.watched ? new Date().toISOString() : null
    };
    
    const newWatchlist = watchlist.map(item => 
      item.id === id ? updatedItem : item
    );
    
    setWatchlist(newWatchlist);
    saveWatchlist(newWatchlist);
    
    // Reset completo dell'animazione per garantire che la scala torni a 1
    if (animatedValues[id]) {
      // Prima resettiamo il valore a 1 immediatamente se era meno di 1
      if (animatedValues[id]._value < 1) {
        animatedValues[id].setValue(1);
      }
      
      // Poi applichiamo un'animazione che evidenzi il cambio di stato
      Animated.sequence([
        // Scala leggermente verso il basso
        Animated.timing(animatedValues[id], {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        // Ritorna a scala 1 con un leggero effetto elastico
        Animated.spring(animatedValues[id], {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  // Filtriamo gli elementi in base allo stato watched
  const getUnwatchedItems = () => {
    return watchlist.filter(item => !item.watched);
  };

  const getWatchedItems = () => {
    return watchlist.filter(item => item.watched);
  };

  // Filtriamo per categoria, considerando elementi visti/non visti
  const getFilteredUnwatchedWatchlist = () => {
    const unwatchedItems = getUnwatchedItems();
    return filterCategory
      ? unwatchedItems.filter((item) => item.category === filterCategory)
      : unwatchedItems;
  };

  const getFilteredWatchedWatchlist = () => {
    const watchedItems = getWatchedItems();
    return filterCategory
      ? watchedItems.filter((item) => item.category === filterCategory)
      : watchedItems;
  };

  const value = {
    watchlist,
    unwatchedWatchlist: getUnwatchedItems(),
    watchedWatchlist: getWatchedItems(),
    filteredWatchlist: getFilteredUnwatchedWatchlist(),
    filteredWatchedWatchlist: getFilteredWatchedWatchlist(),
    filterCategory,
    filterAnimation,
    listTransitionAnim,
    animatedValues,
    flatListRef,
    watchedFlatListRef,
    addItem,
    removeItem,
    updateItem,
    toggleWatched,
    setFilterCategory,
    setWatchedFlatListRef,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};