import { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  ChevronLeft,
  Clock,
  Compass,
  Crown,
  Landmark,
  Lightbulb,
  Play,
  RotateCcw,
  User,
} from 'lucide-react-native';

import { CHAPTER_COLORS } from '@/data/danielStudyChapters';
import { STUDY_VIDEOS, VIDEO_CATEGORIES, getCategoryMeta } from '@/data/danielStudyVideos';
import { ImageSkeleton } from '@/components/ui/Skeleton';

const CATEGORY_ICONS = { BookOpen, Crown, User, Landmark, Compass, RotateCcw, Lightbulb };
const ACCENT = '#E8A838';

function VideoRowCard({ video }) {
  const [loaded, setLoaded] = useState(false);
  const chapterColor = video.chapter ? CHAPTER_COLORS[video.chapter] : '#1e3a8a';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/daniel-study/videos/[id]', params: { id: video.id } })}
      style={styles.rowCard}
      accessibilityRole="button"
      accessibilityLabel={`Play ${video.title}`}
    >
      <View style={styles.rowThumbWrap}>
        {video.thumbnail ? (
          <>
            {!loaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={video.thumbnail}
              style={styles.rowThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.rowThumbPlaceholder, { backgroundColor: chapterColor || '#1e3a8a' }]} />
        )}
        <View style={styles.rowPlayDot}>
          <Play size={12} color="#ffffff" fill="#ffffff" />
        </View>
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>{video.subtitle}</Text>
        <View style={styles.rowMetaRow}>
          <Clock size={11} color="#64748b" />
          <Text style={styles.rowMetaText}>{video.duration}</Text>
          {video.chapter ? <Text style={styles.rowMetaDot}>{'\u2022'}</Text> : null}
          {video.chapter ? <Text style={styles.rowMetaText}>Daniel {video.chapter}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VideoPosterCard({ video }) {
  const [loaded, setLoaded] = useState(false);
  const chapterColor = video.chapter ? CHAPTER_COLORS[video.chapter] : '#1e3a8a';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/daniel-study/videos/[id]', params: { id: video.id } })}
      style={styles.posterCard}
      accessibilityRole="button"
      accessibilityLabel={`Play ${video.title}`}
    >
      <View style={styles.posterImageWrap}>
        {video.thumbnail ? (
          <>
            {!loaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={video.thumbnail}
              style={styles.posterImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.posterPlaceholder, { backgroundColor: chapterColor || '#1e3a8a' }]}>
            <Text style={styles.posterPlaceholderText} numberOfLines={2}>{video.title}</Text>
          </View>
        )}
        <View style={styles.posterPlayDot}>
          <Play size={12} color="#ffffff" fill="#ffffff" />
        </View>
        <View style={styles.posterDurationBadge}>
          <Text style={styles.posterDurationText}>{video.duration}</Text>
        </View>
      </View>
      <Text style={styles.posterTitle} numberOfLines={2}>{video.title}</Text>
    </TouchableOpacity>
  );
}

function CategorySection({ category, videos }) {
  const Icon = CATEGORY_ICONS[category.icon] ?? BookOpen;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIconWrap, { borderColor: `${category.color}40`, backgroundColor: `${category.color}14` }]}>
          <Icon size={16} color={category.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{category.label}</Text>
          <Text style={styles.sectionSubtitle}>{category.description}</Text>
        </View>
      </View>
      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ flexGrow: 0 }}
  contentContainerStyle={styles.sectionRow}
>
        {videos.map((video) => (
          <VideoPosterCard key={video.id} video={video} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function StudyVideoLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { category: categoryParam } = useLocalSearchParams();
  const initialCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const [activeCategory, setActiveCategory] = useState(
    VIDEO_CATEGORIES.some((c) => c.id === initialCategory) ? initialCategory : 'all'
  );

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'all') return STUDY_VIDEOS;
    return STUDY_VIDEOS.filter((v) => v.category === activeCategory);
  }, [activeCategory]);

  const activeCategoryMeta = activeCategory !== 'all' ? getCategoryMeta(activeCategory) : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color={ACCENT} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerEyebrow}>DANIEL STUDY</Text>
          <Text style={styles.headerTitle}>Study Videos</Text>
        </View>
      </View>

      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ flexGrow: 0 }}
  contentContainerStyle={styles.filterRow}
>
        <TouchableOpacity
          onPress={() => setActiveCategory('all')}
          style={[styles.filterChip, activeCategory === 'all' && styles.filterChipActive]}
          activeOpacity={0.85}
        >
          <Text style={[styles.filterChipText, activeCategory === 'all' && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {VIDEO_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          const Icon = CATEGORY_ICONS[category.icon] ?? BookOpen;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => setActiveCategory(category.id)}
              style={[styles.filterChip, isActive && { backgroundColor: category.color, borderColor: category.color }]}
              activeOpacity={0.85}
            >
              <Icon size={13} color={isActive ? '#040f2d' : '#94A3B8'} />
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{category.shortLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {activeCategory === 'all' ? (
          VIDEO_CATEGORIES.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              videos={STUDY_VIDEOS.filter((v) => v.category === category.id)}
            />
          ))
        ) : (
          <View style={styles.section}>
            {activeCategoryMeta ? (
              <Text style={styles.filteredDescription}>{activeCategoryMeta.description}</Text>
            ) : null}
            <View style={styles.list}>
              {filteredVideos.map((video) => (
                <VideoRowCard key={video.id} video={video} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040f2d' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10, 19, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrow: { color: '#E8A838', fontFamily: 'Inter', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  headerTitle: { color: '#FFFFFF', fontFamily: 'Cinzel', fontSize: 22, fontWeight: '700' },

  filterRow: { gap: 8, paddingHorizontal: 16, paddingBottom: 12, alignItems: 'flex-start' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: '#0A1324',
  },
  filterChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterChipText: { color: '#94A3B8', fontFamily: 'Inter', fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#040f2d' },

  section: { marginTop: 14, marginBottom: 6 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 15, fontWeight: '700' },
  sectionSubtitle: { color: '#64748b', fontFamily: 'Inter', fontSize: 11, marginTop: 1 },
  sectionRow: { gap: 12, paddingHorizontal: 16, alignItems: 'flex-start' },
  filteredDescription: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  list: { paddingHorizontal: 16, gap: 12 },

  posterCard: { width: 140 },
  posterImageWrap: {
    position: 'relative',
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#07111F',
  },
  posterImage: { width: '100%', height: '100%' },
  posterPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  posterPlaceholderText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  posterPlayDot: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 15, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterDurationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(4, 15, 45, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posterDurationText: { color: '#E6EEFF', fontFamily: 'Inter', fontSize: 9, fontWeight: '700' },
  posterTitle: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 11.5, fontWeight: '700', marginTop: 6, lineHeight: 15 },

  rowCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 14,
    backgroundColor: '#0A1324',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    padding: 8,
  },
  rowThumbWrap: { position: 'relative', width: 96, height: 64, borderRadius: 10, overflow: 'hidden', backgroundColor: '#07111F' },
  rowThumb: { width: '100%', height: '100%' },
  rowThumbPlaceholder: { flex: 1 },
  rowPlayDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(4, 15, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, justifyContent: 'center', gap: 2 },
  rowTitle: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 12.5, fontWeight: '700', lineHeight: 16 },
  rowSubtitle: { color: '#94A3B8', fontFamily: 'Inter', fontSize: 11 },
  rowMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rowMetaText: { color: '#64748b', fontFamily: 'Inter', fontSize: 10, fontWeight: '600' },
  rowMetaDot: { color: '#475569', fontSize: 10 },
});
