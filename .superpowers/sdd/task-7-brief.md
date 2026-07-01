### Task 7: Update Daniel study page â€” `quoteRef` becomes clickable

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
