import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeContext } from '../../context/ThemeContext';

const THEME_COLORS = [
  '#00B4D8', // Cyan (Default)
  '#E50914', // Netflix Red
  '#10B981', // Emerald Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#FFC5D3', // Pink
];

const BACKGROUNDS = [
  { id: 'none', url: '', name: 'Mặc định' },
  { id: 'custom', url: 'local-cat', name: 'Hachiware', source: require('../../assets/images/custom-bg.jpg') },
  { id: 'custom2', url: 'local-galaxy-cat', name: 'Chiikawa friends', source: require('../../assets/images/custom-bg-2.jpg') },
  { id: 'custom3', url: 'local-candy-pink', name: 'Chiikawa', source: require('../../assets/images/custom-bg-3.jpg') },
  { id: 'custom4', url: 'local-warrior-pink', name: 'Pink Chii', source: require('../../assets/images/custom-bg-4.jpg') },
  // { id: 'bg1', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop', name: 'Rạp xiếc Bóng tối' },
  // { id: 'bg2', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop', name: 'Rạp chiếu phim' },
  // { id: 'bg3', url: 'https://images.unsplash.com/photo-1518929468119-e5bf444c30f4?q=80&w=600&auto=format&fit=crop', name: 'Blue Abstract' },
  { id: 'bg4', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop', name: 'Gradient Color' },
];

export default function ProfileScreen() {
  const { themeColor, changeThemeColor, bgUrl, changeBgUrl } = useContext(ThemeContext);

  const renderContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={100} color={themeColor} />
        <Text style={[styles.userName, { color: themeColor }]}>My Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đổi Màu Theme</Text>
        <View style={styles.colorRow}>
          {THEME_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                themeColor === color && styles.colorActive
              ]}
              onPress={() => changeThemeColor(color)}
            >
              {themeColor === color && <Ionicons name="checkmark" size={24} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đổi Hình Nền (Background Wallpaper)</Text>
        {BACKGROUNDS.map(bg => (
          <TouchableOpacity
            key={bg.id}
            style={[styles.bgCard, bgUrl === bg.url && { borderColor: themeColor, borderWidth: 2 }]}
            onPress={() => changeBgUrl(bg.url)}
            activeOpacity={0.8}
          >
            {bg.url ? (
              <ImageBackground
                source={bg.url.startsWith('local-') ? bg.source : { uri: bg.url }}
                style={styles.bgPreview}
                imageStyle={{ borderRadius: 8 }}
              >
                <View style={[styles.bgOverlay, bg.url.startsWith('local-') && { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <Text style={styles.bgName}>{bg.name}</Text>
                  {bgUrl === bg.url && <Ionicons name="checkmark-circle" size={24} color={themeColor} />}
                </View>
              </ImageBackground>
            ) : (
              <View style={[styles.bgPreview, { backgroundColor: '#1A1A1A', borderRadius: 8 }]}>
                <View style={[styles.bgOverlay, { backgroundColor: 'transparent' }]}>
                  <Text style={styles.bgName}>{bg.name}</Text>
                  {bgUrl === bg.url && <Ionicons name="checkmark-circle" size={24} color={themeColor} />}
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  if (bgUrl) {
    let bgSource: any = { uri: bgUrl };
    if (bgUrl === 'local-cat') bgSource = require('../../assets/images/custom-bg.jpg');
    if (bgUrl === 'local-galaxy-cat') bgSource = require('../../assets/images/custom-bg-2.jpg');
    if (bgUrl === 'local-candy-pink') bgSource = require('../../assets/images/custom-bg-3.jpg');
    if (bgUrl === 'local-warrior-pink') bgSource = require('../../assets/images/custom-bg-4.jpg');

    return (
      <ImageBackground source={bgSource} style={styles.container}>
        <View style={styles.darkOverlay}>
          <SafeAreaView style={{ flex: 1 }}>
            {renderContent()}
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Cho Bottom Tab không bị che
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 10,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorActive: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bgCard: {
    height: 85,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#333',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  bgPreview: {
    flex: 1,
    justifyContent: 'center',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bgName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
