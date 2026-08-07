import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronLeft, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgePreviewModal } from '@/components/BadgePreviewModal';
import { getEarnedBadges, getEarnedStreakBadges, getBadgeSubtitle } from '@/lib/badges';
import type { Badge } from '@/lib/badges';
import { useDanielProgress } from '@/lib/daniel-progress';
import { useStreak } from '@/lib/useStreak';

const TOTAL_BADGES = 17; // 12 chapter + 5 streak

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const completedChapters = useDanielProgress();
  const { streakCount } = useStreak();
  const earned = [
    ...getEarnedBadges(completedChapters),
    ...getEarnedStreakBadges(streakCount),
  ];
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#ffffff" strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Badges</Text>
          <Text style={styles.subtitle}>
            {earned.length} of {TOTAL_BADGES} earned
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Trophy size={22} color="#E8A838" strokeWidth={2} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {earned.length === 0 ? (
          <View style={styles.emptyState}>
            <Trophy size={48} color="#4a5568" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No badges yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete Daniel chapters to earn badges
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {earned.map((badge) => (
              <Pressable
                key={badge.key}
                style={styles.badgeCard}
                onPress={() => setSelectedBadge(badge)}
              >
                <View
                  style={[
                    styles.badgeImageWrap,
                    { borderColor: badge.color + '60' },
                  ]}
                >
                  <Image
                    source={badge.image}
                    style={styles.badgeImage}
                    contentFit="cover"
                  />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeChapter}>{getBadgeSubtitle(badge)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BadgePreviewModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}

const BADGE_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1a30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerRight: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Cinzel',
  },
  subtitle: {
    color: '#8b96a8',
    fontSize: 13,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  badgeCard: {
    width: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  badgeImageWrap: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 3,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  badgeName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 18,
  },
  badgeChapter: {
    color: '#8b96a8',
    fontSize: 11,
    fontFamily: 'Inter',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Cinzel',
  },
  emptySubtitle: {
    color: '#8b96a8',
    fontSize: 13,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
