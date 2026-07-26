import { useCallback, type ReactNode } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

interface VerseLinkProps {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
  children: ReactNode;
  style?: import('react-native').StyleProp<import('react-native').TextStyle>;
}

export function VerseLink({ book, chapter, verse, endVerse, children, style }: VerseLinkProps) {
  const tintColor = useThemeColor({}, 'tint');

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/bible',
      params: {
        book,
        chapter: String(chapter),
        ...(verse ? { verse: String(verse) } : {}),
        ...(endVerse ? { endVerse: String(endVerse) } : {}),
      },
    });
  }, [book, chapter, verse, endVerse]);

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Text style={[styles.link, { color: tintColor }, style]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
});
