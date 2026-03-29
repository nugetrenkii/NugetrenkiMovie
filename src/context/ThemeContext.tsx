import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [themeColor, setThemeColor] = useState('#00B4D8');
  const [bgUrl, setBgUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@theme_color').then(val => {
      if (val) setThemeColor(val);
    });
    AsyncStorage.getItem('@bg_url').then(val => {
      if (val) setBgUrl(val);
    });
    AsyncStorage.getItem('@dark_mode').then(val => {
      if (val !== null) {
        setIsDarkMode(val === 'true');
      }
    });
  }, []);

  const changeThemeColor = async (color: string) => {
    setThemeColor(color);
    await AsyncStorage.setItem('@theme_color', color);
  };

  const changeBgUrl = async (url: string) => {
    setBgUrl(url);
    await AsyncStorage.setItem('@bg_url', url);
  };

  const toggleDarkMode = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('@dark_mode', newVal.toString());
  };

  // Dark Mode colors updated: Background is now dark for "Default" mode
  // Using high contrast between background (#121212) and items (#242424)
  const colors = isDarkMode ? {
    background: '#0F0F0F', // Darker background to avoid clashing with items
    tabBar: '#1A1A1A',
    card: '#222222',
    text: '#FFFFFF',       // White text for dark background
    itemText: '#FFFFFF',   // White text on dark items
    subText: '#A0AEC0',
    itemSubText: '#95A1AD',
    border: '#333333',
    headerSearch: '#1A1A1A',
  } : {
    background: '#FFFFFF',
    tabBar: '#FFFFFF',
    card: '#F8F9FA',
    text: '#1A1A1A',
    itemText: '#1A1A1A',
    subText: '#64748B',
    itemSubText: '#64748B',
    border: '#EAF1F8',
    headerSearch: '#F1F5F9',
  };

  return (
    <ThemeContext.Provider value={{
      themeColor, changeThemeColor,
      bgUrl, changeBgUrl,
      isDarkMode, toggleDarkMode,
      colors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
