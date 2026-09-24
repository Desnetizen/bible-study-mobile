import { LinkedText } from '@/components/LinkedText';
import { ImageSkeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { TIMELINE_ITEMS } from '@/data/danielTimeline';
import { trackActivity } from '@/lib/activity-tracker';
import { parseBibleReference } from '@/lib/parseBibleReference';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { BookOpen, ChevronRight, Crown, Play, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const READ_EVENTS_KEY = 'bible-connection:timeline-read-events';
const LAST_READ_EVENT_KEY = 'bible-connection:timeline-last-read';
const TIMELINE_BEGUN_KEY = 'bible-connection:timeline-begun';

// Computed once from the static timeline data. Used both to self-heal
// persisted read-event ids that no longer exist (e.g. after a content edit)
// and as the denominator for overall progress.
const ALL_EVENT_IDS = new Set(TIMELINE_ITEMS.flatMap((era) => era.events.map((event) => event.id)));
const TOTAL_EVENT_COUNT = ALL_EVENT_IDS.size;

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [readEvents, setReadEvents] = useState<string[]>([]);
  const [lastReadEvent, setLastReadEvent] = useState<{ eraId: string; eraName: string; date: string } | null>(null);
  const [timelineBegun, setTimelineBegun] = useState(false);

  const [activeEraId, setActiveEraId] = useState(TIMELINE_ITEMS[0].id);
  const activeEraIdRef = useRef(TIMELINE_ITEMS[0].id);
  const scrollFrameRef = useRef<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<typeof TIMELINE_ITEMS[number]['events'][number] | null>(null);
  const [activeEra, setActiveEra] = useState<typeof TIMELINE_ITEMS[number] | null>(null);

  const eraPositions = useRef<Record<string, number>>({});
  // Mirrors readEvents synchronously. State updates are batched/async, so
  // handleEventPress reads/writes this ref instead of the `readEvents`
  // closure to avoid dropping an id when two events are tapped in quick
  // succession before a re-render lands.
  const readEventsRef = useRef<string[]>([]);

  const backdropOpacity = useMemo(() => new Animated.Value(0), []);
  const sheetTranslateY = useMemo(() => new Animated.Value(800), []);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const onHeroLoad = useCallback(() => setHeroLoaded(true), []);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [storedRead, storedLast, storedBegun] = await Promise.all([
          AsyncStorage.getItem(READ_EVENTS_KEY),
          AsyncStorage.getItem(LAST_READ_EVENT_KEY),
          AsyncStorage.getItem(TIMELINE_BEGUN_KEY),
        ]);

        let cleanedRead: string[] = [];
        if (storedRead) {
          const parsedRead: string[] = JSON.parse(storedRead);
          // Drop any ids that no longer exist in the timeline data so a past
          // content edit can't leave orphaned entries inflating progress.
          cleanedRead = parsedRead.filter((id) => ALL_EVENT_IDS.has(id));
          readEventsRef.current = cleanedRead;
          setReadEvents(cleanedRead);
          if (cleanedRead.length !== parsedRead.length) {
            await AsyncStorage.setItem(READ_EVENTS_KEY, JSON.stringify(cleanedRead));
          }
        }

        if (storedLast) {
          setLastReadEvent(JSON.parse(storedLast));
        }

        let begun = storedBegun ? JSON.parse(storedBegun) : false;
        // Real reading progress always implies the journey has begun, even
        // if the flag was never explicitly set (e.g. the user jumped
        // straight into an era instead of tapping "Begin Journey").
        if (!begun && cleanedRead.length > 0) {
          begun = true;
          await AsyncStorage.setItem(TIMELINE_BEGUN_KEY, JSON.stringify(true));
        }
        setTimelineBegun(begun);
      } catch (error) {
        console.warn('Failed to load timeline progress:', error);
      }
    };
    loadProgress();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(800);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
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

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  const updateActiveEraId = useCallback((eraId: string) => {
    if (eraId === activeEraIdRef.current) return;
    activeEraIdRef.current = eraId;
    setActiveEraId(eraId);
  }, []);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const offset = y + 120;

    let currentEraId = TIMELINE_ITEMS[0].id;
    for (const era of TIMELINE_ITEMS) {
      const eraY = eraPositions.current[era.id];
      if (eraY !== undefined && offset >= eraY) {
        currentEraId = era.id;
      }
    }

    if (currentEraId !== activeEraIdRef.current && scrollFrameRef.current === null) {
      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        updateActiveEraId(currentEraId);
      });
    }
  };

  const handleEraPress = (eraId: string) => {
    const y = eraPositions.current[eraId];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 48), animated: true });
      updateActiveEraId(eraId);

      try {
        void Haptics.selectionAsync();
      } catch { }
    }
  };

  const handleBeginJourney = async () => {
    const firstEra = TIMELINE_ITEMS[0];
    if (!firstEra || !firstEra.events[0]) return;

    handleEventPress(firstEra.events[0], firstEra);
    setTimelineBegun(true);
    try {
      await AsyncStorage.setItem(TIMELINE_BEGUN_KEY, JSON.stringify(true));
    } catch (error) {
      console.warn('Failed to save timeline begun flag:', error);
    }
  };

  const handleEventPress = async (event: typeof TIMELINE_ITEMS[number]['events'][number], era: typeof TIMELINE_ITEMS[number]) => {
    setActiveEvent(event);
    setActiveEra(era);
    setModalVisible(true);

    if (!readEventsRef.current.includes(event.id)) {
      const nextReadEvents = [...readEventsRef.current, event.id];
      readEventsRef.current = nextReadEvents;
      setReadEvents(nextReadEvents);
      trackActivity('timeline_event_read', event.title, {
        eventId: event.id,
        date: event.date,
        era: era.name,
      });
      try {
        await AsyncStorage.setItem(READ_EVENTS_KEY, JSON.stringify(nextReadEvents));
      } catch (error) {
        console.warn('Failed to save read events:', error);
      }

      // First real progress implicitly begins the journey, regardless of
      // whether the user tapped "Begin Journey" or opened an event directly.
      if (!timelineBegun) {
        setTimelineBegun(true);
        try {
          await AsyncStorage.setItem(TIMELINE_BEGUN_KEY, JSON.stringify(true));
        } catch (error) {
          console.warn('Failed to save timeline begun flag:', error);
        }
      }
    }

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

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch { }
  };

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
      }),
    ]).start(() => {
      setModalVisible(false);
      setActiveEvent(null);
      setActiveEra(null);
    });
  };

  const handleScripturePress = (ref: string) => {
    const parsed = parseBibleReference(ref);
    if (!parsed) return;

    setModalVisible(false);
    setActiveEvent(null);
    setActiveEra(null);

    router.push({
      pathname: '/bible',
      params: {
        book: parsed.book,
        chapter: String(parsed.chapter),
        ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
        ...(parsed.endVerse ? { endVerse: String(parsed.endVerse) } : {}),
      },
    });
  };

  const progress = useMemo(() => {
    const readSet = new Set(readEvents.filter((id) => ALL_EVENT_IDS.has(id)));

    const eraStats = new Map<string, { read: number; total: number; percent: number; complete: boolean }>();
    for (const era of TIMELINE_ITEMS) {
      const total = era.events.length;
      const read = era.events.reduce((count, event) => count + (readSet.has(event.id) ? 1 : 0), 0);
      eraStats.set(era.id, {
        read,
        total,
        percent: total > 0 ? Math.round((read / total) * 100) : 0,
        complete: total > 0 && read === total,
      });
    }

    return {
      readCount: readSet.size,
      totalCount: TOTAL_EVENT_COUNT,
      percent: TOTAL_EVENT_COUNT > 0 ? Math.round((readSet.size / TOTAL_EVENT_COUNT) * 100) : 0,
      eraStats,
    };
  }, [readEvents]);

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
          {!heroLoaded && (
            <View style={styles.heroSkeletonWrap}>
              <ImageSkeleton
                width="100%"
                height="100%"
                borderRadius={0}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={styles.heroSkeletonContent}>
                <TextSkeleton width={100} height={10} />
                <TextSkeleton width={180} height={26} />
                <TextSkeleton width="70%" height={12} />
                <TextSkeleton width="50%" height={12} />
              </View>
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={[styles.heroContent, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.heroEyebrow}>BIBLICAL TIMELINE</Text>
            <Text style={styles.heroTitle}>The Full Story</Text>
            <Text style={styles.heroSubtitle}>
              From the divided kingdom to Revelation — trace God&apos;s plan through history.
            </Text>
            {!timelineBegun ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Begin timeline journey"
                style={({ pressed }) => [styles.beginButton, pressed && styles.beginButtonPressed]}
                onPress={handleBeginJourney}
              >
                <View style={styles.beginIconCircle}>
                  <Play size={11} color="#0D0D0D" fill="#0D0D0D" />
                </View>
                <Text style={styles.beginButtonText}>Begin Journey</Text>
              </Pressable>
            ) : (
              <View
                style={styles.progressSummary}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: progress.percent }}
              >
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {progress.readCount} of {progress.totalCount} events · {progress.percent}% complete
                </Text>
              </View>
            )}
          </View>
        </ImageBackground>

        {/* 2. Continue Banner */}
        {showContinue && lastReadEvent && (
          <View style={styles.continueWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.continueCard,
                pressed && styles.continueCardPressed,
              ]}
              onPress={() => handleEraPress(lastReadEvent.eraId)}
            >
              <View style={styles.continueLeft}>
                <View style={styles.playIconCircle}>
                  <Play size={12} color="#E8A838" fill="#E8A838" />
                </View>
                <View style={styles.continueTextContainer}>
                  <Text style={styles.continueLabel}>Continue where you left off</Text>
                  <Text style={styles.continueEra}>
                    {lastReadEvent.eraName} · {lastReadEvent.date}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#E8A838" />
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
            {TIMELINE_ITEMS.map((era) => {
              const isActive = activeEraId === era.id;
              return (
                <Pressable
                  key={era.id}
                  style={({ pressed }) => [
                    styles.navTab,
                    isActive && styles.navTabActive,
                    pressed && styles.navTabPressed,
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
          {TIMELINE_ITEMS.map((era) => (
            <View
              key={era.id}
              style={styles.eraSection}
              onLayout={(e) => {
                eraPositions.current[era.id] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextGroup}>
                  <Text style={styles.dividerText}>
                    {era.name} · {era.dateRange}
                  </Text>
                  {(() => {
                    const stat = progress.eraStats.get(era.id);
                    if (!stat) return null;
                    return (
                      <View style={[styles.eraBadge, stat.complete && styles.eraBadgeComplete]}>
                        <Text style={[styles.eraBadgeText, stat.complete && styles.eraBadgeTextComplete]}>
                          {stat.complete ? 'Complete' : `${stat.read}/${stat.total}`}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.eraEventsContainer}>
                <View style={styles.verticalTimelineLine} />

                {era.events.map((event) => {
                  const isRead = readEvents.includes(event.id);
                  return (
                    <Pressable
                      key={event.id}
                      style={({ pressed }) => [
                        styles.eventRow,
                        pressed && styles.eventRowPressed,
                      ]}
                      onPress={() => handleEventPress(event, era)}
                    >
                      <View style={styles.nodeColumn}>
                        <View style={[styles.circleNode, isRead && styles.circleNodeFilled]} />
                      </View>

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

                      <ChevronRight size={16} color="#E8A838" style={styles.eventChevron} />
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
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
            <Pressable
              style={styles.backdropDismiss}
              onPress={handleCloseModal}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

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
                  pressed && styles.sheetCloseButtonPressed,
                ]}
                onPress={handleCloseModal}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScrollView}
              contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: insets.bottom + 24 }]}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.descriptionContainer}>
                {activeEvent?.description ? activeEvent.description.split('\n\n').map((paragraph, idx) => (
                  <LinkedText key={idx} text={paragraph} style={styles.descriptionParagraph} />
                )) : null}
              </View>

              {activeEvent && activeEvent.scriptureReferences.length > 0 && (
                <View style={styles.sheetSection}>
                  <Text style={styles.sheetSectionTitle}>Scripture References</Text>
                  <View style={styles.scriptureList}>
                    {activeEvent.scriptureReferences.map((ref) => (
                      <Pressable
                        key={ref}
                        style={({ pressed }) => [
                          styles.scriptureCard,
                          pressed && styles.scriptureCardPressed,
                        ]}
                        onPress={() => handleScripturePress(ref)}
                      >
                        <BookOpen size={14} color="#E8A838" />
                        <Text style={styles.scriptureText}>{ref}</Text>
                        <ChevronRight size={14} color="#E8A838" style={{ marginLeft: 'auto', opacity: 0.7 }} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {activeEvent && activeEvent.danielConnection && (
                <View style={styles.connectionCard}>
                  <View style={styles.connectionHeader}>
                    <Crown size={16} color="#E8A838" />
                    <Text style={styles.connectionTitle}>Daniel Connection</Text>
                  </View>
                  <LinkedText text={activeEvent.danielConnection} style={styles.connectionText} />
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

  heroBackground: {
    width: '100%',
    height: 280,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.75)',
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroEyebrow: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#8B7D6B',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
  },
  beginButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#E8A838',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  beginButtonPressed: {
    backgroundColor: 'rgba(232, 168, 56, 0.12)',
    transform: [{ scale: 0.98 }],
  },
  beginIconCircle: {
    alignItems: 'center',
    backgroundColor: '#E8A838',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  beginButtonText: {
    color: '#F5D48B',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  progressSummary: {
    marginTop: 14,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#E8A838',
  },
  progressLabel: {
    color: '#F5D48B',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  },

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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.4)',
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
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueTextContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  continueLabel: {
    color: '#8B7D6B',
    fontFamily: 'Inter',
    fontSize: 10,
  },
  continueEra: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },

  stickyNavBarWrapper: {
    backgroundColor: '#0D0D0D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 168, 56, 0.15)',
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
    borderBottomColor: '#E8A838',
  },
  navTabText: {
    color: '#8B7D6B',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  navTabTextActive: {
    color: '#E8A838',
    fontWeight: '700',
  },

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
    backgroundColor: 'rgba(232, 168, 56, 0.25)',
  },
  dividerTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  dividerText: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  eraBadge: {
    backgroundColor: 'rgba(232, 168, 56, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  eraBadgeComplete: {
    backgroundColor: '#E8A838',
    borderColor: '#E8A838',
  },
  eraBadgeText: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  eraBadgeTextComplete: {
    color: '#0D0D0D',
  },
  eraEventsContainer: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  verticalTimelineLine: {
    position: 'absolute',
    left: 27,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: '#E8A838',
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
    zIndex: 1,
  },
  circleNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#E8A838',
    backgroundColor: '#0D0D0D',
  },
  circleNodeFilled: {
    backgroundColor: '#E8A838',
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
    color: '#E8A838',
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
    color: '#8B7D6B',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
  },
  eventChevron: {
    opacity: 0.5,
  },

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
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.4)',
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
    backgroundColor: 'rgba(232, 168, 56, 0.3)',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 168, 56, 0.15)',
  },
  sheetHeaderTitles: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  sheetEraTitle: {
    color: '#E8A838',
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
    color: '#E8A838',
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
    borderColor: 'rgba(232, 168, 56, 0.2)',
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
    borderColor: 'rgba(232, 168, 56, 0.4)',
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
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectionText: {
    color: '#8B7D6B',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },

  continueCardPressed: {
    backgroundColor: '#232323',
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
    backgroundColor: '#161616',
    transform: [{ scale: 0.98 }],
  },

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
