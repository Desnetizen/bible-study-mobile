import { useMemo, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { findBibleReferences } from '@/lib/parseBibleReference';
import { VerseTextModal } from '@/components/VerseTextModal';
import type { VerseReference } from '@/hooks/useVerseText';

interface LinkedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
}

type Segment =
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'ref'; content: string; ref: VerseReference };

export function LinkedText({ text, style, linkStyle }: LinkedTextProps) {
  const tintColor = useThemeColor({}, 'tint');
  const [activeRef, setActiveRef] = useState<VerseReference | null>(null);

  const segments = useMemo(() => {
    const matches = findBibleReferences(text);
    if (matches.length === 0) return null;

    const parts: Segment[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        parts.push({ id: `t-${lastIndex}`, type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({
        id: `r-${match.index}-${match.ref}`,
        type: 'ref',
        content: match.ref,
        ref: { book: match.book, chapter: match.chapter, verse: match.verse, endVerse: match.endVerse },
      });
      lastIndex = match.index + match.length;
    }

    if (lastIndex < text.length) {
      parts.push({ id: `t-${lastIndex}`, type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, [text]);

  if (!segments) {
    return <Text style={style}>{text}</Text>;
  }

  return (
    <>
      <Text style={style}>
        {segments.map((segment) => {
          if (segment.type === 'ref') {
            return (
              <Text
                key={segment.id}
                style={[{ color: tintColor, textDecorationLine: 'underline' } as TextStyle, linkStyle]}
                onPress={() => setActiveRef(segment.ref)}
              >
                {segment.content}
              </Text>
            );
          }
          return <Text key={segment.id}>{segment.content}</Text>;
        })}
      </Text>
      <VerseTextModal reference={activeRef} onClose={() => setActiveRef(null)} accentColor={tintColor} />
    </>
  );
}