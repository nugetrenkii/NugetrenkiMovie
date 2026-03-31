import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, ImageBackground, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AccountScreen from '../screens/AccountScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const MockScreen = () => <View style={{ flex: 1, backgroundColor: '#FFF' }} />;

type IconName = 'home' | 'home-outline' | 'heart' | 'heart-outline' | 'person-circle' | 'person-circle-outline';

export default function TabNavigator() {
  const { themeColor, colors, isDarkMode } = React.useContext(ThemeContext);
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColor || '#00B4D8',
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255,255,255,0.4)' : '#8B9BA9',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBar || '#FFFFFF' }],
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Yêu thích',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
          tabBarItemStyle: styles.tabBarItemActive,
        }}
      />
      {/* <Tab.Screen
        name="FavoritesTab"
        component={MockScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      /> */}
      <Tab.Screen
        name="ProfileTab"
        component={user ? AccountScreen : LoginScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 90 : 70,
    borderTopWidth: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    position: 'absolute',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarItemActive: {
    paddingVertical: 4,
  },
});
