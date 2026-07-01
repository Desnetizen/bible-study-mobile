### Task 8: Update description text rendering with `LinkedText`

**Files:**
- Modify: `app/(tabs)/historical-context.tsx` â€” description text in event modals
- Modify: `src/components/ReadTabContent.tsx` â€” section description text

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
