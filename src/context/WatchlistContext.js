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
      duration: 300,
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
        item.animatedValue.setValue(0.8);
        const delay = index * 50;
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(item.animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          })
        ]).start();
      });

      setWatchlist(newWatchlist);
      saveWatchlist(newWatchlist);
      delete animatedValues[id];
    });
  };

  const getFilteredWatchlist = () => {
    return filterCategory
      ? watchlist.filter((item) => item.category === filterCategory)
      : watchlist;
  };

  const value = {
    watchlist,
    filteredWatchlist: getFilteredWatchlist(),
    filterCategory,
    filterAnimation,
    listTransitionAnim,
    animatedValues,
    flatListRef,
    addItem,
    removeItem,
    setFilterCategory,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};