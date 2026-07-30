import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Crown, Bookmark, BookmarkCheck, Play, X } from 'lucide-react-native';

import { CHAPTER_COLORS, CHAPTERS_DATA } from '../data/danielStudyChapters';
import { EXPLORE_TOPICS } from '../data/danielStudyTopics';
import { getAllChapterProgress, toggleChapterBookmark } from '@/lib/daniel-progress';
import TopicGrid from './daniel-study/TopicGrid';
import ContinueReadingRow from './daniel-study/ContinueReadingRow';
import DailyInsightCard from './daniel-study/DailyInsightCard';
import StudyIcon from './daniel-study/StudyIcon';
import { ImageSkeleton } from './ui/Skeleton';

function getStatusMeta(status) {
  if (status === 'completed') return { icon: 'checkCircle', label: 'Completed', color: '#16a34a' };
  if (status === 'in-progress') return { icon: 'halfClock', label: 'In Progress', color: '#2563eb' };
  return { icon: 'circle', label: 'Not Started', color: '#94a3b8' };
}

function SectionHeader({ title, filterText, onClearFilter }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filterText && (
        <TouchableOpacity style={styles.filterChip} onPress={onClearFilter} activeOpacity={0.8}>
          <Text style={styles.filterChipText}>Showing: {filterText}</Text>
          <X size={12} color="#E8A838" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ChapterCard({ chapter, selected, dark, onPress }) {
  const meta = getStatusMeta(chapter.status);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chapterCard,
        {
          borderColor: selected ? '#2563eb' : 'rgba(148,163,184,0.18)',
          borderWidth: selected ? 2 : 1,
        },
      ]}
      activeOpacity={0.85}
    >
      <View style={styles.chapterImageWrap}>
        {chapter.image ? (
          <>
            {!imageLoaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={chapter.image}
              style={styles.chapterImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.chapterImagePlaceholder, { backgroundColor: CHAPTER_COLORS[chapter.num] || '#1e3a8a' }]}>
            <Text style={styles.chapterPlaceholderText}>{chapter.title}</Text>
          </View>
        )}
        <View style={styles.chapterNumBadge}>
          <Text style={styles.chapterNumText}>{chapter.num}</Text>
        </View>
      </View>
      <View style={styles.chapterInfo}>
        <Text
          style={[styles.chapterTitle, { color: chapter.status === 'in-progress' ? '#5fa5ff' : '#ffffff' }]}
          numberOfLines={1}
        >
          {chapter.title}
        </Text>
        <View style={styles.chapterStatusRow}>
          <StudyIcon name={meta.icon} size={13} color={meta.color} />
          <Text style={[styles.chapterStatus, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={styles.chapterRef}>{chapter.ref}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DanielStudyPage({
  onNavigate,
  embedded = false,
  darkMode: controlledDark,
  initialChapter = 5,
  completedChapters = [],
  selectedTopic = null,
  openChapterOnPress = false,
}) {
  const insets = useSafeAreaInsets();

  const [progressMap, setProgressMap] = useState({});
  const chapterListRef = useRef(null);

  // Fetch AsyncStored progress data for all 12 chapters
  const loadProgress = useCallback(async () => {
    const data = await getAllChapterProgress();
    setProgressMap(data);
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
    }, [loadProgress])
  );

  // Determine Focus Chapter: highest partial progress (0 < progress < 100), else initialChapter
  const focusChapter = useMemo(() => {
    let bestChapter = 0;
    let highestProgress = 0;

    Object.entries(progressMap).forEach(([chStr, data]) => {
      const chNum = Number(chStr);
      if (data.progress > 0 && data.progress < 100 && data.progress > highestProgress) {
        highestProgress = data.progress;
        bestChapter = chNum;
      }
    });

    return bestChapter > 0 ? bestChapter : Math.min(Math.max(initialChapter, 1), 12);
  }, [progressMap, initialChapter]);

  const focusChapterData = CHAPTERS_DATA.find((c) => c.id === focusChapter) ?? CHAPTERS_DATA[0];
  const focusProgress = progressMap[focusChapter]?.progress ?? (completedChapters.includes(focusChapter) ? 100 : 0);
  const isBookmarked = Boolean(progressMap[focusChapter]?.bookmarked);

  const handleToggleBookmark = async () => {
    const nextState = await toggleChapterBookmark(focusChapter);
    setProgressMap((prev) => ({
      ...prev,
      [focusChapter]: {
        ...prev[focusChapter],
        progress: prev[focusChapter]?.progress ?? 0,
        bookmarked: nextState,
      },
    }));
  };

  const handleContinueReading = () => {
    router.push({
      pathname: '/daniel-study/[chapter]',
      params: { chapter: String(focusChapter) },
    });
  };

  const handleSelectChapter = useCallback(
    (chapterNum) => {
      router.push({
        pathname: '/daniel-study/[chapter]',
        params: { chapter: String(chapterNum) },
      });
    },
    []
  );

  const normalisedCompleted = useMemo(
    () => [...new Set(completedChapters.filter((n) => Number.isInteger(n) && n >= 1 && n <= 12))],
    [completedChapters]
  );

  const chaptersWithStatus = useMemo(
    () =>
      CHAPTERS_DATA.map((ch) => {
        const p = progressMap[ch.id]?.progress ?? 0;
        const isCompleted = normalisedCompleted.includes(ch.id) || p >= 100;
        const isInProgress = p > 0 && p < 100;
        return {
          ...ch,
          status: isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'not-started',
        };
      }),
    [progressMap, normalisedCompleted]
  );

  // Filter chapters if topic query parameter is active
  const filteredChapters = useMemo(() => {
    if (!selectedTopic) return chaptersWithStatus;
    const normTopic = selectedTopic.toLowerCase();
    return chaptersWithStatus.filter((ch) =>
      ch.topics?.some((t) => t.toLowerCase().includes(normTopic) || normTopic.includes(t.toLowerCase()))
    );
  }, [chaptersWithStatus, selectedTopic]);

  const clearTopicFilter = () => {
    router.setParams({ topic: undefined });
  };

  return (
    <View style={[styles.root, { paddingTop: embedded ? insets.top : 0 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: embedded ? insets.bottom + 90 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO SECTION */}
        <View style={styles.heroWrap}>
          {focusChapterData.image ? (
            <ImageBackground source={focusChapterData.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: CHAPTER_COLORS[focusChapter] || '#07111F' }]} />
          )}

          <LinearGradient
            colors={['rgba(4,15,45,0.92)', 'rgba(4,15,45,0.75)', '#040f2d']}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroEyebrowRow}>
              <Crown size={14} color="#E8A838" />
              <Text style={styles.heroEyebrow}>CONTINUE YOUR STUDY</Text>
            </View>

            <Text style={styles.heroTitle}>Daniel {focusChapter}</Text>
            <Text style={styles.heroSubtitle}>{focusChapterData.subtitle || focusChapterData.title}</Text>

            <View style={styles.heroProgressCard}>
              <View style={styles.heroProgressHeader}>
                <Text style={styles.heroProgressLabel}>Chapter Progress</Text>
                <Text style={styles.heroProgressValue}>{focusProgress}%</Text>
              </View>
              <View style={styles.heroProgressTrack}>
                <View style={[styles.heroProgressFill, { width: `${focusProgress}%` }]} />
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleContinueReading}
                style={styles.continueBtn}
                accessibilityRole="button"
                accessibilityLabel={`Continue reading Daniel ${focusChapter}`}
              >
                <Play size={16} color="#040f2d" fill="#040f2d" />
                <Text style={styles.continueBtnText}>Continue Reading</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleToggleBookmark}
                style={[styles.bookmarkBtn, isBookmarked && styles.bookmarkBtnActive]}
                accessibilityRole="button"
                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark chapter'}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={20} color="#E8A838" fill="#E8A838" />
                ) : (
                  <Bookmark size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. CONTINUE READING ROW */}
        <SectionHeader title="Continue Reading" />
        <ContinueReadingRow progressMap={progressMap} />

        {/* 3. EXPLORE BY TOPIC GRID */}
        <SectionHeader title="Explore by Topic" />
        <TopicGrid topics={EXPLORE_TOPICS} />

        {/* 4. CHAPTERS CAROUSEL */}
        <SectionHeader
          title="Chapters"
          filterText={selectedTopic}
          onClearFilter={clearTopicFilter}
        />
        <FlatList
          ref={chapterListRef}
          data={filteredChapters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chapterListContent}
          renderItem={({ item }) => (
            <ChapterCard
              chapter={item}
              selected={item.id === focusChapter}
              onPress={() => handleSelectChapter(item.id)}
            />
          )}
          style={styles.chapterList}
        />

        {/* 5. DAILY INSIGHT CARD */}
        <SectionHeader title="Daily Insight" />
        <DailyInsightCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040f2d' },
  scroll: { flex: 1 },
  mainContent: { paddingVertical: 12 },

  // Hero section
  heroWrap: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
    minHeight: 240,
  },
  heroContent: {
    padding: 20,
    gap: 8,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroEyebrow: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: '#E6EEFF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
  },
  heroProgressCard: {
    backgroundColor: 'rgba(10, 19, 36, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    gap: 6,
  },
  heroProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroProgressLabel: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  },
  heroProgressValue: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
  heroProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#E8A838',
    borderRadius: 3,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  continueBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#E8A838',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  continueBtnText: {
    color: '#040f2d',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(10, 19, 36, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtnActive: {
    borderColor: '#E8A838',
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: '700',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232, 168, 56, 0.15)',
    borderColor: 'rgba(232, 168, 56, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterChipText: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  },

  // Chapter Carousel Cards
  chapterList: { marginHorizontal: 0 },
  chapterListContent: { paddingHorizontal: 16, paddingVertical: 4, gap: 10 },
  chapterCard: { width: 144, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0A1324' },
  chapterImageWrap: { position: 'relative', height: 110 },
  chapterImage: { width: '100%', height: '100%' },
  chapterImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  chapterPlaceholderText: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  chapterNumBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2463ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chapterInfo: { padding: 10 },
  chapterTitle: { fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },
  chapterStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chapterStatus: { fontSize: 11, fontWeight: '500', fontFamily: 'Inter' },
  chapterRef: { fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: 'Inter' },
});
