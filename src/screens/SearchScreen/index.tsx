import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSearchMovies } from '../../hooks/queries/useSearchMovies';
import { useDebounce } from '../../hooks/useDebounce';
import { MovieItem } from '../../types/movie';
import { ThemeContext } from '../../context/ThemeContext';

const getImageUrl = (cdnBase: string, path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = cdnBase.replace(/\/$/, '');
  return `${base}/uploads/movies/${path}`;
};

const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [keyword, setKeyword] = useState('');
  const { themeColor, bgUrl } = React.useContext(ThemeContext);
  
  // Debounce 500ms: giảm số lần request khi người dùng đang gõ
  const debouncedKeyword = useDebounce(keyword, 500);
  
  const { data, isLoading } = useSearchMovies(debouncedKeyword);

  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
  const movies = data?.data?.items || [];

  const handleClear = () => {
    setKeyword('');
  };

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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: bgUrl ? 'transparent' : '#F9FBFC' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Search Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), backgroundColor: bgUrl ? 'rgba(255,255,255,0.85)' : '#FFF' }]}>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm phim, diễn viên..."
            placeholderTextColor="#94A3B8"
            value={keyword}
            onChangeText={setKeyword}
            autoFocus
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.btnClear}>
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
            <Text style={styles.infoText}>Đang tìm kiếm...</Text>
          </View>
        ) : debouncedKeyword.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons name="search-outline" size={60} color="#E2E8F0" />
            <Text style={styles.placeholderText}>Nhập tên phim để bắt đầu tìm kiếm</Text>
          </View>
        ) : movies.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons name="file-tray-outline" size={60} color="#E2E8F0" />
            <Text style={styles.infoText}>Không tìm thấy phim nào phù hợp</Text>
            <Text style={styles.placeholderText}>Thử lại với từ khóa khác</Text>
          </View>
        ) : (
          <FlatList
            data={movies}
            keyExtractor={(item: MovieItem) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  btnBack: {
    marginRight: 12,
    padding: 4,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  btnClear: {
    padding: 4,
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
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  movieOrigin: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  movieTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#02609A',
    backgroundColor: '#EAF1F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagDot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
    fontSize: 12,
  },
});

export default SearchScreen;
