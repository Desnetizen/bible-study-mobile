# Clickable Bible Verses — Design Spec

## Summary

Make every Bible verse reference across the app clickable, navigating to the
specific verse in the Bible reader. Currently verse references appear as plain
text in study content, character bios, timelines, and historical context — with
no way to tap and jump to the referenced passage.

## Approach

Auto-parsing `LinkedText` component + explicit `VerseLink` component.

A shared utility consolidates the 4+ duplicate parsing functions into one
robust regex built from the canonical book-name list. A `LinkedText` component
auto-detects references in any prose string and renders them as inline
clickable links. A `VerseLink` component handles standalone reference rendering.
Both use the existing Bible-page deep-link pattern (`/bible?book=X&chapter=Y&verse=Z`).

## Architecture

### 1. `src/lib/parseBibleReference.ts` — shared parsing utility

- Builds a regex from the sorted `BIBLE_BOOKS` name list for precision
- Matches: `Daniel 2:20`, `Daniel 2:20-23`, `2 Timothy 3:16-17`, `Psalm 119:105`, `Genesis 1`
- Returns `{ book: string; chapter: number; verse?: number; endVerse?: number } | null`
- Consolidates the 4+ duplicate parsers currently spread across the app

### 2. `src/components/VerseLink.tsx` — clickable link component

- A `Pressable` that navigates to `/bible` with book/chapter/verse params
- Styled with accent color + underline (distinct link appearance per user preference)
- Subtle `scale(0.97)` press feedback (per emil-design-eng principle)
- Props: `book`, `chapter`, `verse?`, `children`, `style?`

### 3. `src/components/LinkedText.tsx` — auto-linking text component

- Accepts a `text` string prop
- Runs `parseBibleReference` regex to find all references in the string
- Splits into segments: alternating plain `<Text>` and `<Text onPress>` (inline)
- Nested `<Text onPress>` is the idiomatic React Native approach for inline
  pressable text (per building-native-ui skill)
- Props: `text`, `style?`, `linkStyle?`

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/parseBibleReference.ts` | Shared reference parser |
| `src/components/VerseLink.tsx` | Standalone clickable reference |
| `src/components/LinkedText.tsx` | Auto-linking inline text |

## Files to Modify

### Phase 1 — Consolidate existing parsers

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Replace local `parseVerseReference` with shared utility |
| `app/(tabs)/characters.jsx` | Replace local `parseBibleReference`; use `VerseLink` for scripture refs |
| `app/(tabs)/timeline.tsx` | Replace local `parseBibleReference`; use `VerseLink` for timeline refs |
| `app/(tabs)/historical-context.tsx` | Replace local parser; use `VerseLink` for refs |
| `src/components/ReadTabContent.tsx` | Replace inline regex; use `VerseLink`/`LinkedText` |

### Phase 2 — Add links to content areas

| File | Change |
|------|--------|
| `src/components/DanielStudyPage.jsx` | Render study prose with `LinkedText` |
| `src/components/ReadTabContent.tsx` | Render QuoteCard and timeline text with `LinkedText` |
| `src/constants/bible-verse.ts` | Use `VerseLink` for key verses list |
| Character/timeline/historical-context screens | Render descriptions with `LinkedText` |

## Navigation Pattern

All links use Expo Router:
```ts
router.push({
  pathname: '/bible',
  params: { book, chapter: String(chapter), verse: String(verse) },
});
```

The Bible page already handles these params (lines 1192-1195 in bible.jsx) and
supports verse-level scrolling via `navigateToReference`.

## Styling

- **Link text**: Accent color (`useThemeColor({}, 'tint')` from `@/hooks/use-theme-color`) + underline
- **Press feedback**: `scale(0.97)` on `VerseLink` (standalone component)
- **Inline links**: Underline style on the `<Text onPress>` segment only

## Edge Cases

- **Non-canonical book names**: Reference must match a known Bible book name to
  be treated as a link (the regex is built from the book list, not open-ended)
- **Range references** (`Daniel 2:20-23`): Navigate to the starting verse;
  `endVerse` is available for future use (e.g., highlighting the range)
- **Performance**: `LinkedText` parses text at render time. For very long texts
  (entire study chapters), consider memoizing with `useMemo`

## Future Considerations

- Cross-reference links within the Bible reader already work (separate pattern)
- Verse range highlighting on navigation (`navigateToReference` already supports
  a navigation highlight object)
- Long-press context menu on references (copy reference text, share verse)
