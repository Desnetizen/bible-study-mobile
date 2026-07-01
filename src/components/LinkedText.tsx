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

    const parts: { type: 'text' | 'ref'; content: string; ref?: { book: string; chapter: number; verse?: number } }[] = [];
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
