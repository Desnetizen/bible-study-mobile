import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedRef,
  scrollTo,
} from 'react-native-reanimated';

import { useDanielProgress, saveDanielProgress } from '@/lib/daniel-progress';
import type { DanielChapterStudy, StudySection } from '@/types/daniel-study';
import StudyHero, { HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT } from '@/components/study/StudyHero';
import StudyTabs, { type StudyTabId } from '@/components/study/StudyTabs';
import StudySectionList from '@/components/study/StudySectionList';
import StudyOutline, { type OutlineItem } from '@/components/study/StudyOutline';
import StudyActions from '@/components/study/StudyActions';
import StudyGlossarySheet from '@/components/study/StudyGlossarySheet';

const BG = '#0B0F16';
const SCROLL_RANGE = HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;
const HERO_SPACER = HERO_COLLAPSED_HEIGHT;
const TABS_HEIGHT = 52;
const CONTENT_PADDING_TOP = HERO_COLLAPSED_HEIGHT + TABS_HEIGHT;

type ChapterStudyState = {
  progress: number;
  lastReadId?: string;
  completedIds: string[];
  bookmarked: boolean;
  highlighted: boolean;
  expandedSectionIds: string[];
  expandedSubsectionIds: string[];
};

const DEFAULT_STATE: ChapterStudyState = {
  progress: 0,
  completedIds: [],
  bookmarked: false,
  highlighted: false,
  expandedSectionIds: [],
  expandedSubsectionIds: [],
};

function storageKey(chapterNumber: number): string {
  return `chapter-study:v2:${chapterNumber}`;
}

function stripNumber(title: string): string {
  return title.replace(/^\d+(?:\.\d+)?\.?\s*/, '').trim();
}

function sectionLabel(title: string, fallback: number): string {
  const match = title.match(/^(\d+(?:\.\d+)?)/);
  return match?.[1] ?? String(fallback);
}

function buildOutlineItems(sections: StudySection[]): OutlineItem[] {
  return sections.flatMap((section, sectionIndex) => {
    const label = sectionLabel(section.title, sectionIndex + 1);
    const items: OutlineItem[] = [{
      id: section.id,
      title: stripNumber(section.title),
      label,
      level: 0,
    }];

    section.subsections?.forEach((subsection, subIndex) => {
      items.push({
        id: subsection.id,
        title: stripNumber(subsection.title),
        label: sectionLabel(subsection.title, Number(`${sectionIndex + 1}.${subIndex + 1}`)),
        level: 1,
      });
    });

    return items;
  });
}

function normaliseState(raw: string | null, sections: StudySection[]): ChapterStudyState {
  const outline = buildOutlineItems(sections);
  const defaultOpen = sections.find((s) => s.subsections?.length)?.id ?? sections[0]?.id;
  const defaultSubsection = sections
    .flatMap((s) => s.subsections ?? [])
    .find((sub) => /stone/i.test(sub.title))?.id;

  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_STATE,
      ...parsed,
      progress: typeof parsed.progress === 'number' ? parsed.progress : 0,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      expandedSectionIds: Array.isArray(parsed.expandedSectionIds)
        ? parsed.expandedSectionIds
        : defaultOpen ? [defaultOpen] : [],
      expandedSubsectionIds: Array.isArray(parsed.expandedSubsectionIds)
        ? parsed.expandedSubsectionIds
        : defaultSubsection ? [defaultSubsection] : [],
      lastReadId: typeof parsed.lastReadId === 'string' ? parsed.lastReadId : outline[0]?.id,
    };
  } catch {
    return {
      ...DEFAULT_STATE,
      expandedSectionIds: defaultOpen ? [defaultOpen] : [],
      expandedSubsectionIds: defaultSubsection ? [defaultSubsection] : [],
      lastReadId: outline[0]?.id,
    };
  }
}

