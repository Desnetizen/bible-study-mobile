# Clickable Bible Verses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Bible verse reference in the app clickable, navigating to the specific verse in the Bible reader.

**Architecture:** Three new files — a shared parsing utility (`parseBibleReference.ts`), a standalone link component (`VerseLink.tsx`), and an inline auto-linking text component (`LinkedText.tsx`). Then consolidate all 4+ existing duplicate parsers across the app, and wire VerseLink/LinkedText into content-rendering components.

**Tech Stack:** React Native, Expo Router, TypeScript (with JSX fallback for .jsx files)

## Global Constraints

- Use nested `<Text onPress>` inside `<Text>` for inline pressable links (React Native idiomatic pattern)
- Link styling: accent color (`useThemeColor({}, 'tint')`) + text decoration underline
- Navigation pattern: `router.push({ pathname: '/bible', params: { book, chapter: String(chapter), verse: String(verse) } })`
- Regex for matching references must be built from the `BIBLE_BOOKS` array in `@/constants/bible-connection` to avoid false positives
- Use `Pressable` for standalone `VerseLink` (not `TouchableOpacity` — per react-native-skills `ui-pressable`)

---
### Task 1: Create shared parsing utility (`src/lib/parseBibleReference.ts`)

**Files:**
- Create: `src/lib/parseBibleReference.ts`

**Interfaces:**
- Produces: `ParsedReference`, `ReferenceMatch`, `parseBibleReference(text): ParsedReference | null`, `findBibleReferences(text): ReferenceMatch[]`

- [ ] **Step 1: Write the file**

```ts
export interface ParsedReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

export interface ReferenceMatch extends ParsedReference {
  ref: string;
  index: number;
  length: number;
}

import { BIBLE_BOOKS } from '@/constants/bible-connection';

// Escape regex special characters in a string
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const BOOK_PATTERN = (() => {
  const sorted = BIBLE_BOOKS.map((b) => b.name)
    .slice()
    .sort((a, b) => b.length - a.length);
  return sorted.map(escapeRegex).join('|');
})();

// Matches: "Daniel 2:20", "Daniel 2:20-23", "2 Timothy 3:16-17", "Daniel 1", "Psalm 119:105"
// Captures: book, chapter, verse, endVerse
const SINGLE_REF_REGEX = new RegExp(
  `^(${BOOK_PATTERN})\\s+(\\d+)(?::(\\d+)(?:[–-](\\d+))?)?$`,
  'i'
);

// Variant for finding references inline (not anchored to start/end)
const INLINE_REF_REGEX = new RegExp(
  `\\b(${BOOK_PATTERN})\\s+(\\d+)(?::(\\d+)(?:[–-](\\d+))?)?\\b`,
  'gi'
);

function normalizeBookName(book: string): string {
  // Match the raw name back to the canonical name in BIBLE_BOOKS (case-insensitive)
  const matched = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === book.toLowerCase()
  );
  return matched ? matched.name : book;
}

export function parseBibleReference(text: string): ParsedReference | null {
  const trimmed = text.trim();
  const match = trimmed.match(SINGLE_REF_REGEX);
  if (!match) return null;

  const [, book, chapterStr, verseStr, endVerseStr] = match;
  return {
    book: normalizeBookName(book),
    chapter: Number(chapterStr),
    ...(verseStr ? { verse: Number(verseStr) } : {}),
    ...(endVerseStr ? { endVerse: Number(endVerseStr) } : {}),
  };
}

export function findBibleReferences(text: string): ReferenceMatch[] {
  const results: ReferenceMatch[] = [];
  let match: RegExpExecArray | null;

  INLINE_REF_REGEX.lastIndex = 0;

  while ((match = INLINE_REF_REGEX.exec(text)) !== null) {
    const [, book, chapterStr, verseStr, endVerseStr] = match;

    // Validate book name
    const canonical = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === book.toLowerCase()
    );
    if (!canonical) continue;

    const ref = match[0];
    results.push({
      ref,
      book: canonical.name,
      chapter: Number(chapterStr),
      index: match.index,
      length: ref.length,
      ...(verseStr ? { verse: Number(verseStr) } : {}),
      ...(endVerseStr ? { endVerse: Number(endVerseStr) } : {}),
    });
  }

  return results;
}
```

- [ ] **Step 2: Verify the utility builds**

