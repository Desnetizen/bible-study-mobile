# Bible Connection Mobile

An Expo SDK 54 mobile version of the Bible Connection study app. The Vite/Tailwind web files were translated into native screens, typed constants, Expo Router routes, and mobile-safe environment configuration.

## Run

```bash
npm install
npx expo start
```

Use Expo Go first. The app is built with Expo Router tabs and should not require a custom native build for the current feature set.

## Imported Web Content

- Dashboard, Bible reader, Daniel study, timeline, and profile content now live in native React Native components under `components/`.
- `CHARACTER_PROFILES.md` was converted into typed data in `constants/character-profiles.ts` and exposed through the `/characters` route.
- The Bible Connection logo and Daniel artwork were copied into `assets/bible-connection/`.
- Vite, Tailwind, and browser-only config were not copied directly because they do not apply to Expo native UI.

## Environment

Copy `.env.example` to `.env` for local values:

```env
EXPO_PUBLIC_SCRIPTURE_PROVIDER_URL=https://bible-api.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Expo only exposes `EXPO_PUBLIC_*` values to the app bundle. The old web app's `API_BIBLE_KEY` should remain server-side. If you need licensed NKJV text from API.Bible, put that key behind a proxy and point `EXPO_PUBLIC_SCRIPTURE_PROVIDER_URL` at the proxy.

## Supabase Progress Table

The mobile profile screen is prepared to detect Supabase public env values. When sync is wired, use the same progress table shape from the web app:

```sql
create table if not exists public.user_progress (
  profile_id text primary key,
  page text,
  dark_mode boolean default false,
  sidebar_collapsed boolean default false,
  saved_notes jsonb default '{}'::jsonb,
  bookmarks text[] default '{}',
  completed_chapters int[] default '{}',
  recent_activity text[] default '{}',
  updated_at timestamptz default now()
);
```

## Verify

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web
```
