import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
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
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { startAuthListeners, stopAuthListeners } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const inAuthGroup = pathname?.startsWith('/auth');

  useEffect(() => {
    if (loading) return;

    if (!session && !inAuthGroup) {
      router.replace('/auth/signup' as any);
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [session, loading, inAuthGroup]);

  return null;
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

  useEffect(() => {
    startAuthListeners();
    return () => stopAuthListeners();
  }, []);

  const appIsReady = nativeSplashHidden && appContentReady;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="daniel-study/[chapter]" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="daniel-study/videos/index" options={{ headerShown: false }} />
          <Stack.Screen name="daniel-study/videos/[id]" options={{ presentation: 'modal', headerShown: false }} />
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

export default function RootLayout() {
  return (
    <AppReadinessProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </AppReadinessProvider>
  );
}
