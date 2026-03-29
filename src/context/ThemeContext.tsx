import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [themeColor, setThemeColor] = useState('#00B4D8');
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('@theme_color').then(val => {
      if (val) setThemeColor(val);
    });
    AsyncStorage.getItem('@bg_url').then(val => {
      if (val) setBgUrl(val);
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

  return (
    <ThemeContext.Provider value={{ themeColor, changeThemeColor, bgUrl, changeBgUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};
