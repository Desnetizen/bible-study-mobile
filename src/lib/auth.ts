import { supabase } from './supabase';

let authPromise: Promise<string | null> | null = null;

export async function getUserId(): Promise<string | null> {
  if (!supabase) return null;

  if (!authPromise) {
    authPromise = initAuth();
  }

  return authPromise;
}

async function initAuth(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user?.id ?? null;
  } catch (err) {
    console.warn('Auth initialization failed:', err);
    return null;
  }
}
