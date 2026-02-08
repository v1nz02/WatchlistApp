import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MEDIA_CATEGORIES } from '../../constants/categories';
import { WatchlistContext } from '../../context/WatchlistContext';
import { searchMedia } from '../../services/mediaService';

const AddItemModal = ({ visible, onClose, editItem }) => {
  const { addItem, updateItem } = useContext(WatchlistContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(MEDIA_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Carica i dati dell'elemento quando è in modalità modifica
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setDescription(editItem.description || '');
      setSelectedCategory(editItem.category || MEDIA_CATEGORIES[0]);
    } else if (visible) {
      resetForm();
    }
  }, [editItem, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory(MEDIA_CATEGORIES[0]);
    setSearchResults([]);
    setShowResults(false);
    setIsSearching(false);
  };

  React.useEffect(() => {
    if (visible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      modalAnimation.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const performSearch = async () => {
    if (!title.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    setSearchResults([]); // Clear previous results

    try {
      const results = await searchMedia(title, selectedCategory);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = async (item) => {
    setIsLoading(true);
    try {
      // Add item using the ID from the search result
      await addItem(item.title, "", item.category, item.id);
      handleClose();
    } catch (error) {
      console.error("Add item error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      if (editItem) {
        // Modifica elemento esistente
        await updateItem({
          ...editItem,
          title,
          description,
          category: selectedCategory
        });
        handleClose();
      } else {
        // Direct add (fallback or manual)
        await addItem(title, description, selectedCategory);
        handleClose();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item)}
    >
      <Image
        source={item.posterUrl ? { uri: item.posterUrl } : null}
        style={styles.resultPoster}
        resizeMode="cover"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultYear}>{item.year}</Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color="#E50914" />
    </TouchableOpacity>
  );


  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={handleClose}
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
              height: showResults ? '80%' : 'auto'
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editItem ? 'Modifica' : 'Nuovo Elemento'}
            </Text>
            {showResults && (
              <TouchableOpacity onPress={() => setShowResults(false)} style={styles.closeResultsButton}>
                <Ionicons name="close-circle" size={24} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={editItem ? "Titolo" : "Cerca film, serie..."}
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                onSubmitEditing={!editItem ? performSearch : undefined}
                returnKeyType="search"
                autoFocus={!editItem}
              />
              {(title.length > 0 && !editItem) && (
                <TouchableOpacity onPress={performSearch} style={styles.searchIconBtn}>
                  <Ionicons name="arrow-forward-circle" size={28} color="#E50914" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.modalCategories}>
            {MEDIA_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.category,
                  selectedCategory === cat && styles.selectedCategory,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  // If results are shown, hide them to reset context or trigger new search logic if desired
                  if (showResults && title.trim()) {
                    setShowResults(false);
                  }
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.selectedCategoryText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showResults ? (
            <View style={styles.resultsContainer}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E50914" />
                  <Text style={styles.loadingText}>Ricerca in corso...</Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSearchResult}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Ionicons name="search-outline" size={48} color="#444" />
                      <Text style={styles.emptyText}>Nessun risultato trovato</Text>
                    </View>
                  }
                />
              )}
            </View>
          ) : (
            <>
              {/* Description only in edit mode or manual fallback */}
              {(editItem || title.length > 0) && (
                <View style={styles.descriptionContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Aggiungi una nota o descrizione..."
                    placeholderTextColor="#666"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !title.trim() && styles.disabledButton]}
                  onPress={handleSaveItem}
                  disabled={isLoading || !title.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name={editItem ? "checkmark" : "add"} size={20} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.saveButtonText}>
                        {editItem ? 'Salva' : 'Aggiungi'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Add padding to avoid edges
  },
  modalView: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeResultsButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  searchIconBtn: {
    padding: 4,
  },
  modalCategories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: '#222',
    padding: 4,
    borderRadius: 14,
  },
  category: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: "#333",
  },
  categoryText: {
    color: "#888",
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    minHeight: 250,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultPoster: {
    width: 48,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultYear: {
    color: '#888',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    opacity: 0.6
  },
  emptyText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
  descriptionContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    color: "#fff",
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom if space available
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#E50914",
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 14,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // elevation: 6, // Removed to avoid potential cut-off on Android in modal
  },
  disabledButton: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddItemModal;