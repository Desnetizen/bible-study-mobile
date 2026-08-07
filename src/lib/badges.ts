import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { CHAPTER_COLORS } from '../data/danielStudyChapters';
import { getDanielProgressSnapshot, subscribeDanielProgress } from './daniel-progress';

// The badge-seen snapshot (which "new" badges have already been shown) is
// stored only in AsyncStorage. This is a deliberate local-only design:
// badge toast state is cosmetic — re-showing a few toasts on a new device
// is harmless, and syncing this state adds complexity for no user-visible
// correctness gain. See Bug #7 in the review for context.
const BADGE_SNAPSHOT_KEY = 'bible-connection:badge-snapshot:v2';

export type Badge = {
  key: string;
  kind: 'chapter' | 'streak';
  chapter?: number;
  days?: number;
  name: string;
  image: number;
  color: string;
};

const BADGE_MAP: Record<number, { name: string; image: number }> = {
  1: {
    name: 'Purposeful Resolver',
    image: require('../../assets/badges/Purposeful_resolver_Chapter_1.png'),
  },
  2: {
    name: 'Dream Revealer',
    image: require('../../assets/badges/dream-revealer_Chapter_2.png'),
  },
  3: {
    name: 'Unburned',
    image: require('../../assets/badges/Unburned_Chapter_3.png'),
  },
  4: {
    name: 'Humble Overcomer',
    image: require('../../assets/badges/humble_overcomer_chapter_4.png'),
  },
  5: {
    name: 'Surprised',
    image: require('../../assets/badges/Surprised_chapter_5.png'),
  },
  6: {
    name: 'Untouchable',
    image: require('../../assets/badges/untouchable_chapter_6.png'),
  },
  7: {
    name: 'Visionary',
    image: require('../../assets/badges/visionary_chapter_7.png'),
  },
  8: {
    name: 'Seer',
    image: require('../../assets/badges/seer_chapter_8.png'),
  },
  9: {
    name: 'Incessant Intercessor',
    image: require('../../assets/badges/incessant-intercessor_chapter_9.png'),
  },
  10: {
    name: 'Greatly Beloved',
    image: require('../../assets/badges/Greatly_Beloved_chapter_10.png'),
  },
  11: {
    name: 'Steadfast Warrior',
    image: require('../../assets/badges/steadfast_warrior_chapter_11.png'),
  },
  12: {
    name: 'Faithful to the End',
    image: require('../../assets/badges/chapter_12.png'),
  },
};

const STREAK_BADGES: { days: number; name: string; image: number }[] = [
  { days: 1, name: '1-Day Streak', image: require('../../assets/badges/day_1_streak.png') },
  { days: 3, name: '3-Day Streak', image: require('../../assets/badges/day_3streak.png') },
  { days: 7, name: '7-Day Streak', image: require('../../assets/badges/day_7_streak.png') },
  { days: 14, name: '14-Day Streak', image: require('../../assets/badges/day_14_streak.png') },
  { days: 21, name: '21-Day Streak', image: require('../../assets/badges/day_21_streak.png') },
];

const STREAK_COLOR = '#f59e0b';

export function getBadgeSubtitle(badge: Badge): string {
  if (badge.kind === 'streak') return `Day ${badge.days} Streak`;
  return `Chapter ${badge.chapter}`;
}

export function getEarnedBadges(completedChapters: number[]): Badge[] {
  return completedChapters
    .filter((ch) => ch in BADGE_MAP)
    .sort((a, b) => a - b)
    .map((ch) => ({
      key: `ch-${ch}`,
      kind: 'chapter' as const,
      chapter: ch,
      name: BADGE_MAP[ch].name,
      image: BADGE_MAP[ch].image,
      color: CHAPTER_COLORS[ch as keyof typeof CHAPTER_COLORS] || '#1e3a8a',
    }));
}

export function getEarnedStreakBadges(streakCount: number): Badge[] {
  return STREAK_BADGES
    .filter((sb) => sb.days <= streakCount)
    .sort((a, b) => a.days - b.days)
    .map((sb) => ({
      key: `str-${sb.days}`,
      kind: 'streak' as const,
      days: sb.days,
      name: sb.name,
      image: sb.image,
      color: STREAK_COLOR,
    }));
}

export function getBadgeCount(completedChapters: number[]): number {
  return completedChapters.filter((ch) => ch in BADGE_MAP).length;
}

export function getLatestBadge(completedChapters: number[]): Badge | null {
  const earned = getEarnedBadges(completedChapters);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

async function loadBadgeSnapshot(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BADGE_SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveBadgeSnapshot(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BADGE_SNAPSHOT_KEY, JSON.stringify(keys));
  } catch {
    // Ignore
  }
}

function getEarnedKeys(completedChapters: number[], streakCount: number): string[] {
  const chapterKeys = completedChapters
    .filter((ch) => ch in BADGE_MAP)
    .map((ch) => `ch-${ch}`);
  const streakKeys = STREAK_BADGES
    .filter((sb) => sb.days <= streakCount)
    .map((sb) => `str-${sb.days}`);
  return [...chapterKeys, ...streakKeys];
}

export function useNewBadgeIds(streakCount: number): string[] {
  const [newIds, setNewIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      const currentChapters = getDanielProgressSnapshot();
      const currentKeys = getEarnedKeys(currentChapters, streakCount);

      loadBadgeSnapshot().then((snapshot) => {
        if (cancelled) return;
        const newlyUnlocked = currentKeys.filter((k) => !snapshot.includes(k));
        if (newlyUnlocked.length > 0) {
          setNewIds((prev) => {
            const combined = [...new Set([...prev, ...newlyUnlocked])];
            return combined;
          });
          saveBadgeSnapshot(currentKeys);
        }
      });
    };

    check();

    const unsubscribe = subscribeDanielProgress(check);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [streakCount]);

  return newIds;
}

export function useBadgeCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getBadgeCount(getDanielProgressSnapshot()));

    const unsubscribe = subscribeDanielProgress(() => {
      setCount(getBadgeCount(getDanielProgressSnapshot()));
    });

    return () => { unsubscribe(); };
  }, []);

  return count;
}
