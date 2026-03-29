import React, { useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ImageBackground,
  TouchableOpacity, Image, SafeAreaView, Platform,
  FlatList, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGetHomeMovies } from '../../hooks/queries/useGetHomeMovies';
import { MovieItem } from '../../types/movie';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_SPACING = 10;
const SIDE_SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

// Helper: tạo URL ảnh từ CDN
// API trả cdnBase = "https://img.ophim.live" và path = "ten-phim-thumb.jpg"
// URL đúng: https://img.ophim.live/uploads/movies/ten-phim-thumb.jpg
const getImageUrl = (cdnBase: string, path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Đảm bảo cdnBase không có dấu / cuối
  const base = cdnBase.replace(/\/$/, '');
  return `${base}/uploads/movies/${path}`;
};

const HomeScreen = ({ navigation }: any) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, isLoading, error } = useGetHomeMovies();

  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live/uploads/movies';
  const movies = data?.data?.items || [];
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const { themeColor, bgUrl, isDarkMode, colors } = React.useContext(ThemeContext);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('@history_list').then(str => {
        if (str) setHistory(JSON.parse(str));
      }).catch(() => { });

      AsyncStorage.getItem('@favorite_list').then(str => {
        if (str) setFavorites(JSON.parse(str));
      }).catch(() => { });
    }, [])
  );

  // Lấy 5 phim đầu cho carousel, phần còn lại cho danh sách
  const featuredMovies = useMemo(() => movies.slice(0, 5), [movies]);
  const recentMovies = useMemo(() => movies.slice(5, 15), [movies]);
  const hotMovies = useMemo(() => movies.slice(10, 20), [movies]);

  const LOOPS = 100;
  const infiniteFeaturedMovies = useMemo(() => {
    if (featuredMovies.length === 0) return [];
    return Array(LOOPS).fill(featuredMovies).flat();
  }, [featuredMovies]);

  React.useEffect(() => {
    if (featuredMovies.length > 0 && flatListRef.current) {
      const middleIndex = Math.floor(LOOPS / 2) * featuredMovies.length;
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: middleIndex * (CARD_WIDTH + CARD_SPACING),
          animated: false,
        });
        setActiveIndex(middleIndex);
      }, 100);
    }
  }, [featuredMovies]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: bgUrl ? 'transparent' : '#F8F9FA' }]}>
        <ActivityIndicator size="large" color={themeColor || "#00B4D8"} />
        <Text style={{ marginTop: 12, color: '#65788A', fontSize: 14 }}>Đang tải phim...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgUrl ? 'transparent' : colors.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/app-logo.jpg')} style={styles.logoIcon} />
          <View>
            <Text style={styles.logoName}>Zaq</Text>
            <Text style={styles.logoSub}>moviee</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.headerSearch, padding: 8, borderRadius: 20 }]} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={24} color={isDarkMode ? '#FFF' : '#1A1A1A'} />
          </TouchableOpacity>
          {/* <Image source={{ uri: AVATAR }} style={styles.avatar} /> */}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* 1. Featured Movies Carousel */}
        <View style={styles.carouselSection}>
          <Animated.FlatList
            ref={flatListRef}
            data={infiniteFeaturedMovies}
            keyExtractor={(item: MovieItem, index: number) => `${item._id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH + CARD_SPACING,
              offset: (CARD_WIDTH + CARD_SPACING) * index,
              index,
            })}
            contentContainerStyle={{
              paddingHorizontal: SIDE_SPACING - CARD_SPACING / 2,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            onMomentumScrollEnd={(e: any) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING)
              );
              setActiveIndex(index);
            }}
            renderItem={({ item, index }: { item: MovieItem; index: number }) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + CARD_SPACING),
                index * (CARD_WIDTH + CARD_SPACING),
                (index + 1) * (CARD_WIDTH + CARD_SPACING),
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.88, 1, 0.88],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.6, 1, 0.6],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  style={[
                    styles.carouselCard,
                    { transform: [{ scale }], opacity },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Detail', { slug: item.slug })}
                  >
                    <Image
                      source={{ uri: getImageUrl(cdnImage, item.poster_url || item.thumb_url) }}
                      style={styles.carouselImg}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.carouselTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Animated.View>
              );
            }}
          />
          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {featuredMovies.map((_: MovieItem, i: number) => {
              const isActive = featuredMovies.length > 0 && (activeIndex % featuredMovies.length) === i;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    isActive && [styles.dotActive, { backgroundColor: themeColor }],
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* 1.5. Tiếp tục xem (Lịch sử) */}
        {history.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tiếp tục xem</Text>
                <View style={[styles.titleUnderline, { backgroundColor: themeColor, width: 40 }]} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
              {history.map((item: any, index: number) => {
                const progressPercent = item.duration ? (item.currentTime / item.duration) * 100 : 0;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.historyCard, index === 0 && { marginLeft: 20 }, { backgroundColor: colors.card, padding: 10, borderRadius: 16 }]}
                    onPress={() => navigation.navigate('Player', { slug: item.slug, epIndex: item.epIndex })}
                  >
                    <Image
                      source={{ uri: getImageUrl(cdnImage, item.thumb_url) }}
                      style={styles.historyImg}
                    />
                    <View style={styles.historyProgressBg}>
                      <View style={[styles.historyProgressFill, { width: `${progressPercent}%`, backgroundColor: themeColor }]} />
                    </View>
                    <Text style={[styles.watchedTitle, { color: colors.itemText }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.watchedTimeStr, { color: colors.itemSubText }]} numberOfLines={1}>
                      Đang xem Tập {parseInt(item.epIndex) + 1 || 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* My List (Danh sách yêu thích) */}
        {favorites.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh sách phim của bạn</Text>
                <View style={[styles.titleUnderline, { backgroundColor: '#FF6B6B', width: 40 }]} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
              {favorites.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.slug}
                  style={[styles.watchedCard, index === 0 && { marginLeft: 20 }, { backgroundColor: colors.card, padding: 8, borderRadius: 16 }]}
                  onPress={() => navigation.navigate('Detail', { slug: item.slug })}
                >
                  <Image
                    source={{ uri: getImageUrl(cdnImage, item.thumb_url) }}
                    style={styles.watchedImg}
                  />
                  <Text style={[styles.watchedTitle, { color: colors.itemText }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.watchedTimeStr, { color: colors.itemSubText }]} numberOfLines={1}>Đã lưu</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* 2. Phim Mới Cập Nhật */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Phim Mới Cập Nhật</Text>
            <View style={[styles.titleUnderline, { backgroundColor: themeColor }]} />
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: themeColor }]}>Xem tất cả  {'>'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
          {recentMovies.map((item: MovieItem, index: number) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.watchedCard, index === 0 && { marginLeft: 20 }, { backgroundColor: colors.card, padding: 8, borderRadius: 16 }]}
              onPress={() => navigation.navigate('Detail', { slug: item.slug })}
            >
              <Image
                source={{ uri: getImageUrl(cdnImage, item.thumb_url) }}
                style={styles.watchedImg}
              />
              <Text style={[styles.watchedTitle, { color: colors.itemText }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.watchedTimeStr, { color: colors.itemSubText }]} numberOfLines={1}>
                {item.episode_current} • {item.quality}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3. Phim Hot */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Phim Hot</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subText }]}>Đang thịnh hành tuần này</Text>
          </View>
          <View style={styles.arrowControls}>
            <TouchableOpacity style={[styles.arrowBtn, { backgroundColor: colors.headerSearch }]}><Ionicons name="arrow-back" size={16} color={themeColor} /></TouchableOpacity>
            <TouchableOpacity style={[styles.arrowBtn, { backgroundColor: colors.headerSearch }]}><Ionicons name="arrow-forward" size={16} color={themeColor} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
          {hotMovies.map((item: MovieItem, index: number) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.hotCard, index === 0 && { marginLeft: 20 }]}
              onPress={() => navigation.navigate('Detail', { slug: item.slug })}
            >
              <ImageBackground
                source={{ uri: getImageUrl(cdnImage, item.poster_url || item.thumb_url) }}
                style={styles.hotImg}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.hotTag}>
                  <Text style={styles.hotTagText}>{item.quality}</Text>
                </View>
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.hotGradientBottom} />
              </ImageBackground>
              <Text style={[styles.hotTitle, { color: colors.itemText }]} numberOfLines={1}>{item.name}</Text>
              <View style={styles.hotMeta}>
                <Text style={styles.hotMetaStar}>⭐</Text>
                <Text style={[styles.hotMetaRating, { color: colors.itemText }]}>
                  {item.tmdb?.vote_average ? item.tmdb.vote_average.toFixed(1) : 'N/A'}
                </Text>
                <Text style={[styles.hotMetaYear, { color: colors.itemSubText }]}> • {item.year}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeader, { marginTop: 32, marginBottom: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Khám phá theo thể loại</Text>
        </View>
        <View style={styles.catGrid}>
          {[
            { slug: 'hanh-dong', name: 'Hành Động', icon: 'flash', bg: '#F1F5F9', color: '#0F172A' },
            { slug: 'vien-tuong', name: 'Viễn Tưởng', icon: 'sparkles', bg: '#F5F3FF', color: '#6D28D9' },
            { slug: 'tinh-cam', name: 'Tình Cảm', icon: 'heart', bg: '#FFF1F2', color: '#E11D48' },
            { slug: 'kinh-di', name: 'Kinh Dị', icon: 'skull', bg: '#F8FAFC', color: '#475569' },
          ].map(cat => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.catItem, { backgroundColor: colors.card, paddingVertical: 14 }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Category', { slug: cat.slug, name: cat.name })}
            >
              <Ionicons name={cat.icon} size={22} color={themeColor} style={{ marginRight: 12 }} />
              <Text style={[styles.catTitle, { color: colors.itemText }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Spacer for bottom tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    paddingRight: 12,
  },
  menuIcon: {
    fontSize: 22,
    color: '#02609A',
    fontWeight: '300',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 10,
  },
  logoName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ea7ba0ff',
    letterSpacing: 1,
    textShadowColor: 'rgba(233, 30, 99, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  logoSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FF80AB',
    letterSpacing: 4,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBtn: {
    marginRight: 16,
    borderRadius: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: '#02609A',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAF1F8',
  },
  // === Carousel Styles ===
  carouselSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  carouselCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
    alignItems: 'center',
  },
  carouselImg: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4, // Tỷ lệ poster phim 2:3
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  carouselTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    textAlign: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D1DBE5',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#02609A',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 60, // Width covering "Phim" roughly
    height: 3,
    backgroundColor: '#02609A',
    borderRadius: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: '#02609A',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#65788A',
    marginTop: 4,
  },
  arrowControls: {
    flexDirection: 'row',
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  arrowText: {
    color: '#02609A',
    fontSize: 14,
    fontWeight: '700',
  },
  hList: {
    paddingRight: 20,
  },
  watchedCard: {
    width: 220,
    marginRight: 16,
  },
  watchedImg: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#E4EAEC',
    marginTop: -3, // Overlap the bottom perfectly
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B4D8',
  },
  historyCard: {
    width: 220,
    marginRight: 16,
    marginBottom: 20,
  },
  historyImg: {
    width: '100%',
    height: 125,
    borderRadius: 12,
    backgroundColor: '#E4EAEC',
    marginBottom: 6,
  },
  historyProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#E4EAEC',
    borderRadius: 2,
    marginBottom: 8,
  },
  historyProgressFill: {
    height: '100%',
    backgroundColor: '#00B4D8',
    borderRadius: 2,
  },
  watchedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 4,
  },
  watchedTimeStr: {
    fontSize: 11,
    color: '#65788A',
  },
  hotCard: {
    width: 156,
    marginRight: 16,
  },
  hotImg: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  hotTag: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(50, 70, 90, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    marginRight: 10,
  },
  hotTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  hotGradientBottom: {
    height: 60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  hotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  hotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotMetaStar: {
    fontSize: 12,
    color: '#FFB800', // yellow gold
    marginRight: 4,
  },
  hotMetaRating: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  hotMetaYear: {
    fontSize: 11,
    color: '#95A1AD',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  catItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  catIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#02609A',
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
