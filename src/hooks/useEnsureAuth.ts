import { useEffect } from 'react';

import { supabase, initSupabaseSession } from '@/lib/supabase';

export function useEnsureAuth() {
  useEffect(() => {
    async function ensureAnonymousSession() {
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('[auth] Anonymous sign-in failed:', error.message);
        }
      }

      await initSupabaseSession();
    }
    ensureAnonymousSession();
  }, []);
}
