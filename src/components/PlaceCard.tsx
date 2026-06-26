import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { hexToRgba } from '@/lib/colors';
import type { PlaceEntry } from '@/data/medoPersianPlaces';

interface PlaceCardProps {
  place: PlaceEntry;
  accentColor: string;
}

// Rendered as a plain View, not a Pressable. The "name + blurb + thumbnail"
// tier has no detail destination to navigate to — giving it a chevron or
// press feedback would promise an interaction that doesn't exist.
export default function PlaceCard({ place, accentColor }: PlaceCardProps) {
  return (
    <View style={[styles.card, { borderColor: hexToRgba(accentColor, 0.18) }]}>
      <Image source={place.image} style={styles.thumb} contentFit="cover" />
      <View style={styles.textBlock}>
        <Text style={[styles.role, { color: accentColor }]}>{place.role.toUpperCase()}</Text>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.blurb} numberOfLines={3}>
          {place.blurb}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1420',
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 10,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  role: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
  },
  blurb: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 15,
  },
});
