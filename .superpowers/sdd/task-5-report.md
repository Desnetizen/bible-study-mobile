# Task 5 Report: Consolidate parsers

**Status:** ✅ Done

**Commit:** `10ab652`

**Changes:**
- `app/(tabs)/timeline.tsx`: Removed local `parseBibleReference` function, added import from `@/lib/parseBibleReference`. `handleScripturePress` already used the function correctly.
- `app/(tabs)/historical-context.tsx`: Replaced inline regex parsing in `handleScripturePress` with shared `parseBibleReference`. `chapter` param now uses `String(parsed.chapter)` for consistency.

**Verification:** `npx tsc --noEmit` passes with no type errors.

**Concerns:** None.
