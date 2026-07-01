# Task 4 Report: Consolidate parsers in `index.tsx` and `characters.jsx`

**Status:** ✅ Complete

## Changes Made

### `app/(tabs)/index.tsx`
- Removed `normalizeBibleBookName` function (~7 lines)
- Removed `parseVerseReference` function (~16 lines)
- Added import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
- Updated `ROTATING_KEY_VERSES` mapping to use `parseBibleReference` instead of the removed `parseVerseReference`, with explicit property spreading (avoids passing `endVerse` into `DailyVerse`)

### `app/(tabs)/characters.jsx`
- Removed local `parseBibleReference` function (~14 lines)
- Added import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
- Existing `openScripture` function already had the correct body — removing the local function and adding the import is sufficient

## Verification

- `npx tsc --noEmit` — **passed** with zero errors
- `npx expo export --platform web` — failed with pre-existing SSR error (`window is not defined` from `@react-native-async-storage` + `@supabase/auth-js`), not related to these changes

## Commit

```
4c5a99e feat: consolidate parsers in index.tsx and characters.jsx
```

## Concerns

None. Both files now use the shared `parseBibleReference` from `@/lib/parseBibleReference`. The `characters.jsx` `openScripture` function retains the same behavior because the shared parser returns a compatible shape (`book`, `chapter`, `verse?`).
