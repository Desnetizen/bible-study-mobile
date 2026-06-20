import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { ImageBackground } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Crown,
  Feather,
  ShieldAlert,
  Users,
  Compass,
  ChevronRight,
  Clock,
  Shield,
  MapPin,
  BookOpen,
} from 'lucide-react-native';
import { CastleIcon } from '@/components/CastleIcon';
import ReadTabContent from '@/components/ReadTabContent';
import { hexToRgba } from '@/lib/colors';
import { medoPersianContext } from '@/Data/medoPersianContext';

const { width } = Dimensions.get('window');
const ACCENT = '#4ECDC4';

// ─── Timeline Data ────────────────────────────────────────────────────────────

const TIMELINE_NODES = [
  { id: 'cyrus-conquers', title: 'CYRUS CONQUERS BABYLON', date: '539 BC', icon: Shield, isSpecial: false },
  { id: 'edict-of-cyrus', title: 'EDICT OF CYRUS', date: '538 BC', icon: BookOpen, isSpecial: false },
  { id: 'darius-reigns', title: 'DARIUS I REIGNS', date: '522 BC', icon: Crown, isSpecial: false },
  { id: 'temple-rebuilt', title: 'TEMPLE REBUILT', date: '515 BC', icon: CastleIcon, isSpecial: false },
  { id: 'ezra-returns', title: 'EZRA RETURNS', date: '458 BC', icon: Feather, isSpecial: false },
  { id: 'alexander-arrives', title: 'ALEXANDER ARRIVES', date: '331 BC', icon: ShieldAlert, isSpecial: true },
];

// ─── Explore Cards Data ─────────────────────────────────────────────────────────

const EXPLORE_CARDS = [
  { id: 'daniels-visions', title: "DANIEL'S VISIONS", subtitle: 'Five visions spanning the Persian century', icon: BookOpen, image: require('../assets/Places/Ancient Susa.png') },
  { id: 'cyrus-named-prophecy', title: 'CYRUS: THE NAMED PROPHECY', subtitle: 'A king named 150 years before his birth', icon: Feather, image: require('../assets/Places/Ancient Susa.png') },
  { id: 'extrabiblical-evidence', title: 'EXTRABIBLICAL EVIDENCE', subtitle: 'Confirmation from Persian records', icon: Compass, image: require('../assets/Places/Ancient Susa.png') },
  { id: 'return-grace', title: 'THE RETURN: GRACE THROUGH AN ALIEN EMPIRE', subtitle: 'Why a pagan king set Israel free', icon: Users, image: require('../assets/Places/Ancient Susa.png') },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MedoPersianDetailScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'read'>('overview');

  // Animations
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
            onPress={() => setActiveTab('map')}
            style={styles.subNavTab}
          >
            <Text style={[styles.subNavText, activeTab === 'map' && styles.activeSubNavText]}>Map</Text>
            {activeTab === 'map' && <View style={styles.activeTabIndicator} />}
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
              {EXPLORE_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <Pressable
                    key={card.id}
                    style={({ pressed }) => [
                      styles.exploreCard,
                      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                    ]}
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

        {activeTab === 'map' && (
          <Animated.View style={[styles.tabContentContainer, { opacity: fadeAnim }]}>
            <View style={styles.mapContainer}>
              <ImageBackground
                source={require('../assets/Places/Ancient Susa.png')}
                style={styles.mapVisual}
                contentFit="cover"
              >
                <LinearGradient
                  colors={['rgba(7, 17, 31, 0.2)', 'rgba(7, 17, 31, 0.82)']}
                  style={StyleSheet.absoluteFillObject}
                />
                {/* Susa Pin */}
                <View style={[styles.mapPin, { top: '48%', left: '54%' }]}>
                  <View style={styles.pulseContainer}>
                    <View style={styles.pulsePin} />
                    <MapPin color={ACCENT} size={20} />
                  </View>
                  <Text style={styles.mapPinLabel}>Susa</Text>
                </View>
                {/* Persepolis Pin */}
                <View style={[styles.mapPin, { top: '62%', left: '68%' }]}>
                  <View style={styles.pulseContainer}>
                    <MapPin color="#EF4444" size={16} />
                  </View>
                  <Text style={styles.mapPinLabel}>Persepolis</Text>
                </View>
                {/* Jerusalem Pin */}
                <View style={[styles.mapPin, { top: '58%', left: '20%' }]}>
                  <View style={styles.pulseContainer}>
                    <MapPin color="#EF4444" size={16} />
                  </View>
                  <Text style={styles.mapPinLabel}>Jerusalem</Text>
                </View>
                {/* Babylon Pin */}
                <View style={[styles.mapPin, { top: '42%', left: '36%' }]}>
                  <View style={styles.pulseContainer}>
                    <MapPin color="#EF4444" size={16} />
                  </View>
                  <Text style={styles.mapPinLabel}>Babylon</Text>
                </View>
              </ImageBackground>
            </View>
            <View style={styles.mapInfoCard}>
              <Text style={styles.mapInfoTitle}>Geographic Overview</Text>
              <Text style={styles.mapInfoText}>
                The Persian heartland stretched east of Babylon through Susa and Persepolis, linking royal power with the roads of return. From this imperial center, decrees traveled westward and opened the way for Jewish exiles to journey back to Jerusalem.
              </Text>
            </View>
          </Animated.View>
        )}

        {activeTab === 'read' && (
          <ReadTabContent
            contextData={medoPersianContext}
            accentColor={ACCENT}
            headerEyebrow="THE MEDO-PERSIAN EMPIRE"
            scrollRef={scrollRef}
          />
        )}
      </ScrollView>
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
    borderColor: hexToRgba(ACCENT, 0.2),
  },
  mapVisual: {
    flex: 1,
    position: 'relative',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulsePin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: hexToRgba(ACCENT, 0.3),
    borderWidth: 1,
    borderColor: hexToRgba(ACCENT, 0.5),
  },
  mapPinLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: 'rgba(7, 17, 31, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: hexToRgba(ACCENT, 0.3),
  },
  mapInfoCard: {
    backgroundColor: '#0C1420',
    borderWidth: 1.2,
    borderColor: hexToRgba(ACCENT, 0.18),
    borderRadius: 10,
    padding: 16,
    gap: 8,
  },
  mapInfoTitle: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mapInfoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
  },
});
