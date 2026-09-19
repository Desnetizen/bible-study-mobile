import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVerseText, type VerseReference } from '@/hooks/useVerseText';

interface VerseTextModalProps {
  reference: VerseReference | null;
  onClose: () => void;
  accentColor?: string;
}

function formatReferenceLabel({ book, chapter, verse, endVerse }: VerseReference): string {
  let label = `${book} ${chapter}`;
  if (verse) {
    label += `:${verse}`;
    if (endVerse && endVerse !== verse) label += `-${endVerse}`;
  }
  return label;
}

export function VerseTextModal({ reference, onClose, accentColor = '#93C5FD' }: VerseTextModalProps) {
  const { text, verses, translationId, translationLabel, loading, error } = useVerseText(reference);
  const visible = reference != null;
  const refLabel = reference ? formatReferenceLabel(reference) : '';

  const handleReadFull = () => {
    if (!reference) return;
    onClose();
    router.push({
      pathname: '/bible',
      params: {
        book: reference.book,
        chapter: String(reference.chapter),
        ...(reference.verse ? { verse: String(reference.verse) } : {}),
        ...(reference.endVerse ? { endVerse: String(reference.endVerse) } : {}),
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {refLabel}
              {translationId ? ` (${translationId.toUpperCase()})` : ''}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={accentColor} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {loading && <ActivityIndicator color={accentColor} style={styles.loadingSpinner} />}

            {!loading && error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && !error && text && (
              <Text style={styles.verseParagraph}>
                <Text style={[styles.citation, { color: accentColor }]} onPress={handleReadFull}>
                  {refLabel}
                  {translationId ? ` ${translationId.toUpperCase()}` : ''}
                  {' - '}
                </Text>
                {verses && verses.length > 0 ? (
                  verses.map((v, i) => (
                    <Text key={v.verse}>
                      <Text style={styles.verseNum}>{v.verse}</Text>
                      {v.text}
                      {i < verses.length - 1 ? ' ' : ''}
                    </Text>
                  ))
                ) : (
                  <Text>{text}</Text>
                )}
              </Text>
            )}

            {!loading && !error && text && (
              <Pressable onPress={handleReadFull} style={styles.moreWrap}>
                <Text style={[styles.moreLink, { color: accentColor }]}>More»</Text>
              </Pressable>
            )}
          </View>

          {translationLabel && (
            <View style={styles.footerBar}>
              <Text style={styles.poweredByLabel}>POWERED BY </Text>
              <Text style={styles.poweredByName}>{translationLabel}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111826',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#2B3A4D',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  loadingSpinner: {
    marginVertical: 12,
  },
  verseParagraph: {
    color: '#E8EAED',
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 24,
  },
  citation: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verseNum: {
    fontSize: 10,
    color: '#93A2B4',
    fontWeight: '700',
  },
  errorText: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },
  moreWrap: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  moreLink: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#2B3A4D',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  poweredByLabel: {
    color: '#B8C2CE',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  poweredByName: {
    color: '#93C5FD',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});