import { createContext, PropsWithChildren, use, useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isRecovering: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  setRecoveryMode: (active: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // True while the user is mid password-reset: they have a valid (recovery)
  // session, but the only thing they should be allowed to do with it is set
  // a new password. AuthGate reads this to avoid bouncing them to the home
  // tabs before they've actually changed anything.
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // Belt-and-suspenders: Supabase also emits this event directly when a
      // recovery link is exchanged. The reset-password screen sets recovery
      // mode explicitly too, since this event isn't always reliably delivered.
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        setIsRecovering(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return authService.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return authService.signUp(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return authService.requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return authService.updatePassword(newPassword);
  }, []);

  const setRecoveryMode = useCallback((active: boolean) => {
    setIsRecovering(active);
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    isRecovering,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
    setRecoveryMode,
  }), [session, loading, isRecovering, signIn, signUp, signOut, requestPasswordReset, updatePassword, setRecoveryMode]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
