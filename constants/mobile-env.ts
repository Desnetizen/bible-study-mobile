function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export const SCRIPTURE_PROVIDER_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_SCRIPTURE_PROVIDER_URL || 'https://bible-api.com',
);

export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

export const SUPABASE_PUBLIC_KEY = SUPABASE_CONFIG.publishableKey || SUPABASE_CONFIG.anonKey;

export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_CONFIG.url && SUPABASE_PUBLIC_KEY);
