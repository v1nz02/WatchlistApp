import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { fetchStreamingInfo, fetchTrailers } from '../../services/mediaService';

const DetailModal = ({ item, visible, onClose, onEdit }) => {
  const [providers, setProviders] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    if (visible && item && (item.category === 'Film' || item.category === 'Serie TV')) {
      const loadExtraInfo = async () => {
        setLoadingInfo(true);
        try {
          const [provs, trailer] = await Promise.all([
            fetchStreamingInfo(item.title, item.category, item.tmdbId),
            fetchTrailers(item.title, item.category, item.tmdbId)
          ]);
          setProviders(provs);
          setTrailerUrl(trailer);
        } catch (e) {
          console.error("Error loading extra info", e);
        } finally {
          setLoadingInfo(false);
        }
      };
      loadExtraInfo();
    } else {
      setProviders(null);
      setTrailerUrl(null);
    }
  }, [item, visible]);

  if (!item) return null;

  const handleEdit = () => {
    if (onEdit && typeof onEdit === 'function') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose(); // Close modal before opening edit
      onEdit(item);
    }
  };

  const openTrailer = () => {
    if (trailerUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(trailerUrl).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.mainContent}>
              {item.posterUrl ? (
                <Image
                  source={{ uri: item.posterUrl }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.posterImage, styles.placeholderPoster]}>
                  <Ionicons name="image-outline" size={40} color="#555" />
                </View>
              )}

              <View style={styles.infoContainer}>
                {item.year && (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Anno: </Text>{item.year}
                  </Text>
                )}
                {item.rating && (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Rating: </Text>
                    <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{item.rating}</Text>
                  </Text>
                )}
                {item.genre && (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Genere: </Text>{item.genre}
                  </Text>
                )}
                {item.totalSeasons && (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Stagioni: </Text>{item.totalSeasons}
                  </Text>
                )}
              </View>
            </View>

            {/* Trailer Button */}
            {trailerUrl && (
              <TouchableOpacity style={styles.trailerButton} onPress={openTrailer}>
                <Ionicons name="logo-youtube" size={20} color="#fff" />
                <Text style={styles.trailerButtonText}>Guarda Trailer</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Trama</Text>
            <Text style={styles.description}>
              {item.description || "Nessuna descrizione disponibile."}
            </Text>

            {/* Streaming Providers */}
            {(providers?.flatrate || providers?.buy || providers?.rent) && (
              <View style={styles.providersSection}>
                <Text style={styles.sectionTitle}>Dove guardarlo</Text>

                {providers.flatrate && (
                  <View style={styles.providerRow}>
                    <Text style={styles.providerType}>Streaming:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {providers.flatrate.map(p => (
                        <Image
                          key={p.provider_id}
                          source={{ uri: `https://image.tmdb.org/t/p/original${p.logo_path}` }}
                          style={styles.providerLogo}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {providers.rent && !providers.flatrate && (
                  <View style={styles.providerRow}>
                    <Text style={styles.providerType}>Noleggio:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {providers.rent.map(p => (
                        <Image
                          key={p.provider_id}
                          source={{ uri: `https://image.tmdb.org/t/p/original${p.logo_path}` }}
                          style={styles.providerLogo}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {loadingInfo && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#E50914" />
                <Text style={styles.loadingText}>Caricamento info extra...</Text>
              </View>
            )}

          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Chiudi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    height: "85%",
    backgroundColor: "#1f1f1f",
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#252525',
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  posterImage: {
    width: 130,
    height: 195,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  placeholderPoster: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-start',
  },
  label: {
    color: '#aaa',
    fontWeight: 'normal',
  },
  detailText: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E50914',
    paddingLeft: 10,
  },
  description: {
    color: "#ccc",
    marginBottom: 20,
    lineHeight: 22,
    fontSize: 15,
  },
  trailerButton: {
    flexDirection: 'row',
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  trailerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  providersSection: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  providerRow: {
    marginTop: 10,
  },
  providerType: {
    color: '#aaa',
    marginBottom: 8,
    fontSize: 14,
  },
  providerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: "#333",
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  loadingText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic'
  }
});

export default DetailModal;