import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({
  isReady,
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  // Shared values for animations
  const containerOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);
  const loadingBarWidth = useSharedValue(0);
  const loadingTextOpacity = useSharedValue(0);
  const loadingBarGlow = useSharedValue(0.4);

  // Entry animations on mount
  useEffect(() => {
    // 1. Fade in the full-screen splash image
    imageOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.215, 0.61, 0.355, 1.0),
    });

    // 2. Show loading text
    loadingTextOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    // 3. Animate loading bar — fill to ~70% quickly, then slow crawl
    loadingBarWidth.value = withSequence(
      withTiming(70, { duration: 1800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(85, { duration: 2000, easing: Easing.out(Easing.quad) })
    );

    // 4. Subtle pulsing glow on loading bar
    loadingBarGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  // Exit animation when app is ready
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isReady) {
      // Complete the loading bar to 100%
      loadingBarWidth.value = withTiming(100, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Minimum display time of 2400ms to enjoy the splash
      const minDisplayTime = 2400;
      timeoutId = setTimeout(() => {
        // Subtle zoom-in portal effect
        contentScale.value = withTiming(1.06, {
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // Fade out container
        containerOpacity.value = withTiming(
          0,
          {
            duration: 600,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          (finished) => {
            if (finished) {
              runOnJS(onAnimationComplete)();
            }
          }
        );
      }, minDisplayTime);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isReady]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const animatedLoadingBarStyle = useAnimatedStyle(() => ({
    width: `${loadingBarWidth.value}%` as any,
    shadowOpacity: loadingBarGlow.value,
  }));

  const animatedLoadingTextStyle = useAnimatedStyle(() => ({
    opacity: loadingTextOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Full-screen splash background image */}
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedContentStyle]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, animatedImageStyle]}>
          <Image
            source={require('../assets/bible-connection/splash-bg.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            priority="high"
          />
        </Animated.View>
      </Animated.View>

      {/* Bottom gradient for loading bar area */}
      <LinearGradient
        colors={['transparent', 'rgba(2, 6, 18, 0.85)', 'rgba(2, 6, 18, 0.98)']}
        locations={[0, 0.4, 1]}
        style={styles.bottomGradient}
      />

      {/* Loading bar + text at bottom */}
      <View style={styles.loadingContainer}>
        {/* Loading bar track */}
        <View style={styles.loadingBarTrack}>
          <Animated.View style={[styles.loadingBarFill, animatedLoadingBarStyle]}>
            <LinearGradient
              colors={['#1a6dff', '#3b8aff', '#5fa5ff']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.loadingBarGradient}
            />
          </Animated.View>
        </View>

        {/* Loading text */}
        <Animated.Text style={[styles.loadingText, animatedLoadingTextStyle]}>
          Loading...
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#060e1f',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 60,
    gap: 12,
  },
  loadingBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#3b8aff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  loadingBarGradient: {
    flex: 1,
    borderRadius: 2,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
