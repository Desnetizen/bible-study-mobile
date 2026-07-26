import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { CHAPTER_COLORS } from '../data/danielStudyChapters';
import { getDanielProgressSnapshot, subscribeDanielProgress } from './daniel-progress';

// The badge-seen snapshot (which "new" badges have already been shown) is
// stored only in AsyncStorage. This is a deliberate local-only design:
// badge toast state is cosmetic — re-showing a few toasts on a new device
// is harmless, and syncing this state adds complexity for no user-visible
// correctness gain. See Bug #7 in the review for context.
const BADGE_SNAPSHOT_KEY = 'bible-connection:badge-snapshot:v1';

export type Badge = {
  chapter: number;
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
};

export function getEarnedBadges(completedChapters: number[]): Badge[] {
  return completedChapters
    .filter((ch) => ch in BADGE_MAP)
    .sort((a, b) => a - b)
    .map((ch) => ({
      chapter: ch,
      name: BADGE_MAP[ch].name,
      image: BADGE_MAP[ch].image,
      color: CHAPTER_COLORS[ch as keyof typeof CHAPTER_COLORS] || '#1e3a8a',
    }));
}

export function getBadgeCount(completedChapters: number[]): number {
  return completedChapters.filter((ch) => ch in BADGE_MAP).length;
}

export function getLatestBadge(completedChapters: number[]): Badge | null {
  const earned = getEarnedBadges(completedChapters);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

export async function loadBadgeSnapshot(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(BADGE_SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveBadgeSnapshot(chapters: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BADGE_SNAPSHOT_KEY, JSON.stringify(chapters));
  } catch {
    // Ignore
  }
}

export function useNewBadgeIds(): number[] {
  const [newIds, setNewIds] = useState<number[]>([]);

  useEffect(() => {
    const check = () => {
      const current = getDanielProgressSnapshot();
      const currentFiltered = current.filter((ch) => ch in BADGE_MAP);

      loadBadgeSnapshot().then((snapshot) => {
        const newlyUnlocked = currentFiltered.filter((ch) => !snapshot.includes(ch));
        if (newlyUnlocked.length > 0) {
          setNewIds((prev) => {
            const combined = [...new Set([...prev, ...newlyUnlocked])];
            return combined;
          });
          saveBadgeSnapshot(currentFiltered);
        }
      });
    };

    check();

    const unsubscribe = subscribeDanielProgress(check);

    return () => { unsubscribe(); };
  }, []);

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
