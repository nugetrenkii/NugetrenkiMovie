import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, ActivityIndicator, SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGetMoviesByCategory } from '../../hooks/queries/useGetMoviesByCategory';
import { MovieItem } from '../../types/movie';
import { ThemeContext } from '../../context/ThemeContext';

const getImageUrl = (cdnBase: string, path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = cdnBase.replace(/\/$/, '');
  return `${base}/uploads/movies/${path}`;
};

const CategoryScreen = ({ route, navigation }: any) => {
  const { slug, name } = route.params;
  const insets = useSafeAreaInsets();
  const { themeColor, bgUrl } = React.useContext(ThemeContext);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const { data, isLoading } = useGetMoviesByCategory(slug);

  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
  const movies = data?.data?.items || [];

  const filteredMovies = useMemo(() => {
    if (!searchKeyword.trim()) return movies;
    return movies.filter((m: MovieItem) => 
      m.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      m.origin_name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [movies, searchKeyword]);

  const renderItem = ({ item }: { item: MovieItem }) => (
    <TouchableOpacity 
      style={styles.resultCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Detail', { slug: item.slug })}
    >
      <Image 
        source={{ uri: getImageUrl(cdnImage, item.thumb_url || item.poster_url) }} 
        style={styles.movieImg} 
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.movieOrigin} numberOfLines={1}>{item.origin_name}</Text>
        <View style={styles.movieTags}>
          <Text style={[styles.tagText, { color: themeColor || '#02609A' }]}>{item.year || 'N/A'}</Text>
          <Text style={styles.tagDot}>•</Text>
          <Text style={[styles.tagText, { color: themeColor || '#02609A' }]}>{item.quality || 'HD'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgUrl ? 'transparent' : '#F9FBFC' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), backgroundColor: bgUrl ? 'rgba(255,255,255,0.85)' : '#FFF' }]}>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thể loại: {name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar within Category */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder={`Tìm kiếm phim ${name}...`}
            placeholderTextColor="#94A3B8"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <Ionicons name="close-circle" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={themeColor || "#02609A"} />
            <Text style={styles.infoText}>Đang tải danh sách phim...</Text>
          </View>
        ) : filteredMovies.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons name="search-outline" size={60} color="#E2E8F0" />
            <Text style={styles.infoText}>
                {searchKeyword ? `Không tìm thấy phim "${searchKeyword}"` : 'Chưa có phim nào ở thể loại này'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredMovies}
            keyExtractor={(item: MovieItem) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  btnBack: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  content: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  movieImg: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  movieOrigin: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  movieTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagDot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
    fontSize: 12,
  },
});

export default CategoryScreen;
