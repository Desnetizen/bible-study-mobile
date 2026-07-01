### Task 5: Consolidate parsers in `timeline.tsx` and `historical-context.tsx`

**Files:**
- Modify: `app/(tabs)/timeline.tsx` (line 27 â€” replace parse function)
- Modify: `app/(tabs)/historical-context.tsx` (lines 313-326 â€” replace handleScripturePress)

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
