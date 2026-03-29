import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ImageBackground,
  TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform, StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { useGetMovieDetail } from '../../hooks/queries/useGetMovieDetail';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

// Tạm dùng static list cho "Phim tương tự" vì API detail không trả về phim liên quan
// Nếu cần có thể fetch API bằng thư mục category của phim
const SIMILAR_MOVIES = [
  { id: 1, title: 'Thành Phố Ngầm', desc: 'Hành động • 2023', img: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=400&auto=format&fit=crop' },
  { id: 2, title: 'Vũ Trụ Song Song', desc: 'Viễn tưởng • 2024', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=400&auto=format&fit=crop' },
];

const DetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { slug } = route.params;
  const { data, isLoading } = useGetMovieDetail(slug);
  const [lastWatchedEp, setLastWatchedEp] = React.useState<number | null>(null);
  const [watchedEps, setWatchedEps] = React.useState<number[]>([]);
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  const { themeColor, bgUrl, isDarkMode, colors } = React.useContext(ThemeContext);

  const movie = data?.data?.item;
  const cdnImage = 'https://img.ophim.live/uploads/movies'; // fallback vì detail API không kèm CDN

  useFocusEffect(
    React.useCallback(() => {
      if (slug) {
        AsyncStorage.getItem(`@movie_last_${slug}`).then(val => {
          if (val) {
            setLastWatchedEp(parseInt(val, 10));
          }
        }).catch(() => { });

        // Lấy danh sách toàn bộ các tập đã xem
        AsyncStorage.getAllKeys().then(keys => {
          const prefix = `@progress_${slug}_`;
          const epKeys = keys.filter(k => k.startsWith(prefix));
          const epIndices = epKeys.map(k => parseInt(k.replace(prefix, ''), 10));
          setWatchedEps(epIndices);
        }).catch(() => { });

        // Lấy danh sách yêu thích
        AsyncStorage.getItem('@favorite_list').then(str => {
          if (str) {
            const favs = JSON.parse(str);
            setIsFavorite(favs.some((f: any) => f.slug === slug));
          }
        }).catch(() => { });
      }
    }, [slug])
  );

  const toggleFavorite = async () => {
    if (!movie || !slug) return;
    try {
      const favStr = await AsyncStorage.getItem('@favorite_list');
      let favList = favStr ? JSON.parse(favStr) : [];

      if (isFavorite) {
        favList = favList.filter((f: any) => f.slug !== slug);
        setIsFavorite(false);
      } else {
        favList.unshift({
          slug,
          name: movie.name,
          thumb_url: movie.thumb_url || movie.poster_url,
          timestamp: Date.now()
        });
        setIsFavorite(true);
      }
      await AsyncStorage.setItem('@favorite_list', JSON.stringify(favList));
    } catch (e) { }
  };

  // Strip HTML tags if content has any
  const cleanContent = useMemo(() => {
    if (!movie?.content) return 'Đang cập nhật nội dung...';
    return movie.content.replace(/<[^>]+>/g, '');
  }, [movie?.content]);

  // Combine tags
  const tags = useMemo(() => {
    if (!movie) return [];
    const t = [];
    if (movie.category && movie.category.length > 0) {
      t.push(movie.category[0].name);
      if (movie.category.length > 1) t.push(movie.category[1].name);
    }
    if (movie.year) t.push(movie.year.toString());
    if (movie.time && movie.time !== 'Đang cập nhật') t.push(movie.time);
    return t;
  }, [movie]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColor || "#00B4D8"} />
        <Text style={{ marginTop: 12, color: colors.subText, fontSize: 14 }}>Đang tải thông tin phim...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: bgUrl ? 'transparent' : '#F8F9FA' }]}>
        <Text style={{ color: '#1A1A1A' }}>Không tìm thấy phim</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: themeColor || '#02609A' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle Play
  const handlePlay = (epIndex: number = 0) => {
    navigation.navigate('Player', { slug: movie.slug, epIndex });
  };

  return (
    <View style={styles.container}>
      {/* 1. Header nổi trên hình nền */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFF' : (themeColor || "#02609A")} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : (themeColor || '#024D7A') }]}>Zaq</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="share-social-outline" size={24} color={isDarkMode ? '#FFF' : '#1A1A1A'} />
          </TouchableOpacity>
          {/* <Image source={{ uri: AVATAR }} style={styles.avatar} /> */}
        </View>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: bgUrl ? 'transparent' : colors.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        {/* 2. Top Banner Image */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{ uri: `${cdnImage}/${movie.poster_url || movie.thumb_url}` }}
            style={styles.bannerImg}
          >
            <LinearGradient
              colors={['transparent', isDarkMode ? 'rgba(15,15,15,0.7)' : 'rgba(255,255,255,0.7)', colors.background]}
              locations={[0.5, 0.85, 1]}
              style={styles.bannerGradient}
            />
          </ImageBackground>

          {/* Floating Play Button with Rating */}
          <TouchableOpacity style={[styles.floatingPlayBtn, { backgroundColor: themeColor || '#00B4D8', shadowColor: themeColor || '#00B4D8' }]} activeOpacity={0.8} onPress={() => handlePlay(0)}>
            <Ionicons name="play" size={24} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* 3. Movie Title & Tags */}
        <View style={styles.contentWrap}>
          <View style={styles.tagsRow}>
            {tags.map((tag, idx) => (
              <View key={idx} style={[styles.tagBadge, { backgroundColor: isDarkMode ? '#1A1A1A' : '#E4EAEC' }]}>
                <Text style={[styles.tagText, { color: isDarkMode ? '#FFF' : '#4A5568' }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.titleName}>{movie.name}</Text>
          <Text style={[styles.titleOrigin, { color: themeColor || '#02609A' }]}>{movie.origin_name !== movie.name ? movie.origin_name : ''}</Text>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.btnWatch, { backgroundColor: themeColor || '#00B4D8', shadowColor: themeColor || '#02609A' }]}
            onPress={() => handlePlay(lastWatchedEp !== null ? lastWatchedEp : 0)}
          >
            <Text style={styles.btnWatchText}>
              {lastWatchedEp !== null && movie.episodes?.[0]?.server_data?.[lastWatchedEp]?.name
                ? `Tiếp Tục Xem - ${movie.episodes[0].server_data[lastWatchedEp].name}`
                : 'Xem Phim'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAddList, isFavorite && { borderColor: themeColor, backgroundColor: isDarkMode ? '#1A1A1A' : '#EAF1F8' }, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "checkmark-circle" : "add"}
              size={20}
              color={isFavorite ? themeColor : "#4A5568"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.btnAddListText, isFavorite && { color: themeColor }]}>
              {isFavorite ? 'Đã thêm vào danh sách' : 'Danh sách của tôi'}
            </Text>
          </TouchableOpacity>

          {/* Episode Selection */}
          {movie.episodes && movie.episodes[0]?.server_data && movie.episodes[0].server_data.length > 1 && (
            <View style={styles.episodeSection}>
              <Text style={[styles.episodeTitle, { color: colors.text }]}>Chọn tập phim</Text>
              <View style={styles.episodeList}>
                {movie.episodes[0].server_data.map((ep: any, index: number) => {
                  const isWatched = watchedEps.includes(index);
                  const isActive = lastWatchedEp === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.episodeBtn,
                        isWatched && { backgroundColor: themeColor, opacity: 0.8 },
                        isActive && { backgroundColor: themeColor, borderWidth: 2, borderColor: colors.itemText },
                        (!isWatched && !isActive) && { backgroundColor: colors.card }
                      ]}
                      onPress={() => handlePlay(index)}
                    >
                      <Text style={[
                        styles.episodeBtnText,
                        (isWatched || isActive) && { color: colors.itemText },
                        (!isWatched && !isActive) && { color: isDarkMode ? colors.itemSubText : themeColor }
                      ]}>
                        {ep.name.replace(/^Tập\s+/i, '')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 4. Info Cards */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.itemText }]}>Tóm tắt nội dung</Text>
            <Text style={[styles.infoDesc, { color: colors.itemSubText }]}>{cleanContent}</Text>
          </View>

          <View style={[styles.infoCardSmall, { backgroundColor: colors.card }]}>
            <Text style={styles.infoTitleGray}>ĐẠO DIỄN</Text>
            <Text style={[styles.infoValueBlue, { color: themeColor || '#02609A' }]}>
              {movie.director && movie.director.length > 0 && movie.director[0] !== ''
                ? movie.director.join(', ')
                : 'Đang cập nhật'}
            </Text>
          </View>

          <View style={[styles.infoCardSmall, { backgroundColor: colors.card }]}>
            <Text style={styles.infoTitleGray}>DIỄN VIÊN CHÍNH</Text>
            <Text style={[styles.infoValueGray, { color: colors.itemSubText }]}>
              {movie.actor && movie.actor.length > 0 && movie.actor[0] !== ''
                ? movie.actor.join(', ')
                : 'Đang cập nhật'}
            </Text>
          </View>

          {/* 5. Phim tương tự */}
          {/* <View style={styles.similarHeader}>
            <Text style={styles.similarTitle}>Phim tương tự</Text>
            <TouchableOpacity>
              <Text style={styles.similarSeeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarList}>
            {SIMILAR_MOVIES.map((item, index) => (
              <TouchableOpacity key={item.id} style={[styles.similarCard, index === 0 && { marginLeft: 20 }]}>
                <Image source={{ uri: item.img }} style={styles.similarImg} />
                <Text style={styles.similarName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.similarDesc} numberOfLines={1}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height: 40 }} /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFC', // Màu nền nhạt như thiết kế
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#024D7A',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAF1F8',
    marginLeft: 12,
  },
  bannerContainer: {
    width: '100%',
    height: 480, // Cao hơn bình thường để che mờ dần xuống
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
  },
  floatingPlayBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#00B4D8',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
  },
  contentWrap: {
    paddingHorizontal: 20,
    marginTop: -40, // Kéo nội dung lên đè lên phần gradient
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingRight: 80, // chừa chỗ cho play btn
  },
  tagBadge: {
    backgroundColor: '#E4EAEC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4A5568',
    fontSize: 12,
    fontWeight: '600',
  },
  titleName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  titleOrigin: {
    fontSize: 28,
    fontWeight: '800',
    color: '#02609A',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  btnWatch: {
    backgroundColor: '#02609A',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#02609A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnWatchText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnAddList: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4EAEC',
    marginBottom: 32,
  },
  btnAddListText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoDesc: {
    fontSize: 14,
    color: '#65788A',
    lineHeight: 24,
  },
  infoCardSmall: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitleGray: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0AEC0',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoValueBlue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#02609A',
  },
  infoValueGray: {
    fontSize: 14,
    color: '#65788A',
    lineHeight: 22,
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  similarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  similarSeeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#02609A',
  },
  similarList: {
    marginHorizontal: -20, // Kéo giãn list ra sát mép màn hình
    paddingRight: 20,
  },
  similarCard: {
    width: 140,
    marginRight: 16,
  },
  similarImg: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    backgroundColor: '#E4EAEC',
    marginBottom: 10,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  similarDesc: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  episodeSection: {
    marginBottom: 24,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  episodeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 10,
  },
  episodeBtn: {
    backgroundColor: '#E4EAEC',
    width: (Dimensions.get('window').width - 40 - 40) / 5, // 40 là padding 2 bên, 40 là tổng gap (10x4)
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  episodeBtnWatched: {
    backgroundColor: '#02609A', // Màu đánh dấu xem rồi
  },
  episodeBtnActive: {
    backgroundColor: '#00B4D8', // Màu nổi nhất cho tập đang xem dở
  },
  episodeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#02609A',
  },
  episodeBtnTextWatched: {
    color: '#FFF',
  },
});

export default DetailScreen;
