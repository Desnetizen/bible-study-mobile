import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import { hexToRgba } from '@/lib/colors';
import { LinkedText } from '@/components/LinkedText';

interface GeographicOverviewCardProps {
  title: string;
  description: string;
  image: ImageSourcePropType;
  imageCaption: string;
  accentColor: string;
}

export default function GeographicOverviewCard({
  title,
  description,
  image,
  imageCaption,
  accentColor,
}: GeographicOverviewCardProps) {
  return (
    <View style={[styles.card, { borderColor: hexToRgba(accentColor, 0.18) }]}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <LinkedText text={description} style={styles.description} />
      </View>
      <View style={styles.imageBlock}>
        <Image source={image} style={styles.thumbnail} contentFit="cover" />
        <Text style={styles.caption}>{imageCaption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#0C1420',
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 16,
  },
  imageBlock: {
    width: 100,
    gap: 4,
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  caption: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 11,
  },
});
