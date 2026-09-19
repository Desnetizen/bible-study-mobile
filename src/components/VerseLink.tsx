import { useState, type ReactNode } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { VerseTextModal } from '@/components/VerseTextModal';
import type { VerseReference } from '@/hooks/useVerseText';

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
  const [open, setOpen] = useState(false);

  const reference: VerseReference = { book, chapter, verse, endVerse };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [pressed && styles.pressed]}>
        <Text style={[styles.link, { color: tintColor }, style]}>{children}</Text>
      </Pressable>
      <VerseTextModal reference={open ? reference : null} onClose={() => setOpen(false)} accentColor={tintColor} />
    </>
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