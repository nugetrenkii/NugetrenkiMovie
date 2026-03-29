// Reactotron: chỉ khởi tạo khi đang ở chế độ debug
if (__DEV__) {
  require('./src/config/ReactotronConfig');
}

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SplashScreen from 'react-native-splash-screen';
import Orientation from 'react-native-orientation-locker';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    try {
      SplashScreen.hide();
      // Luôn khóa màn hình theo chiều dọc cho toàn bộ ứng dụng
      Orientation.lockToPortrait();
    } catch (e) {
      console.warn('React Native Orientation or Splash Screen is not yet configured on native side');
    }
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor="transparent" 
            translucent 
          />
          <AppNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
