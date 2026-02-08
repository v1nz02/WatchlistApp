import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistContext } from '../context/WatchlistContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
    const { watchlist } = useContext(WatchlistContext);

    const stats = useMemo(() => {
        const totalItems = watchlist.length;
        const watchedItems = watchlist.filter(item => item.watched);
        const watchedCount = watchedItems.length;
        const unwatchedCount = totalItems - watchedCount;

        // Calculate total duration (minutes)
        let totalMinutes = 0;
        watchedItems.forEach(item => {
            if (item.category === 'Film' && item.runtime) {
                totalMinutes += parseInt(item.runtime);
            } else if (item.category === 'Serie TV' && item.runtime && item.totalSeasons) {
                // Stima: 10 episodi per stagione se non abbiamo info precise
                totalMinutes += parseInt(item.runtime) * parseInt(item.totalSeasons) * 10;
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Calculate favorite genre
        const genreCounts = {};
        watchedItems.forEach(item => {
            if (item.genre) {
                const genres = item.genre.split(',').map(g => g.trim());
                genres.forEach(g => {
                    genreCounts[g] = (genreCounts[g] || 0) + 1;
                });
            }
        });

        let favoriteGenre = '-';
        let maxCount = 0;
        Object.entries(genreCounts).forEach(([genre, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteGenre = genre;
            }
        });

        return {
            totalItems,
            watchedCount,
            unwatchedCount,
            totalTime: `${hours}h ${minutes}m`,
            favoriteGenre
        };
    }, [watchlist]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#fff"
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTitle}>Il tuo Profilo</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.mainStatsCard}>
                    <Text style={styles.mainStatsTitle}>Tempo Totale di Visione</Text>
                    <Text style={styles.mainStatsValue}>{stats.totalTime}</Text>
                    <Text style={styles.mainStatsSub}>Basato sui titoli segnati come "Visti"</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.statCard}>
                        <Ionicons name="film-outline" size={32} color="#E50914" />
                        <Text style={styles.statValue}>{stats.watchedCount}</Text>
                        <Text style={styles.statLabel}>Titoli Visti</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time-outline" size={32} color="#FFD700" />
                        <Text style={styles.statValue}>{stats.unwatchedCount}</Text>
                        <Text style={styles.statLabel}>Da Vedere</Text>
                    </View>
                </View>

                <View style={styles.genreCard}>
                    <View style={styles.genreIconContainer}>
                        <Ionicons name="heart" size={30} color="#E50914" />
                    </View>
                    <View style={styles.genreInfo}>
                        <Text style={styles.genreLabel}>Genere Preferito</Text>
                        <Text style={styles.genreValue}>{stats.favoriteGenre}</Text>
                    </View>
                </View>

                {/* Placeholder for future Charts or more stats */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={24} color="#aaa" />
                    <Text style={styles.infoText}>
                        Le statistiche si aggiornano automaticamente man mano che completi la tua watchlist.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'Caveat-Bold',
    },
    content: {
        padding: 20,
    },
    mainStatsCard: {
        backgroundColor: '#1f1f1f',
        padding: 25,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#E50914",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    mainStatsTitle: {
        color: '#aaa',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    mainStatsValue: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    mainStatsSub: {
        color: '#666',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1f1f1f',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    statValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    statLabel: {
        color: '#aaa',
        fontSize: 14,
    },
    genreCard: {
        backgroundColor: '#1f1f1f',
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    genreIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    genreInfo: {
        flex: 1,
    },
    genreLabel: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 5,
    },
    genreValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    infoText: {
        color: '#888',
        marginLeft: 10,
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});

export default StatisticsScreen;
