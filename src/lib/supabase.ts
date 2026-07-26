import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, SUPABASE_PUBLIC_KEY, HAS_SUPABASE_CONFIG } from '../constants/mobile-env';
import { largeSecureStore } from './large-secure-store';

export const supabase = HAS_SUPABASE_CONFIG
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_PUBLIC_KEY, {
      auth: {
        storage: largeSecureStore,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function startAuthListeners(): void {
  if (!supabase) return;
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export function stopAuthListeners(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
}
