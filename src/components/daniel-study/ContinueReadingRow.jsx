import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CHAPTERS_DATA, CHAPTER_COLORS } from '../../data/danielStudyChapters';
import { ImageSkeleton } from '../ui/Skeleton';

function ContinueReadingCard({ chapter, progress }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePress = () => {
    router.push({ pathname: '/daniel-study/[chapter]', params: { chapter: String(chapter.num) } });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Continue reading Daniel ${chapter.num}, ${progress}% complete`}
    >
      <View style={styles.imageWrap}>
        {chapter.image ? (
          <>
            {!imageLoaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={chapter.image}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: CHAPTER_COLORS[chapter.num] || '#1e3a8a' }]}>
            <Text style={styles.placeholderText}>{chapter.title}</Text>
          </View>
        )}
        <View style={styles.chapterBadge}>
          <Text style={styles.chapterBadgeText}>Ch {chapter.num}</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{progress}%</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {chapter.title}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ContinueReadingRow({ progressMap = {} }) {
  // Find chapters with 0 < progress < 100 sorted descending, or fallback to first few chapters
  const items = CHAPTERS_DATA.map((ch) => {
    const p = progressMap[ch.id]?.progress ?? 0;
    return { chapter: ch, progress: p };
  })
    .filter((item) => item.progress > 0 && item.progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4);

  // If no partial progress chapters exist, fallback to showing chapters 1, 2, 5 with sample/default progress
  const displayItems =
    items.length > 0
      ? items
      : CHAPTERS_DATA.slice(0, 3).map((ch) => ({
          chapter: ch,
          progress: progressMap[ch.id]?.progress || (ch.id === 1 ? 100 : ch.id === 5 ? 50 : 25),
        }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {displayItems.map(({ chapter, progress }) => (
        <ContinueReadingCard key={chapter.id} chapter={chapter} progress={progress} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  card: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    backgroundColor: '#0A1324',
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative', height: 96, backgroundColor: '#07111F' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  placeholderText: { color: '#ffffff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  chapterBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(7, 17, 31, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chapterBadgeText: { color: '#E8A838', fontSize: 10, fontWeight: '700', fontFamily: 'Inter' },
  progressBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(36, 99, 255, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  progressBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', fontFamily: 'Inter' },
  info: { padding: 10 },
  title: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', fontFamily: 'Inter' },
  track: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#2463ff', borderRadius: 2 },
});
