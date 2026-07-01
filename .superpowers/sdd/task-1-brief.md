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
  `^(${BOOK_PATTERN})\\s+(\\d+)(?::(\\d+)(?:[â€“-](\\d+))?)?$`,
  'i'
);

// Variant for finding references inline (not anchored to start/end)
const INLINE_REF_REGEX = new RegExp(
  `\\b(${BOOK_PATTERN})\\s+(\\d+)(?::(\\d+)(?:[â€“-](\\d+))?)?\\b`,
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
