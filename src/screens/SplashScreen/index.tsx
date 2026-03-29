import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground, SafeAreaView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        navigation.replace('Home');
      }
    });
  }, [animatedWidth, navigation]);

  const progressWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground
      source={require('../../assets/images/splash-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
      blurRadius={2}
    >
      <SafeAreaView style={styles.centerContent}>
        {/* Top Spacer to push logo/title down to make them readable on the white part of the image */}
        <View style={{ height: 100 }} />

        {/* Brand Titles */}
        <Text style={styles.title}>Zaq</Text>
        {/* <Text style={styles.subtitle}>Thiên đường điện ảnh của bạn</Text> */}

        {/* Small loader */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.loadingText}>ĐANG KHỞI TẠO...</Text>
        </View>

        {/* Logo box moved to middle-bottom to overlap with the cute characters */}
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/images/app-logo.jpg')}
            style={styles.logoImage}
          />
        </View>
      </SafeAreaView>

      <Text style={styles.footerText}>VERSION 3.0 • PINK PASTEL EDITION</Text>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD1DC', // Pink Pastel
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 100,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  title: {
    fontSize: 54,
    fontWeight: '900',
    color: '#D81B60', // Deep Pink
    letterSpacing: -1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4081',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: 120,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF80AB', // Pastel Pink progress
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D81B60',
    letterSpacing: 2,
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    color: '#C2185B',
    letterSpacing: 2,
    opacity: 0.6,
  },
});
