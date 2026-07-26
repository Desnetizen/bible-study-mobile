import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Design decision: local-only ─────────────────────────────────────────────
// Streak data lives solely in AsyncStorage — it is not synced to Supabase.
// Streaks are timezone-dependent, device-specific usage metrics, not
// authoritative user progress. Syncing them would add disproportionate
// complexity (a user_streak table, conflict resolution for different
// timezones, etc.) for a cosmetic-adjacent feature.
//
// If user feedback shows streaks are valued enough to preserve across
// devices or reinstalls, add a user_streak table keyed by user_id and
// sync it alongside progress/activity. Until then, the disclosure
// in StreakBadge makes the trade-off visible.
// ──────────────────────────────────────────────────────────────────────────────

const STREAK_COUNT_KEY = 'streak_count';
const STREAK_LAST_DATE_KEY = 'streak_last_date';
const STREAK_BEST_KEY = 'streak_best';

function getTodayString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getStreak(): Promise<{
  count: number;
  best: number;
  lastDate: string | null;
}> {
  const [countRaw, bestRaw, lastDate] = await AsyncStorage.multiGet([
    STREAK_COUNT_KEY,
    STREAK_BEST_KEY,
    STREAK_LAST_DATE_KEY,
  ]);

  return {
    count: countRaw[1] ? Number(countRaw[1]) : 0,
    best: bestRaw[1] ? Number(bestRaw[1]) : 0,
    lastDate: lastDate[1] ?? null,
  };
}

export async function recordStreakToday(): Promise<{
  count: number;
  best: number;
  isNewDay: boolean;
}> {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const current = await getStreak();

  // Already recorded today — no-op
  if (current.lastDate === today) {
    return { count: current.count, best: current.best, isNewDay: false };
  }

  let newCount: number;

  if (current.lastDate === yesterday) {
    // Consecutive day — extend streak
    newCount = current.count + 1;
  } else {
    // Missed a day (or first ever) — reset to 1
    newCount = 1;
  }

  const newBest = Math.max(current.best, newCount);

  await AsyncStorage.multiSet([
    [STREAK_COUNT_KEY, String(newCount)],
    [STREAK_BEST_KEY, String(newBest)],
    [STREAK_LAST_DATE_KEY, today],
  ]);

  return { count: newCount, best: newBest, isNewDay: true };
}
