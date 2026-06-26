import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

type AppReadinessContextValue = {
  appContentReady: boolean;
  splashAnimationComplete: boolean;
  markAppContentReady: () => void;
  markSplashAnimationComplete: () => void;
};

const AppReadinessContext = createContext<AppReadinessContextValue | null>(null);

export function AppReadinessProvider({ children }: PropsWithChildren) {
  const [appContentReady, setAppContentReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  const markAppContentReady = useCallback(() => {
    setAppContentReady(true);
  }, []);

  const markSplashAnimationComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  const value = useMemo(
    () => ({
      appContentReady,
      splashAnimationComplete,
      markAppContentReady,
      markSplashAnimationComplete,
    }),
    [appContentReady, splashAnimationComplete, markAppContentReady, markSplashAnimationComplete]
  );

  return (
    <AppReadinessContext.Provider value={value}>
      {children}
    </AppReadinessContext.Provider>
  );
}

export function useAppReadiness() {
  const context = useContext(AppReadinessContext);

  if (!context) {
    throw new Error('useAppReadiness must be used within AppReadinessProvider');
  }

  return context;
}
