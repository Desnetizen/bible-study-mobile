import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PreparationLogoAnimation } from './PreparationLogoAnimation';
import { SPLASH_MIN_DURATION_MS, SPLASH_TIMED_FILL_TARGET } from '../lib/splash-config';

interface AnimatedSplashScreenProps {
  isReady: boolean;
  /** Real fraction (0–1) of startup assets loaded so far. */
  progress: number;
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({
  isReady,
  progress,
  onAnimationComplete,
}: AnimatedSplashScreenProps) {
  // Ref to capture latest onAnimationComplete callback (prevents stale closure)
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Guard: if isReady is already true on mount, skip entry animations
  const hasMounted = useRef(false);
  const wasReadyOnMount = useRef(isReady);

  // Track whether exit has started (prevent double-fires)
  const exitStartedRef = useRef(false);

  const notifyAnimationComplete = useCallback(() => {
    onAnimationCompleteRef.current?.();
  }, []);

  // Shared values for animations
  const containerOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);
  const loadingBarWidth = useSharedValue(0);
  const loadingTextOpacity = useSharedValue(0);

  // Mirrors loadingBarWidth on the JS thread for the percentage label
  const [displayedPercent, setDisplayedPercent] = useState(0);

  // Entry animations on mount (skip if isReady is already true)
  useEffect(() => {
    if (wasReadyOnMount.current) {
      // isReady was true on mount — go straight to ready state
      loadingBarWidth.value = 100;
      hasMounted.current = true;
      return;
    }

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

    // 3. Fill the loading bar at a steady, visible pace across the whole
    // minimum splash duration. Stops just short of 100% — the exit
    // animation (startExit, below) takes it the rest of the way once the
    // app is actually ready, so a slow load never leaves it stalled at 100%.
    loadingBarWidth.value = withTiming(SPLASH_TIMED_FILL_TARGET, {
      duration: SPLASH_MIN_DURATION_MS,
      easing: Easing.linear,
    });
  }, [imageOpacity, loadingBarWidth, loadingTextOpacity]);

  // Exit animation when app is ready
  const beginExitPortal = useCallback(() => {
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
          runOnJS(notifyAnimationComplete)();
        }
      }
    );
  }, [containerOpacity, contentScale, notifyAnimationComplete]);

  const startExit = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;

    // Smoothly complete the loading bar from current value to 100%.
    // Duration is proportional to remaining progress (~15ms per % remaining,
    // clamped to 400-1000ms) so the speedup feels natural.
    const currentProgress = loadingBarWidth.value;
    const remaining = Math.max(0, 100 - currentProgress);
    const barDuration = Math.min(1000, Math.max(400, remaining * 15));

    loadingBarWidth.value = withTiming(
      100,
      {
        duration: barDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(beginExitPortal)();
        }
      }
    );
  }, [beginExitPortal, loadingBarWidth]);

  useEffect(() => {
    if (!isReady || wasReadyOnMount.current) {
      if (wasReadyOnMount.current && isReady) {
        startExit();
      }
      return;
    }

    startExit();
  }, [isReady, startExit]);

  // Mirror the loading bar value onto the JS thread so the % label can render
  useAnimatedReaction(
    () => Math.floor(loadingBarWidth.value),
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setDisplayedPercent)(currentValue);
      }
    },
    [loadingBarWidth]
  );

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

  // Loading bar scale: 0 = 0%, 1 = 100%. Uses transform scaleX which avoids layout recalculation.
  const loadingBarScale = useDerivedValue(() => loadingBarWidth.value / 100);

  const animatedLoadingBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: loadingBarScale.value }],
  }));

  const animatedLoadingTextStyle = useAnimatedStyle(() => ({
    opacity: loadingTextOpacity.value,
  }));

  // Determine pointerEvents: block touches during entry, allow pass-through during exit
  const pointerEvents = isReady ? 'none' as const : 'auto' as const;

  // Approximate current bar value for accessibility (not reactive — static OK for screen readers)
  const approxBarValue = isReady ? 100 : Math.round(loadingBarWidth.value);

  return (
    <Animated.View
      style={[styles.container, animatedContainerStyle]}
      pointerEvents={pointerEvents}
    >
      {/* Full-screen splash background image */}
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedContentStyle]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, animatedImageStyle]}>
          <Image
            source={require('../../assets/bible-connection/splash-bg.png')}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
            priority="high"
          />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.logoAnimationContainer, animatedContentStyle, animatedImageStyle]}>
        <PreparationLogoAnimation style={styles.logoAnimation} speed={1.05} />
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
        <View
          style={styles.loadingBarTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: approxBarValue }}
        >
          {/* Wrapper pinned to left so scaleX grows left-to-right */}
          <View style={styles.loadingBarOriginWrapper}>
            <Animated.View style={[styles.loadingBarFill, animatedLoadingBarStyle]}>
              <LinearGradient
                colors={['#8f6420', '#d6a747', '#fff0a8']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.loadingBarGradient}
              />
            </Animated.View>
          </View>
        </View>

        {/* Loading text */}
        <Animated.Text style={[styles.loadingText, animatedLoadingTextStyle]}>
          {`Loading... ${displayedPercent}%`}
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
  logoAnimationContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 128,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoAnimation: {
    // Sized relative to screen width with sane floor/ceiling so it reads
    // clearly on small phones without dominating larger screens.
    width: '60%',
    minWidth: 160,
    maxWidth: 260,
    aspectRatio: 1,
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
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBarOriginWrapper: {
    // Pins scaleX transform to left edge so the bar grows left-to-right
    alignSelf: 'flex-start',
    height: '100%',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingBarGradient: {
    flex: 1,
    borderRadius: 3,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
