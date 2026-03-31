import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  TouchableWithoutFeedback, Dimensions, StatusBar, Pressable,
  useWindowDimensions
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Orientation from 'react-native-orientation-locker';
import { ThemeContext } from '../../context/ThemeContext';
import { useGetMovieDetail } from '../../hooks/queries/useGetMovieDetail';
import { syncManager } from '../../utils/syncManager';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const PlayerScreen = ({ route, navigation }: any) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { slug, epIndex = 0 } = route.params || {};
  const { data, isLoading: isLoadingApi } = useGetMovieDetail(slug);
  const movie = data?.data?.item;

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [isLandscape, setIsLandscape] = React.useState(true);
  const { themeColor } = React.useContext(ThemeContext);
  const [initSeekDone, setInitSeekDone] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTimeRef = useRef(0);
  const pendingExitActionRef = useRef<any>(null);
  const allowedExitRef = useRef(false);

  // Khởi tạo hướng màn hình
  useEffect(() => {
    // Lock ngang ngay khi vào màn hình xem phim
    Orientation.lockToLandscape();
    
    return () => {
      // Trả lại hướng dọc khi thoát
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
    };
  }, []);

  // Tải thời gian xem cũ
  useEffect(() => {
    const loadProgress = async () => {
      try {
        if (!slug) return;
        const valStr = await AsyncStorage.getItem(`@progress_${slug}_${epIndex}`);
        if (valStr) {
          const time = parseFloat(valStr);
          if (!isNaN(time) && time > 0) {
            lastSavedTimeRef.current = time;
          }
        }
      } catch (e) { }
    };
    loadProgress();
  }, [slug, epIndex]);

  // Hook cảnh báo khi bấm nút thoát hoặc vuốt thoát (iOS/Android native back)
  useEffect(() => {
    const onBeforeRemove = (e: any) => {
      // Nếu đã cấp phép thoát thì bỏ qua chặn
      if (allowedExitRef.current) return;

      // Chặn thoát ngay
      e.preventDefault();
      setIsPlaying(false); // Dừng phim
      pendingExitActionRef.current = e.data.action;
      setShowExitConfirm(true); // Mở custom alert xoay ngang
    };

    const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);
    return unsubscribe;
  }, [navigation]);

  const handleConfirmExit = () => {
    allowedExitRef.current = true;
    setShowExitConfirm(false);
    if (pendingExitActionRef.current) {
      navigation.dispatch(pendingExitActionRef.current);
    } else {
      navigation.goBack();
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setIsPlaying(true);
  };

  // Auto-hide controls after 3s
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleOverlayPress = () => {
    if (!showControls) {
      resetControlsTimeout();
    } else {
      setShowControls(false); // Hide immediately if tapping when visible
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.max(0, currentTime - 10));
      resetControlsTimeout();
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.min(duration, currentTime + 10));
      resetControlsTimeout();
    }
  };

  const handleSlidingStart = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };

  const handleSlidingComplete = (value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
    resetControlsTimeout();
  };

  const toggleOrientation = () => {
    if (isLandscapeUI) {
      Orientation.lockToPortrait();
      setIsLandscape(false);
    } else {
      Orientation.lockToLandscape();
      setIsLandscape(true);
    }
  };

  // Find video link
  let videoUrl = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'; // Video mặc định nếu lỗi
  let episodeMeta = '';

  if (movie?.episodes?.[0]?.server_data?.[epIndex]) {
    const ep = movie.episodes[0].server_data[epIndex];
    videoUrl = ep.link_m3u8 || ep.link_embed || videoUrl;
    episodeMeta = ep.name;
  }

  const subtitleText = movie?.time ? `${episodeMeta} • ${movie.time}` : episodeMeta;

  // Kiểm tra tập tiếp theo
  const totalEpisodes = movie?.episodes?.[0]?.server_data?.length || 0;
  const hasNextEp = totalEpisodes > 1 && epIndex < totalEpisodes - 1;

  const handleNextEpisode = () => {
    if (hasNextEp) {
      allowedExitRef.current = true;
      navigation.replace('Player', { slug, epIndex: epIndex + 1 });
    }
  };

  // Tự xác định chế độ ngang dựa trên kích thước thật của màn hình
  const isLandscapeUI = screenWidth > screenHeight;

  // Tối ưu hoá layout cho trình phát
  const playerContainerStyle: any = isLandscapeUI ? {
    flex: 1, // Tràn toàn bộ màn hình khi xoay ngang
    width: screenWidth,
    height: screenHeight,
    position: 'absolute' as const,
    zIndex: 9999,
  } : {
    width: screenWidth,
    height: screenWidth * 9 / 16, // Chuẩn tỷ lệ 16:9
    position: 'relative' as const,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
      <View style={playerContainerStyle}>
        {/* Ẩn Status Bar giúp video hiển thị tràn màn hình tốt hơn */}
        <StatusBar hidden />

        {isLoadingApi ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={themeColor || "#00B4D8"} />
            <Text style={styles.loadingText}>Đang tải thông tin phim...</Text>
          </View>
        ) : (
          <>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              paused={!isPlaying}
              rate={playbackRate}
              onLoadStart={() => setIsLoadingVideo(true)}
              onLoad={(data) => {
                setDuration(data.duration);
                setIsLoadingVideo(false);
                // Tự động tua đến điểm dừng lần trước nếu video chưa kết thúc
                if (lastSavedTimeRef.current > 0 && lastSavedTimeRef.current < data.duration - 10) {
                  videoRef.current?.seek(lastSavedTimeRef.current);
                }
                setInitSeekDone(true);
              }}
              onProgress={async (data) => {
                setCurrentTime(data.currentTime);
                // Không lưu khi chưa init xong (tránh bị reset thời gian về 0 và lưu đè)
                if (!initSeekDone || !slug) return;
                // Lưu vào AsyncStorage mỗi 5 giây
                if (Math.abs(data.currentTime - lastSavedTimeRef.current) > 5) {
                  lastSavedTimeRef.current = data.currentTime;
                  try {
                    await AsyncStorage.setItem(`@progress_${slug}_${epIndex}`, data.currentTime.toString());
                    await AsyncStorage.setItem(`@movie_last_${slug}`, epIndex.toString());

                    // Lưu vào danh sách phim đã xem gộp chung (tối đa 15 phim gần nhất)
                    if (movie) {
                      const historyStr = await AsyncStorage.getItem('@history_list');
                      let historyList = historyStr ? JSON.parse(historyStr) : [];
                      // Lọc bỏ phim này nếu nó đã có trong lịch sử (để trồi lên đầu trang)
                      historyList = historyList.filter((item: any) => item.slug !== slug);
                      historyList.unshift({
                        slug,
                        name: movie.name,
                        thumb_url: movie.thumb_url || movie.poster_url,
                        epIndex,
                        currentTime: data.currentTime,
                        duration: duration || 1,
                        timestamp: Date.now()
                      });
                      // Giữ lại tối đa top 15 phim mới nhất
                      await AsyncStorage.setItem('@history_list', JSON.stringify(historyList.slice(0, 15)));
                      // Đồng bộ nhanh tiến trình tập phim lên Firestore (không quét toàn bộ AsyncStorage)
                      syncManager.syncProgressToCloud(slug, epIndex, data.currentTime);
                    }
                  } catch (e) { }
                }
              }}
              onBuffer={(e) => setIsLoadingVideo(e.isBuffering)}
              onError={(e) => {
                console.log('Video error', e);
                setIsLoadingVideo(false);
              }}
            />

            {/* Lớp Touch chia nửa màn hình */}
            <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
              {/* Nửa trái: chỉ bật/tắt menu */}
              <Pressable
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onPress={handleOverlayPress}
              />

              {/* Nửa phải: Bấm = menu, Giữ = tua 2x */}
              <Pressable
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onPress={handleOverlayPress}
                delayLongPress={300} // Cần giữ 0.3s để kích hoạt nhanh hơn
                onLongPress={() => {
                  setPlaybackRate(2.0);
                  setIsFastForwarding(true);
                  if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  setShowControls(false); // Tắt controls đi để người xem không bị che
                }}
                onPressOut={() => {
                  setPlaybackRate(1.0);
                  setIsFastForwarding(false);
                }}
              />
            </View>

            {/* Badge báo hiệu đang tua nhanh */}
            {isFastForwarding && (
              <View style={styles.fastForwardBadge}>
                <Text style={[styles.fastForwardText, { color: themeColor || '#00B4D8' }]}>2X ▶▶</Text>
              </View>
            )}

            {/* Lớp chứa Controls: pointerEvents="box-none" để vùng trống lọt tap xuống nền */}
            <View
              style={[styles.overlay, !showControls && styles.hidden, { zIndex: 2 }]}
              pointerEvents={showControls ? 'box-none' : 'none'}
            >

              {/* Top Controls */}
              <View style={styles.topControls}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={18} color="#FFF" />
                  </TouchableOpacity>

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.movieTitle} numberOfLines={1}>{movie?.name || 'Đang tải...'}</Text>
                    <Text style={styles.movieSubtitle} numberOfLines={1}>
                      {movie ? `S1 • E1 • ${subtitleText}` : '...'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="settings-sharp" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Center Playback Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity style={styles.skipBtn} onPress={skipBackward}>
                  <Ionicons name="play-back" size={20} color="#FFF" />
                </TouchableOpacity>

                {isLoadingVideo ? (
                  <View style={styles.playBtnFallback}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.playBtn, { backgroundColor: themeColor || '#02609A', shadowColor: themeColor || '#00B4D8' }]} 
                    onPress={handlePlayPause} 
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#FFF" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.skipBtn} onPress={skipForward}>
                  <Ionicons name="play-forward" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.sliderRow}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration || 0}
                    value={currentTime}
                    minimumTrackTintColor={themeColor || "#00B4D8"}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={themeColor || "#00B4D8"}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

                <View style={[styles.bottomMetaRow, { justifyContent: 'space-between' }]}>
                  {/* Giữ nút CINEMATIC 4K xuống dưới vì Header nhường chỗ cho Title */}
                  <View style={styles.qualityPill}>
                    <Text style={[styles.qualityText, { color: themeColor || '#00B4D8' }]}>CINEMATIC 4K</Text>
                  </View>

                  {/* Nút chuyển tập tiếp theo */}
                  {hasNextEp && (
                    <TouchableOpacity
                      style={[styles.nextEpBtn, { borderColor: themeColor || '#00B4D8' }]}
                      onPress={handleNextEpisode}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="play-skip-forward" size={14} color={themeColor || '#00B4D8'} style={{ marginRight: 5 }} />
                      <Text style={[styles.nextEpText, { color: themeColor || '#00B4D8' }]}>Tập tiếp</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.metaRight}>
                    {/* <TouchableOpacity style={styles.metaAction}>
                      <Ionicons name="chatbox-ellipses-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.metaIconText}>SUBTITLES</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity style={styles.metaAction}>
                      <Ionicons name="speedometer-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.metaIconText}>1.0X</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity style={styles.metaActionIcon}>
                      <Ionicons name="volume-high" size={24} color="#FFF" />
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.metaActionIcon} onPress={toggleOrientation}>
                      <Ionicons name={isLandscapeUI ? "contract-outline" : "expand-outline"} size={22} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>

            {/* Custom Alert Cùng Chiều Xoay */}
            {showExitConfirm && (
              <View style={styles.alertOverlay}>
                <View style={styles.alertBox}>
                  <Text style={styles.alertTitle}>Dừng xem phim</Text>
                  <Text style={styles.alertMessage}>Phim của bạn đã tự động được lưu. Bạn chắc chắn muốn thoát chứ?</Text>
                  <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.alertBtnCancel} onPress={handleCancelExit}>
                      <Text style={styles.alertBtnCancelText}>Chưa, xem tiếp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alertBtnConfirm} onPress={handleConfirmExit}>
                      <Text style={styles.alertBtnConfirmText}>Thoát</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#CBD5E1',
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
  },
  hidden: {
    opacity: 0,
  },

  // Top
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 34,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  qualityText: {
    color: '#00B4D8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Center
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 36,
  },
  playBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#02609A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  playBtnFallback: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom
  bottomControls: {
    paddingBottom: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flex: 1,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  movieSubtitle: {
    color: '#A0AEC0',
    fontSize: 11,
    fontWeight: '500',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaIconText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaActionIcon: {
    marginLeft: 16,
  },
  nextEpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00B4D8',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  nextEpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B4D8',
    letterSpacing: 0.5,
  },
  fastForwardBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  fastForwardText: {
    color: '#00B4D8',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Custom Alert
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  alertBox: {
    backgroundColor: '#1A1A1A',
    width: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  alertMessage: {
    color: '#A0AEC0',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  alertBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    marginRight: 8,
  },
  alertBtnCancelText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  alertBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    marginLeft: 8,
  },
  alertBtnConfirmText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default PlayerScreen;
