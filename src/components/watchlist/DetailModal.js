import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetailModal = ({ item, visible, onClose }) => {
  if (!item) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalView, { maxHeight: "80%" }]}>
          <Text style={styles.modalTitle}>{item.title}</Text>
          {item.posterUrl && (
            <Image
              source={{ uri: item.posterUrl }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          )}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              {item.description}
            </Text>
          </ScrollView>
          {item.year && (
            <Text style={styles.detailText}>Anno: {item.year}</Text>
          )}
          {item.rating && (
            <Text style={styles.ratingText}>Recensione: {item.rating}</Text>
          )}
          {item.genre && (
            <Text style={styles.detailText}>Genere: {item.genre}</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.buttonText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
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
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  posterImage: {
    width: 120, 
    height: 180, 
    alignSelf: "center", 
    borderRadius: 8, 
    marginVertical: 10
  },
  scrollContent: {
    maxHeight: 150,
  },
  description: {
    color: "#aaa", 
    marginVertical: 8,
    lineHeight: 18,
  },
  detailText: {
    color: "#fff",
    marginVertical: 4,
  },
  ratingText: {
    color: "#FFD700",
    marginVertical: 4,
  },
  closeButton: {
    flexDirection: "row",
    backgroundColor: "#555",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default DetailModal;