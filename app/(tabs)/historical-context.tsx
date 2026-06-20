import * as Haptics from 'expo-haptics';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  Crown,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HISTORICAL_ERAS } from '../../Data/historicalContextData';

// ─── Era config ────────────────────────────────────────────────────────────────

interface EraConfig {
  color: string;
  image: any;
  quote?: string;
}

const ERA_CONFIG: Record<string, EraConfig> = {
  'pre-exilic': {
    color: '#E8A838',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  'babylonian-exile': {
    color: '#E8A838',
    image: require('../../assets/Places/Babylon.png'),
  },
  'persian-period': {
    color: '#4ECDC4',
    image: require('../../assets/Places/Ancient Susa.png'),
  },
  'greek-period': {
    color: '#A78BFA',
    image: require('../../assets/Places/Athens.jpg'),
  },
  'new-testament': {
    color: '#F87171',
    image: require('../../assets/Places/Rome.jpg'),
  },
};

// display labels matching the mockup
const ERA_LABELS: Record<string, string> = {
  'pre-exilic': 'Pre-Exilic',
  'babylonian-exile': 'Babylonian',
  'persian-period': 'Medo-Persian',
  'greek-period': 'Greek Empire',
  'new-testament': 'Roman Empire',
};

const ERA_DATE_RANGES: Record<string, string> = {
  'pre-exilic': '1000–586 BC',
  'babylonian-exile': '586–539 BC',
  'persian-period': '539–331 BC',
  'greek-period': '331–63 BC',
  'new-testament': '63 BC–476 AD',
};

const ERA_SUMMARIES: Record<string, string> = {
  'pre-exilic':
    'The rise of Israel under kings like David and Solomon. The temple is built in Jerusalem, God\'s presence dwells among His people.',
  'babylonian-exile':
    'Judah is exiled to Babylon. The Babylonian Empire rises in power, and Daniel and his friends are taken captive.',
  'persian-period':
    'Persia conquers Babylon. Cyrus the Great allows the exiles to return and rebuild Jerusalem and the temple.',
  'greek-period':
    'Alexander the Great spreads Greek culture across the world. His empire is divided among his generals.',
  'new-testament':
    'Rome becomes the dominant power in the world. Daniel\'s prophecies point toward this final empire.',
};

const FOOTER_QUOTE = '"The exile was God\'s judgment, but also His method of restoration."';

type Era = typeof HISTORICAL_ERAS[number];
type TimelineEvent = Era['events'][number];

// ─── EraCardItem Component ───────────────────────────────────────────────────

interface EraCardItemProps {
  era: Era;
  index: number;
  onPress: () => void;
}

function EraCardItem({ era, index, onPress }: EraCardItemProps) {
  const cfg = ERA_CONFIG[era.id];
  const color = cfg?.color ?? '#E8A838';
  const label = ERA_LABELS[era.id] ?? era.name;
  const dateRange = ERA_DATE_RANGES[era.id] ?? era.dateRange;
  const summary = ERA_SUMMARIES[era.id] ?? '';
  const num = String(index + 1).padStart(2, '0');

  // Stagger entry animation values
  const animValue = useRef(new Animated.Value(0)).current;

  // Press feedback animation values
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 380,
      delay: index * 75,
      easing: Easing.bezier(0.23, 1, 0.32, 1), // Strong ease-out curve from Emil's framework
      useNativeDriver: true,
    }).start();
  }, [index, animValue]);

  const onPressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.965, // Responsive button press scaling
      duration: 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(pressScale, {
      toValue: 1,
      duration: 160,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  };

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0], // Smooth slide-up
  });

  const entryScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1], // Never animate from scale(0)
  });

  const combinedScale = Animated.multiply(entryScale, pressScale);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale: combinedScale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.eraCard,
          {
            borderColor: color + '22', // Subtle color-matched border glow
            shadowColor: color, // Shadow glow color
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label} era, ${dateRange}`}
      >
        {/* Subtle interior gradient glow */}
        <LinearGradient
          colors={[color + '12', 'rgba(15, 30, 48, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eraCardGradient}
        />
        {/* Left image */}
        <View style={styles.eraImageWrap}>
          {cfg?.image ? (
            <Image
              source={cfg.image}
              style={styles.eraImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
            />
          ) : (
            <View style={[styles.eraImage, { backgroundColor: '#1A2535' }]} />
          )}
        </View>

        {/* Text content */}
        <View style={styles.eraBody}>
          <View style={styles.eraTitleRow}>
            <Text style={[styles.eraNum, { color }]}>{num}</Text>
            <Text style={[styles.eraName, { color }]}>{label}</Text>
          </View>
          <Text style={styles.eraDateRange}>{dateRange}</Text>
          <Text style={styles.eraSummary} numberOfLines={3}>
            {summary}
          </Text>
        </View>

        {/* Chevron */}
        <ChevronRight size={18} color="rgba(255,255,255,0.35)" style={{ marginRight: 14 }} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HistoricalContextScreen() {
  const insets = useSafeAreaInsets();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const onHeroLoad = useCallback(() => {
    Animated.timing(heroOpacity, {
      toValue: 1,
      duration: 450,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, [heroOpacity]);

  // Detail modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeEra, setActiveEra] = useState<Era | null>(null);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(900)).current;

  useEffect(() => {
    if (modalVisible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(900);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible, backdropOpacity, sheetTranslateY]);

  const openEraDetail = (era: Era) => {
    const routeMap: Record<string, '/pre-exilic-detail' | '/babylon-detail' | '/medo-persian-detail' | '/greek-detail' | '/roman-detail'> = {
      'pre-exilic': '/pre-exilic-detail',
      'babylonian-exile': '/babylon-detail',
      'persian-period': '/medo-persian-detail',
      'greek-period': '/greek-detail',
      'new-testament': '/roman-detail',
    };

    const route = routeMap[era.id];
    if (route) {
      router.push(route);
      return;
    }

    setActiveEra(era);
    setActiveEvent(era.events[0] ?? null);
    setModalVisible(true);
  };

  const openEventDetail = (event: TimelineEvent, era: Era) => {
    setActiveEra(era);
    setActiveEvent(event);
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 900,
        duration: 250,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setActiveEra(null);
      setActiveEvent(null);
    });
  };

  const handleScripturePress = (ref: string) => {
    const normalized = ref.trim().replace(/–|—/g, '-');
    const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
    if (!match) return;
    closeModal();
    router.push({
      pathname: '/bible',
      params: {
        book: match[1].trim(),
        chapter: match[2],
        ...(match[3] ? { verse: match[3] } : {}),
      },
    });
  };

  const eraColor = activeEra ? (ERA_CONFIG[activeEra.id]?.color ?? '#E8A838') : '#E8A838';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07111F" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: heroOpacity }}>
          <ImageBackground
            source={require('../../assets/images/historical_context_hero.png')}
            style={[styles.hero, { paddingTop: insets.top + 12 }]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={400}
            onLoad={onHeroLoad}
          >
            {/* Multi-layered cinematic gradient overlays */}
            <LinearGradient
              colors={['rgba(7, 17, 31, 0.25)', 'rgba(7, 17, 31, 0.7)', '#07111F']}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.22)', 'rgba(232, 168, 56, 0.05)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Historical Context</Text>
              <View style={styles.heroSubRow}>
                <Text style={styles.heroSubtitle}>
                  Explore the empires and events that shaped{'\n'}the story of Daniel.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.exploreBtn, pressed && styles.exploreBtnPressed]}
                  onPress={() => openEraDetail(HISTORICAL_ERAS[0])}
                >
                  <Compass size={13} color="#93C5FD" strokeWidth={2} />
                  <Text style={styles.exploreBtnText}>Tap to explore</Text>
                </Pressable>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* ── Era Cards ─────────────────────────────────────────── */}
        <View style={styles.cardList}>
          {HISTORICAL_ERAS.map((era, index) => (
            <EraCardItem
              key={era.id}
              era={era}
              index={index}
              onPress={() => openEraDetail(era)}
            />
          ))}
        </View>

        {/* ── Footer Quote ──────────────────────────────────────── */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteSymbol}>“</Text>
          <Text style={styles.quoteText}>{FOOTER_QUOTE}</Text>
          <Pressable
            style={({ pressed }) => [styles.readBtn, pressed && styles.readBtnPressed]}
            onPress={() => router.push({ pathname: '/bible', params: { book: 'Daniel', chapter: '1' } })}
          >
            <BookOpen size={15} color="#93C5FD" strokeWidth={2} />
            <Text style={styles.readBtnText}>Read Daniel 1</Text>
            <ArrowRight size={15} color="#93C5FD" strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Detail Bottom Sheet Modal ───────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalWrap}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closeModal} />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
          >
            {/* Handle */}
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: eraColor + '55' }]} />
            </View>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <Text style={[styles.sheetEraLabel, { color: eraColor }]}>
                  {activeEra ? (ERA_LABELS[activeEra.id] ?? activeEra.name) : ''}
                  {' · '}
                  {activeEvent?.date ?? ''}
                </Text>
                <Text style={styles.sheetEventTitle} numberOfLines={2}>
                  {activeEvent?.title ?? ''}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                onPress={closeModal}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Sheet body */}
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: insets.bottom + 28 }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Description */}
              {activeEvent?.description
                ? activeEvent.description.split('\n\n').map((para, i) => (
                    <Text key={i} style={styles.descParagraph}>{para}</Text>
                  ))
                : null}

              {/* Scripture refs */}
              {activeEvent && activeEvent.scriptureReferences.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Scripture References</Text>
                  {activeEvent.scriptureReferences.map((ref) => (
                    <Pressable
                      key={ref}
                      style={({ pressed }) => [styles.scriptureChip, pressed && styles.scriptureChipPressed]}
                      onPress={() => handleScripturePress(ref)}
                    >
                      <BookOpen size={13} color={eraColor} strokeWidth={2} />
                      <Text style={[styles.scriptureChipText, { color: eraColor }]}>{ref}</Text>
                      <ChevronRight size={13} color={eraColor} style={{ marginLeft: 'auto', opacity: 0.7 }} />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Daniel connection */}
              {activeEvent?.danielConnection && (
                <View style={styles.connectionCard}>
                  <View style={styles.connectionHeader}>
                    <Crown size={15} color={eraColor} />
                    <Text style={[styles.connectionTitle, { color: eraColor }]}>Daniel Connection</Text>
                  </View>
                  <Text style={styles.connectionText}>{activeEvent.danielConnection}</Text>
                </View>
              )}

              {/* Era events list */}
              {activeEra && activeEra.events.length > 1 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>All Events in This Era</Text>
                  {activeEra.events.map((ev) => {
                    const isActive = ev.id === activeEvent?.id;
                    return (
                      <Pressable
                        key={ev.id}
                        style={({ pressed }) => [
                          styles.eventRow,
                          isActive && { borderColor: eraColor + '60', backgroundColor: eraColor + '12' },
                          pressed && styles.eventRowPressed,
                        ]}
                        onPress={() => openEventDetail(ev, activeEra)}
                      >
                        <View style={styles.eventRowLeft}>
                          <Text style={[styles.eventRowDate, { color: eraColor }]}>{ev.date}</Text>
                          <Text style={styles.eventRowTitle} numberOfLines={1}>{ev.title}</Text>
                          <Text style={styles.eventRowSub} numberOfLines={2}>{ev.subtitle}</Text>
                        </View>
                        <ChevronRight size={16} color={eraColor} opacity={0.6} />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // dynamic paddingBottom injected inline
  },

  // Hero
  hero: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroSubtitle: {
    flex: 1,
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(37,99,235,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  exploreBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  exploreBtnText: {
    color: '#93C5FD',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  },

  // Card list
  cardList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  eraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1324',
    borderWidth: 1,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  eraImageWrap: {
    width: 108,
    height: 110,
    flexShrink: 0,
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    overflow: 'hidden',
  },
  eraImage: {
    width: '100%',
    height: '100%',
  },
  eraCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  eraBody: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 14,
    gap: 4,
  },
  eraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eraNum: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eraName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  eraDateRange: {
    color: '#64748B',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  eraSummary: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  // Quote footer
  quoteCard: {
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: '#0A1324',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.16)', // Premium blue border glow
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteSymbol: {
    color: '#2563EB',
    fontSize: 42,
    fontFamily: 'Cinzel',
    lineHeight: 44,
    alignSelf: 'flex-start',
    marginBottom: -6,
  },
  quoteText: {
    color: '#CBD5E1',
    fontFamily: 'Inter',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.4)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginTop: 4,
  },
  readBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  readBtnText: {
    color: '#93C5FD',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  sheet: {
    backgroundColor: '#0F1E30',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    height: '82%',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 24,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.1)',
  },
  sheetHeaderLeft: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  sheetEraLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sheetEventTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  // Sheet body
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  descParagraph: {
    color: '#CBD5E1',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#64748B',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scriptureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  scriptureChipPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scriptureChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
  connectionCard: {
    backgroundColor: 'rgba(232,168,56,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.2)',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  connectionTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  connectionText: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  eventRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  eventRowLeft: {
    flex: 1,
    gap: 2,
  },
  eventRowDate: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  eventRowTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
  eventRowSub: {
    color: '#64748B',
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 15,
  },
});
