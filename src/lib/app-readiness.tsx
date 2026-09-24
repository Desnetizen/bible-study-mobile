import { createContext, PropsWithChildren, use, useCallback, useMemo, useState } from 'react';

type AppReadinessContextValue = {
  appContentReady: boolean;
  splashAnimationComplete: boolean;
  minDurationElapsed: boolean;
  /** Real fraction (0–1) of startup assets loaded so far. Drives the splash progress bar. */
  loadProgress: number;
  markAppContentReady: () => void;
  markSplashAnimationComplete: () => void;
  markMinDurationElapsed: () => void;
  setLoadProgress: (progress: number) => void;
};

const AppReadinessContext = createContext<AppReadinessContextValue | null>(null);

export function AppReadinessProvider({ children }: PropsWithChildren) {
  const [appContentReady, setAppContentReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [loadProgress, setLoadProgressState] = useState(0);

  const markAppContentReady = useCallback(() => {
    setAppContentReady(true);
  }, []);

  const markSplashAnimationComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  const markMinDurationElapsed = useCallback(() => {
    setMinDurationElapsed(true);
  }, []);

  // Progress only ever moves forward — guards against out-of-order async
  // resolutions momentarily rewinding the bar.
  const setLoadProgress = useCallback((progress: number) => {
    setLoadProgressState((prev) => Math.max(prev, Math.min(1, Math.max(0, progress))));
  }, []);

  const value = useMemo(
    () => ({
      appContentReady,
      splashAnimationComplete,
      minDurationElapsed,
      loadProgress,
      markAppContentReady,
      markSplashAnimationComplete,
      markMinDurationElapsed,
      setLoadProgress,
    }),
    [
      appContentReady,
      splashAnimationComplete,
      minDurationElapsed,
      loadProgress,
      markAppContentReady,
      markSplashAnimationComplete,
      markMinDurationElapsed,
      setLoadProgress,
    ]
  );

  return (
    <AppReadinessContext.Provider value={value}>
      {children}
    </AppReadinessContext.Provider>
  );
}

export function useAppReadiness() {
  const context = use(AppReadinessContext);

  if (!context) {
    throw new Error('useAppReadiness must be used within AppReadinessProvider');
  }

  return context;
}
