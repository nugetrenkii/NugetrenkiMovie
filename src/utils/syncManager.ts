import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const syncManager = {
  // === SYNC FROM FIRESTORE → ASYNCSTORAGE ===
  // Chạy khi người dùng đăng nhập hoặc cài lại App
  syncToLocal: async () => {
    const user = auth().currentUser;
    if (!user) return;
    try {
      const doc = await firestore().collection('users').doc(user.uid).get();
      const data = doc.data();
      if (!data) return;

      // 1. Khôi phục danh sách yêu thích
      if (data.favorites) {
        await AsyncStorage.setItem('@favorite_list', JSON.stringify(data.favorites));
      }

      // 2. Khôi phục lịch sử xem (@history_list)
      if (data.history) {
        await AsyncStorage.setItem('@history_list', JSON.stringify(data.history));
      }

      // 3. Khôi phục tiến trình xem dở (tập phim cuối + giây dừng lại)
      if (data.watchProgress) {
        const entries = Object.entries(data.watchProgress as Record<string, any>);
        for (const [key, value] of entries) {
          // key có dạng "slug__epIndex", value = { time, lastEp }
          const slugKey = key.replace(/__/g, '/'); // decode lại
          if (value.time != null) {
            await AsyncStorage.setItem(`@progress_${slugKey}`, String(value.time));
          }
          if (value.lastEp != null) {
            const slug = key.split('__')[0];
            await AsyncStorage.setItem(`@movie_last_${slug}`, String(value.lastEp));
          }
        }
      }

    } catch (error) {
      console.log('[SyncManager] syncToLocal Error:', error);
    }
  },

  // === SYNC FROM ASYNCSTORAGE → FIRESTORE ===
  // Chạy khi người dùng thay đổi danh sách yêu thích hoặc xem phim
  syncToCloud: async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      // 1. Đọc danh sách yêu thích
      const favStr = await AsyncStorage.getItem('@favorite_list');
      const favLocal = favStr ? JSON.parse(favStr) : [];

      // 2. Đọc lịch sử xem
      const histStr = await AsyncStorage.getItem('@history_list');
      const histLocal = histStr ? JSON.parse(histStr) : [];

      // 3. Quét toàn bộ kho AsyncStorage để lấy tiến trình xem
      const allKeys = await AsyncStorage.getAllKeys();
      const progressKeys = allKeys.filter(k => k.startsWith('@progress_'));
      const lastEpKeys = allKeys.filter(k => k.startsWith('@movie_last_'));

      const watchProgress: Record<string, any> = {};

      // Lưu tiến trình giây đang xem dở theo từng tập
      for (const key of progressKeys) {
        // key dạng: @progress_<slug>_<epIndex>
        const rawKey = key.replace('@progress_', '');
        // Firestore không cho phép '/' trong field name → thay bằng '__'
        const firestoreKey = rawKey.replace(/\//g, '__');
        const value = await AsyncStorage.getItem(key);
        if (value != null) {
          if (!watchProgress[firestoreKey]) watchProgress[firestoreKey] = {};
          watchProgress[firestoreKey].time = parseFloat(value);
        }
      }

      // Lưu tập phim cuối cùng đang xem của từng slug
      for (const key of lastEpKeys) {
        const slug = key.replace('@movie_last_', '');
        const firestoreKey = `${slug}__LAST`;
        const value = await AsyncStorage.getItem(key);
        if (value != null) {
          if (!watchProgress[firestoreKey]) watchProgress[firestoreKey] = {};
          watchProgress[firestoreKey].lastEp = parseInt(value, 10);
        }
      }

      await firestore().collection('users').doc(user.uid).set({
        favorites: favLocal,
        history: histLocal,
        watchProgress,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

    } catch (e) {
      console.log('[SyncManager] syncToCloud Error:', e);
    }
  },

  // === SYNC chỉ tiến trình 1 bộ phim (tối ưu - không cần quét toàn bộ) ===
  syncProgressToCloud: async (slug: string, epIndex: number, time: number) => {
    const user = auth().currentUser;
    if (!user) return;
    try {
      const firestoreKey = `${slug}__${epIndex}`;
      const lastEpKey = `${slug}__LAST`;
      await firestore().collection('users').doc(user.uid).set({
        watchProgress: {
          [firestoreKey]: { time },
          [lastEpKey]: { lastEp: epIndex },
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.log('[SyncManager] syncProgressToCloud Error:', e);
    }
  },
};
