import { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

const MILESTONE_DAYS = [1, 3, 7, 14, 21];

export function StreakBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const isActive = count > 0;
  const isMilestone = MILESTONE_DAYS.includes(count);

  useEffect(() => {
    if (isMilestone && count > 0) {
      scale.set(
        withSequence(
          withSpring(1.18, { damping: 4, stiffness: 200 }),
          withSpring(1, { damping: 8, stiffness: 180 })
        )
      );
    }
  }, [count, isMilestone, scale]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(350).springify()}
      style={[styles.wrapper, style, animatedScale]}
    >
      <View
        style={[
          styles.pill,
          isActive ? styles.pillActive : styles.pillInactive,
        ]}
      >
        <Text style={styles.flame}>{isActive ? '🔥' : '🪨'}</Text>
        <Text
          style={[
            styles.label,
            isActive ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {isActive ? `${count} Day Streak` : 'Start your streak'}
        </Text>
      </View>
      <Text style={styles.disclosure}>per device</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 'auto',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#1a1200',
    borderColor: '#f59e0b40',
  },
  pillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  flame: {
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  labelActive: {
    color: '#f59e0b',
  },
  labelInactive: {
    color: '#6b7a94',
  },
  disclosure: {
    fontSize: 9,
    color: '#6b7a94',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});
