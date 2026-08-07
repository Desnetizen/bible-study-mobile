import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Award, ChevronRight } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Badge, getEarnedBadges, getEarnedStreakBadges } from '../lib/badges';
import { useDanielProgress } from '../lib/daniel-progress';

function BadgePill({
  badge,
  isNew,
}: {
  badge: Badge;
  isNew: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isNew) {
      scale.set(
        withSequence(
          withSpring(1.2, { damping: 3, stiffness: 180 }),
          withSpring(1, { damping: 6, stiffness: 150 }),
        ),
      );
    }
  }, [isNew, scale]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View style={[styles.badgePill, animatedScale]}>
      <View style={styles.badgeImageWrap}>
        <Image
          source={badge.image}
          style={styles.badgeImage}
          contentFit="cover"
        />
        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New!</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export function BadgeSection({ newBadgeIds, streakCount }: { newBadgeIds?: string[]; streakCount: number }) {
  const completedChapters = useDanielProgress();
  const earned = [
    ...getEarnedBadges(completedChapters),
    ...getEarnedStreakBadges(streakCount),
  ];
  const newSet = new Set(newBadgeIds);

  if (earned.length === 0) return null;

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.sectionHeader}
        onPress={() => router.push('/badges' as any)}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIcon, { backgroundColor: '#E8A838' }]}>
            <Award size={14} color="#ffffff" strokeWidth={2.5} />
          </View>
          <Text style={styles.sectionTitle}>Badges</Text>
        </View>
        <View style={styles.sectionHeaderRight}>
          <Text style={styles.sectionCount}>{earned.length}</Text>
          <ChevronRight size={14} color="#8b96a8" strokeWidth={2} />
        </View>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {earned.map((badge) => (
          <Pressable
            key={badge.key}
            onPress={() => router.push('/badges' as any)}
          >
            <BadgePill badge={badge} isNew={newSet.has(badge.key)} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const BADGE_SIZE = 52;

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Cinzel',
    lineHeight: 22,
  },
  sectionCount: {
    color: '#8b96a8',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  scrollContent: {
    gap: 14,
    paddingRight: 20,
  },
  badgePill: {
    alignItems: 'center',
    gap: 4,
  },
  badgeImageWrap: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(232, 168, 56, 0.4)',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
