import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { BookOpen, CalendarDays } from 'lucide-react-native';
import { ComponentProps, ComponentType, useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { DANIEL_CHAPTERS, formatDisplayDate } from '../../constants/bible-connection';
import { KEY_VERSES } from '../../constants/key-verses';
import { useDanielProgress } from '../../lib/daniel-progress';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SharedAnimatedView = Animated.View as ComponentType<
  ComponentProps<typeof Animated.View> & { sharedTransitionTag?: string }
>;
const SharedAnimatedText = Animated.Text as ComponentType<
  ComponentProps<typeof Animated.Text> & { sharedTransitionTag?: string }
>;

const quickAccessItems = [
  { title: 'Daniel Study', subtitle: 'Explore the book of Daniel chapter by chapter with interactive tools.', icon: require('../../assets/Icons/crown.png'), buttonText: 'Open', color: '#2463ff' },
  { title: 'Historical Context', subtitle: 'Discover the historical background from Prophets and Kings.', icon: require('../../assets/Icons/Building.png'), buttonText: 'Open', color: '#ff9500' },
  { title: 'Connections', subtitle: 'See how verses, events, and themes connect across Scripture.', icon: require('../../assets/Icons/Connection.png'), buttonText: 'Explore', color: '#10b981' },
  { title: 'Timeline', subtitle: 'Walk through biblical history from Babylon to Medo-Persia and beyond.', icon: require('../../assets/Icons/Timeline.png'), buttonText: 'View Timeline', color: '#a855f7' },
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
};

function normalizeBibleBookName(book: string) {
  if (book === 'Psalm') {
    return 'Psalms';
  }

  return book;
}

function parseVerseReference(reference: string) {
  const match = reference.trim().match(/^(?:(\d)\s+)?(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);

  if (!match) {
    return null;
  }

  const [, bookPrefix, bookName, chapter, verse] = match;
  const normalizedBookName = normalizeBibleBookName(`${bookPrefix ? `${bookPrefix} ` : ''}${bookName}`.trim());

  return {
    book: normalizedBookName,
    chapter: Number(chapter),
    verse: Number(verse),
  };
}

const DAILY_KEY_VERSES: DailyVerse[] = KEY_VERSES.map((verse) => {
  const parsedReference = parseVerseReference(verse.reference);

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
    ...parsedReference,
  };
});

function getDailyKeyVerse(date = new Date()) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((today - start) / 86_400_000);

  return DAILY_KEY_VERSES[dayOfYear % DAILY_KEY_VERSES.length];
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
  const scale = useSharedValue(1);
  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).springify()}
      style={styles.quickAccessCardWrapper}
    >
      <AnimatedPressable
        onPress={() => router.push('/bible')}
        onPressIn={() => {
          scale.set(withSpring(0.96));
        }}
        onPressOut={() => {
          scale.set(withSpring(1));
        }}
        style={animatedCard}
      >
        <View style={[styles.quickAccessCard, { borderColor: item.color + '40' }]}>
          <SharedAnimatedView
            sharedTransitionTag={`quickaccess-icon-${index}`}
            style={[styles.quickAccessIconLarge, { backgroundColor: item.color }]}
          >
            <Image source={item.icon} style={styles.quickAccessCardIcon} resizeMode="contain" />
          </SharedAnimatedView>
          <SharedAnimatedText sharedTransitionTag={`quickaccess-title-${index}`} style={styles.quickAccessCardTitle}>
            {item.title}
          </SharedAnimatedText>
          <Text style={styles.quickAccessCardDescription}>{item.subtitle}</Text>
          <View style={[styles.quickAccessButton, { backgroundColor: item.color + '20', borderColor: item.color }]}>
            <Text style={[styles.quickAccessButtonText, { color: item.color }]}>{item.buttonText}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress / 100);

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
        <Text style={styles.progressRingText}>{`${clampedProgress}%`}</Text>
      </View>
    </View>
  );
}

