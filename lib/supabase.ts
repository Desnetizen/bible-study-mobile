import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

import { HAS_SUPABASE_CONFIG, SUPABASE_CONFIG, SUPABASE_PUBLIC_KEY } from '../constants/mobile-env';

export const supabase = HAS_SUPABASE_CONFIG
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_PUBLIC_KEY, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
