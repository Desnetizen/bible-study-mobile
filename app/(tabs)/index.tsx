import { BlurView } from 'expo-blur';
import { BadgeSection } from '@/components/BadgeSection';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, Link, router } from 'expo-router';
import { ArrowRight, Bookmark, BookOpen, CalendarDays, Compass, Gift, NotebookPen } from 'lucide-react-native';
import { ComponentProps, ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { StreakBadge } from '@/components/StreakBadge';
import { ImageSkeleton, Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { DANIEL_CHAPTERS, formatDisplayDate, RECENT_ACTIVITY } from '@/constants/bible-connection';
import { BIBLE_VERSES } from '@/constants/bible-verse';
import { useAppReadiness } from '@/lib/app-readiness';
import { formatActivityTime, useRecentActivity } from '@/lib/activity-tracker';
import { useDanielProgress } from '@/lib/daniel-progress';
import { useStreak } from '@/lib/useStreak';
import { useNewBadgeIds } from '@/lib/badges';
import { parseBibleReference } from '@/lib/parseBibleReference';

// expo-image doesn't need Animated wrapping — we wrap in Animated.View instead

const SharedAnimatedView = Animated.View as ComponentType<
  ComponentProps<typeof Animated.View> & { sharedTransitionTag?: string }
>;
const SharedAnimatedText = Animated.Text as ComponentType<
  ComponentProps<typeof Animated.Text> & { sharedTransitionTag?: string }
>;

type QuickAccessItem = {
  title: string;
  subtitle: string;
  icon: any;
  buttonText: string;
  color: string;
  href?: Href;
};

const quickAccessItems: QuickAccessItem[] = [
  { title: 'Daniel Study', subtitle: 'Explore the book of Daniel chapter by chapter with interactive tools.', icon: require('../../assets/Icons/crown.png'), buttonText: 'Open', color: '#2463ff', href: '/daniel-study' },
  { title: 'Historical Context', subtitle: 'Discover the historical background from Prophets and Kings.', icon: require('../../assets/Icons/Building.png'), buttonText: 'Open', color: '#ff9500', href: '/historical-context' },
  { title: 'Connections', subtitle: 'See how verses, events, and themes connect across Scripture.', icon: require('../../assets/Icons/Connection.png'), buttonText: 'Explore', color: '#10b981' },
  { title: 'Timeline', subtitle: 'Walk through biblical history from Babylon to Medo-Persia and beyond.', icon: require('../../assets/Icons/Timeline.png'), buttonText: 'View Timeline', color: '#e8a838', href: '/timeline' as Href },
  { title: 'Patterns', subtitle: 'Discover recurring themes and prophetic patterns in Daniel.', icon: require('../../assets/Icons/Patterns.png'), buttonText: 'Discover', color: '#06b6d4' },
  { title: 'Notes', subtitle: 'Your saved notes and highlights from your Bible study journey.', icon: require('../../assets/Icons/Notes.png'), buttonText: 'View Notes', color: '#3b82f6' },
];

const heroLogoImage = require('../../assets/bible-connection/logo.png');

const STUDY_TOTAL_CHAPTERS = 12;
const PROGRESS_RING_SIZE = 82;
const PROGRESS_RING_STROKE = 8;

type DailyVerse = {
  text: string;
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
};

const ROTATING_KEY_VERSES: DailyVerse[] = BIBLE_VERSES.map((verse) => {
  const parsedReference = parseBibleReference(verse.reference);

  if (!parsedReference) {
    return {
      text: verse.text,
      ref: verse.reference,
      book: 'Bible',
      chapter: 1,
      verse: 1,
    };
  }

  return {
    text: verse.text,
    ref: verse.reference,
    book: parsedReference.book,
    chapter: parsedReference.chapter,
    verse: parsedReference.verse ?? 1,
    endVerse: parsedReference.endVerse,
  };
});

function getRotatingKeyVerse(date = new Date()) {
  const rotationWindow = 4 * 60 * 1000;
  const slotIndex = Math.floor(date.getTime() / rotationWindow);

  return ROTATING_KEY_VERSES[slotIndex % ROTATING_KEY_VERSES.length];
}

const chapterShowcase = {
  1: {
    image: require('../../assets/Chapters/daniel-chapter-1.png'),
    gradient: ['rgba(6, 14, 36, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  2: {
    image: require('../../assets/Chapters/daniel-chapter-2.png'),
    gradient: ['rgba(25, 12, 55, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  3: {
    image: require('../../assets/Chapters/daniel-chapter-3.png'),
    gradient: ['rgba(17, 33, 67, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  4: {
    image: require('../../assets/Chapters/daniel-chapter-4.png'),
    gradient: ['rgba(17, 42, 61, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  5: {
    image: require('../../assets/Chapters/daniel-chapter-5.png'),
    gradient: ['rgba(10, 34, 44, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  6: {
    image: require('../../assets/Chapters/daniel-chapter-6.png'),
    gradient: ['rgba(13, 54, 35, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  7: {
    image: require('../../assets/Chapters/daniel-chapter-7.png'),
    gradient: ['rgba(22, 32, 63, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  8: {
    image: require('../../assets/Chapters/daniel-chapter-8.png'),
    gradient: ['rgba(10, 44, 58, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  9: {
    image: require('../../assets/Chapters/daniel-chapter-9.png'),
    gradient: ['rgba(48, 25, 72, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  10: {
    image: require('../../assets/Chapters/daniel-chapter-10.png'),
    gradient: ['rgba(43, 23, 64, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
  12: {
    image: require('../../assets/Chapters/daniel-chapter-12.png'),
    gradient: ['rgba(45, 18, 75, 0.08)', 'rgba(15, 31, 69, 0.96)'],
  },
} as const;

function QuickAccessCard({ item, index }: { item: typeof quickAccessItems[number]; index: number }) {
  const pressed = useSharedValue(0);
  // CHANGE 8 — 3D Tilt shared values
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.96]) }],
  }));

  // CHANGE 8 — Pan gesture for 3D tilt (only activates on horizontal swipe)
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      'worklet';
      tiltY.set(Math.min(8, Math.max(-8, e.translationX / 4)));
      tiltX.set(Math.min(8, Math.max(-8, -e.translationY / 4)));
    })
    .onEnd(() => {
      'worklet';
      tiltX.set(withSpring(0));
      tiltY.set(withSpring(0));
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      pressed.set(withSpring(1));
    })
    .onFinalize(() => {
      pressed.set(withSpring(0));
    })
    .onEnd(() => {
      runOnJS(router.push)(item.href ?? '/bible');
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  const animatedTilt = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${tiltX.get()}deg` },
      { rotateY: `${tiltY.get()}deg` },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).springify()}
      style={styles.quickAccessCardWrapper}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[animatedTilt, animatedCard]}>
          {/* CHANGE 5 — Glassmorphism BlurView card */}
          <BlurView intensity={18} tint="dark" style={[styles.quickAccessCard, { borderColor: item.color + '40' }]}>
            <View style={styles.quickAccessCardGlassInner}>
              <SharedAnimatedView
                sharedTransitionTag={`quickaccess-icon-${index}`}
                style={[styles.quickAccessIconLarge, { backgroundColor: item.color }]}
              >
                <Image source={item.icon} style={styles.quickAccessCardIcon} contentFit="contain" cachePolicy="memory-disk" />
              </SharedAnimatedView>
              <SharedAnimatedText sharedTransitionTag={`quickaccess-title-${index}`} style={styles.quickAccessCardTitle}>
                {item.title}
              </SharedAnimatedText>
              <Text style={styles.quickAccessCardDescription}>{item.subtitle}</Text>
              <View style={[styles.quickAccessButton, { backgroundColor: item.color + '20', borderColor: item.color }]}>
                <Text style={[styles.quickAccessButtonText, { color: item.color }]}>{item.buttonText}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedProgress = useSharedValue(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const radius = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress / 100);

  useEffect(() => {
    animatedProgress.set(0);
    animatedProgress.set(withTiming(clampedProgress, { duration: 1200 }));
  }, [animatedProgress, clampedProgress]);

  useAnimatedReaction(
    () => Math.floor(animatedProgress.get()),
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setDisplayedProgress)(currentValue);
      }
    },
    [animatedProgress]
  );

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
      style={styles.progressRing}
    >
      <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE} style={styles.progressRingSvg}>
        <Circle
          cx={PROGRESS_RING_SIZE / 2}
          cy={PROGRESS_RING_SIZE / 2}
          r={radius}
          stroke="rgba(47, 140, 255, 0.22)"
          strokeWidth={PROGRESS_RING_STROKE}
          fill="none"
        />
        <Circle
          cx={PROGRESS_RING_SIZE / 2}
          cy={PROGRESS_RING_SIZE / 2}
          r={radius}
          stroke="#2f8cff"
          strokeWidth={PROGRESS_RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${PROGRESS_RING_SIZE / 2}, ${PROGRESS_RING_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.progressRingCenter}>
        <Text style={styles.progressRingText}>{`${displayedProgress}%`}</Text>
      </View>
    </View>
  );
}

function SegmentedProgressBar({
  total,
  completed,
}: {
  total: number;
  completed: number[];
}) {
  return (
    <View style={styles.segmentedBar}>
      {Array.from({ length: total }, (_, i) => {
        const chapterNum = i + 1;
        const isFilled = completed.includes(chapterNum);
        return (
          <View
            key={chapterNum}
            style={[
              styles.segment,
              { backgroundColor: isFilled ? '#2463ff' : 'rgba(255,255,255,0.15)' },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function HomeTabScreen() {
  const insets = useSafeAreaInsets();
  const { splashAnimationComplete } = useAppReadiness();
  const placeImages = useMemo(
    () => [
      require('../../assets/Places/Ancient Jerusalem.jpg'),
      require('../../assets/Places/Babylon.png'),
      require('../../assets/Places/Egypt (2).png'),
      require('../../assets/Places/Sinai.jpg'),
      require('../../assets/Places/Rome.jpg'),
      require('../../assets/Places/Shushan(Susa).jpg'),
      require('../../assets/Places/Ur of the Chaldeans.png'),
      require('../../assets/Places/ziggurat in Babylon.png'),
      require('../../assets/Places/Athens.jpg'),
      require('../../assets/Places/Ancient ninevah.png'),
      require('../../assets/Places/Ancient Susa.png'),
      require('../../assets/Places/Canaanite Lands.jpg'),
    ],
    []
  );
  const heroImageOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const [placeImageIndexes, setPlaceImageIndexes] = useState({ current: 1, previous: 1 });
  const currentPlaceImageIndex = placeImageIndexes.current;
  const previousPlaceImageIndex = placeImageIndexes.previous;
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [studyImageLoaded, setStudyImageLoaded] = useState(false);
  const [verseImageLoaded, setVerseImageLoaded] = useState(false);
  const heroLoadedOpacity = useSharedValue(0);
  const studyLoadedOpacity = useSharedValue(0);
  const verseLoadedOpacity = useSharedValue(0);
  const completedChapters = useDanielProgress();
  const { streakCount, recordToday } = useStreak();
  const recentActivities = useRecentActivity(3);
  const initialVerseIndex = useMemo(() => {
    const now = Date.now();
    const rotationWindow = 4 * 60 * 1000;
    return Math.floor(now / rotationWindow) % ROTATING_KEY_VERSES.length;
  }, []);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex);
  const dailyVerse = ROTATING_KEY_VERSES[currentVerseIndex] ?? getRotatingKeyVerse();
  const displayDate = useMemo(() => formatDisplayDate(), []);

  const newBadgeIds = useNewBadgeIds(streakCount);

  const completedCount = completedChapters.length;
  const progressPercent = Math.round((completedCount / STUDY_TOTAL_CHAPTERS) * 100);
  const milestoneChapter = [3, 6, 9, 12].find((m) => m > completedCount) ?? STUDY_TOTAL_CHAPTERS;
  const nextChapter =
    Array.from({ length: STUDY_TOTAL_CHAPTERS }, (_, index) => index + 1).find(
      (chapterNumber) => !completedChapters.includes(chapterNumber)
    ) ?? STUDY_TOTAL_CHAPTERS;
  const nextChapterData = DANIEL_CHAPTERS.find((chapter) => chapter.chapter === nextChapter) ?? DANIEL_CHAPTERS[0];
  const showcase = chapterShowcase[nextChapter as keyof typeof chapterShowcase];
  const chapterArtwork = showcase?.image;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.get(), [0, 300], [0, -80], Extrapolation.CLAMP) }],
  }));

  // CHANGE 6 — Verse card parallax artwork
  const verseParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.get(), [0, 600], [0, -40], Extrapolation.CLAMP) }],
  }));

  // CHANGE 3 — Shiny sweep shared value for Continue button
  const shinySweepX = useSharedValue(-200);
  useEffect(() => {
    shinySweepX.set(withRepeat(withTiming(400, { duration: 2200 }), -1, false));
  }, [shinySweepX]);
  const shinySweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shinySweepX.get() }, { rotate: '20deg' }],
  }));

  // CHANGE 7 — Aurora glow shared value for Study card
  const auroraOpacity = useSharedValue(0.10);
  useEffect(() => {
    auroraOpacity.set(withRepeat(withTiming(0.22, { duration: 3000 }), -1, true));
  }, [auroraOpacity]);

  const auroraGlowStyle = useAnimatedStyle(() => ({
    opacity: auroraOpacity.get(),
  }));

  const currentHeroImageStyle = useAnimatedStyle(() => ({
    opacity: heroImageOpacity.get(),
  }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceImageIndexes(({ current }) => ({
        previous: current,
        current: (current + 1) % placeImages.length,
      }));
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [placeImages.length]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentVerseIndex((prevIndex) => (prevIndex + 1) % ROTATING_KEY_VERSES.length);
    }, 4 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    heroImageOpacity.set(0);
    heroImageOpacity.set(withTiming(1, { duration: 1000 }));
  }, [currentPlaceImageIndex, heroImageOpacity]);

  // Fade in once images finish loading
  const onHeroImageLoad = useCallback(() => {
    setHeroImageLoaded(true);
    heroLoadedOpacity.set(withTiming(1, { duration: 500 }));
  }, [heroLoadedOpacity]);

  const onStudyImageLoad = useCallback(() => {
    setStudyImageLoaded(true);
    studyLoadedOpacity.set(withTiming(1, { duration: 500 }));
  }, [studyLoadedOpacity]);

  const onVerseImageLoad = useCallback(() => {
    setVerseImageLoaded(true);
    verseLoadedOpacity.set(withTiming(1, { duration: 500 }));
  }, [verseLoadedOpacity]);

  const heroLoadedAnimStyle = useAnimatedStyle(() => ({
    opacity: heroLoadedOpacity.get(),
  }));
  const studyLoadedAnimStyle = useAnimatedStyle(() => ({
    opacity: studyLoadedOpacity.get(),
  }));
  const verseLoadedAnimStyle = useAnimatedStyle(() => ({
    opacity: verseLoadedOpacity.get(),
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040f2d" />
      {splashAnimationComplete && (
        <Animated.ScrollView
          style={styles.streamScroll}
          contentContainerStyle={styles.streamContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.heroRow}>
          <View style={styles.heroCard}>
            {/* Skeleton placeholder while hero image loads */}
            {!heroImageLoaded && (
              <View style={[styles.heroBackgroundLayer, { zIndex: 0 }]}>
                <ImageSkeleton
                  width="100%"
                  height="100%"
                  borderRadius={0}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
              </View>
            )}
            <Animated.View style={[styles.heroBackgroundLayer, heroParallax, heroLoadedAnimStyle]}>
              <ImageBackground
                source={placeImages[previousPlaceImageIndex]}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={300}
                imageStyle={styles.heroImage}
                style={styles.heroBackgroundImage}
                onLoad={onHeroImageLoad}
              />
              <Animated.View style={[styles.heroBackgroundImage, currentHeroImageStyle]}>
                <ImageBackground
                  source={placeImages[currentPlaceImageIndex]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={300}
                  imageStyle={styles.heroImage}
                  style={styles.heroBackgroundImageInner}
                  onLoad={onHeroImageLoad}
                />
              </Animated.View>
            </Animated.View>
            <View style={styles.heroShadeStrong} />
            <View style={styles.heroShadeSoft} />

            {/* Fade overlays at edges */}
            <LinearGradient
              colors={['rgba(4,15,45,0.9)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.heroFadeLeft}
            />
            <LinearGradient
              colors={['transparent', 'rgba(4,15,45,0.9)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.heroFadeRight}
            />
            <LinearGradient
              colors={['rgba(4,15,45,0.5)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.heroFadeTop}
            />
            <LinearGradient
              colors={['transparent', 'rgba(4,15,45,0.98)']}
              start={{ x: 0.5, y: 0.3 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.heroFadeBottom}
            />

            <View style={[styles.heroContent, { paddingTop: insets.top + 14 }]}>
              <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroBrandRow}>
                <Image source={heroLogoImage} style={styles.heroLogo} contentFit="contain" cachePolicy="memory-disk" />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.heroTextBlock}>
                <Text style={styles.heroKicker}>Welcome back,</Text>
                {/* CHANGE 4 — SplitText Hero Heading */}
                <View style={styles.heroHeadingSplitRow}>
                  {'Desvorn!'.split('').map((char, index) => (
                    <Animated.Text
                      key={`hero-char-${index}`}
                      entering={FadeInDown.delay(200 + index * 40).springify()}
                      style={styles.heroHeading}
                    >
                      {char}
                    </Animated.Text>
                  ))}
                </View>
                <Text style={styles.heroDescription}>Continue your journey through Daniel and discover the connections in God&apos;s Word.</Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Continue Study */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.studyCard}>
          {/* CHANGE 7 — Aurora Glow behind study card artwork */}
          <Animated.View style={[styles.auroraGlowSvg, auroraGlowStyle]} pointerEvents="none">
            <Svg width="100%" height={240}>
              <Defs>
                <RadialGradient id="auroraGrad" cx="30%" cy="50%" r="50%">
                  <Stop offset="0" stopColor="#2463ff" stopOpacity={1} />
                  <Stop offset="1" stopColor="transparent" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="240" fill="url(#auroraGrad)" />
            </Svg>
          </Animated.View>
          {/* Skeleton placeholder while chapter artwork loads */}
          {!studyImageLoaded && (
            <View style={styles.studySkeletonWrap}>
              <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              <View style={styles.studySkeletonContent}>
                <Skeleton width={90} height={14} borderRadius={4} />
                <Skeleton width={180} height={28} borderRadius={6} style={{ marginTop: 8 }} />
                <TextSkeleton width="70%" height={12} style={{ marginTop: 6 }} />
                <TextSkeleton width="55%" height={12} style={{ marginTop: 4 }} />
                <View style={{ marginTop: 'auto', gap: 8 }}>
                  <Skeleton width="100%" height={4} borderRadius={2} />
                  <Skeleton width="100%" height={44} borderRadius={8} />
                </View>
              </View>
            </View>
          )}
          {/* Full-bleed chapter artwork background */}
          <Animated.View style={[styles.studyImageLayer, studyLoadedAnimStyle]}>
            <ImageBackground
              source={chapterArtwork ?? undefined}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
              imageStyle={styles.studyBgImage}
              style={styles.studyBgFill}
              onLoad={onStudyImageLoad}
            >
              {/* Left-to-right dark gradient overlay (dark on the left for text readability, transparent on the right for artwork visibility) */}
              <LinearGradient
                colors={['rgba(3,10,28,0.95)', 'rgba(3,10,28,0.6)', 'rgba(3,10,28,0.15)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Bottom navy fade */}
              <LinearGradient
                colors={['transparent', 'rgba(3,10,28,0.85)', 'rgba(3,10,28,0.98)']}
                locations={[0, 0.55, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* ProgressRing - top-right corner */}
              <View style={styles.studyProgressRingWrap}>
                <ProgressRing progress={progressPercent} />
              </View>

              {/* Content overlay */}
              <View style={styles.studyContent}>
                {/* Top row: label + streak (spans full width, parallel streak float) */}
                <View style={styles.studyHeaderRow}>
                  <BookOpen size={16} color="#2f8cff" fill="#2f8cff" strokeWidth={2.4} />
                  <Text style={styles.studyLabel}>Continue Study</Text>
                  <StreakBadge count={streakCount} />
                </View>

                {/* Restrict width of the upper text content to avoid overlapping the ProgressRing */}
                <View style={styles.studyUpperContent}>
                  {/* Chapter info */}
                  <SharedAnimatedText
                    sharedTransitionTag={`open-chapter-daniel-${nextChapter}-title`}
                    style={styles.studyChapter}
                  >
                    {`DANIEL ${nextChapter}`}
                  </SharedAnimatedText>
                  <Text style={styles.studyTitle}>{nextChapterData.title}</Text>
                  <Text style={styles.studyDescription} numberOfLines={2}>
                    {nextChapterData.description}
                  </Text>
                </View>

                {/* Dot separator */}
                <Text style={styles.studyDotSeparator}>·</Text>

                {/* Chapters completed count */}
                <View style={styles.studyCompletedRow}>
                  <BookOpen size={12} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.studyCompletedText}>
                    {`${completedCount} of ${STUDY_TOTAL_CHAPTERS} Chapters Completed`}
                  </Text>
                </View>

                {/* Segmented progress bar */}
                <SegmentedProgressBar total={STUDY_TOTAL_CHAPTERS} completed={completedChapters} />

                {/* Milestone */}
                <View style={styles.studyMilestoneRow}>
                  <Gift size={13} color="#2463ff" strokeWidth={2.2} />
                  <Text style={styles.studyMilestoneText}>
                    {`Next Milestone: Chapter ${milestoneChapter}`}
                  </Text>
                </View>

                {/* Continue button */}
                <Link
                  href={{
                    pathname: '/bible',
                    params: {
                      book: 'Daniel',
                      chapter: String(nextChapter),
                    },
                  }}
                  asChild
                >
                  <Pressable style={styles.studyContinueButton} onPress={() => recordToday()}>
                    <BookOpen size={16} color="#ffffff" strokeWidth={2.4} />
                    <Text style={styles.studyContinueButtonText}>Continue Chapter</Text>
                    <ArrowRight size={16} color="#ffffff" strokeWidth={2.4} />
                    {/* CHANGE 3 — Shiny sweep overlay */}
                    <Animated.View style={[styles.shinySweepOverlay, shinySweepStyle]} pointerEvents="none">
                      <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0.36 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                    </Animated.View>
                  </Pressable>
                </Link>
              </View>
            </ImageBackground>
          </Animated.View>
        </Animated.View>

        {/* Key Verse */}
        <Animated.View entering={FadeInUp.delay(260).duration(500)} style={styles.verseCard}>
          {/* Skeleton placeholder for verse card image */}
          {!verseImageLoaded && (
            <View style={styles.verseSkeletonWrap}>
              <View style={styles.verseSkeletonContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Skeleton width={32} height={32} borderRadius={16} />
                  <View style={{ gap: 4 }}>
                    <TextSkeleton width={50} height={12} />
                    <TextSkeleton width={80} height={10} />
                  </View>
                </View>
                <TextSkeleton width="90%" height={11} />
                <TextSkeleton width="70%" height={11} />
                <TextSkeleton width={60} height={11} />
              </View>
              <View style={styles.verseSkeletonArt}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            </View>
          )}
          {/* Full bleed artwork on right */}
          {/* CHANGE 6 — Verse card parallax artwork */}
          <Animated.View style={[styles.verseArtworkWrap, verseLoadedAnimStyle, verseParallax]} pointerEvents="none">
            <ImageBackground
              source={require('../../assets/Aesthetics/Bible.jpg')}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
              imageStyle={styles.verseBgImage}
              style={styles.verseBackground}
              onLoad={onVerseImageLoad}
            />
          </Animated.View>
          {/* Single gradient: dark left -> transparent right */}
          <LinearGradient
            colors={['#011634', '#011634', 'rgba(1,22,52,0.92)', 'rgba(1,22,52,0.4)', 'transparent']}
            locations={[0, 0.35, 0.55, 0.75, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.verseContent}>
            <View style={styles.verseHeader}>
              <View style={styles.verseIconChip}>
                <CalendarDays size={16} color="#8fc1ff" strokeWidth={2} />
              </View>
              <View style={styles.verseHeaderLabel}>
                <Text style={styles.verseEyebrow}>Today</Text>
                <Text style={styles.verseDate}>{displayDate}</Text>
              </View>
            </View>
            <Text selectable style={styles.verseText}>
              {dailyVerse.text}
            </Text>
            <View style={styles.verseFooter}>
              <Text style={styles.verseRef}>{dailyVerse.ref}</Text>
              <Text style={styles.verseBook}>{dailyVerse.book}</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/bible',
                    params: {
                      book: dailyVerse.book,
                      chapter: String(dailyVerse.chapter),
                      verse: String(dailyVerse.verse),
                      ...(dailyVerse.endVerse ? { endVerse: String(dailyVerse.endVerse) } : {}),
                    },
                  })
                }
                style={styles.verseButton}
              >
                <Text style={styles.verseButtonText}>Open verse</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Badges */}
        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <BadgeSection newBadgeIds={newBadgeIds} streakCount={streakCount} />
        </Animated.View>

        {/* Quick Access */}
        <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconPlaceholder} />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item, index) => (
              <QuickAccessCard key={item.title} item={item} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(420).springify()} style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconPlaceholder, { backgroundColor: '#10b981' }]} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityList}>
            {(recentActivities.length > 0
              ? recentActivities.slice(0, 3).map((item) => ({
                label: item.label,
                time: formatActivityTime(item),
              }))
              : RECENT_ACTIVITY.slice(0, 3)
            ).map((item, index) => {
              const lower = item.label.toLowerCase();
              let ActIcon = Compass;
              let actColor = '#06b6d4';
              let actBg = 'rgba(6, 182, 212, 0.12)';

              if (lower.includes('completed')) {
                ActIcon = BookOpen;
                actColor = '#10b981';
                actBg = 'rgba(16, 185, 129, 0.12)';
              } else if (lower.includes('note')) {
                ActIcon = NotebookPen;
                actColor = '#ff9500';
                actBg = 'rgba(255, 149, 0, 0.12)';
              } else if (lower.includes('bookmark') || lower.includes('highlighted')) {
                ActIcon = Bookmark;
                actColor = '#a855f7';
                actBg = 'rgba(168, 85, 247, 0.12)';
              } else if (lower.includes('explored')) {
                ActIcon = Compass;
                actColor = '#06b6d4';
                actBg = 'rgba(6, 182, 212, 0.12)';
              }

              return (
                <Animated.View key={index} entering={FadeInDown.delay(index * 80).springify()}>
                  <View style={[styles.activityRow, index === 2 && { borderBottomWidth: 0 }]}>
                    <View style={[styles.activityIconCircle, { backgroundColor: actBg }]}>
                      <ActIcon size={14} color={actColor} strokeWidth={2.4} />
                    </View>
                    <View style={styles.activityRowTextContent}>
                      <Text style={styles.activityRowLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text style={styles.activityRowTime}>{item.time}</Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
          <Pressable
            onPress={() => router.push('/recent-activity')}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.viewAllButtonPressed
            ]}
          >
            <Text style={styles.viewAllButtonText}>View All Activity</Text>
            <ArrowRight size={14} color="#8b96a8" strokeWidth={2.2} />
          </Pressable>
        </Animated.View>

        </Animated.ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Design Tokens - Type Scale (px): 11 / 13 / 15 / 18 / 24 / 32 / 48
  // Line Heights: body 1.6 (24px), headings 1.2 (29px), display 1.1 (53px)
  // Spacing (8px multiples): 8 / 12 / 16 / 24 / 32 / 48
  // Colors: Primary #2463ff, Text #ffffff/#e5efff, Surface #1a2947, Background #040f2d

  container: { flex: 1, backgroundColor: '#040f2d' },
  statusPartition: {
    backgroundColor: '#040f2d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(95,165,255,0.16)',
  },
  streamScroll: { flex: 1 },
  streamContent: { padding: 16, paddingBottom: 120 },

  // Hero Section
  heroRow: { marginBottom: 16, marginHorizontal: -16 },
  heroCard: {
    minHeight: 220,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  heroBackgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    bottom: -90,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBackgroundImageInner: {
    flex: 1,
  },
  heroImage: { borderRadius: 0, opacity: 0.98 },
  heroShadeStrong: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,11,38,0.08)' },
  heroShadeSoft: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,58,122,0.03)' },
  heroFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    pointerEvents: 'none',
  },
  heroFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    pointerEvents: 'none',
  },
  heroFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    pointerEvents: 'none',
  },
  heroFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 170,
    pointerEvents: 'none',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    justifyContent: 'flex-start',
  },
  heroBrandRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTextBlock: {
    maxWidth: '58%',
    alignSelf: 'flex-start',
  },
  heroLogo: {
    width: 210,
    height: 74,
  },
  heroKicker: {
    color: '#e6eeff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 0,
    fontFamily: 'Inter',
    lineHeight: 30,
  },
  heroHeading: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Inter',
    lineHeight: 34,
  },
  heroDescription: {
    color: '#dde9ff',
    fontSize: 11,
    lineHeight: 17,
    maxWidth: '100%',
    fontFamily: 'Inter',
    fontWeight: '400',
  },

  // Verse of the Day
  verseCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 92,
    position: 'relative',
    backgroundColor: '#011634',
    borderWidth: 1,
    borderColor: 'rgba(143, 193, 255, 0.12)',
  },
  verseArtworkWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '55%',
    overflow: 'hidden',
  },
  verseBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  verseBgImage: {
    opacity: 0.9,
  },
  verseContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    zIndex: 1,
    gap: 7,
    maxWidth: '76%',
  },
  verseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verseIconChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#01142e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseHeaderLabel: { flex: 1 },
  verseEyebrow: { color: '#ffffff', fontSize: 14, lineHeight: 17, fontWeight: '600', fontFamily: 'Inter' },
  verseDate: { color: '#c8d3e8', fontSize: 10, lineHeight: 13, fontWeight: '400', fontFamily: 'Inter', marginTop: 1 },
  verseText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  verseFooter: { flexDirection: 'column', gap: 2 },
  verseRef: { color: '#5fa5ff', fontSize: 11, lineHeight: 14, fontWeight: '700', fontFamily: 'Inter' },
  verseBook: { color: '#8b96a8', fontSize: 9, lineHeight: 12, fontWeight: '500', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 0.4 },
  verseButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#01142e',
    borderWidth: 1,
    borderColor: 'rgba(10, 92, 255, 0.45)',
  },
  verseButtonText: {
    color: '#dce9ff',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  // Continue Study
  studyCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.28)',
    minHeight: 240,
  },
  studyImageLayer: {
    flex: 1,
    zIndex: 1,
  },
  studyBgFill: {
    flex: 1,
    minHeight: 240,
  },
  studyBgImage: {
    opacity: 0.95,
  },
  studyUpperContent: {
    marginRight: 96, // Leave room for ProgressRing (82px ring + 14px padding)
  },
  studyProgressRingWrap: {
    position: 'absolute',
    top: 56,
    right: 14,
    zIndex: 2,
  },
  studyContent: {
    flex: 1,
    padding: 14,
    zIndex: 1,
    justifyContent: 'flex-end',
  },
  studyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  studyLabel: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  studyChapter: {
    color: '#f1a23a',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter',
    lineHeight: 38,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  studyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 21,
    marginTop: 2,
  },
  studyDescription: {
    color: '#c8deff',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: 4,
  },
  studyDotSeparator: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 4,
  },
  studyCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  studyCompletedText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  segmentedBar: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  studyMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  studyMilestoneText: {
    color: '#2463ff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  studyContinueButton: {
    backgroundColor: '#2463ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    overflow: 'hidden', // CHANGE 3 — clip the shiny sweep
  },
  studyContinueButtonText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    flex: 1,
    textAlign: 'center',
  },
  progressRing: {
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    borderRadius: PROGRESS_RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRingSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  progressRingCenter: {
    position: 'absolute',
    width: PROGRESS_RING_SIZE - PROGRESS_RING_STROKE * 2 - 6,
    height: PROGRESS_RING_SIZE - PROGRESS_RING_STROKE * 2 - 6,
    borderRadius: (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE * 2 - 6) / 2,
    backgroundColor: 'rgba(5,15,40,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'Inter',
    fontVariant: ['tabular-nums'],
  },

  // Quick Access
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickAccessCardWrapper: {
    width: '48%',
  },
  quickAccessCard: {
    borderRadius: 24,
    overflow: 'hidden', // CHANGE 5 — needed for BlurView clip
    borderWidth: 1,
    minHeight: 180,
  },
  quickAccessCardGlassInner: {
    backgroundColor: 'rgba(255,255,255,0.04)', // CHANGE 5 — glass look
    padding: 16,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
    width: '100%',
  },
  quickAccessIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickAccessCardIcon: {
    width: 32,
    height: 32,
  },
  quickAccessCardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickAccessCardDescription: {
    color: '#b6c9ea',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '400',
  },
  quickAccessButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    minWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  // Section Headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', fontFamily: 'Cinzel', lineHeight: 22 },
  sectionIconPlaceholder: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#5fa5ff' },

  // Skeleton Loading Overlays
  studySkeletonWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  studySkeletonContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 14,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  verseSkeletonWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    flexDirection: 'row',
  },
  verseSkeletonContent: {
    flex: 1,
    padding: 12,
    gap: 7,
    justifyContent: 'center',
  },
  verseSkeletonArt: {
    width: '40%',
    height: '100%',
  },
  recentActivitySection: {
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: '#1a2947',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.12)',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityRowTextContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  activityRowLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
    flex: 1,
  },
  activityRowTime: {
    color: '#8b96a8',
    fontSize: 10,
    fontFamily: 'Inter',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 44,
  },
  viewAllButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  viewAllButtonText: {
    color: '#b6c9ea',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  // CHANGE 3 — Shiny sweep overlay
  shinySweepOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    left: 0,
  },

  // CHANGE 4 — SplitText hero heading row
  heroHeadingSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // CHANGE 7 — Aurora glow SVG behind study card
  auroraGlowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },

});
