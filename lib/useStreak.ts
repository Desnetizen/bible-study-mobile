import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { recordStreakToday } from './streak';

export function useStreak() {
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const recordToday = useCallback(async () => {
    const result = await recordStreakToday();
    setStreakCount(result.count);
    setBestStreak(result.best);
    return result;
  }, []);

  useEffect(() => {
    // Record streak on mount
    recordToday();

    // Also record streak when the app transitions to the foreground (resumed/opened)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        recordToday();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [recordToday]);

  return { streakCount, bestStreak, recordToday };
}
