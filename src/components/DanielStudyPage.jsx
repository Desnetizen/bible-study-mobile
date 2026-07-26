import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHAPTER_COLORS, CHAPTERS_DATA, TABS } from '../data/danielStudyChapters';
import StudyIcon from './daniel-study/StudyIcon';
import { ImageSkeleton } from './ui/Skeleton';
import { VerseLink } from '@/components/VerseLink';
import { LinkedText } from '@/components/LinkedText';
import { parseBibleReference } from '@/lib/parseBibleReference';

function useTheme(controlled) {
  const systemDark = useColorScheme() === 'dark';
  const dark = typeof controlled === 'boolean' ? controlled : systemDark;
  return { dark };
}

function useColors(dark) {
  return {
    bg: dark ? '#0f172a' : '#f1f5f9',
    card: dark ? '#1e293b' : '#ffffff',
    cardBorder: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#0f172a',
    textMuted: dark ? '#94a3b8' : '#64748b',
    textSub: dark ? '#cbd5e1' : '#475569',
    accent: '#2563eb',
  };
}

function getStatusMeta(status) {
  if (status === 'completed') return { icon: 'checkCircle', label: 'Completed', color: '#16a34a' };
  if (status === 'in-progress') return { icon: 'halfClock', label: 'In Progress', color: '#2563eb' };
  return { icon: 'circle', label: 'Not Started', color: '#94a3b8' };
}

function Card({ children, dark, style }) {
  const colors = useColors(dark);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>
      {children}
    </View>
  );
}

