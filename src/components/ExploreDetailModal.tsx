import { LinkedText } from '@/components/LinkedText';
import { VerseLink } from '@/components/VerseLink';
import { hexToRgba } from '@/lib/colors';
import { parseBibleReference } from '@/lib/parseBibleReference';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const BODY_SERIF = 'Times New Roman';
const BANNER_HEIGHT = 260;

export interface ExploreCardData {
  id: string;
  title: string;
  subtitle: string;
  icon?: ComponentType<{ color: string; size?: number }>;
  image: ImageSourcePropType;
  /**
   * Rich narrative content. Paragraphs are separated by a blank line.
   * A paragraph starting with "### " renders as a subheading.
   * A paragraph starting with a quotation mark and ending in
   * "— Reference" renders as a pull-quote, linked to Scripture when possible.
   */
  content?: string;
}

interface ExploreDetailModalProps {
  visible: boolean;
  onClose: () => void;
  cards: ExploreCardData[];
  initialIndex?: number;
  accentColor: string;
}

type ContentBlock =
  | { type: 'heading'; key: string; text: string }
  | { type: 'quote'; key: string; text: string; reference?: string }
  | { type: 'paragraph'; key: string; text: string };

function parseContentBlocks(content: string): ContentBlock[] {
  const parts = content
    .split('\n\n')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('### ')) {
      return { type: 'heading', key: `h-${index}`, text: part.replace(/^###\s*/, '') };
    }

    if (/^[\u201C"]/.test(part)) {
      const refMatch = part.match(/[—–]\s*([^—–\u201D"]+)\s*$/);
      const reference = refMatch?.[1]?.trim();
      const text = part
        .replace(/[—–]\s*([^—–\u201D"]+)\s*$/, '')
        .replace(/^[\u201C"]/, '')
        .replace(/[\u201D"]\s*$/, '')
        .trim();
      return { type: 'quote', key: `q-${index}`, text, reference };
    }

    return { type: 'paragraph', key: `p-${index}`, text: part };
  });
}

function QuoteBlock({
  text,
  reference,
  accentColor,
}: {
  text: string;
  reference?: string;
  accentColor: string;
}) {
  const parsed = reference ? parseBibleReference(reference) : null;

  return (
    <View
      style={[
        styles.quoteWrap,
        { borderColor: hexToRgba(accentColor, 0.4), backgroundColor: hexToRgba(accentColor, 0.06) },
      ]}
    >
      <Text style={[styles.quoteMark, { color: accentColor }]}>{'\u201C'}</Text>
      <Text style={styles.quoteText}>{text}</Text>
      {reference ? (
        <View style={styles.quoteRefRow}>
          <View style={[styles.quoteDash, { backgroundColor: accentColor }]} />
          {parsed ? (
            <VerseLink book={parsed.book} chapter={parsed.chapter} verse={parsed.verse} endVerse={parsed.endVerse}>
              <Text style={[styles.quoteRef, { color: accentColor }]}>{reference}</Text>
            </VerseLink>
          ) : (
            <Text style={[styles.quoteRef, { color: accentColor }]}>{reference}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

function ExplorePage({ card, accentColor }: { card: ExploreCardData; accentColor: string }) {
  const blocks = useMemo(() => (card.content ? parseContentBlocks(card.content) : []), [card.content]);
  const IconComponent = card.icon;

  return (
    <ScrollView
      style={{ width: SCREEN_W }}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
      bounces
    >
      <View style={styles.banner}>
        <ImageBackground source={card.image} style={StyleSheet.absoluteFillObject} contentFit="cover">
          <LinearGradient
            colors={['rgba(7,17,31,0.1)', 'rgba(7,17,31,0.55)', 'rgba(7,17,31,0.98)']}
            style={StyleSheet.absoluteFillObject}
          />
        </ImageBackground>
        <View style={styles.bannerContent}>
          {IconComponent ? (
            <View style={[styles.iconBadge, { borderColor: accentColor }]}>
              <IconComponent color={accentColor} size={16} />
            </View>
          ) : null}
          <Text style={[styles.title, { color: accentColor }]}>{card.title}</Text>
          <Text style={styles.subtitle}>{card.subtitle}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {blocks.length === 0 ? (
          <Text style={styles.paragraph}>More on this topic is coming soon.</Text>
        ) : (
          blocks.map((block) => {
            if (block.type === 'heading') {
              return (
                <Text key={block.key} style={[styles.heading, { color: accentColor }]}>
                  {block.text}
                </Text>
              );
            }
            if (block.type === 'quote') {
              return (
                <QuoteBlock key={block.key} text={block.text} reference={block.reference} accentColor={accentColor} />
              );
            }
            return (
              <LinkedText
                key={block.key}
                text={block.text}
                style={styles.paragraph}
                linkStyle={{ color: accentColor }}
              />
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

export default function ExploreDetailModal({
  visible,
  onClose,
  cards,
  initialIndex = 0,
  accentColor,
}: ExploreDetailModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_W, animated: false });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [visible, initialIndex]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(index);
  };

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    scrollRef.current?.scrollTo({ x: clamped * SCREEN_W, animated: true });
    setActiveIndex(clamped);
  };

  if (!cards.length) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
        >
          {cards.map((card) => (
            <ExplorePage key={card.id} card={card} accentColor={accentColor} />
          ))}
        </ScrollView>

        <Pressable
          style={[styles.closeButton, { top: insets.top + 12, borderColor: accentColor }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} color={accentColor} />
        </Pressable>

        {cards.length > 1 && (
          <>
            <Pressable
              style={[
                styles.navButton,
                styles.navLeft,
                { top: insets.top + 12, opacity: activeIndex === 0 ? 0.3 : 1 },
              ]}
              onPress={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              accessibilityRole="button"
              accessibilityLabel="Previous topic"
            >
              <ChevronLeft size={18} color={accentColor} />
            </Pressable>
            <Pressable
              style={[
                styles.navButton,
                styles.navRight,
                { top: insets.top + 12, opacity: activeIndex === cards.length - 1 ? 0.3 : 1 },
              ]}
              onPress={() => goTo(activeIndex + 1)}
              disabled={activeIndex === cards.length - 1}
              accessibilityRole="button"
              accessibilityLabel="Next topic"
            >
              <ChevronRight size={18} color={accentColor} />
            </Pressable>

            <View style={[styles.dotsRow, { bottom: insets.bottom + 16 }]}>
              {cards.map((c, i) => (
                <View
                  key={c.id}
                  style={[
                    styles.dot,
                    i === activeIndex ? [styles.dotActive, { backgroundColor: accentColor }] : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  pageContent: {
    paddingBottom: 48,
  },
  banner: {
    height: BANNER_HEIGHT,
    width: '100%',
  },
  bannerContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    gap: 6,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,17,31,0.6)',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Times New Roman',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Times New Roman',
    fontSize: 13,
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  heading: {
    fontFamily: 'Times New Roman',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  paragraph: {
    fontFamily: BODY_SERIF,
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
quoteWrap: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  quoteMark: {
    fontFamily: 'Times New Roman',
    fontSize: 32,
    opacity: 0.6,
    lineHeight: 28,
    marginBottom: 2,
  },
  quoteText: {
    fontFamily: 'Times New Roman',
    fontSize: 15,
    lineHeight: 23,
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  quoteRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  quoteDash: {
    width: 18,
    height: 1,
    opacity: 0.6,
  },
  quoteRef: {
    fontFamily: BODY_SERIF,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: 'rgba(7,17,31,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(7,17,31,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLeft: {
    left: 16,
  },
  navRight: {
    right: 64,
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
