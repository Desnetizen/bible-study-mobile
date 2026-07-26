import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { hexToRgba } from '@/lib/colors';
import type { PlaceEntry } from '@/data/medoPersianPlaces';

interface HorizontalPlaceCardProps {
  place: PlaceEntry;
  accentColor: string;
  onPress?: () => void;
}

export default function HorizontalPlaceCard({ place, accentColor, onPress }: HorizontalPlaceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        [styles.card, { borderColor: hexToRgba(accentColor, 0.15) }],
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <Image source={place.image} style={styles.image} contentFit="cover" />
      <View style={styles.textOverlay}>
        <Text style={[styles.name, { color: accentColor }]}>{place.name.toUpperCase()}</Text>
        <Text style={styles.role} numberOfLines={2}>
          {place.role}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(7, 17, 31, 0.85)',
    gap: 2,
  },
  name: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  role: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'Inter',
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '500',
  },
});
