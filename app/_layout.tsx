import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const readyTimer = setTimeout(() => {
      if (isMounted) {
        setAppIsReady(true);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(readyTimer);
    };
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide the native splash screen once custom splash screen has mounted
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="recent-activity" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        {!splashAnimationComplete && (
          <AnimatedSplashScreen
            isReady={appIsReady}
            onAnimationComplete={() => setSplashAnimationComplete(true)}
          />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
