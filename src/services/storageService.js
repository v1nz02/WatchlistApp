import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_STORAGE_KEY = 'watchlist';

export const loadWatchlist = async () => {
  try {
    const savedWatchlist = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (savedWatchlist) {
      return JSON.parse(savedWatchlist);
    }
    return [];
  } catch (error) {
    console.error('Errore nel caricamento della watchlist:', error);
    return [];
  }
};

export const saveWatchlist = async (watchlist) => {
  try {
    await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    return true;
  } catch (error) {
    console.error('Errore nel salvataggio della watchlist:', error);
    return false;
  }
};