import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG, SUPABASE_CONFIG, SUPABASE_PUBLIC_KEY } from '../constants/mobile-env';

export const supabase = HAS_SUPABASE_CONFIG
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_PUBLIC_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/**
 * Initialize the Supabase session by setting the device_id
 * as a session variable for RLS policy checks.
 */
export async function initSupabaseSession(): Promise<void> {
  if (!supabase) return;
  try {
    const { getOrCreateDeviceId } = await import('./device-id');
    const deviceId = getOrCreateDeviceId();
    await supabase.rpc('set_app_device_id', { device_id: deviceId });
  } catch {
    // Session init is non-critical; queries without it
    // will simply return empty results under the RLS policy.
  }
}
