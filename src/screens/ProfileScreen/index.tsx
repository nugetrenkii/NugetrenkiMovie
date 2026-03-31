import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, SafeAreaView, Platform, Switch } from 'react-native';
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
  { id: 'bg4', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop', name: 'Gradient Color' },
];

export default function ProfileScreen({ navigation }: any) {
  const { themeColor, changeThemeColor, bgUrl, changeBgUrl, isDarkMode, toggleDarkMode, colors } = useContext(ThemeContext);


  const renderContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text || (isDarkMode ? '#FFF' : '#1A1A1A')} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text || (isDarkMode ? '#FFF' : '#1A1A1A') }]}>Cài đặt ứng dụng</Text>
        <View style={{ width: 40 }} />
      </View>


      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={themeColor} style={{ marginRight: 12 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.itemText }]}>Chế độ tối</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: themeColor }}
            thumbColor={isDarkMode ? '#FFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.itemText }]}>Đổi Màu Theme</Text>
        <View style={styles.colorRow}>
          {THEME_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                themeColor === color && styles.colorActive
              ]}
              onPress={() => changeThemeColor(color)}
            >
              {themeColor === color && <Ionicons name="checkmark" size={Platform.OS === 'android' ? 28 : 24} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.itemText }]}>Đổi Hình Nền</Text>
        {BACKGROUNDS.map(bg => (
          <TouchableOpacity
            key={bg.id}
            style={[styles.bgCard, bgUrl === bg.url && { borderColor: themeColor, borderWidth: 2 }]}
            onPress={() => changeBgUrl(bg.url)}
            activeOpacity={0.7}
          >
            {bg.url ? (
              <ImageBackground
                source={bg.url.startsWith('local-') ? bg.source : { uri: bg.url }}
                style={styles.bgPreview}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={[styles.bgOverlay, bg.url.startsWith('local-') && { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                  <Text style={styles.bgName}>{bg.name}</Text>
                  {bgUrl === bg.url && <Ionicons name="checkmark-circle" size={26} color={themeColor} />}
                </View>
              </ImageBackground>
            ) : (
              <View style={[styles.bgPreview, { backgroundColor: '#1A1A1A', borderRadius: 12 }]}>
                <View style={[styles.bgOverlay, { backgroundColor: 'transparent' }]}>
                  <Text style={styles.bgName}>{bg.name}</Text>
                  {bgUrl === bg.url && <Ionicons name="checkmark-circle" size={26} color={themeColor} />}
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
      <ImageBackground source={bgSource} style={styles.container} blurRadius={5}>
        <View style={styles.darkOverlay}>
          <SafeAreaView style={{ flex: 1 }}>
            {renderContent()}
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgUrl ? 'transparent' : colors.background }]}>
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
    // backgroundColor: 'rgba(0,0,0,0.6)',
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'android' ? 10 : 7,
  },
  colorCircle: {
    width: Platform.OS === 'android' ? 46 : 40,
    height: Platform.OS === 'android' ? 46 : 40,
    borderRadius: Platform.OS === 'android' ? 23 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorActive: {
    borderWidth: 3,
    borderColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bgCard: {
    height: 90,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#333',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
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
  },
  bgName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
