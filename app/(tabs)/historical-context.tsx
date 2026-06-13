import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { ImageBackground } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Play, ChevronRight, X, BookOpen, Crown } from 'lucide-react-native';
import { ImageSkeleton, TextSkeleton } from '../../components/ui/Skeleton';
import { HISTORICAL_ERAS, Era, TimelineEvent } from '../../Data/historicalContextData';

const READ_EVENTS_KEY = 'bible-connection:historical-read-events';
const LAST_READ_EVENT_KEY = 'bible-connection:historical-last-read';

function parseBibleReference(ref: string) {
  const normalized = ref.trim().replace(/–|—/g, '-');
  const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+))?/);

  if (!match) {
    return null;
  }

  return {
    book: match[1].trim(),
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : null,
  };
}

export default function HistoricalContextScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Progress states
  const [readEvents, setReadEvents] = useState<string[]>([]);
  const [lastReadEvent, setLastReadEvent] = useState<{ eraId: string; eraName: string; date: string } | null>(null);
  
  // Interactive UI states
  const [activeEraId, setActiveEraId] = useState('pre-exilic');

  // Local state for modal visibility and contents to allow exit animation
  const [modalVisible, setModalVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [activeEra, setActiveEra] = useState<Era | null>(null);

  // Y-coordinates of era dividers to enable scroll-to
  const eraPositions = useRef<Record<string, number>>({});
  
  // Custom animations for bottom sheet
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(800)).current;

  // Hero image loading state
  const [heroLoaded, setHeroLoaded] = useState(false);
  const onHeroLoad = useCallback(() => setHeroLoaded(true), []);

  // Load progress from AsyncStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storedRead = await AsyncStorage.getItem(READ_EVENTS_KEY);
        const storedLast = await AsyncStorage.getItem(LAST_READ_EVENT_KEY);
        
        if (storedRead) {
          setReadEvents(JSON.parse(storedRead));
        }
        if (storedLast) {
          setLastReadEvent(JSON.parse(storedLast));
        }
      } catch (error) {
        console.warn('Failed to load historical progress:', error);
      }
    };
    loadProgress();
  }, []);

  // Animate bottom sheet open
  useEffect(() => {
    if (modalVisible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(800);
      
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.23, 1, 0.32, 1), // custom ease-out
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.32, 0.72, 0, 1), // iOS-like drawer curve
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [modalVisible, backdropOpacity, sheetTranslateY]);

  // Handle scroll to update active era tab
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    // Add offset so tab highlights slightly before divider reaches the very top
    const offset = y + 120;
    
    let currentEraId = HISTORICAL_ERAS[0].id;
    for (const era of HISTORICAL_ERAS) {
      const eraY = eraPositions.current[era.id];
      if (eraY !== undefined && offset >= eraY) {
        currentEraId = era.id;
      }
    }
    
    if (currentEraId !== activeEraId) {
      setActiveEraId(currentEraId);
    }
  };

  // Scroll to era section
  const handleEraPress = (eraId: string) => {
    const y = eraPositions.current[eraId];
    if (y !== undefined) {
      // Subtract sticky header height (approx 50) and a bit of margin
      scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 48), animated: true });
      setActiveEraId(eraId);
      
      // Trigger light haptic
      try {
        void Haptics.selectionAsync();
      } catch {}
    }
  };

  const handleBeginJourney = () => {
    const firstEraId = HISTORICAL_ERAS[0]?.id;
    if (!firstEraId) return;

    handleEraPress(firstEraId);
  };

  // Tapping a timeline event opens detail and marks as read
  const handleEventPress = async (event: TimelineEvent, era: Era) => {
    setActiveEvent(event);
    setActiveEra(era);
    setModalVisible(true);
    
    // Save read status
    let nextReadEvents = readEvents;
    if (!readEvents.includes(event.id)) {
      nextReadEvents = [...readEvents, event.id];
      setReadEvents(nextReadEvents);
      try {
        await AsyncStorage.setItem(READ_EVENTS_KEY, JSON.stringify(nextReadEvents));
      } catch (error) {
        console.warn('Failed to save read events:', error);
      }
    }
    
    // Save last read event details
    const lastRead = {
      eraId: era.id,
      eraName: era.name,
      date: event.date,
    };
    setLastReadEvent(lastRead);
    try {
      await AsyncStorage.setItem(LAST_READ_EVENT_KEY, JSON.stringify(lastRead));
    } catch (error) {
      console.warn('Failed to save last read event:', error);
    }

    // Trigger haptics
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  // Handle slide-down exit animation before closing Modal
  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 800,
        duration: 250,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
      setActiveEvent(null);
      setActiveEra(null);
    });
  };

  // Navigate to scripture reference in Bible tab
  const handleScripturePress = (ref: string) => {
    const parsed = parseBibleReference(ref);
    if (!parsed) return;
    
    // Close modal instantly to avoid transition lag before navigation
    setModalVisible(false);
    setActiveEvent(null);
    setActiveEra(null);

    router.push({
      pathname: '/bible',
      params: {
        book: parsed.book,
        chapter: String(parsed.chapter),
        ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
      },
    });
  };

  const showContinue = !!lastReadEvent;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={showContinue ? [2] : [1]}
      >
        {/* 1. Hero Section */}
        <ImageBackground
          source={require('../../assets/images/historical_context_hero.png')}
          style={styles.heroBackground}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
          onLoad={onHeroLoad}
        >
          {/* Skeleton overlay while hero image loads */}
          {!heroLoaded && (
            <View style={styles.heroSkeletonWrap}>
              <ImageSkeleton
                width="100%"
                height="100%"
                borderRadius={0}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={styles.heroSkeletonContent}>
                <TextSkeleton width={120} height={10} />
                <TextSkeleton width={200} height={26} />
                <TextSkeleton width="80%" height={12} />
                <TextSkeleton width="60%" height={12} />
              </View>
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={[styles.heroContent, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.heroEyebrow}>HISTORICAL CONTEXT</Text>
            <Text style={styles.heroTitle}>The World of Daniel</Text>
            <Text style={styles.heroSubtitle}>
              From the divided kingdom to the coming of Christ — the full sweep of history behind {"Daniel's"} prophecies.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Begin historical context journey"
              style={({ pressed }) => [styles.beginButton, pressed && styles.beginButtonPressed]}
              onPress={handleBeginJourney}
            >
              <View style={styles.beginIconCircle}>
                <Play size={11} color="#0D0D0D" fill="#0D0D0D" />
              </View>
              <Text style={styles.beginButtonText}>Begin Journey</Text>
            </Pressable>
          </View>
        </ImageBackground>

        {/* 2. Continue Banner */}
        {showContinue && lastReadEvent && (
          <View style={styles.continueWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.continueCard,
                pressed && styles.continueCardPressed
              ]}
              onPress={() => handleEraPress(lastReadEvent.eraId)}
            >
              <View style={styles.continueLeft}>
                <View style={styles.playIconCircle}>
                  <Play size={12} color="#C9A84C" fill="#C9A84C" />
                </View>
                <View style={styles.continueTextContainer}>
                  <Text style={styles.continueLabel}>Continue where you left off</Text>
                  <Text style={styles.continueEra}>
                    {lastReadEvent.eraName} · {lastReadEvent.date}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#C9A84C" />
            </Pressable>
          </View>
        )}

        {/* 3. Sticky Era Navigation Bar */}
        <View style={styles.stickyNavBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickyNavBar}
          >
            {HISTORICAL_ERAS.map((era) => {
              const isActive = activeEraId === era.id;
              return (
                <Pressable
                  key={era.id}
                  style={({ pressed }) => [
                    styles.navTab,
                    isActive && styles.navTabActive,
                    pressed && styles.navTabPressed
                  ]}
                  onPress={() => handleEraPress(era.id)}
                >
                  <Text style={[styles.navTabText, isActive && styles.navTabTextActive]}>
                    {era.name.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Timeline list */}
        <View style={styles.timelineContainer}>
          {HISTORICAL_ERAS.map((era) => (
            <View
              key={era.id}
              style={styles.eraSection}
              onLayout={(e) => {
                eraPositions.current[era.id] = e.nativeEvent.layout.y;
              }}
            >
              {/* Era Divider separator */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>
                  {era.name} Era · {era.dateRange}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Era Events Wrapper with Left Line */}
              <View style={styles.eraEventsContainer}>
                {/* Continuous line for this era */}
                <View style={styles.verticalTimelineLine} />
                
                {era.events.map((event) => {
                  const isRead = readEvents.includes(event.id);
                  return (
                    <Pressable
                      key={event.id}
                      style={({ pressed }) => [
                        styles.eventRow,
                        pressed && styles.eventRowPressed
                      ]}
                      onPress={() => handleEventPress(event, era)}
                    >
                      {/* Left Circle Node aligned with line */}
                      <View style={styles.nodeColumn}>
                        <View style={[styles.circleNode, isRead && styles.circleNodeFilled]} />
                      </View>

                      {/* Event details */}
                      <View style={styles.eventContent}>
                        <View style={styles.eventTitleRow}>
                          <Text style={styles.eventDate}>{event.date}</Text>
                          <Text style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                        </View>
                        <Text style={styles.eventSubtitle} numberOfLines={2}>
                          {event.subtitle}
                        </Text>
                      </View>

                      {/* Right Chevron */}
                      <ChevronRight size={16} color="#C9A84C" style={styles.eventChevron} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 5. Custom Slide-up Detail Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
            <Pressable
              style={styles.backdropDismiss}
              onPress={handleCloseModal}
            />
          </Animated.View>

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Header section */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderTitles}>
                <Text style={styles.sheetEraTitle}>
                  {activeEra?.name.toUpperCase()} · {activeEvent?.date}
                </Text>
                <Text style={styles.sheetEventTitle}>{activeEvent?.title}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetCloseButton,
                  pressed && styles.sheetCloseButtonPressed
                ]}
                onPress={handleCloseModal}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Scrollable details */}
            <ScrollView
              style={styles.sheetScrollView}
              contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: insets.bottom + 24 }]}
              showsVerticalScrollIndicator={true}
            >
              {/* Theological description text (paragraphs separated by \n\n) */}
              <View style={styles.descriptionContainer}>
                {activeEvent?.description ? activeEvent.description.split('\n\n').map((paragraph, idx) => (
                  <Text key={idx} style={styles.descriptionParagraph}>
                    {paragraph}
                  </Text>
                )) : null}
              </View>

              {/* Scripture References */}
              {activeEvent && activeEvent.scriptureReferences.length > 0 && (
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>Scripture References</Text>
                  <View style={styles.scriptureList}>
                    {activeEvent.scriptureReferences.map((ref) => (
                      <Pressable
                        key={ref}
                        style={({ pressed }) => [
                          styles.scriptureCard,
                          pressed && styles.scriptureCardPressed
                        ]}
                        onPress={() => handleScripturePress(ref)}
                      >
                        <BookOpen size={14} color="#C9A84C" />
                        <Text style={styles.scriptureText}>{ref}</Text>
                        <ChevronRight size={14} color="#C9A84C" style={{ marginLeft: 'auto', opacity: 0.7 }} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Daniel Connection Section */}
              {activeEvent && activeEvent.danielConnection && (
                <View style={styles.connectionCard}>
                  <View style={styles.connectionHeader}>
                    <Crown size={16} color="#C9A84C" />
                    <Text style={styles.connectionTitle}>Daniel Connection</Text>
                  </View>
                  <Text style={styles.connectionText}>
                    {activeEvent.danielConnection}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  
  // 1. Hero Section
  heroBackground: {
    width: '100%',
    height: 240,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.75)', // dark overlay
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroEyebrow: {
    color: '#C9A84C', // Gold color
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel', // matching characters.jsx serif/bold font
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#9A9A8A', // text secondary
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
  },
  beginButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#C9A84C',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  beginButtonPressed: {
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    transform: [{ scale: 0.98 }],
  },
  beginIconCircle: {
    alignItems: 'center',
    backgroundColor: '#C9A84C',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  beginButtonText: {
    color: '#F6E7B0',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },

  // 2. Continue Banner
  continueWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#0D0D0D',
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A14', // card background
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)', // border at 40% opacity
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 168, 76, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  continueLabel: {
    color: '#9A9A8A',
    fontFamily: 'Inter',
    fontSize: 10,
  },
  continueEra: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },

  // 3. Sticky Era Navigation Bar
  stickyNavBarWrapper: {
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.15)',
  },
  stickyNavBar: {
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    gap: 20,
  },
  navTab: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabActive: {
    borderBottomColor: '#C9A84C', // Gold active underline
  },
  navTabText: {
    color: '#9A9A8A', // muted secondary
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  navTabTextActive: {
    color: '#C9A84C', // active gold
    fontWeight: '700',
  },

  // 4. Timeline
  timelineContainer: {
    paddingTop: 16,
  },
  eraSection: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.25)',
  },
  dividerText: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
  eraEventsContainer: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  verticalTimelineLine: {
    position: 'absolute',
    left: 27, // aligns perfectly with node circles
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: '#C9A84C',
    opacity: 0.5,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 64,
  },
  nodeColumn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // ensure circles draw above the vertical line
  },
  circleNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#C9A84C',
    backgroundColor: '#0D0D0D', // blend in background
  },
  circleNodeFilled: {
    backgroundColor: '#C9A84C', // filled gold when read
  },
  eventContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
    gap: 4,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  eventDate: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'bold',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  eventSubtitle: {
    color: '#9A9A8A',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
  },
  eventChevron: {
    opacity: 0.5,
  },

  // 5. Custom Bottom Sheet Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdropDismiss: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#1A1A14', // card background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)', // gold border 40%
    height: '80%',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.3)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.15)',
  },
  sheetHeaderTitles: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  sheetEraTitle: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sheetEventTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  descriptionContainer: {
    gap: 12,
  },
  descriptionParagraph: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
  },
  sheetSection: {
    gap: 8,
  },
  sheetSectionTitle: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scriptureList: {
    gap: 8,
  },
  scriptureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  scriptureText: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
  },
  connectionCard: {
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionTitle: {
    color: '#C9A84C',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectionText: {
    color: '#9A9A8A',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },

  // Active / Pressed States
  continueCardPressed: {
    backgroundColor: '#23231B',
    transform: [{ scale: 0.98 }],
  },
  navTabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  eventRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ scale: 0.99 }],
  },
  sheetCloseButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 0.92 }],
  },
  scriptureCardPressed: {
    backgroundColor: '#161612',
    transform: [{ scale: 0.98 }],
  },

  // Skeleton Loading
  heroSkeletonWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  heroSkeletonContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    gap: 8,
    zIndex: 3,
  },
});
