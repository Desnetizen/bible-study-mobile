import { BuildingIcon } from '@/components/BuildingIcon';
import ExploreDetailModal from '@/components/ExploreDetailModal';
import GeographicOverviewCard from '@/components/GeographicOverviewCard';
import HorizontalPlaceCard from '@/components/HorizontalPlaceCard';
import ImageModal from '@/components/ImageModal';
import OutlineScrubber from '@/components/OutlineScrubber';
import ReadTabContent from '@/components/ReadTabContent';
import { extractHeadings } from '@/data/extractHeadings';
import { preExileContext } from '@/data/preExileContext';
import { preExileExplore } from '@/data/preExileExplore';
import { keyPlaces as preExilicKeyPlaces, morePlaces as preExilicMorePlaces } from '@/data/preExilicPlaces';
import { preExilicPlacesContent } from '@/data/preExilicPlacesContent';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Feather,
  Flame,
  MapPin,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ACCENT = '#D5A748';

// ─── Timeline Data ────────────────────────────────────────────────────────────

const TIMELINE_NODES = [
  {
    id: 'kingdom-divides',
    title: 'KINGDOM DIVIDES',
    date: '931 BC',
    icon: Shield,
    isSpecial: false,
  },
  {
    id: 'rehoboam',
    title: 'REHOBOAM',
    date: '931–913 BC',
    icon: Crown,
    isSpecial: false,
  },
  {
    id: 'hezekiah',
    title: 'HEZEKIAH',
    date: '715–687 BC',
    icon: Crown,
    isSpecial: false,
  },
  {
    id: 'josiah',
    title: 'JOSIAH',
    date: '640–609 BC',
    icon: BookOpen,
    isSpecial: false,
  },
  {
    id: 'jeremiah',
    title: 'JEREMIAH',
    date: '627–580 BC',
    icon: Feather,
    isSpecial: false,
  },
  {
    id: 'babylon-arrives',
    title: 'BABYLON ARRIVES',
    date: '605 BC',
    icon: BuildingIcon,
    isSpecial: true, // Red highlighted event
  },
];

// ─── Explore Cards Data ─────────────────────────────────────────────────────────

const EXPLORE_CARDS = [
  {
    id: 'political-landscape',
    title: 'POLITICAL LANDSCAPE',
    subtitle: 'Kings, wars, and alliances in Judah',
    icon: Shield,
    image: require('../assets/Places/Canaanite Lands.jpg'),
    content: preExileExplore['political-landscape'],
  },
  {
    id: 'spiritual-condition',
    title: 'SPIRITUAL CONDITION',
    subtitle: 'Faithfulness, idolatry, and reform',
    icon: Flame,
    image: require('../assets/Aesthetics/isreal-Idolotary.png'),
    content: preExileExplore['spiritual-condition'],
  },
  {
    id: 'key-figures',
    title: 'KEY FIGURES',
    subtitle: 'The kings, prophets, and leaders',
    icon: Users,
    image: require('../assets/Aesthetics/Bible.jpg'),
    content: preExileExplore['key-figures'],
  },
  {
    id: 'historical-context',
    title: 'HISTORICAL CONTEXT',
    subtitle: "Events that shaped Judah's final centuries",
    icon: Compass,
    image: require('../assets/Places/Ancient Jerusalem.jpg'),
    content: preExileExplore['historical-context'],
  },
];

