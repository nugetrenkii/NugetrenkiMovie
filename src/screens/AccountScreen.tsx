import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors as defaultColors } from '../theme/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';

const AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';

const AccountScreen = ({ navigation }: any) => {
  const { user, logout, userAvatar, updateUserAvatar } = useAuth();
  const { colors, themeColor, isDarkMode } = React.useContext(ThemeContext);

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateAvatar = async () => {
    if (!user) return;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.3,
        maxWidth: 300,
        maxHeight: 300,
        includeBase64: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.base64) return;

      setIsUpdating(true);

      // Bypass Firebase Storage completely due to Google pricing restrictions.
      // Upload Base64 directly into Firestore Database (under limit -> perfect for avatars)
      await firestore().collection('users').doc(user.uid).set({
        avatarBase64: asset.base64
      }, { merge: true });

      updateUserAvatar(asset.base64);
      Alert.alert('Thành công', 'Đã lưu ảnh đại diện lên Hồ sơ mây (Firestore). Bây giờ bạn đăng nhập ở máy nào cũng giữ nguyên khuôn mặt nhé!');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thiết lập ảnh cục bộ.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeName = () => {
    if (!user) return;
    Alert.prompt(
      'Cập nhật Tên',
      'Nhập tên hiển thị mới của bạn:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Lưu lại', 
          onPress: async (text?: string) => {
            if (!text || text.trim() === '') return;
            setIsUpdating(true);
            try {
              await user.updateProfile({ displayName: text.trim() });
              Alert.alert('Thành công', 'Đã cập nhật Tên! Hãy đăng xuất và đăng nhập lại để thấy thay đổi.');
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể cập nhật tên.');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ],
      'plain-text',
      user.displayName || ''
    );
  };

  const handleProfilePress = () => {
    Alert.alert('Tùy chỉnh Hồ Sơ', 'Bạn muốn thay đổi thông tin gì?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đổi tên', onPress: handleChangeName },
      { text: 'Đổi ảnh đại diện', onPress: handleUpdateAvatar }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài Khoản</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePress} activeOpacity={0.8}>
          <Image source={{ uri: userAvatar || user?.photoURL || AVATAR }} style={[styles.avatar, { borderColor: themeColor, opacity: isUpdating ? 0.5 : 1 }]} />
          {isUpdating ? (
            <View style={styles.spinnerOverlay}>
              <ActivityIndicator color={themeColor} />
            </View>
          ) : (
            <View style={[styles.editBadge, { backgroundColor: themeColor }]}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName || 'Người Dùng Zaq'}</Text>
        <Text style={[styles.userEmail, { color: colors.subText }]}>{user?.email || 'Chưa cập nhật email'}</Text>
      </View>

      <View style={styles.menuSection}>
        {/* Settings options placeholders for future extensions */}
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(2, 96, 154, 0.15)' }]}>
            <Ionicons name="person-outline" size={20} color="#02609A" />
          </View>
          <Text style={[styles.menuText, { color: colors.itemText }]}>Chỉnh sửa thông tin</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]}>
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(235, 171, 52, 0.15)' }]}>
            <Ionicons name="star-outline" size={20} color="#EBAB34" />
          </View>
          <Text style={[styles.menuText, { color: colors.itemText }]}>Gói thành viên</Text>
          <Text style={[styles.badgeText, { color: themeColor, marginRight: 8 }]}>Nâng cấp</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]} 
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <Ionicons name="settings-outline" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.menuText, { color: colors.itemText }]}>Cài đặt ứng dụng</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.subText} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#121212', // to blend with dark mode ideally
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