export default function HomeTabScreen() {
  const insets = useSafeAreaInsets();
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
  const [currentPlaceImageIndex, setCurrentPlaceImageIndex] = useState(1);
  const [previousPlaceImageIndex, setPreviousPlaceImageIndex] = useState(1);
  const completedChapters = useDanielProgress();
  const initialVerseIndex = useMemo(() => {
    const start = Date.UTC(new Date().getFullYear(), 0, 0);
    const today = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const dayOfYear = Math.floor((today - start) / 86_400_000);

    return dayOfYear % DAILY_KEY_VERSES.length;
  }, []);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex);
  const dailyVerse = DAILY_KEY_VERSES[currentVerseIndex] ?? getDailyKeyVerse();
  const displayDate = useMemo(() => formatDisplayDate(), []);

  const completedCount = completedChapters.length;
  const progressPercent = Math.round((completedCount / STUDY_TOTAL_CHAPTERS) * 100);
  const nextChapter =
    Array.from({ length: STUDY_TOTAL_CHAPTERS }, (_, index) => index + 1).find(
      (chapterNumber) => !completedChapters.includes(chapterNumber)
    ) ?? STUDY_TOTAL_CHAPTERS;
  const nextChapterData = DANIEL_CHAPTERS.find((chapter) => chapter.chapter === nextChapter) ?? DANIEL_CHAPTERS[0];
  const showcase = chapterShowcase[nextChapter as keyof typeof chapterShowcase];
  const chapterArtwork = showcase?.image;
  const chapterGradient = showcase?.gradient ?? ['rgba(14, 28, 58, 0.14)', 'rgba(15, 31, 69, 0.96)'];

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.get(), [0, 300], [0, -80], Extrapolation.CLAMP) }],
  }));

  const currentHeroImageStyle = useAnimatedStyle(() => ({
    opacity: heroImageOpacity.get(),
  }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPlaceImageIndex((prevIndex) => {
        setPreviousPlaceImageIndex(prevIndex);
        return (prevIndex + 1) % placeImages.length;
      });
      setCurrentVerseIndex((prevIndex) => (prevIndex + 1) % DAILY_KEY_VERSES.length);
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [placeImages.length]);

  useEffect(() => {
    heroImageOpacity.set(0);
    heroImageOpacity.set(withTiming(1, { duration: 1000 }));
  }, [currentPlaceImageIndex, heroImageOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#040f2d" />
      <Animated.ScrollView
        style={styles.streamScroll}
        contentContainerStyle={styles.streamContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.heroRow}>
          <View style={styles.heroCard}>
            <Animated.View style={[styles.heroBackgroundLayer, heroParallax]}>
              <AnimatedImageBackground
                source={placeImages[previousPlaceImageIndex]}
                resizeMode="cover"
                imageStyle={styles.heroImage}
                style={styles.heroBackgroundImage}
              />
              <AnimatedImageBackground
                source={placeImages[currentPlaceImageIndex]}
                resizeMode="cover"
                imageStyle={styles.heroImage}
                style={[styles.heroBackgroundImage, currentHeroImageStyle]}
              />
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
                <Image source={heroLogoImage} style={styles.heroLogo} resizeMode="contain" />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.heroTextBlock}>
                <Text style={styles.heroKicker}>Welcome back,</Text>
                <Text style={styles.heroHeading}>Desvorn!</Text>
                <Text style={styles.heroDescription}>Continue your journey through Daniel and discover the connections in God&apos;s Word.</Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Continue Study */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.studyCard}>
          <View style={styles.studyHeaderRow}>
            <BookOpen size={18} color="#2f8cff" fill="#2f8cff" strokeWidth={2.4} />
            <Text style={styles.studyLabel}>Continue Study</Text>
          </View>

          <View style={styles.studyCardRow}>
            <View style={styles.studyArtworkPanel} pointerEvents="none">
              {chapterArtwork ? (
                <ImageBackground source={chapterArtwork} resizeMode="cover" imageStyle={styles.studyArtworkImage} style={styles.studyArtworkFill} />
              ) : (
                <LinearGradient colors={chapterGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.studyArtworkFill} />
              )}
              <LinearGradient
                colors={['rgba(3,12,32,0)', 'rgba(3,12,32,0.12)', 'rgba(3,12,32,0.58)']}
                locations={[0, 0.58, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.studyArtworkFade}
              />
            </View>

            <View style={styles.studyCopyColumn}>
              <SharedAnimatedText
                sharedTransitionTag={`open-chapter-daniel-${nextChapter}-title`}
                style={styles.studyChapter}
              >
                {`Daniel ${nextChapter}`}
              </SharedAnimatedText>
              <Text style={styles.studyTitle}>{nextChapterData.title}</Text>
              <Text style={styles.studyDescription}>{nextChapterData.description}</Text>
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
                <Pressable style={styles.openButton}>
                  <Text style={styles.openButtonText}>Open Chapter</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.studyProgressColumn}>
              <ProgressRing progress={progressPercent} />
              <Text style={styles.studyProgressLabel}>Overall Progress</Text>
              <Text style={styles.studyCompletedText}>{`${completedCount} of ${STUDY_TOTAL_CHAPTERS} Chapters\nCompleted`}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Key Verse */}
        <Animated.View entering={FadeInUp.delay(260).duration(500)} style={styles.verseCard}>
          {/* Full bleed artwork on right */}
          <View style={styles.verseArtworkWrap} pointerEvents="none">
            <ImageBackground
              source={require('../../assets/Aesthetics/Bible.jpg')}
              resizeMode="cover"
              imageStyle={styles.verseBgImage}
              style={styles.verseBackground}
            />
          </View>
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

        {/* Quick Access */}
        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.quickAccessSection}>
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

      </Animated.ScrollView>
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
    backgroundColor: '#071d3a',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.28)',
  },
  studyCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  studyCopyColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
  },
  studyArtworkPanel: {
    width: 122,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#102844',
  },
  studyArtworkFill: {
    ...StyleSheet.absoluteFillObject,
  },
  studyArtworkImage: {
    opacity: 0.96,
  },
  studyArtworkFade: {
    ...StyleSheet.absoluteFillObject,
  },
  studyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  studyLabel: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  studyChapter: {
    color: '#f1a23a',
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 27,
  },
  studyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 19,
  },
  studyDescription: {
    color: '#d8e5ff',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginTop: 5,
  },
  studyProgressColumn: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
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
    backgroundColor: '#0c2445',
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
  studyProgressLabel: {
    color: '#91a8c9',
    fontSize: 10,
    lineHeight: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  studyCompletedText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  openButton: {
    backgroundColor: '#2463ff',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 38,
    minWidth: 112,
    justifyContent: 'center',
    marginTop: 12,
  },
  openButtonText: { color: '#ffffff', fontSize: 13, lineHeight: 16, fontWeight: '700', fontFamily: 'Inter' },

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
    backgroundColor: '#1a2947',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
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

});
