import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Landmark,
  Lightbulb,
  Play,
  RotateCcw,
  User,
} from 'lucide-react-native';

import { CHAPTER_COLORS } from '../../data/danielStudyChapters';
import { STUDY_VIDEOS, VIDEO_CATEGORIES, getFeaturedVideo } from '../../data/danielStudyVideos';
import { getInProgressVideoIds, useVideoProgress } from '@/lib/video-progress';
import { ImageSkeleton } from '../ui/Skeleton';

const CATEGORY_ICONS = { BookOpen, Crown, User, Landmark, Compass, RotateCcw, Lightbulb };

function openVideo(id) {
  router.push({ pathname: '/daniel-study/videos/[id]', params: { id } });
}

function openLibrary(categoryId) {
  if (categoryId) {
    router.push({ pathname: '/daniel-study/videos', params: { category: categoryId } });
  } else {
    router.push('/daniel-study/videos');
  }
}

function FeaturedVideoCard({ video }) {
  const [loaded, setLoaded] = useState(false);
  if (!video) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openVideo(video.id)}
      style={styles.featuredCard}
      accessibilityRole="button"
      accessibilityLabel={`Play featured video, ${video.title}`}
    >
      {video.thumbnail ? (
        <>
          {!loaded && (
            <View style={StyleSheet.absoluteFillObject}>
              <ImageSkeleton width="100%" height="100%" borderRadius={0} />
            </View>
          )}
          <Image
            source={video.thumbnail}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1e3a8a' }]} />
      )}
      <View style={styles.featuredDim} />

      <View style={styles.featuredEyebrowRow}>
        <Text style={styles.featuredEyebrow}>FEATURED VIDEO</Text>
      </View>

      <View style={styles.featuredPlayWrap}>
        <View style={styles.featuredPlayBtn}>
          <Play size={22} color="#040f2d" fill="#040f2d" />
        </View>
      </View>

      <View style={styles.featuredDurationBadge}>
        <Text style={styles.featuredDurationText}>{video.duration}</Text>
      </View>

      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{video.title}</Text>
        <Text style={styles.featuredSubtitle} numberOfLines={1}>{video.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function VideoThumbCard({ video, badgeText }) {
  const [loaded, setLoaded] = useState(false);
  const chapterColor = video.chapter ? CHAPTER_COLORS[video.chapter] : '#1e3a8a';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openVideo(video.id)}
      style={styles.thumbCard}
      accessibilityRole="button"
      accessibilityLabel={`Play ${video.title}`}
    >
      <View style={styles.thumbImageWrap}>
        {video.thumbnail ? (
          <>
            {!loaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={video.thumbnail}
              style={styles.thumbImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: chapterColor || '#1e3a8a' }]}>
            <Text style={styles.thumbPlaceholderText} numberOfLines={2}>{video.title}</Text>
          </View>
        )}
        <View style={styles.thumbPlayDot}>
          <Play size={11} color="#ffffff" fill="#ffffff" />
        </View>
        <View style={styles.thumbDurationBadge}>
          <Clock size={9} color="#E6EEFF" />
          <Text style={styles.thumbDurationText}>{video.duration}</Text>
        </View>
      </View>
      <Text style={styles.thumbTitle} numberOfLines={2}>{video.title}</Text>
      {badgeText ? <Text style={styles.thumbBadge}>{badgeText}</Text> : null}
    </TouchableOpacity>
  );
}

