import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, BookOpen, Clock3, Crown } from 'lucide-react-native';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated';

const BG = '#07111F';
const BG_DEEP = '#0B0F16';
const ACCENT = '#D4A24C';
const TEXT = '#FFFFFF';
const TEXT_BODY = '#DDE9FF';
const TEXT_MUTED = '#94A3B8';
const BORDER = 'rgba(148, 163, 184, 0.18)';

export const HERO_EXPANDED_HEIGHT = 318;
export const HERO_COLLAPSED_HEIGHT = 88;
const SCROLL_RANGE = HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;

type StudyHeroProps = {
  scrollY: SharedValue<number>;
  heroImage: ImageSourcePropType | null;
  title: string;
  subtitle: string;
  description?: string;
  tags: { label: string; icon: string; color: string; bgColor: string; value: string }[];
  progressPercent: number;
  lastReadLabel: string;
  estimatedReadTime: string;
  difficulty: string;
  sectionsCount: number;
  onContinueReading: () => void;
};

export default function StudyHero({
  scrollY,
  heroImage,
  title,
  subtitle,
  description,
  progressPercent,
  lastReadLabel,
  estimatedReadTime,
  difficulty,
  sectionsCount,
  onContinueReading,
}: StudyHeroProps) {
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT],
      Extrapolation.CLAMP,
    ),
  }));

  const expandedFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, SCROLL_RANGE * 0.65],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const condensedFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [SCROLL_RANGE * 0.55, SCROLL_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      {heroImage && (
        <ImageBackground source={heroImage} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      )}
      <LinearGradient
        colors={['rgba(4,15,45,0.96)', 'rgba(4,15,45,0.78)', BG_DEEP]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.content, expandedFadeStyle]}>
        <View style={styles.eyebrowRow}>
          <Crown size={16} color={ACCENT} fill={ACCENT} />
          <Text style={styles.eyebrow}>Prophetic Study</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {description && <Text style={styles.description}>{description}</Text>}

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <BookOpen size={15} color={ACCENT} />
            <Text style={styles.metaText}>{sectionsCount} Sections</Text>
          </View>
          <View style={styles.metaChip}>
            <Clock3 size={15} color={ACCENT} />
            <Text style={styles.metaText}>{estimatedReadTime}</Text>
          </View>
          <View style={styles.metaChip}>
            <BarChart3 size={15} color={ACCENT} />
            <Text style={styles.metaText}>{difficulty}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressEyebrow}>Your Progress</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
            <Text style={styles.progressComplete}>Complete</Text>
          </View>
          <View style={styles.progressMiddle}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
          <View style={styles.progressAside}>
            <Text style={styles.lastRead}>Last read: {lastReadLabel}</Text>
            <View style={styles.continueOutline}>
              <Text style={styles.continueOutlineText} onPress={onContinueReading}>
                Continue Reading
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.condensedContent, condensedFadeStyle]}>
        <View style={styles.condensedRow}>
          <Text style={styles.condensedTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.condensedBadge}>
            <Text style={styles.condensedBadgeText}>{progressPercent}%</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BG,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 12,
    gap: 8,
  },
  condensedContent: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  condensedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  condensedTitle: {
    flex: 1,
    color: TEXT,
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  condensedBadge: {
    minHeight: 32,
    minWidth: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 162, 76, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 162, 76, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  condensedBadgeText: {
    color: '#FFD469',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  subtitle: {
    color: '#F5D170',
    fontFamily: 'Georgia',
    fontSize: 18,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  description: {
    maxWidth: 720,
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(12,20,32,0.72)',
  },
  metaText: {
    color: TEXT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
  },
  progressCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(12,20,32,0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressEyebrow: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressPercent: {
    color: TEXT,
    fontFamily: 'Inter',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressComplete: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  progressMiddle: {
    flex: 1,
  },
  progressTrack: {
    height: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(2,6,23,0.8)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  progressAside: {
    alignItems: 'flex-end',
    gap: 8,
  },
  lastRead: {
    color: TEXT_MUTED,
    fontFamily: 'Inter',
    fontSize: 12,
  },
  continueOutline: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  continueOutlineText: {
    color: '#FFD469',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
  },
});
