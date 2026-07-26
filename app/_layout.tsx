import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { AppReadinessProvider, useAppReadiness } from '@/lib/app-readiness';
import { preloadStartupImages } from '@/lib/startup-assets';
import { useEnsureAuth } from '@/hooks/useEnsureAuth';

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
  useEnsureAuth();

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

    SystemUI.setBackgroundColorAsync('#07111F').catch(() => {});
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#07111F').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }

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
          <Stack.Screen name="daniel-study/[chapter]" options={{ presentation: 'modal', title: 'Daniel Study' }} />
          <Stack.Screen name="recent-activity" options={{ headerShown: false }} />
          <Stack.Screen name="badges" options={{ headerShown: false }} />
          <Stack.Screen name="pre-exilic-detail" options={{ headerShown: false }} />
          <Stack.Screen name="babylon-detail" options={{ headerShown: false }} />
          <Stack.Screen name="medo-persian-detail" options={{ headerShown: false }} />
          <Stack.Screen name="greek-detail" options={{ headerShown: false }} />
          <Stack.Screen name="roman-detail" options={{ headerShown: false }} />
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
