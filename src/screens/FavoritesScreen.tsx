import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 60) / COLUMN_COUNT;

const FavoritesScreen = ({ navigation }: any) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { themeColor, colors, isDarkMode } = useContext(ThemeContext);
  const cdnImage = 'https://img.ophim.live/uploads/movies';

  const loadFavorites = async () => {
    try {
      const favStr = await AsyncStorage.getItem('@favorite_list');
      if (favStr) {
        setFavorites(JSON.parse(favStr));
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.movieCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('Detail', { slug: item.slug })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumb_url?.startsWith('http') ? item.thumb_url : `${cdnImage}/${item.thumb_url}` }}
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.movieName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yêu thích</Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.slug}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color={colors.subText} />
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            Danh sách yêu thích đang trống
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: themeColor }]}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.exploreText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  movieCard: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    marginBottom: 20,
    marginRight: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  thumbnail: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    backgroundColor: '#333',
  },
  cardContent: {
    padding: 12,
  },
  movieName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
