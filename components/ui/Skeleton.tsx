import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type SkeletonProps = {
  /** Width of the skeleton block. Defaults to '100%'. */
  width?: ViewStyle['width'];
  /** Height of the skeleton block. Defaults to 16. */
  height?: ViewStyle['height'];
  /** Border-radius. Defaults to 8. */
  borderRadius?: number;
  /** Base background colour of the skeleton. */
  baseColor?: string;
  /** Highlight colour of the shimmer sweep. */
  highlightColor?: string;
  /** Extra styles applied to the outer wrapper View. */
  style?: ViewStyle;
};

/**
 * A reusable skeleton loading placeholder with a smooth shimmer animation.
 *
 * Usage:
 * ```tsx
 * <Skeleton width={120} height={120} borderRadius={16} />
 * <Skeleton width="100%" height={18} />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  baseColor = 'rgba(30, 41, 71, 0.7)',
  highlightColor = 'rgba(70, 100, 160, 0.35)',
  style,
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,  // repeat forever
        false // don't reverse
      )
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.get(), [0, 1], [-300, 300]),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={['transparent', highlightColor, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.shimmer, shimmerStyle]}
      />
    </View>
  );
}

/**
 * A skeleton specifically shaped for images — typically a rounded rectangle
 * that matches the dimensions of the image container it replaces.
 */
export function ImageSkeleton({
  width = '100%',
  height = 200,
  borderRadius = 12,
  style,
}: Omit<SkeletonProps, 'baseColor' | 'highlightColor'>) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      baseColor="rgba(20, 30, 56, 0.85)"
      highlightColor="rgba(55, 85, 145, 0.35)"
      style={style}
    />
  );
}

/**
 * A text-line skeleton — a slim horizontal bar that mimics a line of text.
 */
export function TextSkeleton({
  width = '80%',
  height = 14,
  style,
}: Omit<SkeletonProps, 'baseColor' | 'highlightColor' | 'borderRadius'>) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={6}
      baseColor="rgba(30, 41, 71, 0.6)"
      highlightColor="rgba(70, 100, 160, 0.3)"
      style={style}
    />
  );
}

/**
 * Pre-composed skeleton group that mimics a card with an image + 2–3 lines of text.
 */
export function CardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.cardSkeleton, style]}>
      <ImageSkeleton height={140} borderRadius={12} />
      <View style={styles.cardSkeletonBody}>
        <TextSkeleton width="60%" height={18} />
        <TextSkeleton width="90%" height={12} />
        <TextSkeleton width="45%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 300,
  },
  cardSkeleton: {
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 30, 56, 0.5)',
  },
  cardSkeletonBody: {
    gap: 8,
  },
});
