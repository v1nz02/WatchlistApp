import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Modal, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MEDIA_CATEGORIES } from '../../constants/categories';
import { WatchlistContext } from '../../context/WatchlistContext';

const AddItemModal = ({ visible, onClose, editItem }) => {
  const { addItem, updateItem } = useContext(WatchlistContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(MEDIA_CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Carica i dati dell'elemento quando è in modalità modifica
  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setDescription(editItem.description || '');
      setSelectedCategory(editItem.category || MEDIA_CATEGORIES[0]);
    } else {
      setTitle('');
      setDescription('');
      setSelectedCategory(MEDIA_CATEGORIES[0]);
    }
  }, [editItem]);

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
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleSaveItem = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    if (editItem) {
      // Modifica elemento esistente
      await updateItem({
        ...editItem,
        title,
        description,
        category: selectedCategory
      });
    } else {
      // Aggiungi nuovo elemento
      await addItem(title, description, selectedCategory);
    }
    
    setIsLoading(false);
    handleClose();
  };

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
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editItem ? 'Modifica elemento' : 'Aggiungi elemento'}
            </Text>
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
            {MEDIA_CATEGORIES.map((cat) => (
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
              onPress={handleClose}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.buttonText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveItem}
              disabled={isLoading}
            >
              <Ionicons name="save-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>{isLoading ? 'Salvataggio...' : 'Salva'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default AddItemModal;