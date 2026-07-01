### Task 6: Update `ReadTabContent.tsx` â€” QuoteCard and TimelineVisual

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