function ChapterCard({ chapter, selected, dark, onPress }) {
  const colors = useColors(dark);
  const meta = getStatusMeta(chapter.status);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chapterCard,
        {
          backgroundColor: colors.card,
          borderColor: selected ? '#2563eb' : colors.cardBorder,
          borderWidth: selected ? 2 : 1,
        },
        selected && {
          shadowColor: '#2563eb',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.chapterImageWrap}>
        {chapter.image ? (
          <>
            {!imageLoaded && (
              <View style={StyleSheet.absoluteFillObject}>
                <ImageSkeleton width="100%" height="100%" borderRadius={0} />
              </View>
            )}
            <Image
              source={chapter.image}
              style={styles.chapterImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <View style={[styles.chapterImagePlaceholder, { backgroundColor: CHAPTER_COLORS[chapter.num] || '#1e3a8a' }]}>
            <Text style={styles.chapterPlaceholderText}>{chapter.title}</Text>
          </View>
        )}
        <View style={styles.chapterNumBadge}>
          <Text style={styles.chapterNumText}>{chapter.num}</Text>
        </View>
      </View>
      <View style={[styles.chapterInfo, { backgroundColor: colors.card }]}>
        <Text
          style={[styles.chapterTitle, { color: chapter.status === 'in-progress' ? '#2563eb' : colors.text }]}
          numberOfLines={1}
        >
          {chapter.title}
        </Text>
        <View style={styles.chapterStatusRow}>
          <StudyIcon name={meta.icon} size={14} color={meta.color} />
          <Text style={[styles.chapterStatus, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={[styles.chapterRef, { color: colors.textMuted }]}>{chapter.ref}</Text>
      </View>
    </TouchableOpacity>
  );
}

function OverviewCard({ chapter, dark }) {
  const colors = useColors(dark);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  return (
    <Card dark={dark}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Chapter {chapter.num} Overview</Text>
      <View style={styles.overviewTopRow}>
        <View style={styles.overviewThumb}>
          {chapter.image ? (
            <>
              {!thumbLoaded && (
                <View style={StyleSheet.absoluteFillObject}>
                  <ImageSkeleton width="100%" height="100%" borderRadius={0} />
                </View>
              )}
              <Image
                source={chapter.image}
                style={styles.overviewThumbImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                onLoad={() => setThumbLoaded(true)}
              />
            </>
          ) : (
            <View style={[styles.overviewThumbPlaceholder, { backgroundColor: CHAPTER_COLORS[chapter.num] }]}>
              <Text style={styles.overviewThumbText}>{chapter.title}</Text>
            </View>
          )}
        </View>
        <LinkedText
          text={chapter.overview.description}
          style={[styles.bodyText, styles.overviewDescription, { color: colors.textSub }]}
        />
      </View>

      <View style={styles.tagsRow}>
        {chapter.overview.tags.map((tag) => (
          <View key={tag.label} style={[styles.tag, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
            <View style={styles.tagLabelRow}>
              <StudyIcon name={tag.icon} size={12} color={tag.color} />
              <Text style={[styles.tagLabel, { color: tag.color }]}>{tag.label}</Text>
            </View>
            <Text style={[styles.tagValue, { color: colors.textSub }]} numberOfLines={2}>
              {tag.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.quoteBox, { backgroundColor: dark ? '#334155' : '#f8fafc' }]}>
        <Text style={[styles.quoteMark, { color: colors.cardBorder }]}>{'\u201C'}</Text>
        <Text style={[styles.quoteText, { color: colors.textSub }]}>{chapter.overview.quote}</Text>
        {(() => {
          const parsed = parseBibleReference(chapter.overview.quoteRef);
          if (parsed) {
            return (
              <VerseLink
                book={parsed.book}
                chapter={parsed.chapter}
                verse={parsed.verse}
                endVerse={parsed.endVerse}
              >
                <Text style={[styles.quoteRef, { color: colors.textMuted }]}>{chapter.overview.quoteRef}</Text>
              </VerseLink>
            );
          }
          return <Text style={[styles.quoteRef, { color: colors.textMuted }]}>{chapter.overview.quoteRef}</Text>;
        })()}
        <Text style={[styles.quoteMark, styles.quoteMarkEnd, { color: colors.cardBorder }]}>{'\u201D'}</Text>
      </View>
    </Card>
  );
}

function DiscoveriesCard({ chapter, dark, onChapterLink }) {
  const colors = useColors(dark);

  return (
    <Card dark={dark} style={styles.discoveriesCard}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>What You{'\u2019'}ll Discover</Text>
      <View style={styles.discoveriesList}>
        {chapter.overview.discoveries.map((item) => (
          <View key={item.title} style={styles.discoveryRow}>
            <View style={[styles.discoveryIcon, { backgroundColor: item.iconBg }]}>
              <StudyIcon name={item.icon} size={18} color={item.iconColor} />
            </View>
            <View style={styles.discoveryCopy}>
              <Text style={[styles.discoveryTitle, { color: colors.text }]}>{item.title}</Text>
              <LinkedText
                text={item.description}
                style={[styles.bodyText, styles.discoveryDescription, { color: colors.textMuted }]}
              />
              {item.links?.map((link) => (
                <TouchableOpacity key={link.label} onPress={() => onChapterLink(link.chapter)}>
                  <Text style={styles.discoveryLink}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

function StudyToolsCard({ tools, dark }) {
  const colors = useColors(dark);

  return (
    <Card dark={dark} style={styles.discoveriesCard}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Study Tools</Text>
      <View style={[styles.toolsList, { borderColor: colors.cardBorder }]}>
        {tools.map((tool, index) => (
          <TouchableOpacity
            key={tool.id}
            onPress={tool.onClick}
            style={[
              styles.toolRow,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.cardBorder,
                borderBottomWidth: index < tools.length - 1 ? 1 : 0,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.toolIcon, { backgroundColor: dark ? '#334155' : '#eff6ff' }]}>
              <StudyIcon name={tool.icon} size={18} color="#2563eb" />
            </View>
            <View style={styles.toolCopy}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>{tool.description}</Text>
            </View>
            <StudyIcon name="chevronRight" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

export default function DanielStudyPage({
  onNavigate,
  embedded = false,
  darkMode: controlledDark,
  initialChapter = 5,
  completedChapters = [],
  openChapterOnPress = false,
}) {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme(controlledDark);
  const colors = useColors(dark);

  const [selectedChapter, setSelectedChapter] = useState(Math.min(Math.max(initialChapter, 1), 12));
  const [activeTab, setActiveTab] = useState('Chapters');
  const chapterListRef = useRef(null);

  useEffect(() => {
    setSelectedChapter(Math.min(Math.max(initialChapter, 1), 12));
  }, [initialChapter]);

  const normalised = [...new Set(completedChapters.filter((n) => Number.isInteger(n) && n >= 1 && n <= 12))].sort(
    (a, b) => a - b
  );
  const focusChapter = Math.min(Math.max(initialChapter, 1), 12);

  const chapters = CHAPTERS_DATA.map((chapter) => ({
    ...chapter,
    status: normalised.includes(chapter.id)
      ? 'completed'
      : chapter.id === focusChapter
        ? 'in-progress'
        : 'not-started',
  }));

  const studiedChapters = normalised.length;
  const progressPercent = Math.round((studiedChapters / 12) * 100);
  const chapter = chapters.find((item) => item.id === selectedChapter) ?? chapters[0];

  const studyTools = [
    {
      id: 'read',
      icon: 'book',
      title: `Read Chapter ${chapter.num}`,
      description: `Read Daniel chapter ${chapter.num} in your preferred version.`,
      onClick: () => onNavigate?.('Bible', chapter.num),
    },
    {
      id: 'symbols',
      icon: 'sparkle',
      title: 'Symbols in This Chapter',
      description: 'Explore key symbols and their meaning.',
    },
    {
      id: 'timeline',
      icon: 'clock',
      title: 'Timeline View',
      description: 'See where this chapter fits in history.',
      onClick: () => onNavigate?.('Timeline'),
    },
    {
      id: 'compare',
      icon: 'scales',
      title: 'Chapter Comparison',
      description: 'Compare with other chapters.',
    },
    {
      id: 'notes',
      icon: 'document',
      title: 'Take Notes',
      description: 'Write your observations and insights.',
      onClick: () => onNavigate?.('Bible', chapter.num),
    },
  ];

  const selectChapter = useCallback(
    (id) => {
      if (openChapterOnPress) {
        onNavigate?.('StudyChapter', id);
        return;
      }

      setSelectedChapter(id);
      const index = chapters.findIndex((item) => item.id === id);
      if (index >= 0) {
        chapterListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    },
    [chapters, onNavigate, openChapterOnPress]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: embedded ? insets.top : 0 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: embedded ? insets.bottom + 24 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.studyHeader}>
          <View style={styles.studyHeaderCopy}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Daniel Study</Text>
            <Text style={[styles.bodyText, styles.studySubtitle, { color: colors.textMuted }]}>
              Explore the book of Daniel chapter by chapter.
            </Text>
          </View>
          <Card dark={dark} style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View style={[styles.pageIconWrap, { backgroundColor: dark ? '#1e3a5f' : '#eff6ff' }]}>
                <StudyIcon name="document" size={18} color="#2563eb" />
              </View>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Your Progress</Text>
            </View>
            <Text style={[styles.bodyText, styles.progressCount, { color: colors.textSub }]}>
              {studiedChapters} of 12 Chapters
            </Text>
            <View style={styles.progressRow}>
              <View style={[styles.progressTrack, { backgroundColor: dark ? '#334155' : '#e2e8f0' }]}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{progressPercent}%</Text>
            </View>
          </Card>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, active && styles.tabActive]}
                activeOpacity={0.8}
              >
                <StudyIcon name={tab.icon} size={15} color={active ? '#fff' : colors.textMuted} />
                <Text style={[styles.tabLabel, { color: active ? '#fff' : colors.textMuted }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {activeTab === 'Chapters' ? (
          <>
            <FlatList
              ref={chapterListRef}
              data={chapters}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.chapterListContent}
              renderItem={({ item }) => (
                <ChapterCard
                  chapter={item}
                  selected={item.id === selectedChapter}
                  dark={dark}
                  onPress={() => selectChapter(item.id)}
                />
              )}
              getItemLayout={(_, index) => ({ length: 162, offset: 162 * index, index })}
              onScrollToIndexFailed={() => {}}
              style={styles.chapterList}
            />

            <OverviewCard chapter={chapter} dark={dark} />
            <DiscoveriesCard chapter={chapter} dark={dark} onChapterLink={selectChapter} />
            <StudyToolsCard tools={studyTools} dark={dark} />
          </>
        ) : (
          <Card dark={dark} style={styles.comingSoonCard}>
            <View style={[styles.pageIconWrap, { backgroundColor: dark ? '#1e3a5f' : '#eff6ff' }]}>
              <StudyIcon name={TABS.find((tab) => tab.id === activeTab)?.icon || 'document'} size={24} color="#2563eb" />
            </View>
            <Text style={[styles.cardTitle, styles.comingSoonTitle, { color: colors.text }]}>{activeTab}</Text>
            <Text style={[styles.bodyText, styles.comingSoonBody, { color: colors.textMuted }]}>
              This section is coming soon. The chapter experience is fully built and ready to explore.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  mainContent: { padding: 16 },
  studyHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 },
  studyHeaderCopy: { flex: 1, minWidth: 200 },
  studySubtitle: { marginTop: 2 },
  pageTitle: { fontSize: 26, fontWeight: '800' },
  bodyText: { fontSize: 13 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  progressCard: { minWidth: 180, maxWidth: 220 },
  progressCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressCount: { marginTop: 8, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 99 },
  progressLabel: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  tabsScroll: { marginHorizontal: -16, marginBottom: 4 },
  tabsContent: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabActive: { backgroundColor: '#2563eb' },
  tabLabel: { fontSize: 13, fontWeight: '500' },
  chapterList: { marginHorizontal: -16 },
  chapterListContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 10 },
  chapterCard: { width: 152, borderRadius: 16, overflow: 'hidden' },
  chapterImageWrap: { position: 'relative', height: 120 },
  chapterImage: { width: '100%', height: '100%' },
  chapterImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  chapterPlaceholderText: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  chapterNumBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chapterInfo: { padding: 10 },
  chapterTitle: { fontSize: 13, fontWeight: '700' },
  chapterStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chapterStatus: { fontSize: 11, fontWeight: '500' },
  chapterRef: { fontSize: 11, marginTop: 2 },
  overviewTopRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  overviewThumb: { width: 96, height: 68, borderRadius: 12, overflow: 'hidden' },
  overviewThumbImage: { width: '100%', height: '100%' },
  overviewThumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 4 },
  overviewThumbText: { color: '#fff', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  overviewDescription: { flex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { borderRadius: 12, borderWidth: 1, padding: 10, minWidth: 120, flex: 1 },
  tagLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagLabel: { fontSize: 11, fontWeight: '700' },
  tagValue: { fontSize: 11, marginTop: 2 },
  quoteBox: { borderRadius: 16, padding: 14, marginTop: 14 },
  quoteMark: { fontSize: 36, lineHeight: 38 },
  quoteMarkEnd: { textAlign: 'right' },
  quoteText: { fontStyle: 'italic', fontSize: 14, lineHeight: 22 },
  quoteRef: { fontSize: 12, marginTop: 4 },
  discoveriesCard: { marginTop: 12 },
  discoveriesList: { gap: 16, marginTop: 12 },
  discoveryRow: { flexDirection: 'row', gap: 12 },
  discoveryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  discoveryCopy: { flex: 1 },
  discoveryTitle: { fontSize: 14, fontWeight: '600' },
  discoveryDescription: { marginTop: 2 },
  discoveryLink: { color: '#2563eb', fontSize: 12, marginTop: 3 },
  toolsList: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginTop: 12 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  toolIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toolCopy: { flex: 1 },
  toolTitle: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  pageIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  comingSoonCard: { marginTop: 12 },
  comingSoonTitle: { marginTop: 12 },
  comingSoonBody: { marginTop: 6, lineHeight: 22 },
});
