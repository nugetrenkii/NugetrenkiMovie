import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ImageBackground, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';
import PlayerScreen from '../screens/PlayerScreen';
import DetailScreen from '../screens/DetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoryScreen from '../screens/CategoryScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined; // We map "Home" root to the Main Tabs now
  Detail: { slug: string };
  Search: undefined;
  Category: { slug: string; name: string };
  Player: { videoUrl?: string; slug?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { bgUrl } = React.useContext(ThemeContext);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  const navContent = (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade', // Smooth transition from Splash
          contentStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* Route Home giờ sẽ dùng TabNavigator thay vì màn hình thường */}
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  if (bgUrl) {
    let bgSource: any = { uri: bgUrl };
    if (bgUrl === 'local-cat') bgSource = require('../assets/images/custom-bg.jpg');
    if (bgUrl === 'local-galaxy-cat') bgSource = require('../assets/images/custom-bg-2.jpg');
    if (bgUrl === 'local-candy-pink') bgSource = require('../assets/images/custom-bg-3.jpg');
    if (bgUrl === 'local-warrior-pink') bgSource = require('../assets/images/custom-bg-4.jpg');

    return (
      <ImageBackground source={bgSource} style={{ flex: 1 }} blurRadius={2}>
        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.45)' }}>
          {navContent}
        </View>
      </ImageBackground>
    );
  }

  return <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>{navContent}</View>;
};

export default AppNavigator;
