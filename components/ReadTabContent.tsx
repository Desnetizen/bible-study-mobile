import { useRef, useEffect, useCallback, useMemo, useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ScrollView as RNScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Scroll,
  List,
} from 'lucide-react-native';
import type { ContextData, Section as ContextSection } from '@/types/context';

export type ReadTabContentProps = {
  contextData: ContextData;
  accentColor?: string;
  headerEyebrow: string;
  scrollRef?: React.RefObject<RNScrollView | null>;
};

type AccentColorCtx = { color: string; rgb: { r: number; g: number; b: number } };
const AccentColorContext = createContext<AccentColorCtx>({
  color: '#D5A748',
  rgb: { r: 213, g: 167, b: 72 },
});

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_WIDE = SCREEN_WIDTH >= 768;
const DARK_CARD = '#0C1420';
const QUOTE_BG = '#0A1628';
const BODY_TEXT = 'rgba(255,255,255,0.78)';
const BODY_SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

function extractQuotes(content: string): { paragraphs: string[]; quotes: { text: string; reference?: string }[] } {
  const quotes: { text: string; reference?: string }[] = [];
  const paragraphs: string[] = [];
  const parts = content.split('\n\n');
  for (const part of parts) {
    const trimmed = part.trim();
    if (/^["""\u201C]/.test(trimmed)) {
      const refMatch = trimmed.match(/[—–]\s*(.+?)["""\u201D]?\s*$/);
      quotes.push({
        text: trimmed.replace(/[—–]\s*(.+?)["""\u201D]?\s*$/, '').trim(),
        reference: refMatch?.[1]?.trim(),
      });
    } else {
      paragraphs.push(trimmed);
    }
  }
  return { paragraphs, quotes };
}

function GoldDivider({ double: isDouble = false }: { double?: boolean }) {
  const { rgb } = useContext(AccentColorContext);
  const borderColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`;
  return (
    <View style={dividerStyles.wrapper}>
      <View style={[dividerStyles.line, { backgroundColor: borderColor }]} />
      {isDouble && <View style={[dividerStyles.line, { backgroundColor: borderColor, marginTop: 3 }]} />}
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  wrapper: { paddingVertical: 12 },
  line: { height: 1, borderRadius: 1 },
});

function QuoteCard({ text, reference }: { text: string; reference?: string }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  return (
    <View style={quoteStyles.card}>
      <View style={[quoteStyles.borderOuter, { borderColor: accentColor }]}>
        <View style={[quoteStyles.borderInner, { borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)` }, { backgroundColor: QUOTE_BG }]}>
          <View style={quoteStyles.content}>
            <Text style={[quoteStyles.markerOpen, { color: accentColor }]}>{"\u201C"}</Text>
            <Text style={quoteStyles.text}>{text}</Text>
            {reference && (
              <View style={quoteStyles.refRow}>
                <View style={[quoteStyles.refDash, { backgroundColor: accentColor }]} />
                <Text style={[quoteStyles.refText, { color: accentColor }]}>{reference}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const quoteStyles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  borderOuter: {
    borderWidth: 1.5,
    borderRadius: 4,
    padding: 3,
  },
  borderInner: {
    borderWidth: 1,
    borderRadius: 2,
  },
  content: {
    padding: 20,
  },
  markerOpen: {
    fontFamily: BODY_SERIF,
    fontSize: 40,
    opacity: 0.6,
    lineHeight: 32,
    marginBottom: 6,
  },
  text: {
    fontFamily: BODY_SERIF,
    fontSize: 15,
    lineHeight: 24,
    color: '#E2E8F0',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  refDash: {
    width: 20,
    height: 1,
    opacity: 0.5,
  },
  refText: {
    fontFamily: BODY_SERIF,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

function SubsectionView({ title, content }: { title: string; content: string }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  const { paragraphs, quotes } = extractQuotes(content);
  const numMatch = title.match(/^(\d+\.\d+)\s*/);
  const subNum = numMatch?.[1] || '';
  const cleanTitle = title.replace(/^\d+\.\d+\s*/, '');

  return (
    <View style={subsectionStyles.container}>
      <View style={subsectionStyles.headerRow}>
        {subNum ? (
          <View style={[subsectionStyles.numBadge, { borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`, backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.06)` }]}>
            <Text style={[subsectionStyles.numText, { color: accentColor }]}>{subNum}</Text>
          </View>
        ) : null}
        <Text style={subsectionStyles.title}>{cleanTitle}</Text>
      </View>
      {paragraphs.map((p, i) => (
        <Text key={`p-${i}`} style={subsectionStyles.para}>{p}</Text>
      ))}
      {quotes.map((q, i) => (
        <QuoteCard key={`q-${i}`} text={q.text} reference={q.reference} />
      ))}
    </View>
  );
}

const subsectionStyles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  numText: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Cinzel',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
  },
  para: {
    fontFamily: BODY_SERIF,
    fontSize: 14,
    lineHeight: 22,
    color: BODY_TEXT,
    letterSpacing: 0.2,
  },
});

function ImageFrame({ source, style }: { source: any; style?: any }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  return (
    <View style={[imageFrameStyles.container, style]}>
      <View style={[imageFrameStyles.outer, { borderColor: accentColor }]}>
        <View style={[imageFrameStyles.inner, { borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)` }]}>
          <Image source={source} style={imageFrameStyles.image} contentFit="cover" />
        </View>
      </View>
    </View>
  );
}

const imageFrameStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  outer: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 4,
  },
  inner: {
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 10,
  },
});

function SectionHeader({ number, title }: { number: string; title: string }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  return (
    <View style={sectionHeaderStyles.container}>
      <View style={[sectionHeaderStyles.lineLeft, { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)` }]} />
      <View style={sectionHeaderStyles.textGroup}>
        <Text style={[sectionHeaderStyles.number, { color: accentColor }]}>{number}</Text>
        <Text style={sectionHeaderStyles.title}>{title}</Text>
      </View>
      <View style={[sectionHeaderStyles.lineRight, { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)` }]} />
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 14,
  },
  lineLeft: {
    flex: 1,
    height: 1,
  },
  lineRight: {
    flex: 1,
    height: 1,
  },
  textGroup: {
    alignItems: 'center',
    gap: 2,
  },
  number: {
    fontFamily: 'Cinzel',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontFamily: 'Cinzel',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

type Section = ContextSection;

function TermCard({ term, definition }: { term: string; definition: string }) {
  const { color: accentColor } = useContext(AccentColorContext);
  return (
    <View style={termCardStyles.container}>
      <View style={[termCardStyles.termRow, { borderBottomColor: `rgba(255,255,255,0.08)` }]}>
        <Text style={[termCardStyles.term, { color: accentColor }]}>{term}</Text>
      </View>
      <Text style={termCardStyles.definition}>{definition}</Text>
    </View>
  );
}

const termCardStyles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
    gap: 6,
  },
  termRow: {
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  term: {
    fontFamily: 'Cinzel',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  definition: {
    fontFamily: BODY_SERIF,
    fontSize: 13,
    lineHeight: 20,
    color: BODY_TEXT,
  },
});

function SectionBody({ section, index }: { section: Section; index: number }) {
  const { paragraphs, quotes } = section.content ? extractQuotes(section.content) : { paragraphs: [], quotes: [] };

  return (
    <View>
      {section.intro && (
        <Text style={sectionBodyStyles.intro}>{section.intro}</Text>
      )}

      {section.timeline && section.timeline.length > 0 && (
        <TimelineVisual items={section.timeline} />
      )}

      <View style={IS_WIDE ? sectionBodyStyles.columns : undefined}>
        <View style={sectionBodyStyles.column}>
          {paragraphs.slice(0, IS_WIDE ? Math.ceil(paragraphs.length / 2) : paragraphs.length).map((p, i) => (
            <Text key={`p-${i}`} style={sectionBodyStyles.para}>{p}</Text>
          ))}
          {quotes.slice(0, IS_WIDE ? Math.ceil(quotes.length / 2) : quotes.length).map((q, i) => (
            <QuoteCard key={`q-${i}`} text={q.text} reference={q.reference} />
          ))}
        </View>

        {IS_WIDE && (
          <View style={sectionBodyStyles.column}>
            {paragraphs.slice(Math.ceil(paragraphs.length / 2)).map((p, i) => (
              <Text key={`pr-${i}`} style={sectionBodyStyles.para}>{p}</Text>
            ))}
            {quotes.slice(Math.ceil(quotes.length / 2)).map((q, i) => (
              <QuoteCard key={`qr-${i}`} text={q.text} reference={q.reference} />
            ))}
          </View>
        )}
      </View>

      {section.terms && section.terms.length > 0 && (
        <View style={sectionBodyStyles.termsSection}>
          {section.terms.map((t) => (
            <TermCard key={t.id} term={t.term} definition={t.definition} />
          ))}
        </View>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <View style={sectionBodyStyles.subsections}>
          {section.subsections.map((sub) => (
            <SubsectionView key={sub.id} title={sub.title} content={sub.content} />
          ))}
        </View>
      )}
    </View>
  );
}

const sectionBodyStyles = StyleSheet.create({
  intro: {
    fontFamily: BODY_SERIF,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  para: {
    fontFamily: BODY_SERIF,
    fontSize: 14,
    lineHeight: 22,
    color: BODY_TEXT,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  termsSection: {
    marginTop: 12,
    gap: 8,
  },
  subsections: {
    marginTop: 8,
    gap: 16,
  },
});

function TimelineVisual({ items }: { items: { date: string; event: string; reference: string }[] }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  return (
    <View style={timelineStyles.container}>
      <View style={[timelineStyles.line, { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.2)` }]} />
      {items.map((item, i) => (
        <View key={i} style={timelineStyles.item}>
          <View style={[timelineStyles.dot, { borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)` }]}>
            <View style={[timelineStyles.dotInner, { backgroundColor: accentColor }]} />
          </View>
          <View style={timelineStyles.content}>
            <Text style={[timelineStyles.date, { color: accentColor }]}>{item.date}</Text>
            <Text style={timelineStyles.event}>{item.event}</Text>
            <Pressable
              style={[timelineStyles.refChip, { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)` }]}
              onPress={() => {
                const match = item.reference.match(/^(.+?)\s+(\d+)/);
                if (match) {
                  router.push({
                    pathname: '/bible',
                    params: { book: match[1].trim(), chapter: match[2] },
                  });
                }
              }}
            >
              <BookOpen size={10} color={accentColor} />
              <Text style={[timelineStyles.refText, { color: accentColor }]}>{item.reference}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  container: { paddingLeft: 16, position: 'relative', marginVertical: 12 },
  line: {
    position: 'absolute', left: 20, top: 8, bottom: 8,
    width: 2, borderRadius: 1,
  },
  item: { flexDirection: 'row', gap: 14, paddingVertical: 8 },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: DARK_CARD, borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  dotInner: { width: 5, height: 5, borderRadius: 3 },
  content: { flex: 1, gap: 4 },
  date: { fontFamily: 'Cinzel', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  event: { fontFamily: BODY_SERIF, fontSize: 13, lineHeight: 19, color: BODY_TEXT },
  refChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2,
  },
  refText: { fontFamily: 'Cinzel', fontSize: 10, fontWeight: '600' },
});

function CalloutBox({ title, children }: { title: string; children: React.ReactNode }) {
  const { color: accentColor, rgb } = useContext(AccentColorContext);
  return (
    <View style={calloutStyles.container}>
      <View style={[calloutStyles.borderOuter, { borderColor: accentColor }]}>
        <View style={[calloutStyles.borderInner, { borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)` }]}>
          <View style={calloutStyles.content}>
            {title && (
              <Text style={[calloutStyles.title, { color: accentColor }]}>{title}</Text>
            )}
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

const calloutStyles = StyleSheet.create({
  container: { marginVertical: 20 },
  borderOuter: {
    borderWidth: 2,
    borderRadius: 4,
    padding: 4,
  },
  borderInner: {
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: QUOTE_BG,
  },
  content: { padding: 20, gap: 10 },
  title: {
    fontFamily: 'Cinzel',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
});

function DropCap({ text }: { text: string }) {
  const { color: accentColor } = useContext(AccentColorContext);
  const firstChar = text.charAt(0);
  const rest = text.slice(1);
  return (
    <View style={dropCapStyles.row}>
      <Text style={[dropCapStyles.cap, { color: accentColor }]}>{firstChar}</Text>
      <Text style={dropCapStyles.rest}>{rest}</Text>
    </View>
  );
}

const dropCapStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  cap: {
    fontFamily: 'Cinzel',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 44,
    marginRight: 6,
    marginTop: 2,
  },
  rest: {
    fontFamily: BODY_SERIF,
    fontSize: 14,
    lineHeight: 22,
    color: BODY_TEXT,
    letterSpacing: 0.2,
    flex: 1,
  },
});

export default function ReadTabContent({ contextData, accentColor = '#D5A748', headerEyebrow, scrollRef }: ReadTabContentProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const sectionPositions = useRef<Record<string, number>>({});
  const rootOffsetRef = useRef(0);
  const tocScrollRef = useRef<RNScrollView>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);

  const accentRgb = useMemo(() => ({
    r: parseInt(accentColor.slice(1, 3), 16),
    g: parseInt(accentColor.slice(3, 5), 16),
    b: parseInt(accentColor.slice(5, 7), 16),
  }), [accentColor]);

  const accentCtx = useMemo(() => ({ color: accentColor, rgb: accentRgb }), [accentColor, accentRgb]);

  const handleLayoutRoot = useCallback((e: any) => {
    rootOffsetRef.current = e.nativeEvent.layout.y;
  }, []);

  const handleSectionLayout = useCallback((id: string, e: any) => {
    sectionPositions.current[id] = e.nativeEvent.layout.y;
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const sectionY = sectionPositions.current[id];
    if (sectionY !== undefined && scrollRef?.current) {
      scrollRef.current.scrollTo({
        y: rootOffsetRef.current + sectionY,
        animated: true,
      });
      setActiveSection(id);
      setTocOpen(false);
    }
  }, [scrollRef]);

  const tocItems = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    const sections = contextData.sections;

    const abs = sections.find(s => s.id === 'abstract');
    if (abs) items.push({ id: abs.id, label: 'Abstract' });

    for (const s of sections) {
      if (s.id === 'abstract') continue;
      const match = s.title.match(/^([IVXLC]+)\.\s*(.*)/);
      items.push({ id: s.id, label: match?.[1] || s.title });
    }
    return items;
  }, [contextData]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 350, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 350, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const abstractSection = contextData.sections.find(s => s.id === 'abstract');
  const otherSections = contextData.sections.filter(s => s.id !== 'abstract');
  const firstSectionText = abstractSection?.content || contextData.description;

  const baseStyles = useMemo(() => {
    const r = accentRgb.r;
    const g = accentRgb.g;
    const b = accentRgb.b;
    return StyleSheet.create({
      headerBanner: {
        backgroundColor: DARK_CARD,
        borderWidth: 1.5,
        borderColor: `rgba(${r},${g},${b},0.2)`,
        borderRadius: 4,
        padding: 20,
        overflow: 'hidden',
      },
      abstractSection: {
        backgroundColor: DARK_CARD,
        borderWidth: 1.5,
        borderColor: `rgba(${r},${g},${b},0.18)`,
        borderRadius: 4,
        padding: 20,
        marginTop: 8,
      },
      footerCard: {
        backgroundColor: DARK_CARD,
        borderWidth: 1.5,
        borderColor: `rgba(${r},${g},${b},0.15)`,
        borderRadius: 4,
        padding: 20,
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
      },
      footerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: `rgba(${r},${g},${b},0.1)`,
        borderWidth: 1,
        borderColor: `rgba(${r},${g},${b},0.25)`,
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 10,
      },
      tocInner: {
        backgroundColor: 'rgba(12, 20, 32, 0.95)',
        borderWidth: 1,
        borderColor: `rgba(${r},${g},${b},0.2)`,
        borderRadius: 4,
        overflow: 'hidden',
      },
      tocScroll: {
        maxHeight: 44,
        borderTopWidth: 1,
        borderTopColor: `rgba(${r},${g},${b},0.12)`,
      },
      tocChip: {
        borderWidth: 1,
        borderColor: `rgba(${r},${g},${b},0.2)`,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: `rgba(${r},${g},${b},0.04)`,
      },
      tocChipActive: {
        borderColor: accentColor,
        backgroundColor: `rgba(${r},${g},${b},0.12)`,
      },
    });
  }, [accentColor, accentRgb]);

  return (
    <AccentColorContext.Provider value={accentCtx}>
      <Animated.View
        onLayout={handleLayoutRoot}
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ─────── SECTION INDEX (TOC) ─────── */}
        <View style={tocStyles.wrapper}>
          <View style={baseStyles.tocInner}>
            <Pressable
              style={tocStyles.toggleBtn}
              onPress={() => setTocOpen(o => !o)}
              hitSlop={8}
            >
              <List size={16} color={accentColor} />
              <Text style={[tocStyles.toggleText, { color: accentColor }]}>
                {tocOpen ? 'Close Index' : 'Section Index'}
              </Text>
            </Pressable>

            {tocOpen && (
              <RNScrollView
                ref={tocScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={baseStyles.tocScroll}
                contentContainerStyle={tocStyles.scrollContent}
              >
                <Pressable
                  style={({ pressed }) => [
                    baseStyles.tocChip,
                    activeSection === '__header__' && baseStyles.tocChipActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    scrollRef?.current?.scrollTo({ y: 0, animated: true });
                    setActiveSection('__header__');
                    setTocOpen(false);
                  }}
                >
                  <Text style={[
                    tocStyles.chipText,
                    activeSection === '__header__' && { color: accentColor },
                  ]}>
                    Top
                  </Text>
                </Pressable>

                {tocItems.map(item => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      baseStyles.tocChip,
                      activeSection === item.id && baseStyles.tocChipActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => scrollToSection(item.id)}
                  >
                    <Text style={[
                      tocStyles.chipText,
                      activeSection === item.id && { color: accentColor },
                    ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </RNScrollView>
            )}
          </View>
        </View>

        {/* ─────── HEADER BANNER ─────── */}
        <View
          style={baseStyles.headerBanner}
          onLayout={(e) => handleSectionLayout('__header__', e)}
        >
          <LinearGradient
            colors={[`rgba(${accentRgb.r},${accentRgb.g},${accentRgb.b},0.08)`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 4 }]}
          />
          <Text style={[styles.headerEyebrow, { color: accentColor }]}>{headerEyebrow}</Text>
          <Text style={styles.headerTitle}>{contextData.title}</Text>
          <Text style={[styles.headerSubtitle, { color: accentColor }]}>{contextData.subtitle}</Text>

          <GoldDivider double />

          <Text style={styles.headerDesc}>{contextData.description}</Text>

          <ImageFrame
            source={require('../assets/images/pre_exile_header_relief.png')}
            style={{ marginBottom: 4 }}
          />
        </View>

        {/* ─────── ABSTRACT SECTION ─────── */}
        {abstractSection && (
          <View
            style={baseStyles.abstractSection}
            onLayout={(e) => handleSectionLayout(abstractSection.id, e)}
          >
            <View style={IS_WIDE ? styles.abstractRow : undefined}>
              <View style={styles.abstractTextCol}>
                <Text style={[styles.abstractLabel, { color: accentColor }]}>Abstract</Text>
                <GoldDivider double />
                <DropCap text={firstSectionText} />
              </View>

              {IS_WIDE && (
                <View style={styles.abstractImageCol}>
                  <ImageFrame
                    source={require('../assets/images/ancient_babylon_engraving.png')}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* ─────── SECTIONS I – VIII ─────── */}
        {otherSections.map((section, idx) => {
          const numMatch = section.title.match(/^([IVXLC]+)\.\s*(.*)/);
          const sectionNum = numMatch?.[1] || '';
          const cleanTitle = numMatch?.[2] || section.title;

          const isSectionII = sectionNum === 'II';

          return (
            <View
              key={section.id}
              style={styles.sectionWrapper}
              onLayout={(e) => handleSectionLayout(section.id, e)}
            >
              {isSectionII ? (
                <CalloutBox title={`${sectionNum}. ${cleanTitle}`}>
                  <SectionBody section={section} index={idx} />
                </CalloutBox>
              ) : (
                <>
                  <SectionHeader number={sectionNum} title={cleanTitle} />

                  <SectionBody section={section} index={idx} />

                  {sectionNum === 'I' && (
                    <ImageFrame
                      source={require('../assets/images/judean_ruins.png')}
                    />
                  )}
                </>
              )}

              <GoldDivider double />
            </View>
          );
        })}

        {/* ─────── FOOTER CTA ─────── */}
        <View style={baseStyles.footerCard}>
          <Scroll size={22} color={accentColor} style={{ opacity: 0.6 }} />
          <Text style={styles.footerText}>
            This study covers {contextData.sections.length} major sections of scholarship on the {contextData.title}.
          </Text>
          <Pressable
            style={({ pressed }) => [
              baseStyles.footerBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() =>
              router.push({ pathname: '/bible', params: { book: 'Daniel', chapter: '1' } })
            }
          >
            <BookOpen size={14} color={accentColor} />
            <Text style={[styles.footerBtnText, { color: accentColor }]}>Open Daniel in Study Bible</Text>
            <ChevronRight size={14} color={accentColor} />
          </Pressable>
        </View>
      </Animated.View>
    </AccentColorContext.Provider>
  );
}

const tocStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleText: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  chipText: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerEyebrow: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: 'Cinzel',
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Cinzel',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  headerDesc: {
    fontFamily: BODY_SERIF,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  abstractSection: {
    marginTop: 8,
  },
  abstractRow: {
    flexDirection: 'row',
    gap: 24,
  },
  abstractTextCol: {
    flex: 2,
  },
  abstractImageCol: {
    flex: 1,
    justifyContent: 'center',
  },
  abstractLabel: {
    fontFamily: 'Cinzel',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionWrapper: {
    marginTop: 8,
  },
  footerText: {
    fontFamily: BODY_SERIF,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  footerBtnText: {
    fontFamily: 'Cinzel',
    fontSize: 12,
    fontWeight: '600',
  },
});
