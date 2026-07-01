### Task 4: Consolidate parsers in `index.tsx` and `characters.jsx`

**Files:**
- Modify: `app/(tabs)/index.tsx` (lines 85-100 â€” remove `parseVerseReference`, use shared parser)
- Modify: `app/(tabs)/characters.jsx` (lines 134-147 â€” remove `parseBibleReference`, lines 271-286 â€” remove `openScripture`, use `VerseLink`)

- [ ] **Step 1: Edit `index.tsx` â€” replace `parseVerseReference`**

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

- [ ] **Step 2: Edit `characters.jsx` â€” remove local `parseBibleReference`**

Delete lines 134-147 (the `parseBibleReference` function, not the `getServedRegime` function below it).
Delete lines 271-286 (the `openScripture` function).

Add import at top:
```tsx
import { parseBibleReference } from '@/lib/parseBibleReference';
```

- [ ] **Step 3: Edit `characters.jsx` â€” replace scripture reference rendering with `VerseLink`**

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

Actually, looking at it again: the existing code calls `openScripture(entry.ref)` which parses the ref and navigates. I just need to replace `openScripture` with inline usage of `parseBibleReference` + `router.push` and remove the local parse function. The VerseLink component might not be the right fit here since it wraps children â€” the character page has its own layout for scripture rows.

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
The `ROTATING_KEY_VERSES` mapping already calls `parseVerseReference` â€” rename to `parseBibleReference`.

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