function splitParagraphs(content?: string): string[] {
  return (content ?? '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

type ChapterStudyContentProps = {
  chapter: DanielChapterStudy;
};

export default function ChapterStudyContent({ chapter }: ChapterStudyContentProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isMobile = width < 768;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const readScrollRef = useAnimatedRef<Animated.ScrollView>();
  const positionsRef = useRef<Record<string, number>>({});
  const readPositionsRef = useRef<Record<string, number>>({});
  const loadedRef = useRef(false);
  const scrollY = useSharedValue(0);
  const tabScrollOffsets = useRef<Record<StudyTabId, number>>({ overview: 0, read: 0, outline: 0 });

  const [activeTab, setActiveTab] = useState<StudyTabId>('overview');
  const [state, setState] = useState<ChapterStudyState>(DEFAULT_STATE);
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [sectionsDrawerOpen, setSectionsDrawerOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [actionsHeight, setActionsHeight] = useState(0);

  const onActionsLayout = useCallback((e: LayoutChangeEvent) => {
    setActionsHeight(e.nativeEvent.layout.height);
  }, []);

  const outlineItems = useMemo(() => buildOutlineItems(chapter.sections), [chapter.sections]);
  const reflectionSection = useMemo(
    () => chapter.sections.find((s) => /reflection|discussion/i.test(s.title)),
    [chapter.sections],
  );
  const reflectionQuestions = reflectionSection?.list?.slice(0, 3) ?? [];
  const lastRead = outlineItems.find((item) => item.id === state.lastReadId) ?? outlineItems[0];
  const nextUnread = outlineItems.find((item) => !state.completedIds.includes(item.id)) ?? outlineItems[0];
  const progressPercent = Math.max(0, Math.min(100, state.progress));

  const completedChapters = useDanielProgress();

  useEffect(() => {
    loadedRef.current = false;
    AsyncStorage.getItem(storageKey(chapter.chapterNumber))
      .then((raw) => {
        const next = normaliseState(raw, chapter.sections);
        setState(next);
        setCurrentId(next.lastReadId);
      })
      .finally(() => {
        loadedRef.current = true;
      });
  }, [chapter.chapterNumber, chapter.sections]);

  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(storageKey(chapter.chapterNumber), JSON.stringify(state)).catch(() => {});
  }, [chapter.chapterNumber, state]);

  const markVisited = useCallback((id: string) => {
    setCurrentId(id);
    setState((prev) => {
      const completedIds = prev.completedIds.includes(id) ? prev.completedIds : [...prev.completedIds, id];
      const progress = outlineItems.length ? Math.round((completedIds.length / outlineItems.length) * 100) : 0;
      return { ...prev, completedIds, lastReadId: id, progress };
    });
  }, [outlineItems.length]);

  useEffect(() => {
    if (state.progress >= 100 && !completedChapters.includes(chapter.chapterNumber)) {
      const next = [...completedChapters, chapter.chapterNumber];
      void saveDanielProgress(next);
    }
  }, [state.progress, chapter.chapterNumber, completedChapters]);

  const scrollToId = useCallback((id: string, targetTab?: StudyTabId) => {
    const tab = targetTab ?? (activeTab === 'read' ? 'read' : 'overview');
    const positions = tab === 'read' ? readPositionsRef.current : positionsRef.current;
    const targetY = Math.max((positions[id] ?? 0) - 16, 0);

    tabScrollOffsets.current[tab] = targetY;
    scrollY.value = SCROLL_RANGE;

    if (tab !== activeTab) {
      tabScrollOffsets.current[activeTab] = scrollY.value;
      setActiveTab(tab);
    } else {
      const ref = tab === 'read' ? readScrollRef : scrollRef;
      scrollTo(ref, 0, targetY, false);
    }

    markVisited(id);
    setSectionsDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, scrollY, markVisited]);

  const changeTab = useCallback((tab: StudyTabId) => {
    tabScrollOffsets.current[activeTab] = scrollY.value;
    setActiveTab(tab);
    if (tab === 'outline') {
      scrollY.value = SCROLL_RANGE;
    } else {
      scrollY.value = tabScrollOffsets.current[tab] ?? 0;
    }
  }, [activeTab, scrollY]);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [HERO_EXPANDED_HEIGHT, HERO_COLLAPSED_HEIGHT],
      Extrapolation.CLAMP,
    ),
  }));

  const overviewScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const readScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      const y = tabScrollOffsets.current.overview;
      scrollTo(scrollRef, 0, y, false);
    } else if (activeTab === 'read') {
      const y = tabScrollOffsets.current.read;
      scrollTo(readScrollRef, 0, y, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const toggleSection = useCallback((id: string) => {
    setState((prev) => {
      const next = prev.expandedSectionIds.includes(id)
        ? prev.expandedSectionIds.filter((s) => s !== id)
        : [...prev.expandedSectionIds, id];
      return { ...prev, expandedSectionIds: next };
    });
    markVisited(id);
  }, [markVisited]);

  const toggleSubsection = useCallback((id: string) => {
    setState((prev) => {
      const next = prev.expandedSubsectionIds.includes(id)
        ? prev.expandedSubsectionIds.filter((s) => s !== id)
        : [...prev.expandedSubsectionIds, id];
      return { ...prev, expandedSubsectionIds: next };
    });
    markVisited(id);
  }, [markVisited]);

  const onNodeLayout = useCallback((id: string, e: LayoutChangeEvent, read = false) => {
    const positions = read ? readPositionsRef.current : positionsRef.current;
    positions[id] = e.nativeEvent.layout.y;
  }, []);

  const renderRail = () => (
    <View style={styles.rail}>
      <View style={styles.railCard}>
        <Text style={styles.railTitle}>Sections</Text>
        {outlineItems.map((item) => {
          const active = currentId === item.id;
          return (
            <View
              key={item.id}
              style={[styles.railItem, item.level === 1 && styles.railSubItem, active && styles.railItemActive]}
            >
              <Text style={[styles.railNumber, active && styles.railNumberActive]}>{item.label}</Text>
              <Text
                style={[styles.railItemText, active && styles.railItemTextActive]}
                numberOfLines={2}
                onPress={() => scrollToId(item.id)}
              >
                {item.title}
              </Text>
            </View>
          );
        })}
      </View>

      {chapter.sources.length > 0 && (
        <View style={styles.railCard}>
          <Text style={styles.railTitle}>Sources</Text>
          {chapter.sources.map((source, index) => (
            <View key={`${source.author}-${index}`} style={styles.sourceRow}>
              <View style={styles.sourceCopy}>
                <Text style={styles.sourceName}>{source.author}</Text>
                <Text style={styles.sourceRole}>{source.role}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {chapter.terms.length > 0 && (
        <View style={styles.railCard}>
          <Text style={styles.railTitle}>Key Terms</Text>
          {chapter.terms.slice(0, 3).map((term) => (
            <View key={`${term.term}-${term.gloss}`} style={styles.termMini}>
              <Text style={styles.termOriginal}>{term.term}</Text>
              <Text style={styles.termGloss}>
                {term.transliteration ? `${term.transliteration}, ` : ''}{term.gloss}
              </Text>
            </View>
          ))}
          <Text style={styles.viewAllTermsText} onPress={() => setGlossaryOpen(true)}>
            View All Terms
          </Text>
        </View>
      )}
    </View>
  );

  const renderOverview = () => (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.tabScroll}
      contentContainerStyle={[
        styles.overviewContent,
        { paddingBottom: insets.bottom + (actionsHeight || (isMobile ? 160 : 112)) },
      ]}
      onScroll={overviewScrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <View style={isWide ? styles.bodyWide : undefined}>
        <View style={styles.primaryColumn}>
          <StudySectionList
            sections={chapter.sections}
            expandedSectionIds={state.expandedSectionIds}
            expandedSubsectionIds={state.expandedSubsectionIds}
            onToggleSection={toggleSection}
            onToggleSubsection={toggleSubsection}
          />

          {reflectionQuestions.length > 0 && (
            <View style={styles.reflectionCard}>
              <View style={styles.reflectionHeader}>
                <View style={styles.reflectionIcon}>
                  <Text style={styles.reflectionIconText}>?</Text>
                </View>
                <View>
                  <Text style={styles.reflectionTitle}>Reflection Questions</Text>
                  <Text style={styles.reflectionSubtitle}>Take time to reflect and apply these truths.</Text>
                </View>
              </View>
              {reflectionQuestions.map((question, index) => (
                <View key={question} style={styles.questionRow}>
                  <Text style={styles.questionNumber}>{index + 1}</Text>
                  <Text style={styles.questionText} numberOfLines={3}>{question}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {isWide && renderRail()}
      </View>
    </Animated.ScrollView>
  );

  const renderReadView = () => (
    <Animated.ScrollView
      ref={readScrollRef}
      style={styles.tabScroll}
      contentContainerStyle={[styles.readContent, { paddingBottom: insets.bottom + (actionsHeight || (isMobile ? 160 : 112)) }]}
      onScroll={readScrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {chapter.sections.map((section, sectionIndex) => (
        <View key={section.id} style={styles.readSection} onLayout={(e) => onNodeLayout(section.id, e, true)}>
          <Text style={styles.readTitle}>{sectionLabel(section.title, sectionIndex + 1)}. {stripNumber(section.title)}</Text>
          {section.intro && <Text style={styles.readIntro}>{section.intro}</Text>}
          {splitParagraphs(section.content).map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
          {section.table && (
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {section.table.columns.map((c) => (
                  <Text key={c} style={[styles.tableCell, styles.tableHead]}>{c}</Text>
                ))}
              </View>
              {section.table.rows.map((row, ri) => (
                <View key={ri} style={styles.tableRow}>
                  {row.map((cell, ci) => (
                    <Text key={ci} style={styles.tableCell}>{cell}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
          {section.list && (
            <View style={styles.bulletList}>
              {section.list.map((item) => (
                <View key={item} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {section.quote && (
            <View style={styles.quoteBlock}>
              <Text style={styles.quoteText}>{section.quote}</Text>
              {section.quoteCitation && <Text style={styles.quoteCitation}>- {section.quoteCitation}</Text>}
            </View>
          )}
          {section.subsections?.map((subsection, subIndex) => (
            <View key={subsection.id} style={styles.readSubsection} onLayout={(e) => onNodeLayout(subsection.id, e, true)}>
              <Text style={styles.readSubTitle}>{sectionLabel(subsection.title, Number(`${sectionIndex + 1}.${subIndex + 1}`))} {stripNumber(subsection.title)}</Text>
              {splitParagraphs(subsection.content).map((p, i) => (
                <Text key={i} style={styles.paragraph}>{p}</Text>
              ))}
              {subsection.table && (
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    {subsection.table.columns.map((c) => (
                      <Text key={c} style={[styles.tableCell, styles.tableHead]}>{c}</Text>
                    ))}
                  </View>
                  {subsection.table.rows.map((row, ri) => (
                    <View key={ri} style={styles.tableRow}>
                      {row.map((cell, ci) => (
                        <Text key={ci} style={styles.tableCell}>{cell}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}
              {subsection.list && (
                <View style={styles.bulletList}>
                  {subsection.list.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
              {subsection.quote && (
                <View style={styles.quoteBlock}>
                  <Text style={styles.quoteText}>{subsection.quote}</Text>
                  {subsection.quoteCitation && <Text style={styles.quoteCitation}>- {subsection.quoteCitation}</Text>}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </Animated.ScrollView>
  );

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.heroOverlay, heroAnimatedStyle]}>
        <StudyHero
          scrollY={scrollY}
          heroImage={chapter.heroImage}
          title={chapter.title}
          subtitle={chapter.subtitle}
          description={chapter.overview.description}
          tags={chapter.tags}
          progressPercent={progressPercent}
          lastReadLabel={`Section ${lastRead?.label ?? '1'}`}
          estimatedReadTime={chapter.estimatedReadTime}
          difficulty={chapter.difficulty}
          sectionsCount={chapter.sections.length}
          onContinueReading={() => nextUnread && scrollToId(nextUnread.id)}
        />
      </Animated.View>

      <View style={{ height: HERO_SPACER }} />

      <StudyTabs
        activeTab={activeTab}
        onTabChange={changeTab}
        isWide={isWide}
        sectionsDrawerOpen={sectionsDrawerOpen}
        onToggleSections={() => setSectionsDrawerOpen((o) => !o)}
      />

      {!isWide && sectionsDrawerOpen && (
        <ScrollView style={styles.drawer} contentContainerStyle={styles.drawerContent}>
          {renderRail()}
        </ScrollView>
      )}

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'read' && renderReadView()}
      {activeTab === 'outline' && (
        <StudyOutline
          items={outlineItems}
          currentId={currentId}
          onSelect={(id) => scrollToId(id)}
        />
      )}

      <StudyActions
        bookmarked={state.bookmarked}
        onToggleBookmark={() => setState((prev) => ({ ...prev, bookmarked: !prev.bookmarked }))}
        highlighted={state.highlighted}
        onToggleHighlight={() => setState((prev) => ({ ...prev, highlighted: !prev.highlighted }))}
        onAddNotes={() => {}}
        onShare={() => {}}
        onPlayAudio={() => {}}
        nextSectionLabel={nextUnread?.label ?? '1'}
        nextSectionTitle={nextUnread?.title ?? chapter.title}
        onContinueReading={() => nextUnread && scrollToId(nextUnread.id)}
        onLayout={onActionsLayout}
      />

      {chapter.terms.length > 0 && (
        <StudyGlossarySheet
          visible={glossaryOpen}
          terms={chapter.terms}
          onClose={() => setGlossaryOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabScroll: {
    flex: 1,
  },
  overviewContent: {
    paddingHorizontal: 16,
    paddingTop: CONTENT_PADDING_TOP,
  },
  readContent: {
    paddingHorizontal: 20,
    paddingTop: CONTENT_PADDING_TOP,
    maxWidth: 820,
  },
  bodyWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  primaryColumn: {
    flex: 1,
    gap: 12,
  },
  drawer: {
    maxHeight: 320,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.18)',
    backgroundColor: '#07111F',
  },
  drawerContent: {
    padding: 14,
  },
  rail: {
    width: 240,
    gap: 12,
  },
  railCard: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    borderRadius: 12,
    backgroundColor: '#0A1324',
    padding: 12,
    gap: 8,
  },
  railTitle: {
    color: '#D4A24C',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  railItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  railSubItem: {
    marginLeft: 12,
  },
  railItemActive: {
    backgroundColor: 'rgba(212,162,76,0.10)',
  },
  railNumber: {
    minWidth: 22,
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
  railNumberActive: {
    color: '#D4A24C',
  },
  railItemText: {
    flex: 1,
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  railItemTextActive: {
    color: '#FFD469',
  },
  sourceRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 8,
  },
  sourceCopy: {
    flex: 1,
  },
  sourceName: {
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  sourceRole: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 11,
  },
  termMini: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 9,
  },
  termOriginal: {
    color: '#FFFFFF',
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
  },
  termGloss: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  viewAllTermsText: {
    color: '#FFD469',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  reflectionCard: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    borderRadius: 12,
    backgroundColor: '#0A1324',
    padding: 14,
    gap: 12,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reflectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168,85,247,0.25)',
  },
  reflectionIconText: {
    color: '#D9C6FF',
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '800',
  },
  reflectionTitle: {
    color: '#FFD469',
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: '700',
  },
  reflectionSubtitle: {
    color: '#94A3B8',
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 2,
  },
  questionRow: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: 8,
    backgroundColor: '#111B2C',
    padding: 10,
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 5,
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: 'rgba(168,85,247,0.25)',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
  },
  questionText: {
    flex: 1,
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 17,
  },
  readSection: {
    marginBottom: 24,
  },
  readTitle: {
    color: '#FFD469',
    fontFamily: 'Cinzel',
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    marginBottom: 10,
  },
  readIntro: {
    color: '#94A3B8',
    fontFamily: 'Georgia',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  readSubsection: {
    marginTop: 14,
  },
  readSubTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    marginBottom: 6,
  },
  paragraph: {
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: 'rgba(212,162,76,0.55)',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,162,76,0.25)',
  },
  tableCell: {
    flex: 1,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(212,162,76,0.25)',
  },
  tableHead: {
    color: '#FFD469',
    fontWeight: '800',
    backgroundColor: 'rgba(212,162,76,0.08)',
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 5,
    height: 5,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: '#D4A24C',
  },
  bulletText: {
    flex: 1,
    color: '#DDE9FF',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: '#D4A24C',
    borderRadius: 8,
    backgroundColor: 'rgba(212,162,76,0.08)',
    padding: 14,
    marginVertical: 8,
  },
  quoteText: {
    color: '#F7EAC4',
    fontFamily: 'Georgia',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteCitation: {
    color: '#D4A24C',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'right',
  },
});