Run: `npx tsc --noEmit src/lib/parseBibleReference.ts 2>&1 | head -30`
Expected: No type errors

---
### Task 2: Create `VerseLink` component (`src/components/VerseLink.tsx`)

**Files:**
- Create: `src/components/VerseLink.tsx`

**Interfaces:**
- Consumes: `ParsedReference` from Task 1
- Produces: `<VerseLink book chapter verse? style?>`

- [ ] **Step 1: Write the file**

```tsx
import { useCallback, type ReactNode } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

interface VerseLinkProps {
  book: string;
  chapter: number;
  verse?: number;
  children: ReactNode;
  style?: any;
}

export function VerseLink({ book, chapter, verse, children, style }: VerseLinkProps) {
  const tintColor = useThemeColor({}, 'tint');

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/bible',
      params: {
        book,
        chapter: String(chapter),
        ...(verse ? { verse: String(verse) } : {}),
      },
    });
  }, [book, chapter, verse]);

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Text style={[styles.link, { color: tintColor }, style]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    textDecorationColor: 'currentColor',
  },
  pressed: {
    opacity: 0.7,
  },
});
```

- [ ] **Step 2: Verify the component builds**

Run: `npx tsc --noEmit src/components/VerseLink.tsx 2>&1 | head -30`
Expected: No type errors

---
### Task 3: Create `LinkedText` component (`src/components/LinkedText.tsx`)

**Files:**
- Create: `src/components/LinkedText.tsx`

**Interfaces:**
- Consumes: `findBibleReferences` from Task 1
- Produces: `<LinkedText text style? linkStyle? />`

- [ ] **Step 1: Write the file**

```tsx
import { useMemo } from 'react';
import { Text, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { findBibleReferences } from '@/lib/parseBibleReference';

interface LinkedTextProps {
  text: string;
  style?: TextStyle;
  linkStyle?: TextStyle;
}

export function LinkedText({ text, style, linkStyle }: LinkedTextProps) {
  const tintColor = useThemeColor({}, 'tint');

  const segments = useMemo(() => {
    const matches = findBibleReferences(text);
    if (matches.length === 0) return null;

    const parts: Array<{ type: 'text' | 'ref'; content: string; ref?: { book: string; chapter: number; verse?: number } }> = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({
        type: 'ref',
        content: match.ref,
        ref: { book: match.book, chapter: match.chapter, verse: match.verse },
      });
      lastIndex = match.index + match.length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, [text]);

  if (!segments) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {segments.map((segment, i) => {
        if (segment.type === 'ref') {
          return (
            <Text
              key={i}
              style={[
                { color: tintColor, textDecorationLine: 'underline' } as TextStyle,
                linkStyle,
              ]}
              onPress={() => {
                router.push({
                  pathname: '/bible',
                  params: {
                    book: segment.ref!.book,
                    chapter: String(segment.ref!.chapter),
                    ...(segment.ref!.verse ? { verse: String(segment.ref!.verse) } : {}),
                  },
                });
              }}
            >
              {segment.content}
            </Text>
          );
        }
        return <Text key={i}>{segment.content}</Text>;
      })}
    </Text>
  );
}
```

- [ ] **Step 2: Verify the component builds**

Run: `npx tsc --noEmit src/components/LinkedText.tsx 2>&1 | head -30`
Expected: No type errors

---
### Task 4: Consolidate parsers in `index.tsx` and `characters.jsx`

**Files:**
- Modify: `app/(tabs)/index.tsx` (lines 85-100 — remove `parseVerseReference`, use shared parser)
- Modify: `app/(tabs)/characters.jsx` (lines 134-147 — remove `parseBibleReference`, lines 271-286 — remove `openScripture`, use `VerseLink`)

- [ ] **Step 1: Edit `index.tsx` — replace `parseVerseReference`**

Replace lines 85-100 (the entire `parseVerseReference` function):
```tsx
import { parseBibleReference } from '@/lib/parseBibleReference';

// Remove the normalizeBibleBookName + parseVerseReference functions entirely
```

