import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { DANIEL_COLLECTIONS } from '../../data/danielCollections';
import { ImageSkeleton } from '../ui/Skeleton';

function CollectionCard({ collection }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePress = () => {
    const firstChapter = collection.chapters[0] ?? 1;
    router.push({ pathname: '/daniel-study/[chapter]', params: { chapter: String(firstChapter) } });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${collection.label} collection, ${collection.chapterCount} chapters`}
    >
      <View style={styles.imageWrap}>
        {!imageLoaded && (
          <View style={StyleSheet.absoluteFillObject}>
            <ImageSkeleton width="100%" height="100%" borderRadius={0} />
          </View>
        )}
        <ImageBackground
          source={collection.image}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          onLoad={() => setImageLoaded(true)}
        >
          <LinearGradient
            colors={['rgba(7,17,31,0.2)', 'rgba(7,17,31,0.85)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.content}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{collection.chapterCount} Chapters</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {collection.label}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
}

export default function CollectionsRow() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {DANIEL_COLLECTIONS.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  card: {
    width: 150,
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    backgroundColor: '#0A1324',
    overflow: 'hidden',
  },
  imageWrap: { flex: 1, position: 'relative' },
  image: { width: '100%', height: '100%' },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(7, 17, 31, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.3)',
  },
  countText: { color: '#E8A838', fontSize: 10, fontWeight: '700', fontFamily: 'Inter' },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', fontFamily: 'Cinzel' },
});
