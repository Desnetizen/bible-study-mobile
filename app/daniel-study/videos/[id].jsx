import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react-native';

import { getCategoryMeta, getRelatedVideos, getVideoById } from '@/data/danielStudyVideos';
import { recordVideoProgress, useVideoProgress } from '@/lib/video-progress';
import VideoPlayer from '@/components/daniel-study/VideoPlayer';
import { ImageSkeleton } from '@/components/ui/Skeleton';

const ACCENT = '#E8A838';

function RelatedVideoCard({ video }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/daniel-study/videos/[id]', params: { id: video.id } })}
      style={styles.relatedCard}
      accessibilityRole="button"
      accessibilityLabel={`Play ${video.title}`}
    >
      <View style={styles.relatedThumbWrap}>
        {video.thumbnail ? (
          <>
            {!loaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={video.thumbnail}
              style={styles.relatedThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.relatedThumb, { backgroundColor: '#1e3a8a' }]} />
        )}
        <View style={styles.relatedPlayDot}>
          <Play size={11} color="#ffffff" fill="#ffffff" />
        </View>
      </View>
      <Text style={styles.relatedTitle} numberOfLines={2}>{video.title}</Text>
      <Text style={styles.relatedDuration}>{video.duration}</Text>
    </TouchableOpacity>
  );
}

export default function StudyVideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const videoId = Array.isArray(id) ? id[0] : id;

  const video = useMemo(() => getVideoById(videoId), [videoId]);
  const category = useMemo(() => (video ? getCategoryMeta(video.category) : null), [video]);
  const relatedVideos = useMemo(() => getRelatedVideos(video, 6), [video]);
  const { progress, refresh } = useVideoProgress();

  const watchedPercent = video ? progress[video.id]?.percent ?? 0 : 0;
  const isComplete = watchedPercent >= 100;

  // A lightweight signal that the person opened this lesson, so it can
  // surface under "Continue Watching" even before real playback telemetry
  // (expo-video status / YouTube IFrame API events) is wired up.
  useFocusEffect(
    useCallback(() => {
      if (video && watchedPercent === 0) {
        void recordVideoProgress(video.id, 8);
      }
    }, [video, watchedPercent])
  );

  const handleMarkWatched = () => {
    if (!video) return;
    void recordVideoProgress(video.id, 100).then(refresh);
  };

  const handleOpenChapter = () => {
    if (!video?.chapter) return;
    router.push({ pathname: '/daniel-study/[chapter]', params: { chapter: String(video.chapter) } });
  };

  if (!video) {
    return (
      <View style={styles.root}>
        <View style={[styles.notFoundWrap, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.notFoundText}>This video couldn{'\u2019'}t be found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.notFoundBtn}>
            <Text style={styles.notFoundBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.playerWrap}>
          <VideoPlayer video={video} />
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + 10 }]}
            accessibilityRole="button"
            accessibilityLabel="Close video"
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            {category ? (
              <View style={[styles.categoryBadge, { backgroundColor: `${category.color}1F`, borderColor: `${category.color}55` }]}>
                <Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.label}</Text>
              </View>
            ) : null}
            <View style={styles.durationRow}>
              <Clock size={12} color="#64748b" />
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          </View>

          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.subtitle}>{video.subtitle}</Text>

          <View style={styles.actionRow}>
            {video.chapter ? (
              <TouchableOpacity onPress={handleOpenChapter} style={styles.chapterChip} activeOpacity={0.85}>
                <Text style={styles.chapterChipText}>Read Daniel {video.chapter}</Text>
                <ChevronRight size={14} color="#5fa5ff" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleMarkWatched}
              disabled={isComplete}
              style={[styles.watchedBtn, isComplete && styles.watchedBtnDone]}
              activeOpacity={0.85}
            >
              {isComplete && <Check size={14} color="#16a34a" />}
              <Text style={[styles.watchedBtnText, isComplete && styles.watchedBtnTextDone]}>
                {isComplete ? 'Watched' : 'Mark as Watched'}
              </Text>
            </TouchableOpacity>
          </View>

          {relatedVideos.length > 0 && (
            <>
              <Text style={styles.relatedHeading}>More in {category?.label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
                {relatedVideos.map((rv) => (
                  <RelatedVideoCard key={rv.id} video={rv} />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040f2d' },

  playerWrap: { position: 'relative' },
  backButton: {
    position: 'absolute',
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(4, 15, 45, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { padding: 16, gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryBadgeText: { fontFamily: 'Inter', fontSize: 11, fontWeight: '800' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { color: '#64748b', fontFamily: 'Inter', fontSize: 12, fontWeight: '600' },

  title: { color: '#FFFFFF', fontFamily: 'Cinzel', fontSize: 20, fontWeight: '700', lineHeight: 26 },
  subtitle: { color: '#94A3B8', fontFamily: 'Inter', fontSize: 14, marginTop: 4, lineHeight: 20 },

  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  chapterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 140, 255, 0.12)',
    borderColor: 'rgba(47, 140, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chapterChipText: { color: '#5fa5ff', fontFamily: 'Inter', fontSize: 12, fontWeight: '700' },
  watchedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(10, 19, 36, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  watchedBtnDone: { borderColor: 'rgba(22, 163, 74, 0.4)', backgroundColor: 'rgba(22, 163, 74, 0.12)' },
  watchedBtnText: { color: '#CBD5E1', fontFamily: 'Inter', fontSize: 12, fontWeight: '700' },
  watchedBtnTextDone: { color: '#16a34a' },

  relatedHeading: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 10,
  },
  relatedRow: { gap: 12, paddingBottom: 4 },
  relatedCard: { width: 130 },
  relatedThumbWrap: { position: 'relative', height: 78, borderRadius: 12, overflow: 'hidden', backgroundColor: '#07111F' },
  relatedThumb: { width: '100%', height: '100%' },
  relatedPlayDot: {
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
  relatedTitle: { color: '#FFFFFF', fontFamily: 'Inter', fontSize: 11.5, fontWeight: '700', marginTop: 6, lineHeight: 15 },
  relatedDuration: { color: '#64748b', fontFamily: 'Inter', fontSize: 10, marginTop: 2 },

  notFoundWrap: { flex: 1, alignItems: 'center', gap: 14, paddingHorizontal: 24 },
  notFoundText: { color: '#94A3B8', fontFamily: 'Inter', fontSize: 14, textAlign: 'center' },
  notFoundBtn: { backgroundColor: ACCENT, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  notFoundBtnText: { color: '#040f2d', fontFamily: 'Inter', fontSize: 13, fontWeight: '700' },
});
