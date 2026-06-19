import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { AppReadinessProvider, useAppReadiness } from '@/lib/app-readiness';
import { preloadStartupImages } from '@/lib/startup-assets';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppReadinessProvider>
      <RootLayoutContent />
    </AppReadinessProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { appContentReady, splashAnimationComplete, markAppContentReady, markSplashAnimationComplete } = useAppReadiness();
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setNativeSplashHidden(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void preloadStartupImages().finally(() => {
      if (isMounted) {
        markAppContentReady();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [markAppContentReady]);

  const appIsReady = nativeSplashHidden && appContentReady;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="recent-activity" options={{ headerShown: false }} />
          <Stack.Screen name="badges" options={{ headerShown: false }} />
          <Stack.Screen name="pre-exilic-detail" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />

        {!splashAnimationComplete && (
          <AnimatedSplashScreen
            isReady={appIsReady}
            onAnimationComplete={markSplashAnimationComplete}
          />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