const PLACE_CARDS = [...preExilicKeyPlaces, ...preExilicMorePlaces].map((place) => ({
  id: place.id,
  title: place.name.toUpperCase(),
  subtitle: place.role,
  image: place.image,
  content: (preExilicPlacesContent as Record<string, string>)[place.id],
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PreExilicDetailScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'read'>('overview');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [exploreModalVisible, setExploreModalVisible] = useState(false);
  const [exploreModalIndex, setExploreModalIndex] = useState(0);
  const [placesModalVisible, setPlacesModalVisible] = useState(false);
  const [placesModalIndex, setPlacesModalIndex] = useState(0);

  // Animations
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(20), []);

  const scrollY = useMemo(() => new Animated.Value(0), []);
  const scrollViewHeightRef = useRef(0);
  const scrollViewContentHeightRef = useRef(0);
  const [rootOffset, setRootOffset] = useState(0);
  const sectionPositions = useRef<Record<string, number>>({});
  const headings = useMemo(() => extractHeadings(preExileContext), []);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Solid header background to prevent text overlapping status bar */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#07111F',
          opacity: scrollY.interpolate({
            inputRange: [50, 150],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          zIndex: 100,
        }}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onLayout={(e) => {
          scrollViewHeightRef.current = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(w, h) => {
          scrollViewContentHeightRef.current = h;
        }}
      >
        {/* ── Hero Header Banner ────────────────────────────────────────── */}
        <ImageBackground
          source={require('../assets/Places/Ancient Jerusalem.jpg')}
          style={[styles.hero, { paddingTop: insets.top + 10 }]}
          contentFit="cover"
        >
          {/* Multi-layered premium gradients for depth */}
          <LinearGradient
            colors={['rgba(7, 17, 31, 0.4)', 'rgba(7, 17, 31, 0.8)', '#07111F']}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(213, 167, 72, 0.15)', 'rgba(7, 17, 31, 0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Floating Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={ACCENT} />
          </Pressable>

          {/* Hero Content */}
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.heroEyebrow}>PRE-EXILIC JUDAH</Text>
            <Text style={styles.heroTitle}>THE FALL OF JUDAH TO BABYLON</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>931–605 BC</Text>
            </View>
          </Animated.View>
        </ImageBackground>

        {/* ── Sub-Navigation Segmented Bar ────────────────────────────── */}
        <View style={styles.subNavBar}>
          <Pressable
            onPress={() => setActiveTab('overview')}
            style={styles.subNavTab}
          >
            <Text style={[styles.subNavText, activeTab === 'overview' && styles.activeSubNavText]}>Overview</Text>
            {activeTab === 'overview' && <View style={styles.activeTabIndicator} />}
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('places')}
            style={styles.subNavTab}
          >
            <Text style={[styles.subNavText, activeTab === 'places' && styles.activeSubNavText]}>Places</Text>
            {activeTab === 'places' && <View style={styles.activeTabIndicator} />}
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('read')}
            style={styles.subNavTab}
          >
            <Text style={[styles.subNavText, activeTab === 'read' && styles.activeSubNavText]}>Read</Text>
            {activeTab === 'read' && <View style={styles.activeTabIndicator} />}
          </Pressable>
        </View>

        {/* ── Tab Content Views ────────────────────────────────────────── */}

        {activeTab === 'overview' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Grid of Key Facts */}
            <View style={styles.factsWrapper}>
              <View style={styles.factsGrid}>
                {/* Fact 1: Capital */}
                <View style={styles.factCard}>
                  <MapPin color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>CAPITAL</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Jerusalem</Text>
                </View>

                {/* Fact 2: Dynasty */}
                <View style={styles.factCard}>
                  <Crown color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>DYNASTY</Text>
                  <Text style={styles.factValue} numberOfLines={2}>House of David</Text>
                </View>

                {/* Fact 3: Key Prophets */}
                <View style={styles.factCard}>
                  <Feather color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>KEY PROPHETS</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Isaiah · Jeremiah</Text>
                </View>

                {/* Fact 4: Status */}
                <View style={styles.factCard}>
                  <ShieldAlert color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>STATUS</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Approaching Exile</Text>
                </View>
              </View>
            </View>

            {/* Timeline Section */}
            <View style={styles.sectionHeaderRow}>
              <Clock size={16} color={ACCENT} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>TIMELINE</Text>
            </View>

            <ScrollView
              horizontal
              style={styles.timelineScroll}
              contentContainerStyle={styles.timelineContent}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.timelineTrackLine} />

              {TIMELINE_NODES.map((node) => {
                const IconComponent = node.icon;
                const strokeColor = node.isSpecial ? '#EF4444' : ACCENT;
                const bgColor = node.isSpecial ? 'rgba(239, 68, 68, 0.15)' : '#07111F';

                return (
                  <View key={node.id} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.nodeCircle,
                        { borderColor: strokeColor, backgroundColor: bgColor },
                      ]}
                    >
                      <IconComponent color={strokeColor} size={18} />
                    </View>

                    <Text style={[styles.nodeTitle, node.isSpecial && { color: '#EF4444' }]}>
                      {node.title}
                    </Text>
                    <Text style={styles.nodeDate}>{node.date}</Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Explore Section */}
            <View style={styles.sectionHeaderRow}>
              <Compass size={16} color={ACCENT} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>EXPLORE PRE-EXILIC JUDAH</Text>
            </View>

            <View style={styles.exploreGrid}>
              {EXPLORE_CARDS.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Pressable
                    key={card.id}
                    style={({ pressed }) => [
                      styles.exploreCard,
                      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                    ]}
                    onPress={() => {
                      setExploreModalIndex(index);
                      setExploreModalVisible(true);
                    }}
                  >
                    <ImageBackground
                      source={card.image}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]}
                    />
                    <LinearGradient
                      colors={['rgba(7, 17, 31, 0.35)', 'rgba(7, 17, 31, 0.92)']}
                      style={[StyleSheet.absoluteFillObject, styles.exploreCardGradient]}
                    />

                    <View style={styles.exploreCardContent}>
                      <IconComponent color={ACCENT} size={18} style={styles.exploreCardIcon} />
                      <Text style={styles.exploreCardTitle}>{card.title}</Text>
                      <Text style={styles.exploreCardSubtitle}>{card.subtitle}</Text>
                    </View>

                    <View style={styles.chevronWrap}>
                      <ChevronRight size={16} color={ACCENT} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {activeTab === 'places' && (
          <Animated.View style={[styles.tabContentContainer, { opacity: fadeAnim }]}>
            {/* Key Places Horizontal Scroll */}
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>KEY PLACES OF PRE-EXILIC JUDAH</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.placesScrollContent}
                scrollEventThrottle={16}
              >
                {preExilicKeyPlaces.map((place, index) => (
                  <HorizontalPlaceCard key={place.id} place={place} accentColor={ACCENT} onPress={() => {
                    setPlacesModalIndex(index);
                    setPlacesModalVisible(true);
                  }} />
                ))}
              </ScrollView>
            </View>

            {/* Map Without Pins */}
            <Pressable
              style={({ pressed }) => [styles.mapContainer, pressed && { opacity: 0.92 }]}
              onPress={() => setMapModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Expand map"
            >
              <ImageBackground
                source={require('../assets/Maps/pre_Exile.png')}
                style={styles.mapVisual}
                contentFit="cover"
              >
                <LinearGradient
                  colors={['rgba(7, 17, 31, 0.2)', 'rgba(7, 17, 31, 0.82)']}
                  style={StyleSheet.absoluteFillObject}
                />
              </ImageBackground>
              <View style={styles.expandHint}>
                <Text style={styles.expandHintText}>Tap to expand</Text>
              </View>
            </Pressable>

            {/* Geographic Overview with Side Image */}
            <GeographicOverviewCard
              title="Geographic Overview"
              description="Pre-Exilic Judah was a rugged, mountainous kingdom bordered by the Dead Sea to the east and Philistia to the west. Jerusalem, situated safely in the Judean hills, served as its highly fortified royal capital and spiritual heart."
              image={require('../assets/Places/Ancient Jerusalem.jpg')}
              imageCaption="Judean hill country\nFortified capital"
              accentColor={ACCENT}
            />

            {/* More Places to Explore Horizontal Scroll */}
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>MORE PLACES TO EXPLORE</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.placesScrollContent}
                scrollEventThrottle={16}
              >
                {preExilicMorePlaces.map((place, index) => (
                  <HorizontalPlaceCard key={place.id} place={place} accentColor={ACCENT} onPress={() => {
                    setPlacesModalIndex(preExilicKeyPlaces.length + index);
                    setPlacesModalVisible(true);
                  }} />
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {activeTab === 'read' && (
          <ReadTabContent
            contextData={preExileContext}
            accentColor={ACCENT}
            headerEyebrow="PRE-EXILIC JUDAH"
            scrollRef={scrollRef}
            scrollY={scrollY}
            scrollViewHeightRef={scrollViewHeightRef}
            scrollViewContentHeightRef={scrollViewContentHeightRef}
            sectionPositions={sectionPositions}
            rootOffset={rootOffset}
            setRootOffset={setRootOffset}
          />
        )}
      </ScrollView>
      {activeTab === 'read' && rootOffset > 0 && (
        <OutlineScrubber
          headings={headings}
          accentColor={ACCENT}
          scrollRef={scrollRef}
          scrollY={scrollY}
          scrollViewHeightRef={scrollViewHeightRef}
          scrollViewContentHeightRef={scrollViewContentHeightRef}
          rootOffset={rootOffset}
          sectionPositions={sectionPositions}
        />
      )}
      <ImageModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        images={[require('../assets/Maps/pre_Exile.png')]}
        accentColor={ACCENT}
      />
      <ExploreDetailModal
        visible={exploreModalVisible}
        onClose={() => setExploreModalVisible(false)}
        cards={EXPLORE_CARDS}
        initialIndex={exploreModalIndex}
        accentColor={ACCENT}
      />
      <ExploreDetailModal
        visible={placesModalVisible}
        onClose={() => setPlacesModalVisible(false)}
        cards={PLACE_CARDS}
        initialIndex={placesModalIndex}
        accentColor={ACCENT}
      />
    </View>
  );
}

// ─── Main Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  scroll: {
    flex: 1,
  },
  hero: {
    width: '100%',
    minHeight: 280,
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 54,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 17, 31, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(213, 167, 72, 0.2)',
  },
  heroContent: {
    marginTop: 60,
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  badgeContainer: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  badgeText: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },

  // Key Facts Row
  factsWrapper: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  factsGrid: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  factCard: {
    flex: 1,
    backgroundColor: '#0C1420',
    borderWidth: 1.2,
    borderColor: 'rgba(213, 167, 72, 0.18)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  factLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  factValue: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sections
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitleText: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // Timeline
  timelineScroll: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  timelineContent: {
    paddingRight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  timelineTrackLine: {
    position: 'absolute',
    top: 22,
    left: 50,
    right: 50,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(213, 167, 72, 0.35)',
    zIndex: 1,
  },
  timelineItem: {
    width: 100,
    alignItems: 'center',
  },
  nodeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    lineHeight: 12,
  },
  nodeDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },

  // Explore Grid
  exploreGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exploreCard: {
    width: (width - 44) / 2, // 2 column cards
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(213, 167, 72, 0.15)',
  },
  exploreCardGradient: {
    borderRadius: 12,
  },
  exploreCardContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 2,
  },
  exploreCardIcon: {
    marginBottom: 4,
  },
  exploreCardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exploreCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 12,
  },
  chevronWrap: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },

  // Sub-Navigation bar
  subNavBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-around',
  },
  subNavTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'relative',
    alignItems: 'center',
  },
  subNavText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeSubNavText: {
    color: ACCENT,
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: ACCENT,
    borderRadius: 1,
  },

  // Tab Content Container
  tabContentContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 14,
  },

  // Map Content
  mapContainer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(213, 167, 72, 0.2)',
  },
  mapVisual: {
    flex: 1,
    position: 'relative',
  },
  expandHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(7, 17, 31, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expandHintText: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
  },
  placesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
});
