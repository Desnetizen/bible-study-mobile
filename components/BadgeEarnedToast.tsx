import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import type { Badge } from '../lib/badges';

const ARC_SIZE = 44;
const ARC_STROKE = 3;
const LOGO_SIZE = 34;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ArcRing() {
  const progress = useSharedValue(0);
  const radius = (ARC_SIZE - ARC_STROKE) / 2;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  useEffect(() => {
    progress.set(withTiming(1, { duration: 900 }));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  return (
    <Svg width={ARC_SIZE} height={ARC_SIZE}>
      <Circle
        cx={ARC_SIZE / 2}
        cy={ARC_SIZE / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={ARC_STROKE}
        fill="none"
      />
      <AnimatedCircle
        cx={ARC_SIZE / 2}
        cy={ARC_SIZE / 2}
        r={radius}
        stroke="#4caf50"
        strokeWidth={ARC_STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        rotation="-90"
        origin={`${ARC_SIZE / 2}, ${ARC_SIZE / 2}`}
      />
    </Svg>
  );
}

function ToastItem({
  badge,
  onDismiss,
  onPress,
}: {
  badge: Badge;
  onDismiss: () => void;
  onPress: () => void;
}) {
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const dismissedRef = useRef(false);

  useEffect(() => {
    translateY.set(withSpring(0, { damping: 14, stiffness: 180 }));
    opacity.set(withTiming(1, { duration: 250 }));

    const timer = setTimeout(() => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      opacity.set(withTiming(0, { duration: 300 }));
      translateY.set(withTiming(-60, { duration: 300 }, () => {
        runOnJS(onDismiss)();
      }));
    }, 4200);

    return () => { clearTimeout(timer); };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.toast, animStyle]}>
        <View style={styles.body}>
          <View style={styles.iconWrap}>
            <Image
              source={require('../assets/bible-connection/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.arcOverlay} pointerEvents="none">
              <ArcRing />
            </View>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Badge earned</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {badge.name}
            </Text>
            <Text style={styles.chapter}>Chapter {badge.chapter}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface BadgeEarnedToastProps {
  badges: Badge[];
  onComplete: () => void;
  onPress: (badge: Badge) => void;
}

export function BadgeEarnedToast({ badges, onComplete, onPress }: BadgeEarnedToastProps) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [badges]);

  const current = badges[index];

  if (!current) return null;

  const handleDismiss = () => {
    if (index < badges.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const handlePress = () => {
    onPress(current);
  };

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <ToastItem
        badge={current}
        onDismiss={handleDismiss}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  toast: {
    maxWidth: 320,
    backgroundColor: '#1a1a1a',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: ARC_SIZE,
    height: ARC_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  arcOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textBlock: {
    flexShrink: 1,
    gap: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  subtitle: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  chapter: {
    color: '#4caf50',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
});
