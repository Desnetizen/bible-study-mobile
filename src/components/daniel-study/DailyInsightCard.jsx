import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStreak } from '@/lib/useStreak';
import { getTodayDailyInsight } from '../../data/dailyInsights';

export default function DailyInsightCard() {
  const { streakCount } = useStreak();
  const insight = getTodayDailyInsight();

  const handleReadInsight = () => {
    router.push({
      pathname: '/bible',
      params: {
        book: insight.book,
        chapter: String(insight.chapter),
        verse: String(insight.verse),
      },
    });
  };

  const streakDisplay = streakCount > 0 ? `${streakCount} Day${streakCount > 1 ? 's' : ''}` : 'Daily';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={16} color="#E8A838" />
          <Text style={styles.headerText}>Daily Insight</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakText}>{streakDisplay}</Text>
        </View>
      </View>

      <Text style={styles.quoteText}>
        {'\u201C'}{insight.reflection}{'\u201D'}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.refText}>
          {insight.book} {insight.chapter}:{insight.verse}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReadInsight}
          style={styles.ctaButton}
          accessibilityRole="button"
          accessibilityLabel={`Read Insight for ${insight.book} ${insight.chapter}:${insight.verse}`}
        >
          <Text style={styles.ctaText}>Read Insight</Text>
          <ArrowRight size={14} color="#5fa5ff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    backgroundColor: '#0A1324',
    padding: 16,
    marginHorizontal: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#E8A838',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1200',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streakFlame: {
    fontSize: 11,
  },
  streakText: {
    color: '#f59e0b',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  quoteText: {
    color: '#E6EEFF',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  refText: {
    color: '#5fa5ff',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 140, 255, 0.12)',
    borderColor: 'rgba(47, 140, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaText: {
    color: '#5fa5ff',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
});
