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