function CategoryChip({ category }) {
  const Icon = CATEGORY_ICONS[category.icon] ?? BookOpen;
  const count = STUDY_VIDEOS.filter((v) => v.category === category.id).length;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openLibrary(category.id)}
      style={styles.categoryChip}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${category.label} videos`}
    >
      <View style={[styles.categoryIconWrap, { borderColor: `${category.color}40`, backgroundColor: `${category.color}14` }]}>
        <Icon size={18} color={category.color} />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={1}>{category.shortLabel}</Text>
      <Text style={styles.categoryMeta}>{count} videos</Text>
    </TouchableOpacity>
  );
}

export default function StudyVideosSection({ progressMap = {} }) {
  const { progress: videoProgress } = useVideoProgress();
  const featured = useMemo(() => getFeaturedVideo(), []);

  const continueWatching = useMemo(() => {
    const watchedIds = getInProgressVideoIds(videoProgress, 6);
    if (watchedIds.length > 0) {
      return watchedIds
        .map((id) => STUDY_VIDEOS.find((v) => v.id === id))
        .filter(Boolean)
        .map((video) => ({ video, badgeText: `${videoProgress[video.id]?.percent ?? 0}% watched` }));
    }

    // Nothing watched yet: suggest the chapter video that matches whatever
    // reading chapter is currently in progress, so the row still feels earned.
    const inProgressChapters = Object.entries(progressMap)
      .filter(([, data]) => data?.progress > 0 && data.progress < 100)
      .sort((a, b) => (b[1]?.progress ?? 0) - (a[1]?.progress ?? 0))
      .map(([chStr]) => Number(chStr));

    const suggestions = inProgressChapters
      .map((chNum) => STUDY_VIDEOS.find((v) => v.category === 'chapters' && v.chapter === chNum))
      .filter(Boolean);

    if (suggestions.length > 0) {
      return suggestions.slice(0, 4).map((video) => ({ video, badgeText: 'Matches your reading' }));
    }

    // Final fallback: lead with the first couple of chapter videos.
    return STUDY_VIDEOS.filter((v) => v.category === 'chapters')
      .slice(0, 3)
      .map((video) => ({ video, badgeText: null }));
  }, [videoProgress, progressMap]);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Study Videos</Text>
        <TouchableOpacity
          onPress={() => openLibrary()}
          activeOpacity={0.7}
          style={styles.viewAllBtn}
          accessibilityRole="button"
          accessibilityLabel="View all study videos"
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={15} color="#5fa5ff" />
        </TouchableOpacity>
      </View>

      <View style={styles.featuredWrap}>
        <FeaturedVideoCard video={featured} />
      </View>

      <Text style={styles.subheading}>Continue Watching</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {continueWatching.map(({ video, badgeText }) => (
          <VideoThumbCard key={video.id} video={video} badgeText={badgeText} />
        ))}
      </ScrollView>

      <Text style={styles.subheading}>Browse by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {VIDEO_CATEGORIES.map((category) => (
          <CategoryChip key={category.id} category={category} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { color: '#FFFFFF', fontFamily: 'Cinzel', fontSize: 18, fontWeight: '700' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { color: '#5fa5ff', fontFamily: 'Inter', fontSize: 13, fontWeight: '600' },

  subheading: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  // Featured card
  featuredWrap: { paddingHorizontal: 16 },
  featuredCard: {
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    backgroundColor: '#0A1324',
  },
  featuredDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 15, 45, 0.28)',
  },
  featuredEyebrowRow: { position: 'absolute', top: 12, left: 14 },
  featuredEyebrow: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  featuredPlayWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  featuredPlayBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8A838',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredDurationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(4, 15, 45, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredDurationText: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 11, fontWeight: '700' },
  featuredInfo: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    gap: 2,
  },
  featuredTitle: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 15, fontWeight: '800' },
  featuredSubtitle: { color: '#CBD5E1', fontFamily: 'Inter', fontSize: 12, fontWeight: '500' },

  // Rows
  row: { gap: 12, paddingHorizontal: 16, paddingVertical: 4 },

  // Continue watching thumb card
  thumbCard: { width: 150 },
  thumbImageWrap: {
    position: 'relative',
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#07111F',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  thumbPlaceholderText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  thumbPlayDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(4, 15, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbDurationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(4, 15, 45, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  thumbDurationText: { color: '#E6EEFF', fontFamily: 'Inter', fontSize: 9, fontWeight: '700' },
  thumbTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    lineHeight: 16,
  },
  thumbBadge: {
    color: '#5fa5ff',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Category chip
  categoryChip: {
    width: 108,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    backgroundColor: '#0A1324',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  categoryMeta: { color: '#64748B', fontFamily: 'Inter', fontSize: 10, fontWeight: '500' },
});