Then update the `ROTATING_KEY_VERSES` mapping (lines 102-119):
```tsx
const ROTATING_KEY_VERSES: DailyVerse[] = BIBLE_VERSES.map((verse) => {
  const parsedReference = parseBibleReference(verse.reference);

  if (!parsedReference) {
    return {
      text: verse.text,
      ref: verse.reference,
      book: 'Bible',
      chapter: 1,
      verse: 1,
    };
  }

  return {
    text: verse.text,
    ref: verse.reference,
    book: parsedReference.book,
    chapter: parsedReference.chapter,
    verse: parsedReference.verse ?? 1,
  };
});
```

- [ ] **Step 2: Edit `characters.jsx` — remove local `parseBibleReference`**

Delete lines 134-147 (the `parseBibleReference` function, not the `getServedRegime` function below it).
Delete lines 271-286 (the `openScripture` function).

Add import at top:
```tsx
import { parseBibleReference } from '@/lib/parseBibleReference';
```

- [ ] **Step 3: Edit `characters.jsx` — replace scripture reference rendering with `VerseLink`**

Replace lines 390-401 (the Scripture References section):
```tsx
<Section title="Scripture References">
  <View style={styles.scriptureList}>
    {selectedCharacter.scriptures?.map((entry) => {
      const parsed = parseBibleReference(entry.ref);
      return (
        <Pressable key={entry.ref} style={styles.scriptureRow}>
          <View style={styles.scriptureCopy}>
            {parsed ? (
              <Text selectable style={styles.scriptureRef}>
                <LinkedText text={cleanText(entry.ref)} style={styles.scriptureRef} />
              </Text>
            ) : (
              <Text selectable style={styles.scriptureRef}>{cleanText(entry.ref)}</Text>
            )}
            <Text selectable style={styles.scriptureDescription}>
              {cleanText(entry.description)}
            </Text>
          </View>
          <BookOpenText size={18} color="#e1b64b" />
        </Pressable>
      );
    })}
  </View>
</Section>
```

Wait, this is more complex. The characters.jsx renders a Pressable for the whole row with a BookOpenText icon. I should keep the same visual but use the shared parser to navigate. Let me use `parseBibleReference` for the navigation but keep the existing UI pattern.

Actually, looking at it again: the existing code calls `openScripture(entry.ref)` which parses the ref and navigates. I just need to replace `openScripture` with inline usage of `parseBibleReference` + `router.push` and remove the local parse function. The VerseLink component might not be the right fit here since it wraps children — the character page has its own layout for scripture rows.

Let me reconsider: the simplest approach for Task 4 is to just replace the parsing logic with the shared utility, keeping the existing UI/navigation patterns. VerseLink is better for when we just want a styled text link.

Let me revise the approach for Task 4:

For `index.tsx`: Replace `parseVerseReference` with shared `parseBibleReference`. Remove `normalizeBibleBookName`.

For `characters.jsx`: Replace `parseBibleReference` with shared `parseBibleReference`. Replace `openScripture` body with shared parser + router.push.

For `timeline.tsx`: Same pattern.

For `historical-context.tsx`: Same pattern.

Then in Task 5-6 we use VerseLink and LinkedText where the rendering is more appropriate.

- [ ] **Step 1: Edit `index.tsx`**

Remove `normalizeBibleBookName` function (lines 66-83) and `parseVerseReference` function (lines 85-100).
Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
The `ROTATING_KEY_VERSES` mapping already calls `parseVerseReference` — rename to `parseBibleReference`.

- [ ] **Step 2: Edit `characters.jsx`**

Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
Delete local `parseBibleReference` function (lines 134-147).
Replace `openScripture` body (lines 271-286):
```tsx
const openScripture = (ref: string) => {
  const parsed = parseBibleReference(ref);
  if (!parsed) return;
  router.push({
    pathname: '/bible',
    params: {
      book: parsed.book,
      chapter: String(parsed.chapter),
      ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
    },
  });
};
```

- [ ] **Step 3: Verify changes build**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No type errors

---
### Task 5: Consolidate parsers in `timeline.tsx` and `historical-context.tsx`

**Files:**
- Modify: `app/(tabs)/timeline.tsx` (line 27 — replace parse function)
- Modify: `app/(tabs)/historical-context.tsx` (lines 313-326 — replace handleScripturePress)

