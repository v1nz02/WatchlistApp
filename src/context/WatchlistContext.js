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
  
  useEffect(() => {
    loadWatchlistData();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(filterAnimation, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(filterAnimation, {
        toValue: 1,
        friction: 3,
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
    animatedValues,
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