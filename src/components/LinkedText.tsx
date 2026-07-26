import { useMemo, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { findBibleReferences, getDefinedVerseText } from '@/lib/parseBibleReference';

interface LinkedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
}

type Segment =
  | { type: 'text'; content: string }
  | {
      type: 'ref';
      content: string;
      ref: { book: string; chapter: number; verse?: number; endVerse?: number };
      verseText?: string | null;
    };

function RefSegment({
  segment,
  linkStyle,
  tintColor,
  mutedColor,
}: {
  segment: Extract<Segment, { type: 'ref' }>;
  linkStyle?: StyleProp<TextStyle>;
  tintColor: string;
  mutedColor: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (segment.verseText == null) {
    return (
      <Text
        style={[{ color: tintColor, textDecorationLine: 'underline' } as TextStyle, linkStyle]}
        onPress={() => {
          router.push({
            pathname: '/bible',
            params: {
              book: segment.ref.book,
              chapter: String(segment.ref.chapter),
              ...(segment.ref.verse ? { verse: String(segment.ref.verse) } : {}),
              ...(segment.ref.endVerse ? { endVerse: String(segment.ref.endVerse) } : {}),
            },
          });
        }}
      >
        {segment.content}
      </Text>
    );
  }

  return (
    <Text>
      <Text
        style={[{ color: tintColor, textDecorationLine: 'underline' } as TextStyle, linkStyle]}
        onPress={() => setExpanded(v => !v)}
      >
        {segment.content}
        <Text style={{ fontSize: 10, color: mutedColor }}>
          {expanded ? ' ▾' : ' ▸'}
        </Text>
      </Text>
      {expanded && (
        <Text style={{ fontStyle: 'italic', color: mutedColor }}>
          {' \u201C'}{segment.verseText}{'\u201D'}
        </Text>
      )}
    </Text>
  );
}

export function LinkedText({ text, style, linkStyle }: LinkedTextProps) {
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'icon');

  const segments = useMemo(() => {
    const matches = findBibleReferences(text);
    if (matches.length === 0) return null;

    const parts: Segment[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      const ref = { book: match.book, chapter: match.chapter, verse: match.verse, endVerse: match.endVerse };
      parts.push({
        type: 'ref',
        content: match.ref,
        ref,
        verseText: getDefinedVerseText(match.book, match.chapter, match.verse, match.endVerse),
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
            <RefSegment
              key={i}
              segment={segment}
              linkStyle={linkStyle}
              tintColor={tintColor}
              mutedColor={mutedColor}
            />
          );
        }
        return <Text key={i}>{segment.content}</Text>;
      })}
    </Text>
  );
}