- [ ] **Step 1: Edit `timeline.tsx`**

Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
Delete local `parseBibleReference` function (lines 27-40).
Replace `handleScripturePress` body (lines 210-226):
```tsx
const handleScripturePress = (ref: string) => {
  const parsed = parseBibleReference(ref);
  if (!parsed) return;

  setModalVisible(false);
  setActiveEvent(null);
  setActiveEra(null);

  router.push({
    pathname: '/bible',
    params: {
      book: parsed.book,
      chapter: String(parsed.chapter),
      ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
    },
  });
};
```

- [ ] **Step 2: Edit `historical-context.tsx`**

Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`
Replace `handleScripturePress` body (lines 313-326):
```tsx
const handleScripturePress = (ref: string) => {
  const parsed = parseBibleReference(ref);
  if (!parsed) return;
  closeModal();
  router.push({
    pathname: '/bible',
    params: {
      book: parsed.book,
      chapter: String(parsed.chapter),
      ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
    },
  });
};
```

- [ ] **Step 3: Verify changes build**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No type errors

---
### Task 6: Update `ReadTabContent.tsx` — QuoteCard and TimelineVisual

**Files:**
- Modify: `src/components/ReadTabContent.tsx`

- [ ] **Step 1: Update `QuoteCard` to make reference clickable**

Add import: `import { VerseLink } from '@/components/VerseLink';`
Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`

Replace the reference rendering inside `QuoteCard` (lines 99-102):
```tsx
{reference && (
  <View style={quoteStyles.refRow}>
    <View style={[quoteStyles.refDash, { backgroundColor: accentColor }]} />
    {(() => {
      const parsed = parseBibleReference(reference);
      if (parsed) {
        return (
          <VerseLink book={parsed.book} chapter={parsed.chapter} verse={parsed.verse}>
            <Text style={[quoteStyles.refText, { color: accentColor }]}>{reference}</Text>
          </VerseLink>
        );
      }
      return <Text style={[quoteStyles.refText, { color: accentColor }]}>{reference}</Text>;
    })()}
  </View>
)}
```

- [ ] **Step 2: Update `TimelineVisual` to use shared parser**

Replace the inline regex in `TimelineVisual` (lines 495-500):
```tsx
onPress={() => {
  const parsed = parseBibleReference(item.reference);
  if (parsed) {
    router.push({
      pathname: '/bible',
      params: {
        book: parsed.book,
        chapter: String(parsed.chapter),
        ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
      },
    });
  }
}}
```

- [ ] **Step 3: Verify changes build**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No type errors

---
### Task 7: Update Daniel study page — `quoteRef` becomes clickable

**Files:**
- Modify: `src/components/DanielStudyPage.jsx`

- [ ] **Step 1: Make the `quoteRef` text clickable**

Add import: `import { VerseLink } from '@/components/VerseLink';`
Add import: `import { parseBibleReference } from '@/lib/parseBibleReference';`

Replace line 172 (the `quoteRef` rendering):
```tsx
{(() => {
  const parsed = parseBibleReference(chapter.overview.quoteRef);
  if (parsed) {
    return (
      <VerseLink book={parsed.book} chapter={parsed.chapter} verse={parsed.verse}>
        <Text style={[styles.quoteRef, { color: colors.textMuted }]}>{chapter.overview.quoteRef}</Text>
      </VerseLink>
    );
  }
  return <Text style={[styles.quoteRef, { color: colors.textMuted }]}>{chapter.overview.quoteRef}</Text>;
})()}
```

- [ ] **Step 2: Verify changes build**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No type errors

---
### Task 8: Update description text rendering with `LinkedText`

**Files:**
- Modify: `app/(tabs)/historical-context.tsx` — description text in event modals
- Modify: `src/components/ReadTabContent.tsx` — section description text

- [ ] **Step 1: In `historical-context.tsx`, replace description `<Text>` with `<LinkedText>`**

Find the event description `<Text>` (around line 456) and wrap it:
```tsx
<LinkedText style={styles.eventDescription} text={activeEvent.description} />
```

- [ ] **Step 2: In `ReadTabContent.tsx`, replace paragraph `<Text>` with `<LinkedText>` for section descriptions**

Find section paragraphs rendered as `<Text>` and replace with `<LinkedText>`. This covers the prose sections that contain inline references like "Acts 13:47".

- [ ] **Step 3: Verify changes build**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No type errors

---
### Task 9: Final verification

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Lint**

Run: `npx eslint src/ app/ --ext .ts,.tsx,.js,.jsx 2>&1 | head -50`
Expected: No errors
