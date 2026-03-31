import React, { createContext, useState, useEffect, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncManager } from '../utils/syncManager';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  userAvatar: string | null;
  updateUserAvatar: (base64: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  initializing: true,
  login: async () => { },
  register: async () => { },
  logout: async () => { },
  loginWithGoogle: async () => { },
  userAvatar: null,
  updateUserAvatar: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const updateUserAvatar = (base64: string) => {
    setUserAvatar(`data:image/jpeg;base64,${base64}`);
  };

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (user) {
      console.log('USER:>>>>>>>>', JSON.stringify(user, null, 2));
      syncManager.syncToLocal().then(() => syncManager.syncToCloud());
      
      // Fetch Custom Base64 Avatar from Firestore
      AsyncStorage.getItem('@user_avatar').then(localBase64 => {
        if (localBase64) setUserAvatar(`data:image/jpeg;base64,${localBase64}`);
      });
      firestore().collection('users').doc(user.uid).get().then(doc => {
        const data = doc.data();
        if (data && data.avatarBase64) {
          setUserAvatar(`data:image/jpeg;base64,${data.avatarBase64}`);
          AsyncStorage.setItem('@user_avatar', data.avatarBase64);
        }
      }).catch(e => console.log(e));

    } else {
      setUserAvatar(null);
    }
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Xoá sạch toàn bộ dữ liệu cục bộ của tài khoản hiện tại
      // để tránh tài khoản khác thấy dữ liệu của tài khoản cũ
      const allKeys = await AsyncStorage.getAllKeys();
      const userDataKeys = allKeys.filter(k =>
        k.startsWith('@favorite_list') ||
        k.startsWith('@history_list') ||
        k.startsWith('@user_avatar') ||
        k.startsWith('@progress_') ||
        k.startsWith('@movie_last_')
      );
      if (userDataKeys.length > 0) {
        await Promise.all(userDataKeys.map(k => AsyncStorage.removeItem(k)));
      }

      await auth().signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: '599527269798-6kb5lst8v8jp5tsi7dp4831gdra4qhok.apps.googleusercontent.com',
      });

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      // @ts-ignore
      const idToken = signInResult.data?.idToken || signInResult.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        login,
        register,
        logout,
        loginWithGoogle,
        userAvatar,
        updateUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
