import { BuildingIcon } from '@/components/BuildingIcon';
import OutlineScrubber from '@/components/OutlineScrubber';
import ReadTabContent from '@/components/ReadTabContent';
import { extractHeadings } from '@/data/extractHeadings';
import { medoPersianContext } from '@/data/medoPersianContext';
import { keyPlaces, morePlaces } from '@/data/medoPersianPlaces';
import GeographicOverviewCard from '@/components/GeographicOverviewCard';
import HorizontalPlaceCard from '@/components/HorizontalPlaceCard';
import ImageModal from '@/components/ImageModal';
import { hexToRgba } from '@/lib/colors';
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
const ACCENT = '#4ECDC4';

// ─── Timeline Data ────────────────────────────────────────────────────────────

const TIMELINE_NODES = [
  { id: 'cyrus-conquers', title: 'CYRUS CONQUERS BABYLON', date: '539 BC', icon: Shield, isSpecial: false },
  { id: 'edict-of-cyrus', title: 'EDICT OF CYRUS', date: '538 BC', icon: BookOpen, isSpecial: false },
  { id: 'darius-reigns', title: 'DARIUS I REIGNS', date: '522 BC', icon: Crown, isSpecial: false },
  { id: 'temple-rebuilt', title: 'TEMPLE REBUILT', date: '515 BC', icon: BuildingIcon, isSpecial: false },
  { id: 'ezra-returns', title: 'EZRA RETURNS', date: '458 BC', icon: Feather, isSpecial: false },
  { id: 'alexander-arrives', title: 'ALEXANDER ARRIVES', date: '331 BC', icon: ShieldAlert, isSpecial: true },
];

// ─── Explore Cards Data ─────────────────────────────────────────────────────────

const EXPLORE_CARDS = [
  { id: 'daniels-visions', title: "DANIEL'S VISIONS", subtitle: 'Five visions spanning the Persian century', icon: BookOpen, image: require('../assets/Aesthetics/Daniel-Visions.png') },
  { id: 'cyrus-named-prophecy', title: 'CYRUS: THE NAMED PROPHECY', subtitle: 'A king named 150 years before his birth', icon: Feather, image: require('../assets/Places/Ancient Susa.png') },
  { id: 'extrabiblical-evidence', title: 'EXTRABIBLICAL EVIDENCE', subtitle: 'Confirmation from Persian records', icon: Compass, image: require('../assets/Places/Ancient Susa.png') },
  { id: 'return-grace', title: 'THE RETURN: GRACE THROUGH AN ALIEN EMPIRE', subtitle: 'Why a pagan king set Israel free', icon: Users, image: require('../assets/Places/Ancient Susa.png') },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MedoPersianDetailScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'places' | 'read'>('overview');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [exploreModalVisible, setExploreModalVisible] = useState(false);
  const [exploreModalIndex, setExploreModalIndex] = useState(0);
  const [placesModalVisible, setPlacesModalVisible] = useState(false);
  const [placesModalIndex, setPlacesModalIndex] = useState(0);

  // Animations
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewHeightRef = useRef(0);
  const scrollViewContentHeightRef = useRef(0);
  const [rootOffset, setRootOffset] = useState(0);
  const sectionPositions = useRef<Record<string, number>>({});
  const headings = useMemo(() => extractHeadings(medoPersianContext), []);

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
          source={require('../assets/Places/Ancient Susa.png')}
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
            colors={[hexToRgba(ACCENT, 0.15), 'rgba(7, 17, 31, 0)']}
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
            <Text style={styles.heroEyebrow}>THE MEDO-PERSIAN EMPIRE</Text>
            <Text style={styles.heroTitle}>The Silver Kingdom</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>539–331 BC</Text>
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
                  <Text style={styles.factValue} numberOfLines={2}>Susa · Persepolis</Text>
                </View>

                {/* Fact 2: Dynasty */}
                <View style={styles.factCard}>
                  <Crown color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>RULER</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Cyrus the Great</Text>
                </View>

                {/* Fact 3: Key Prophets */}
                <View style={styles.factCard}>
                  <Feather color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>KEY PROPHETS</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Daniel · Ezra</Text>
                </View>

                {/* Fact 4: Status */}
                <View style={styles.factCard}>
                  <Compass color={ACCENT} size={16} />
                  <Text style={styles.factLabel}>STATUS</Text>
                  <Text style={styles.factValue} numberOfLines={2}>Restoration Era</Text>
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
              <Text style={styles.sectionTitleText}>EXPLORE THE MEDO-PERSIAN EMPIRE</Text>
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
                <Text style={styles.sectionTitleText}>KEY PLACES OF THE MEDO-PERSIAN EMPIRE</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.placesScrollContent}
                scrollEventThrottle={16}
              >
                {keyPlaces.map((place, index) => (
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
                source={require('../assets/Maps/medo-persian.jpg')}
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
              description="The Persian heartland stretched east of Babylon through Susa and Persepolis, linking royal power with the roads of return. From this imperial center, decrees traveled westward and opened the way for Jewish exiles to journey back to Jerusalem."
              image={require('../assets/Places/Ancient Susa.png')}
              imageCaption="Royal Road\nImperial highways\nconnected the empire"
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
                {morePlaces.map((place, index) => (
                  <HorizontalPlaceCard key={place.id} place={place} accentColor={ACCENT} onPress={() => {
                    setPlacesModalIndex(keyPlaces.length + index);
                    setPlacesModalVisible(true);
                  }} />
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {activeTab === 'read' && (
          <ReadTabContent
            contextData={medoPersianContext}
            accentColor={ACCENT}
            headerEyebrow="THE MEDO-PERSIAN EMPIRE"
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
        images={[require('../assets/Maps/medo-persian.jpg')]}
        accentColor={ACCENT}
      />
      <ImageModal
        visible={exploreModalVisible}
        onClose={() => setExploreModalVisible(false)}
        images={EXPLORE_CARDS.map((c) => c.image)}
        initialIndex={exploreModalIndex}
        accentColor={ACCENT}
      />
      <ImageModal
        visible={placesModalVisible}
        onClose={() => setPlacesModalVisible(false)}
        images={[...keyPlaces.map((p) => p.image), ...morePlaces.map((p) => p.image)]}
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
    borderColor: hexToRgba(ACCENT, 0.2),
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
    borderColor: hexToRgba(ACCENT, 0.18),
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
    borderColor: hexToRgba(ACCENT, 0.35),
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
    borderColor: hexToRgba(ACCENT, 0.15),
  },
  exploreCardGradient: {
    borderRadius: 12,
  },
  exploreCardContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    paddingRight: 22,
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

  // Places Horizontal Scroll
  placesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },

  // Map Content
  mapContainer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: hexToRgba(ACCENT, 0.2),
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
});
