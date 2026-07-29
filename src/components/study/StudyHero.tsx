import { Image } from 'expo-image';
import { Bookmark, ChevronLeft, Crown, Share2 } from 'lucide-react-native';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const BG = '#07111F';
const ACCENT = '#D4A24C';
const TEXT = '#FFFFFF';
const TEXT_BODY = '#DDE9FF';

type StudyHeroProps = {
  heroImage: ImageSourcePropType | null;
  title: string;
  subtitle: string;
  description?: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  onShare?: () => void;
  onBack?: () => void;
};

export default function StudyHero({
  heroImage,
  title,
  subtitle,
  description,
  bookmarked = false,
  onToggleBookmark,
  onShare,
  onBack,
}: StudyHeroProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Self-contained banner image block */}
      <View style={styles.imageCard}>
        {heroImage ? (
          <Image source={heroImage} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.placeholderBg]} />
        )}

        {/* Top-bar overlay icons */}
        <View style={styles.topBarOverlay}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={22} color={TEXT} />
          </Pressable>

          <View style={styles.topBarRightActions}>
            {onToggleBookmark && (
              <Pressable
                onPress={onToggleBookmark}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                accessibilityLabel="Bookmark chapter"
              >
                <Bookmark
                  size={20}
                  color={bookmarked ? ACCENT : TEXT}
                  fill={bookmarked ? ACCENT : 'transparent'}
                />
              </Pressable>
            )}

            {onShare && (
              <Pressable
                onPress={onShare}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                accessibilityLabel="Share chapter"
              >
                <Share2 size={20} color={TEXT} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* 2. Text Content Block in normal document flow below image */}
      <View style={styles.contentBlock}>
        <View style={styles.eyebrowRow}>
          <Crown size={15} color={ACCENT} fill={ACCENT} />
          <Text style={styles.eyebrow}>Prophetic Study</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.accentRule} />

        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
  },
  imageCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    maxHeight: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0E1726',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderBg: {
    backgroundColor: '#111B2C',
  },
  topBarOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBarRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 17, 31, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  contentBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: TEXT,
    fontFamily: 'Cinzel',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  subtitle: {
    color: '#F5D170',
    fontFamily: 'Georgia',
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  accentRule: {
    height: 2,
    width: 48,
    backgroundColor: ACCENT,
    borderRadius: 1,
    marginVertical: 4,
  },
  description: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 21,
  },
});
