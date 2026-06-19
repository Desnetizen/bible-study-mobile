import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  BookOpen, 
  NotebookPen, 
  Bookmark, 
  Compass, 
  CalendarDays, 
  Activity,
  Flame,
  Award,
  ArrowRight
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  withSpring, 
  useSharedValue, 
  useAnimatedStyle 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { RECENT_ACTIVITY, STUDY_USER } from '../constants/bible-connection';
import { useDanielProgress } from '../lib/daniel-progress';
import { useStreak } from '../lib/useStreak';
import { useRecentActivity, formatActivityTime } from '../lib/activity-tracker';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FilterType = 'all' | 'completed' | 'notes' | 'bookmarks' | 'explored';

export default function RecentActivityScreen() {
  const insets = useSafeAreaInsets();
  const completedChapters = useDanielProgress();
  const { streakCount } = useStreak();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const trackedActivities = useRecentActivity();

  // Stats values
  const totalCompleted = completedChapters.length;
  const totalNotes = trackedActivities.length > 0
    ? trackedActivities.filter((a) => a.activity_type === 'note_saved').length
    : STUDY_USER.notesTaken;
  const totalBookmarks = trackedActivities.length > 0
    ? trackedActivities.filter((a) => a.activity_type === 'bookmark_added').length
    : STUDY_USER.bookmarks;

  // Categorize activity items dynamically
  const activities = useMemo(() => {
    const sourceItems = trackedActivities.length > 0
      ? trackedActivities.map((item, index) => ({
          label: item.label,
          time: formatActivityTime(item),
          key: `tracked-${item.id ?? index}`,
        }))
      : RECENT_ACTIVITY.map((item, index) => ({
          label: item.label,
          time: item.time,
          key: `fallback-${index}`,
        }));

    return sourceItems.map((item) => {
      const lower = item.label.toLowerCase();
      let type: FilterType = 'explored';
      let icon = Compass;
      let color = '#06b6d4'; // Cyan
      let bg = 'rgba(6, 182, 212, 0.12)';
      let actionLabel = 'Explored Profile';

      if (lower.includes('completed')) {
        type = 'completed';
        icon = BookOpen;
        color = '#10b981'; // Green
        bg = 'rgba(16, 185, 129, 0.12)';
        actionLabel = 'Study Completed';
      } else if (lower.includes('note')) {
        type = 'notes';
        icon = NotebookPen;
        color = '#ff9500'; // Amber
        bg = 'rgba(255, 149, 0, 0.12)';
        actionLabel = 'Note Added';
      } else if (lower.includes('bookmark')) {
        type = 'bookmarks';
        icon = Bookmark;
        color = '#a855f7'; // Purple
        bg = 'rgba(168, 85, 247, 0.12)';
        actionLabel = 'Saved Bookmark';
      } else if (lower.includes('highlighted')) {
        type = 'bookmarks';
        icon = Bookmark;
        color = '#a855f7'; // Purple
        bg = 'rgba(168, 85, 247, 0.12)';
        actionLabel = 'Verse Highlighted';
      } else if (lower.includes('opened')) {
        type = 'explored';
        icon = BookOpen;
        color = '#06b6d4'; // Cyan
        bg = 'rgba(6, 182, 212, 0.12)';
        actionLabel = 'Chapter Opened';
      } else if (lower.includes('timeline')) {
        type = 'explored';
        icon = Compass;
        color = '#E8A838';
        bg = 'rgba(232, 168, 56, 0.12)';
        actionLabel = 'Timeline Event';
      }

      return {
        id: item.key,
        label: item.label,
        time: item.time,
        type,
        icon,
        color,
        bg,
        actionLabel,
      };
    });
  }, [trackedActivities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') {
      return activities;
    }
    return activities.filter((act) => act.type === activeFilter);
  }, [activities, activeFilter]);

  // Back button animation
  const scale = useSharedValue(1);
  const animatedBackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const renderStatsCard = (
    title: string, 
    value: number | string, 
    icon: any, 
    color: string, 
    gradientColors: [string, string]
  ) => {
    const IconComponent = icon;
    return (
      <View style={styles.statsCard}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconWrap, { backgroundColor: color + '20' }]}>
            <IconComponent size={18} color={color} strokeWidth={2.2} />
          </View>
          <Text style={styles.statsCardTitle}>{title}</Text>
        </View>
        <Text style={styles.statsCardValue}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <AnimatedPressable
          onPress={() => router.back()}
          onPressIn={() => {
            scale.set(withSpring(0.9));
          }}
          onPressOut={() => {
            scale.set(withSpring(1));
          }}
          style={[styles.backButton, animatedBackStyle]}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <ChevronLeft size={22} color="#ffffff" strokeWidth={2.5} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Section */}
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard(
              'Daily Streak', 
              `${streakCount} days`, 
              Flame, 
              '#ff9500', 
              ['rgba(255, 149, 0, 0.08)', 'rgba(25, 17, 7, 0.95)']
            )}
            {renderStatsCard(
              'Chapters Done', 
              `${totalCompleted}/12`, 
              Award, 
              '#2463ff', 
              ['rgba(36, 99, 255, 0.08)', 'rgba(7, 14, 33, 0.95)']
            )}
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            {renderStatsCard(
              'Saved Notes', 
              totalNotes, 
              NotebookPen, 
              '#a855f7', 
              ['rgba(168, 85, 247, 0.08)', 'rgba(21, 11, 31, 0.95)']
            )}
            {renderStatsCard(
              'Bookmarks', 
              totalBookmarks, 
              Bookmark, 
              '#06b6d4', 
              ['rgba(6, 182, 212, 0.08)', 'rgba(6, 21, 31, 0.95)']
            )}
          </View>
        </Animated.View>

        {/* Filter Badges */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'completed', 'notes', 'bookmarks', 'explored'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterBadge,
                    isActive && styles.filterBadgeActive,
                    { borderColor: isActive ? '#2463ff' : 'rgba(255,255,255,0.12)' }
                  ]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Feed List */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          {filteredActivities.length === 0 ? (
            <Animated.View entering={FadeInUp.springify()} style={styles.emptyContainer}>
              <Activity size={32} color="rgba(255,255,255,0.25)" />
              <Text style={styles.emptyText}>No recent activity found for this category.</Text>
            </Animated.View>
          ) : (
            <View style={styles.listContainer}>
              {filteredActivities.map((act, idx) => {
                const ActIcon = act.icon;
                return (
                  <Animated.View
                    key={act.id}
                    entering={FadeInDown.delay(150 + idx * 50).springify()}
                    layout={Layout.springify()}
                    style={styles.activityCard}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: act.bg }]}>
                      <ActIcon size={18} color={act.color} strokeWidth={2.2} />
                    </View>
                    <View style={styles.cardInfo}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardActionLabel, { color: act.color }]}>{act.actionLabel}</Text>
                        <View style={styles.timeWrapper}>
                          <CalendarDays size={10} color="#8b96a8" />
                          <Text style={styles.cardTime}>{act.time}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardLabel}>{act.label}</Text>
                    </View>
                    <ArrowRight size={14} color="#8b96a8" style={styles.arrowIcon} />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040f2d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(95, 165, 255, 0.08)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cinzel',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 80,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.12)',
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardTitle: {
    color: '#b6c9ea',
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  statsCardValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  filterContainer: {
    marginBottom: 20,
    marginHorizontal: -16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  filterBadgeActive: {
    backgroundColor: '#2463ff',
  },
  filterText: {
    color: '#b6c9ea',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  feedContainer: {
    flex: 1,
  },
  listContainer: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2947',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 139, 255, 0.12)',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  cardActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTime: {
    color: '#8b96a8',
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  cardLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  arrowIcon: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(26, 41, 71, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  emptyText: {
    color: '#b6c9ea',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
    maxWidth: '80%',
  },
});
