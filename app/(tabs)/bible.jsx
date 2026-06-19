import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Bookmark, ChevronDown, ChevronLeft, Highlighter, NotebookPen } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChapterCompleteModal from '../../components/ChapterCompleteModal';
import { BadgeEarnedToast } from '../../components/BadgeEarnedToast';
import { BadgePreviewModal } from '../../components/BadgePreviewModal';
import { trackActivity } from '../../lib/activity-tracker';
import { loadDanielCrossReferences } from '../../lib/daniel-cross-references';
import { saveDanielProgress, useDanielProgress } from '../../lib/daniel-progress';
import { getEarnedBadges } from '../../lib/badges';
import type { Badge } from '../../lib/badges';

const API_ROOT = 'https://bible-api.com/data';
const DEFAULT_TRANSLATION_ID = 'kjv';
const DANIEL_BOOK_NAME = 'Daniel';
const STUDY_STATE_KEY = 'bible-page:study-state:v1';

function normalizeVerseText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeBookName(name = '') {
  return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

function findBookByName(books, bookName) {
  const requestedName = normalizeBookName(bookName);

  if (!requestedName) {
    return null;
  }

  return (
    books.find((book) => normalizeBookName(book.name) === requestedName) ??
    books.find((book) => {
      const normalizedBookName = normalizeBookName(book.name);
      return (
        (normalizedBookName === 'psalm' && requestedName === 'psalms') ||
        (normalizedBookName === 'psalms' && requestedName === 'psalm')
      );
    }) ??
    null
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function makeRange(start, end) {
  if (start === null || start === undefined) {
    return [];
  }

  const rangeEnd = end === null || end === undefined ? start : end;
  const min = Math.min(start, rangeEnd);
  const max = Math.max(start, rangeEnd);
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

const MAX_CACHE_ENTRIES = 30;

const FONT_SIZE_OPTIONS = [16, 18, 20, 22, 24];

function setCacheEntry(cacheRef, key, value) {
  const keys = Object.keys(cacheRef.current);
  if (keys.length >= MAX_CACHE_ENTRIES) {
    delete cacheRef.current[keys[0]];
  }
  cacheRef.current[key] = value;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function LoadingSkeleton({ bibleChapterCount, colors, dark }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(shimmer);
  }, [shimmer]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-220, 220]) }, { rotate: '18deg' }],
  }));

  return (
    <View style={styles.loadingShell}>
      <View style={styles.loadingHeader}>
        <View style={[styles.loadingTitleBlock, { backgroundColor: dark ? '#111827' : '#e2e8f0' }]}>
          <View style={[styles.loadingLine, styles.loadingLineShort, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
          <View style={[styles.loadingLine, styles.loadingLineMedium, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
        </View>

        <View style={styles.loadingChapterStrip}>
          {Array.from({ length: Math.min(Math.max(bibleChapterCount, 5), 8) }, (_, index) => {
            const isActive = index === 0;
            return (
              <View
                key={index}
                style={[
                  styles.loadingChapterChip,
                  {
                    backgroundColor: isActive ? '#0f172a' : dark ? '#111827' : '#e5e7eb',
                    borderColor: isActive ? '#0f172a' : dark ? '#1f2937' : '#d1d5db',
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.loadingContent}>
        <View style={[styles.loadingBookRow, { backgroundColor: dark ? '#111827' : '#e2e8f0' }]}>
          <View style={[styles.loadingBookLine, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
          <View style={[styles.loadingVerseBlock, { backgroundColor: dark ? '#111827' : '#e2e8f0' }]}>
            {Array.from({ length: 5 }, (_, index) => (
              <View key={index} style={[styles.loadingVerseLine, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
            ))}
          </View>
        </View>

        <View style={[styles.loadingBookRow, { backgroundColor: dark ? '#111827' : '#e2e8f0' }]}>
          <View style={[styles.loadingBookLine, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
          <View style={[styles.loadingVerseBlock, { backgroundColor: dark ? '#111827' : '#e2e8f0' }]}>
            {Array.from({ length: 4 }, (_, index) => (
              <View key={index} style={[styles.loadingVerseLine, { backgroundColor: dark ? '#1f2937' : '#cbd5e1' }]} />
            ))}
          </View>
        </View>
      </View>

      <Reanimated.View
        pointerEvents="none"
        style={[
          styles.loadingShimmer,
          shimmerAnimatedStyle,
        ]}>
        <LinearGradient
          colors={['transparent', dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Reanimated.View>
    </View>
  );
}

function getColors(dark) {
  return {
    bg: dark ? '#020617' : '#f8fafc',
    cardBg: dark ? '#0f172a' : '#ffffff',
    text: dark ? '#f1f5f9' : '#0f172a',
    heading: dark ? '#f1f5f9' : '#020617',
    bookHeading: dark ? '#cbd5e1' : '#1e293b',
    subtext: dark ? '#cbd5e1' : '#64748b',
    muted: dark ? '#94a3b8' : '#475569',
    border: dark ? '#334155' : '#e2e8f0',
    toolbarBorder: dark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.2)',
    toolbarBg: dark ? 'rgba(8,15,28,0.78)' : 'rgba(255,255,255,0.78)',
    pickerBg: dark ? 'rgba(30,41,59,0.78)' : 'rgba(255,255,255,0.88)',
    pickerText: dark ? '#f1f5f9' : '#0f172a',
    bannerBg: dark ? 'rgba(30,58,138,0.24)' : 'rgba(239,246,255,0.8)',
    bannerBorder: dark ? '#1d4ed8' : '#bfdbfe',
    blueText: dark ? '#93c5fd' : '#1d4ed8',
    selectedBg: dark ? 'rgba(30,58,138,0.28)' : 'rgba(239,246,255,1)',
    navBg: dark ? 'rgba(37,99,235,0.22)' : 'rgba(219,234,254,0.92)',
    rangeBg: dark ? 'rgba(202,138,4,0.22)' : 'rgba(254,249,195,0.85)',
    highlightBg: dark ? 'rgba(217,119,6,0.22)' : 'rgba(254,243,199,0.85)',
    inputBg: dark ? '#1e293b' : '#ffffff',
    sheetBorder: dark ? '#1e3a5f' : '#bfdbfe',
    rowPressed: dark ? '#0b1222' : '#eff6ff',
  };
}

function BibleReaderScreen({
  scrollViewRef,
  scriptureVersion,
  setScriptureVersion,
  bibleBook,
  setBibleBook,
  bibleChapter,
  setBibleChapter,
  selectableBibleBooks,
  bibleChapterCount,
  loading,
  error,
  bibleText,
  verseRefs,
  selectionStart,
  selectionEnd,
  setSelectionStart,
  setSelectionEnd,
  selectedVerse,
  setSelectedVerse,
  verseNote,
  setVerseNote,
  savedNotes,
  getNoteKey,
  isDanielBibleView,
  completedChapters,
  toggleChapterCompletion,
  saveNote,
  bookmarks,
  setBookmarks,
  highlightedVerses,
  setHighlightedVerses,
  navigationHighlight,
  crossReferenceOrigin,
  returnToCrossReferenceOrigin,
  selectedScriptureVersionLabel,
  crossReferences,
  crossReferencesLoading,
  crossReferencesLoaded,
  openCrossReference,
  DANIEL_BOOK_NAME: danielBookName,
  SCRIPTURE_VERSIONS,
  fontSize,
  setFontSize,
}) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const colors = getColors(dark);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const longPressTriggeredRef = useRef(false);
  const readingAreaYRef = useRef(0);
  const verseListYRef = useRef(0);
  const sheetDragY = useSharedValue(0);
  const headerVisible = useSharedValue(1);
  const lastScrollY = useSharedValue(0);

  const [selectorModal, setSelectorModal] = useState(null);
  const [longPressMenu, setLongPressMenu] = useState(null);
  const [selectedVerseRange, setSelectedVerseRange] = useState(null);

  const updateMeasuredVersePositions = useCallback(() => {
    Object.values(verseRefs.current).forEach((entry) => {
      if (typeof entry.localY !== 'number') {
        return;
      }

      entry.y = readingAreaYRef.current + verseListYRef.current + entry.localY;
    });
  }, [verseRefs]);

  const handleScroll = useAnimatedScrollHandler((event) => {
    const currentY = event.contentOffset.y;
    const delta = currentY - lastScrollY.value;

    if (currentY <= 8) {
      headerVisible.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    } else if (delta > 5 && headerVisible.value !== 0) {
      headerVisible.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    } else if (delta < -5 && headerVisible.value !== 1) {
      headerVisible.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    }

    lastScrollY.value = currentY;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(headerVisible.value, [0, 1], [0, 110]),
    opacity: headerVisible.value,
    transform: [{ translateY: interpolate(headerVisible.value, [0, 1], [-18, 0]) }],
  }));

  const toolbarRowAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(headerVisible.value, [0, 1], [8, 12]),
    paddingBottom: interpolate(headerVisible.value, [0, 1], [8, 12]),
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetDragY.value }],
  }));

  const chapterNumbers = useMemo(
    () => Array.from({ length: bibleChapterCount }, (_, i) => i + 1),
    [bibleChapterCount]
  );

  const getSavedNoteForVerse = useCallback(
    (verseNumber) => savedNotes[getNoteKey(bibleBook, bibleChapter, verseNumber)] || '',
    [bibleBook, bibleChapter, getNoteKey, savedNotes]
  );

  const hasUnsavedNoteChanges = useCallback(() => {
    if (!selectedVerse) {
      return false;
    }

    return verseNote !== getSavedNoteForVerse(selectedVerse.verse);
  }, [getSavedNoteForVerse, selectedVerse, verseNote]);

  const confirmDiscardUnsaved = useCallback(
    () =>
      new Promise((resolve) => {
        if (!hasUnsavedNoteChanges()) {
          resolve(true);
          return;
        }

        Alert.alert('Unsaved Changes', 'You have unsaved note changes. Continue without saving?', [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Continue', style: 'destructive', onPress: () => resolve(true) },
        ]);
      }),
    [hasUnsavedNoteChanges]
  );

  const clearRangeSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [setSelectionEnd, setSelectionStart]);

  const closeLongPressMenu = useCallback(() => {
    setLongPressMenu(null);
  }, []);

  const openBookSelector = useCallback(() => {
    setSelectorModal('book');
  }, []);

  const openVersionSelector = useCallback(() => {
    setSelectorModal('version');
  }, []);

  const closeSelectorModal = useCallback(() => {
    setSelectorModal(null);
  }, []);

  const clearSelectionState = useCallback(() => {
    setSelectedVerse(null);
    setSelectedVerseRange(null);
    setVerseNote('');
    sheetDragY.value = 0;
  }, [setSelectedVerse, setVerseNote, sheetDragY]);

  const handleBookChange = useCallback(
    async (nextBookName) => {
      if (!(await confirmDiscardUnsaved())) {
        return;
      }

      setBibleBook(nextBookName);
      setBibleChapter(1);
      clearRangeSelection();
      closeLongPressMenu();
      clearSelectionState();
    },
    [
      clearRangeSelection,
      clearSelectionState,
      closeLongPressMenu,
      confirmDiscardUnsaved,
      setBibleBook,
      setBibleChapter,
    ]
  );

  const handleChapterChange = useCallback(
    async (nextChapter) => {
      if (!(await confirmDiscardUnsaved())) {
        return;
      }

      setBibleChapter(nextChapter);
      clearRangeSelection();
      closeLongPressMenu();
      clearSelectionState();
    },
    [
      clearRangeSelection,
      clearSelectionState,
      closeLongPressMenu,
      confirmDiscardUnsaved,
      setBibleChapter,
    ]
  );

  const handleChapterChipPress = useCallback(
    (chapter) => {
      void handleChapterChange(chapter);
    },
    [handleChapterChange]
  );

  const handleVerseSelect = useCallback(
    async (verse) => {
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }

      const isAlreadyHighlighted =
        (selectionStart !== null && selectionEnd === null && selectionStart === verse.verse) ||
        (selectionStart !== null &&
          selectionEnd !== null &&
          verse.verse >= Math.min(selectionStart, selectionEnd) &&
          verse.verse <= Math.max(selectionStart, selectionEnd));

      if (isAlreadyHighlighted) {
        clearRangeSelection();
        closeLongPressMenu();
        return;
      }

      if (selectionStart !== null && selectionEnd === null) {
        setSelectionEnd(verse.verse);
        return;
      }

      if (selectionStart !== null && selectionEnd !== null) {
        return;
      }

      if (selectedVerse && !(await confirmDiscardUnsaved())) {
        return;
      }

      clearRangeSelection();
      setSelectedVerse(verse);
      setVerseNote(getSavedNoteForVerse(verse.verse));
    },
    [
      clearRangeSelection,
      closeLongPressMenu,
      confirmDiscardUnsaved,
      getSavedNoteForVerse,
      selectedVerse,
      selectionEnd,
      selectionStart,
      setSelectionEnd,
      setSelectedVerse,
      setVerseNote,
    ]
  );

  const handleTextButtonPress = useCallback(() => {
    setFontSize((current) => {
      const currentIndex = FONT_SIZE_OPTIONS.indexOf(current);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % FONT_SIZE_OPTIONS.length;
      return FONT_SIZE_OPTIONS[nextIndex];
    });
  }, [setFontSize]);

  const setMenuFromMeasuredVerse = useCallback(
    (verseNumber, node) => {
      const fallback = {
        verseNumber,
        top: Math.max(8, insets.top + 96),
        left: clamp(screenWidth / 2 - 110, 8, Math.max(8, screenWidth - 228)),
      };

      if (!node?.measureInWindow) {
        setLongPressMenu(fallback);
        return;
      }

      node.measureInWindow((x, y, width) => {
        setLongPressMenu({
          verseNumber,
          top: Math.max(8, y - 46),
          left: Math.min(screenWidth - 228, Math.max(8, x + width / 2 - 110)),
        });
      });
    },
    [insets.top, screenWidth]
  );

  const handleVerseLongPress = useCallback(
    (verseNumber) => {
      if (selectionStart !== null && selectionEnd === null && selectionStart !== verseNumber) {
        setSelectionEnd(verseNumber);
      } else {
        setSelectionStart(verseNumber);
        setSelectionEnd(null);
      }

      longPressTriggeredRef.current = true;
      setMenuFromMeasuredVerse(verseNumber, verseRefs.current[verseNumber]?.node);
    },
    [selectionEnd, selectionStart, setMenuFromMeasuredVerse, setSelectionEnd, setSelectionStart, verseRefs]
  );

  const openNoteFromLongPress = useCallback(() => {
    if (!longPressMenu) {
      return;
    }

    const rangeStart = selectionStart ?? longPressMenu.verseNumber;
    const rangeEnd = selectionEnd ?? longPressMenu.verseNumber;
    const verseNumbers = new Set(makeRange(rangeStart, rangeEnd));
    const verses = bibleText.filter((verse) => verseNumbers.has(verse.verse));

    if (!verses.length) {
      return;
    }

    setSelectedVerseRange(verses);
    setSelectedVerse(verses[0]);
    setVerseNote(getSavedNoteForVerse(verses[0].verse));
    closeLongPressMenu();
  }, [
    bibleText,
    closeLongPressMenu,
    getSavedNoteForVerse,
    longPressMenu,
    selectionEnd,
    selectionStart,
    setSelectedVerse,
    setVerseNote,
  ]);

  const highlightVerseFromLongPress = useCallback(() => {
    if (!longPressMenu) {
      return;
    }

    const rangeStart = selectionStart ?? longPressMenu.verseNumber;
    const rangeEnd = selectionEnd ?? longPressMenu.verseNumber;
    const verseKeys = makeRange(rangeStart, rangeEnd).map((verseNumber) =>
      getNoteKey(bibleBook, bibleChapter, verseNumber)
    );

    setHighlightedVerses((current) => {
      const allHighlighted = verseKeys.every((key) => current.includes(key));
      if (!allHighlighted) {
        const verseLabel = rangeStart === rangeEnd
          ? `${rangeStart}`
          : `${Math.min(rangeStart, rangeEnd)}-${Math.max(rangeStart, rangeEnd)}`;
        void trackActivity('verse_highlighted', `Highlighted ${bibleBook} ${bibleChapter}:${verseLabel}`, {
          book: bibleBook, chapter: bibleChapter,
          verseStart: Math.min(rangeStart, rangeEnd),
          verseEnd: Math.max(rangeStart, rangeEnd),
        });
      }
      return allHighlighted
        ? current.filter((key) => !verseKeys.includes(key))
        : Array.from(new Set([...current, ...verseKeys]));
    });

    clearRangeSelection();
    closeLongPressMenu();
  }, [
    bibleBook,
    bibleChapter,
    clearRangeSelection,
    closeLongPressMenu,
    getNoteKey,
    longPressMenu,
    selectionEnd,
    selectionStart,
    setHighlightedVerses,
  ]);

  const bookmarkFromLongPress = useCallback(() => {
    if (!longPressMenu) {
      return;
    }

    const key = getNoteKey(bibleBook, bibleChapter, longPressMenu.verseNumber);
    void trackActivity('bookmark_added', `Bookmarked ${bibleBook} ${bibleChapter}:${longPressMenu.verseNumber}`, {
      book: bibleBook, chapter: bibleChapter, verse: longPressMenu.verseNumber,
    });
    setBookmarks((current) => (current.includes(key) ? current : [...current, key]));
    closeLongPressMenu();
  }, [bibleBook, bibleChapter, closeLongPressMenu, getNoteKey, longPressMenu, setBookmarks]);

  const bookmarkKey = selectedVerse ? getNoteKey(bibleBook, bibleChapter, selectedVerse.verse) : '';
  const isBookmarked = bookmarkKey ? bookmarks.includes(bookmarkKey) : false;

  const toggleBookmark = useCallback(() => {
    if (!bookmarkKey) {
      return;
    }

    if (!isBookmarked) {
      void trackActivity('bookmark_added', `Bookmarked ${bibleBook} ${bibleChapter}:${selectedVerse?.verse}`, {
        book: bibleBook, chapter: bibleChapter, verse: selectedVerse?.verse,
      });
    }

    setBookmarks((current) =>
      current.includes(bookmarkKey) ? current.filter((item) => item !== bookmarkKey) : [...current, bookmarkKey]
    );
  }, [bibleBook, bibleChapter, bookmarkKey, isBookmarked, selectedVerse, setBookmarks]);

  const copySelectedVerse = useCallback(async () => {
    if (!selectedVerse) {
      return;
    }

    await Clipboard.setStringAsync(
      `${bibleBook} ${bibleChapter}:${selectedVerse.verse} (${selectedScriptureVersionLabel}) ${selectedVerse.text}`
    );
  }, [bibleBook, bibleChapter, selectedScriptureVersionLabel, selectedVerse]);

  const handleSelectorItemPress = useCallback(
    (value) => {
      const currentSelector = selectorModal;
      closeSelectorModal();

      if (currentSelector === 'version') {
        setScriptureVersion(value);
        return;
      }

      if (currentSelector === 'book') {
        void handleBookChange(value);
      }
    },
    [
      closeSelectorModal,
      handleBookChange,
      selectorModal,
      setScriptureVersion,
    ]
  );

  const clearOutsideSelection = useCallback(() => {
    if (selectionStart !== null || selectionEnd !== null) {
      clearRangeSelection();
    }
    closeLongPressMenu();
  }, [clearRangeSelection, closeLongPressMenu, selectionEnd, selectionStart]);

  const sheetPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(5)
        .onUpdate((event) => {
          if (event.translationY > 0) {
            sheetDragY.value = event.translationY;
          }
        })
        .onEnd((event) => {
          if (event.translationY > 120) {
            runOnJS(clearSelectionState)();
            return;
          }

          sheetDragY.value = withSpring(0, {
            damping: 20,
            stiffness: 220,
          });
        }),
    [clearSelectionState, sheetDragY]
  );

  const selectedReference = selectedVerse
    ? selectedVerseRange && selectedVerseRange.length > 1
      ? `${bibleBook} ${bibleChapter}:${selectedVerseRange[0].verse}-${selectedVerseRange[selectedVerseRange.length - 1].verse
      }`
      : `${bibleBook} ${bibleChapter}:${selectedVerse.verse}`
    : '';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <Reanimated.View
        style={[
          styles.headerShell,
          {
            backgroundColor: colors.toolbarBg,
            borderColor: colors.toolbarBorder,
            shadowColor: dark ? '#000000' : '#94a3b8',
          },
        ]}>
        <Reanimated.View style={[styles.collapsibleHeader, headerAnimatedStyle]}>
          <Reanimated.View
            style={[
              styles.headerRow,
              toolbarRowAnimatedStyle,
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: pressed ? colors.rowPressed : 'transparent',
                },
              ]}>
              <ChevronLeft size={24} color={colors.text} strokeWidth={2.25} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Change book, currently ${bibleBook}`}
              hitSlop={10}
              onPress={openBookSelector}
              style={({ pressed }) => [
                styles.bookButton,
                {
                  backgroundColor: pressed ? colors.rowPressed : 'transparent',
                },
              ]}>
              <Text style={[styles.bookButtonText, { color: colors.heading }]}>{bibleBook}</Text>
              <ChevronDown size={16} color={colors.subtext} strokeWidth={2.5} />
            </Pressable>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Change translation, currently ${selectedScriptureVersionLabel}`}
                hitSlop={10}
                onPress={openVersionSelector}
                style={({ pressed }) => [
                  styles.versionButton,
                  {
                    backgroundColor: pressed ? colors.rowPressed : colors.pickerBg,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.versionButtonText, { color: colors.text }]}>{scriptureVersion.toUpperCase()}</Text>
                <ChevronDown size={14} color={colors.subtext} strokeWidth={2.5} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Text settings"
                hitSlop={10}
                onPress={handleTextButtonPress}
                style={({ pressed }) => [
                  styles.textButton,
                  {
                    backgroundColor: pressed ? colors.rowPressed : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.textButtonLabel, { color: colors.text }]}>Aa</Text>
              </Pressable>
            </View>
          </Reanimated.View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chapterStrip}
            keyboardShouldPersistTaps="handled"
            data={chapterNumbers}
            keyExtractor={(chapter) => String(chapter)}
            renderItem={({ item: chapter }) => {
              const active = chapter === bibleChapter;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Go to chapter ${chapter}`}
                  onPress={() => handleChapterChipPress(chapter)}
                  style={({ pressed }) => [
                    styles.chapterChip,
                    active && styles.chapterChipActive,
                    {
                      backgroundColor: active ? '#0a0a0a' : pressed ? colors.rowPressed : 'transparent',
                      borderColor: active ? '#0a0a0a' : 'transparent',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chapterChipText,
                      {
                        color: active ? '#ffffff' : colors.muted,
                      },
                    ]}>
                    {chapter}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Reanimated.View>
      </Reanimated.View>

      <Modal visible={selectorModal !== null} transparent animationType="fade" onRequestClose={closeSelectorModal}>
        <Pressable style={styles.selectorOverlay} onPress={closeSelectorModal}>
          <View style={[styles.selectorSheet, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.selectorHeader}>
              <Text style={[styles.selectorTitle, { color: colors.heading }]}>
                {selectorModal === 'version' ? 'Choose Translation' : 'Choose Book'}
              </Text>
              <Pressable onPress={closeSelectorModal} hitSlop={10}>
                <Text style={[styles.selectorClose, { color: colors.subtext }]}>Close</Text>
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {(selectorModal === 'version' ? SCRIPTURE_VERSIONS : selectableBibleBooks).map((item) => {
                const value = selectorModal === 'version' ? item.value : item.name;
                const label = selectorModal === 'version' ? item.label : item.name;
                const activeValue = selectorModal === 'version' ? scriptureVersion : bibleBook;
                const active = value === activeValue;

                return (
                  <Pressable
                    key={value}
                    onPress={() => handleSelectorItemPress(value)}
                    style={({ pressed }) => [
                      styles.selectorRow,
                      {
                        backgroundColor: pressed ? colors.rowPressed : active ? colors.selectedBg : 'transparent',
                      },
                    ]}>
                    <Text style={[styles.selectorRowText, { color: colors.text }]}>{label}</Text>
                    {active ? <Text style={[styles.selectorActiveTag, { color: colors.blueText }]}>Current</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.body}>
        <Reanimated.ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: screenWidth >= 768 ? 40 : 96 }]}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          <Pressable onPress={clearOutsideSelection}>
            {error ? <Text style={[styles.statusText, styles.errorText]}>{error}</Text> : null}

            {loading && !error ? (
              <LoadingSkeleton bibleChapterCount={bibleChapterCount} colors={colors} dark={dark} />
            ) : null}

            {!loading && !error ? (
              <View
                style={styles.readingArea}
                onLayout={(event) => {
                  readingAreaYRef.current = event.nativeEvent.layout.y;
                  updateMeasuredVersePositions();
                }}>
                {crossReferenceOrigin ? (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={[
                      styles.returnBanner,
                      { backgroundColor: colors.bannerBg, borderColor: colors.bannerBorder },
                    ]}
                    onPress={returnToCrossReferenceOrigin}>
                    <View style={styles.returnCopy}>
                      <Text style={[styles.returnKicker, { color: colors.blueText }]}>RETURN</Text>
                      <Text style={[styles.returnText, { color: colors.text }]}>
                        Back to {crossReferenceOrigin.book} {crossReferenceOrigin.chapter}:
                        {crossReferenceOrigin.startVerse}
                        {crossReferenceOrigin.endVerse !== crossReferenceOrigin.startVerse
                          ? `-${crossReferenceOrigin.endVerse}`
                          : ''}
                      </Text>
                    </View>
                    <Text style={[styles.returnOpen, { color: colors.blueText }]}>Open</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.chapterHeader}>
                  <Text style={[styles.bookTitle, { color: colors.bookHeading }]}>{bibleBook}</Text>
                  <Text style={[styles.chapterTitle, { color: colors.heading }]}>{bibleChapter}</Text>
                </View>

                <Text style={[styles.scriptureLabel, { color: colors.text }]}>Scripture</Text>

                <View
                  style={styles.verseList}
                  onLayout={(event) => {
                    verseListYRef.current = event.nativeEvent.layout.y;
                    updateMeasuredVersePositions();
                  }}>
                  {bibleText.map((verse) => {
                    const verseKey = getNoteKey(bibleBook, bibleChapter, verse.verse);
                    const isRangeHighlighted =
                      (selectionStart !== null && selectionEnd === null && selectionStart === verse.verse) ||
                      (selectionStart !== null &&
                        selectionEnd !== null &&
                        verse.verse >= Math.min(selectionStart, selectionEnd) &&
                        verse.verse <= Math.max(selectionStart, selectionEnd));
                    const isSelectedVerse = selectedVerse?.verse === verse.verse;
                    const hasPersistentHighlight = highlightedVerses.includes(verseKey);
                    const hasNavigationHighlight =
                      navigationHighlight?.book === bibleBook &&
                      navigationHighlight?.chapter === bibleChapter &&
                      verse.verse >= navigationHighlight.startVerse &&
                      verse.verse <= navigationHighlight.endVerse;

                    const rowBg = hasNavigationHighlight
                      ? colors.navBg
                      : isRangeHighlighted
                        ? colors.rangeBg
                        : isSelectedVerse
                          ? colors.selectedBg
                          : hasPersistentHighlight
                            ? colors.highlightBg
                            : 'transparent';
                    const isActive =
                      hasNavigationHighlight || isRangeHighlighted || isSelectedVerse || hasPersistentHighlight;

                    return (
                      <Pressable
                        key={verse.verse}
                        ref={(element) => {
                          verseRefs.current[verse.verse] = {
                            ...(verseRefs.current[verse.verse] ?? {}),
                            node: element,
                          };
                        }}
                        onLayout={(event) => {
                          const localY = event.nativeEvent.layout.y;
                          verseRefs.current[verse.verse] = {
                            ...(verseRefs.current[verse.verse] ?? {}),
                            localY,
                            y: readingAreaYRef.current + verseListYRef.current + localY,
                          };
                        }}
                        delayLongPress={500}
                        onLongPress={() => handleVerseLongPress(verse.verse)}
                        onPress={(event) => {
                          event.stopPropagation?.();
                          void handleVerseSelect(verse);
                        }}
                        style={({ pressed }) => [
                          styles.verseRow,
                          {
                            backgroundColor: pressed && !isActive ? colors.rowPressed : rowBg,
                            paddingHorizontal: isActive ? 12 : 0,
                            borderWidth: hasNavigationHighlight ? 1 : 0,
                            borderColor: hasNavigationHighlight ? '#93c5fd' : 'transparent',
                          },
                        ]}>
                        <Text style={[styles.verseNumber, { color: colors.subtext }]}>{verse.verse}</Text>
                        <Text selectable style={[styles.verseText, { color: colors.text, fontSize }]}>
                          {verse.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {isDanielBibleView ? (
                  <View style={styles.completeWrap}>
                    <TouchableOpacity
                      activeOpacity={0.86}
                      style={[
                        styles.completeButton,
                        { backgroundColor: completedChapters.includes(bibleChapter) ? '#16a34a' : '#2563eb' },
                      ]}
                      onPress={() => toggleChapterCompletion(bibleChapter)}>
                      <Text style={styles.completeText}>
                        {completedChapters.includes(bibleChapter)
                          ? 'Mark Incomplete'
                          : `Mark Chapter ${bibleChapter} Completed`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Pressable>
        </Reanimated.ScrollView>

        {longPressMenu ? (
          <View style={[styles.longPressOverlay, styles.pointerEventsBoxNone]}>
            <View
              style={[
                styles.longPressMenu,
                {
                  top: longPressMenu.top,
                  left: longPressMenu.left,
                },
              ]}>
              <TouchableOpacity activeOpacity={0.86} style={styles.menuButtonNote} onPress={openNoteFromLongPress}>
                <NotebookPen size={16} color="#f1f5f9" />
                <Text style={styles.menuButtonNoteText}>Note</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.menuButtonHighlight}
                onPress={highlightVerseFromLongPress}>
                <Highlighter size={16} color="#bfdbfe" />
                <Text style={styles.menuButtonHighlightText}>Highlight</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.86} style={styles.menuButtonMarker} onPress={bookmarkFromLongPress}>
                <Bookmark size={16} color="#d1fae5" />
                <Text style={styles.menuButtonMarkerText}>Marker</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <Modal visible={!!selectedVerse} transparent animationType="slide" onRequestClose={clearSelectionState}>
        <TouchableWithoutFeedback onPress={clearSelectionState}>
          <View style={styles.sheetBackdrop}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.sheetKeyboardView}>
              <TouchableWithoutFeedback>
                <Reanimated.View
                  style={[
                    styles.sheetCard,
                    {
                      maxHeight: screenHeight * 0.78,
                      paddingBottom: 16 + insets.bottom,
                      backgroundColor: colors.cardBg,
                      borderColor: colors.sheetBorder,
                    },
                    sheetAnimatedStyle,
                  ]}>
                  <GestureDetector gesture={sheetPanGesture}>
                    <View style={styles.sheetHandleArea}>
                      <View style={[styles.sheetHandle, { backgroundColor: dark ? '#475569' : '#cbd5e1' }]} />
                    </View>
                  </GestureDetector>

                  <ScrollView
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.sheetScrollContent}>
                    <Text style={[styles.sheetRef, { color: colors.text }]}>{selectedReference}</Text>

                    <View style={styles.sheetPassage}>
                      {selectedVerseRange && selectedVerseRange.length > 1 ? (
                        selectedVerseRange.map((verse) => (
                          <Text key={verse.verse} style={[styles.sheetVerseText, { color: colors.muted }]}>
                            <Text style={[styles.sheetVerseNumber, { color: colors.subtext }]}>{verse.verse} </Text>
                            {verse.text}
                          </Text>
                        ))
                      ) : (
                        <Text style={[styles.sheetVerseText, { color: colors.muted }]}>{selectedVerse?.text}</Text>
                      )}
                    </View>

                    <TextInput
                      value={verseNote}
                      onChangeText={setVerseNote}
                      placeholder="Add note..."
                      placeholderTextColor={colors.subtext}
                      multiline
                      textAlignVertical="top"
                      style={[
                        styles.noteInput,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.inputBg,
                          color: colors.text,
                        },
                      ]}
                    />

                    <View style={styles.sheetActions}>
                      <TouchableOpacity activeOpacity={0.86} style={styles.filledPill} onPress={saveNote}>
                        <Text style={styles.filledPillText}>Save Note</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.86}
                        style={[styles.outlinePill, isBookmarked && styles.filledPill]}
                        onPress={toggleBookmark}>
                        <Text style={isBookmarked ? styles.filledPillText : styles.outlinePillText}>
                          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.86} style={styles.outlinePill} onPress={copySelectedVerse}>
                        <Text style={styles.outlinePillText}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={0.86} style={styles.closePill} onPress={clearSelectionState}>
                        <Text style={[styles.closePillText, { color: colors.text }]}>Close</Text>
                      </TouchableOpacity>
                    </View>

                    {isDanielBibleView ? (
                      <View style={[styles.crossRefSection, { borderTopColor: colors.border }]}>
                        <Text style={[styles.crossRefTitle, { color: colors.text }]}>Cross References</Text>
                        {crossReferencesLoading ? (
                          <Text style={[styles.crossRefState, { color: colors.muted }]}>Loading cross-references...</Text>
                        ) : null}
                        {!crossReferencesLoading && crossReferencesLoaded && crossReferences.length === 0 ? (
                          <Text style={[styles.crossRefState, { color: colors.subtext }]}>
                            No cross-references saved for this verse yet.
                          </Text>
                        ) : null}
                        {!crossReferencesLoading && crossReferences.length > 0 ? (
                          <View style={styles.crossRefList}>
                            {crossReferences.map((reference) => {
                              const verseRange =
                                reference.target_verse_end &&
                                  reference.target_verse_end !== reference.target_verse_start
                                  ? `${reference.target_verse_start}-${reference.target_verse_end}`
                                  : `${reference.target_verse_start}`;

                              return (
                                <Pressable
                                  key={reference.id}
                                  onPress={() => openCrossReference(reference)}
                                  style={({ pressed }) => [
                                    styles.crossRefItem,
                                    {
                                      borderColor: pressed ? '#93c5fd' : colors.border,
                                      backgroundColor: pressed ? '#eff6ff' : dark ? '#0b1222' : '#f8fafc',
                                    },
                                  ]}>
                                  <Text style={[styles.crossRefTarget, { color: colors.blueText }]}>
                                    {reference.target_book} {reference.target_chapter}:{verseRange}
                                  </Text>
                                  {reference.note ? (
                                    <Text style={[styles.crossRefNote, { color: colors.muted }]}>{reference.note}</Text>
                                  ) : null}
                                </Pressable>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </ScrollView>
                </Reanimated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

export default function BiblePage() {
  const { book: bookParam, chapter: chapterParam, verse: verseParam } = useLocalSearchParams();
  const requestedBookParam = Array.isArray(bookParam) ? bookParam[0] : bookParam;
  const requestedChapterParam = Number(Array.isArray(chapterParam) ? chapterParam[0] : chapterParam);
  const requestedVerseParam = Number(Array.isArray(verseParam) ? verseParam[0] : verseParam);
  const initialRouteRef = useRef({
    book: requestedBookParam,
    chapter: Number.isFinite(requestedChapterParam) ? requestedChapterParam : 1,
  });
  const completedDanielChapters = useDanielProgress();
  const scrollViewRef = useRef(null);
  const verseRefs = useRef({});
  const pendingNavigationRef = useRef(null);
  const translationsAbortRef = useRef(null);
  const booksAbortRef = useRef(null);
  const chaptersAbortRef = useRef(null);
  const versesAbortRef = useRef(null);
  const booksCacheRef = useRef({});
  const chaptersCacheRef = useRef({});
  const versesCacheRef = useRef({});

  const [translations, setTranslations] = useState([]);
  const [scriptureVersion, setScriptureVersion] = useState(DEFAULT_TRANSLATION_ID);
  const [translationName, setTranslationName] = useState('King James Version');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [bibleBook, setBibleBookState] = useState('');
  const [chapters, setChapters] = useState([]);
  const [bibleChapter, setBibleChapterState] = useState(1);
  const [bibleText, setBibleText] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [verseNote, setVerseNote] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [savedNotes, setSavedNotes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [highlightedVerses, setHighlightedVerses] = useState([]);
  const [navigationHighlight, setNavigationHighlight] = useState(null);
  const [crossReferenceOrigin, setCrossReferenceOrigin] = useState(null);
  const [crossReferences, setCrossReferences] = useState([]);
  const [crossReferencesLoading, setCrossReferencesLoading] = useState(false);
  const [crossReferencesLoaded, setCrossReferencesLoaded] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [toastBadges, setToastBadges] = useState<Badge[]>([]);
  const crossReferencesCacheRef = useRef({});
  const prevCompletedRef = useRef<number[]>([]);

  const selectedTranslation = useMemo(
    () => translations.find((translation) => translation.identifier === scriptureVersion) ?? null,
    [scriptureVersion, translations]
  );
  const selectedBook = useMemo(() => books.find((book) => book.id === selectedBookId) ?? null, [books, selectedBookId]);
  const SCRIPTURE_VERSIONS = useMemo(
    () =>
      translations.length
        ? translations.map((translation) => ({
          value: translation.identifier,
          label: translation.name ?? translation.identifier.toUpperCase(),
        }))
        : [{ value: DEFAULT_TRANSLATION_ID, label: 'King James Version' }],
    [translations]
  );

  const getNoteKey = useCallback(
    (book, chapter, verseNumber) => `${book}:${chapter}:${verseNumber}`,
    []
  );

  const clearChapterState = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setSelectedVerse(null);
    setVerseNote('');
    setNavigationHighlight(null);
    pendingNavigationRef.current = null;
  }, []);

  const loadVerses = useCallback(async (translationId, bookId, chapterNumber) => {
    if (!translationId || !bookId || !chapterNumber) {
      return;
    }

    const cacheKey = `${translationId}:${bookId}:${chapterNumber}`;
    if (versesCacheRef.current[cacheKey]) {
      setBibleText(versesCacheRef.current[cacheKey]);
      return;
    }

    versesAbortRef.current?.abort();
    const controller = new AbortController();
    versesAbortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJson(`${API_ROOT}/${translationId}/${bookId}/${chapterNumber}`, controller.signal);
      const nextVerses = Array.isArray(data.verses)
        ? data.verses.map((verse) => ({
          verse: verse.verse,
          text: normalizeVerseText(verse.text),
        }))
        : [];

      setCacheEntry(versesCacheRef, cacheKey, nextVerses);
      setBibleText(nextVerses);
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        setError('Could not load this chapter. Please try again.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const loadChapters = useCallback(
    async (translationId, bookId, preferredChapter = 1) => {
      if (!translationId || !bookId) {
        return;
      }

      const cacheKey = `${translationId}:${bookId}`;
      const cachedChapters = chaptersCacheRef.current[cacheKey];

      if (cachedChapters) {
        setChapters(cachedChapters);
        const targetChapter = cachedChapters.includes(preferredChapter)
          ? preferredChapter
          : cachedChapters[0] ?? 1;
        setBibleChapterState(targetChapter);
        await loadVerses(translationId, bookId, targetChapter);
        return;
      }

      chaptersAbortRef.current?.abort();
      const controller = new AbortController();
      chaptersAbortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchJson(`${API_ROOT}/${translationId}/${bookId}`, controller.signal);
        const nextChapters = Array.isArray(data.chapters)
          ? data.chapters.reduce((acc, chapter) => {
            const value = chapter?.chapter;

            if (Number.isFinite(value)) {
              acc.push(value);
            }

            return acc;
          }, [])
          : [];

        setCacheEntry(chaptersCacheRef, cacheKey, nextChapters);
        setChapters(nextChapters);

        const targetChapter = nextChapters.includes(preferredChapter)
          ? preferredChapter
          : nextChapters[0] ?? 1;

        setBibleChapterState(targetChapter);
        await loadVerses(translationId, bookId, targetChapter);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Could not load chapters for this book. Please try again.');
          setLoading(false);
        }
      }
    },
    [loadVerses]
  );

  const loadBooksForTranslation = useCallback(
    async (translationId, preferredBookName = '', preferredChapter = 1) => {
      if (!translationId) {
        return;
      }

      const cachedBooks = booksCacheRef.current[translationId];
      if (cachedBooks) {
        const targetBook = findBookByName(cachedBooks, preferredBookName) ?? findBookByName(cachedBooks, DANIEL_BOOK_NAME) ?? cachedBooks[0];

        setBooks(cachedBooks);
        setSelectedBookId(targetBook.id);
        setBibleBookState(targetBook.name);
        await loadChapters(translationId, targetBook.id, preferredChapter);
        return;
      }

      booksAbortRef.current?.abort();
      const controller = new AbortController();
      booksAbortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchJson(`${API_ROOT}/${translationId}`, controller.signal);
        const nextBooks = Array.isArray(data.books) ? data.books : [];

        if (!nextBooks.length) {
          throw new Error('No books found.');
        }

        setCacheEntry(booksCacheRef, translationId, nextBooks);
        setBooks(nextBooks);
        setTranslationName(data.translation?.name ?? 'Bible Translation');

        const targetBook = findBookByName(nextBooks, preferredBookName) ?? findBookByName(nextBooks, DANIEL_BOOK_NAME) ?? nextBooks[0];

        setSelectedBookId(targetBook.id);
        setBibleBookState(targetBook.name);
        await loadChapters(translationId, targetBook.id, preferredChapter);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Could not load books for this version. Please try again.');
          setLoading(false);
        }
      }
    },
    [loadChapters]
  );

  const setBibleBook = useCallback(
    (nextBookName) => {
      const targetBook = findBookByName(books, nextBookName);
      if (!targetBook) {
        return;
      }

      clearChapterState();
      setSelectedBookId(targetBook.id);
      setBibleBookState(targetBook.name);
      void loadChapters(scriptureVersion, targetBook.id, 1);
    },
    [books, clearChapterState, loadChapters, scriptureVersion]
  );

  const setBibleChapter = useCallback(
    (nextChapter) => {
      if (!selectedBookId) {
        return;
      }

      clearChapterState();
      setBibleChapterState(nextChapter);
      void loadVerses(scriptureVersion, selectedBookId, nextChapter);
      void trackActivity('chapter_opened', `Opened ${bibleBook} ${nextChapter}`, {
        book: bibleBook, chapter: nextChapter,
      });
    },
    [bibleBook, clearChapterState, loadVerses, scriptureVersion, selectedBookId]
  );

  const navigateToReference = useCallback(
    (bookName, chapter, startVerse = null, endVerse = startVerse) => {
      const targetBook = findBookByName(books, bookName);
      if (!targetBook) {
        return;
      }

      clearChapterState();
      setSelectedBookId(targetBook.id);
      setBibleBookState(targetBook.name);
      setBibleChapterState(chapter);
      void loadChapters(scriptureVersion, targetBook.id, chapter);

      if (startVerse !== null && Number.isFinite(Number(startVerse))) {
        pendingNavigationRef.current = {
          book: targetBook.name,
          chapter,
          verse: startVerse,
        };
        setNavigationHighlight({
          book: targetBook.name,
          chapter,
          startVerse,
          endVerse: endVerse ?? startVerse,
        });
      }
    },
    [books, clearChapterState, loadChapters, scriptureVersion]
  );

  const toggleChapterCompletion = useCallback(
    (chapter) => {
      const isCurrentlyComplete = completedDanielChapters.includes(chapter);
      const nextChapters = isCurrentlyComplete
        ? completedDanielChapters.filter((item) => item !== chapter)
        : [...completedDanielChapters, chapter].sort((a, b) => a - b);
      void saveDanielProgress(nextChapters);
      if (!isCurrentlyComplete) {
        setShowCompleteModal(true);
        void trackActivity('chapter_completed', `Completed Daniel ${chapter}`, {
          book: 'Daniel', chapter,
        });
      }
    },
    [completedDanielChapters]
  );

  useEffect(() => {
    const prev = prevCompletedRef.current;
    if (prev.length > 0 && completedDanielChapters.length > prev.length) {
      const newlyCompleted = completedDanielChapters.filter((ch) => !prev.includes(ch));
      const earned = getEarnedBadges(newlyCompleted);
      if (earned.length > 0) {
        setToastBadges(earned);
      }
    }
    prevCompletedRef.current = [...completedDanielChapters];
  }, [completedDanielChapters]);

  const saveNote = useCallback(() => {
    if (!selectedVerse) {
      return;
    }

    const key = getNoteKey(bibleBook, bibleChapter, selectedVerse.verse);
    setSavedNotes((current) => ({
      ...current,
      [key]: verseNote.trim(),
    }));
    void trackActivity('note_saved', `Added note on ${bibleBook} ${bibleChapter}:${selectedVerse.verse}`, {
      book: bibleBook, chapter: bibleChapter, verse: selectedVerse.verse,
    });
  }, [bibleBook, bibleChapter, getNoteKey, selectedVerse, verseNote]);

  const returnToCrossReferenceOrigin = useCallback(() => {
    if (!crossReferenceOrigin) {
      return;
    }

    navigateToReference(
      crossReferenceOrigin.book,
      crossReferenceOrigin.chapter,
      crossReferenceOrigin.startVerse,
      crossReferenceOrigin.endVerse
    );
    setCrossReferenceOrigin(null);
  }, [crossReferenceOrigin, navigateToReference]);

  const openCrossReference = useCallback(
    (reference) => {
      setCrossReferenceOrigin({
        book: bibleBook,
        chapter: bibleChapter,
        startVerse: selectedVerse?.verse ?? 1,
        endVerse: selectedVerse?.verse ?? 1,
      });
      navigateToReference(
        reference.target_book,
        reference.target_chapter,
        reference.target_verse_start,
        reference.target_verse_end ?? reference.target_verse_start
      );
      setSelectedVerse(null);
    },
    [bibleBook, bibleChapter, navigateToReference, selectedVerse?.verse]
  );

  useEffect(() => {
    if (!selectedVerse || bibleBook !== DANIEL_BOOK_NAME) {
      setCrossReferences([]);
      setCrossReferencesLoading(false);
      setCrossReferencesLoaded(false);
      return;
    }

    let active = true;

    const cacheKey = `${bibleBook}:${bibleChapter}:${selectedVerse.verse}`;
    const cachedCrossReferences = crossReferencesCacheRef.current[cacheKey];

    if (cachedCrossReferences) {
      setCrossReferences(cachedCrossReferences);
      setCrossReferencesLoading(false);
      setCrossReferencesLoaded(true);
      return () => {
        active = false;
      };
    }

    setCrossReferencesLoading(true);
    setCrossReferencesLoaded(false);

    void loadDanielCrossReferences(bibleChapter, selectedVerse.verse)
      .then((nextCrossReferences) => {
        if (!active) {
          return;
        }

        setCacheEntry(crossReferencesCacheRef, cacheKey, nextCrossReferences);
        setCrossReferences(nextCrossReferences);
        setCrossReferencesLoaded(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setCrossReferences([]);
        setCrossReferencesLoaded(true);
      })
      .finally(() => {
        if (active) {
          setCrossReferencesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [bibleBook, bibleChapter, selectedVerse]);

  useEffect(() => {
    const controller = new AbortController();
    translationsAbortRef.current = controller;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchJson(API_ROOT, controller.signal);
        const allTranslations = Array.isArray(data.translations) ? data.translations : [];
        const english = allTranslations.filter((translation) => translation.language_code === 'eng');
        const priority = { kjv: 0, asv: 1, web: 2, bbe: 3, darby: 4, ylt: 5 };
        const nextTranslations = english
          .sort((a, b) => {
            const rankA = priority[a.identifier] ?? 50;
            const rankB = priority[b.identifier] ?? 50;
            return rankA === rankB ? a.name.localeCompare(b.name) : rankA - rankB;
          })
          .slice(0, 12);

        setTranslations(nextTranslations);
        const defaultTranslation =
          nextTranslations.find((translation) => translation.identifier === DEFAULT_TRANSLATION_ID) ??
          nextTranslations[0];

        if (!defaultTranslation) {
          throw new Error('No supported translations found.');
        }

        setScriptureVersion(defaultTranslation.identifier);
        setTranslationName(defaultTranslation.name ?? 'King James Version');
        await loadBooksForTranslation(
          defaultTranslation.identifier,
          initialRouteRef.current.book || DANIEL_BOOK_NAME,
          initialRouteRef.current.chapter
        );
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Could not connect to Bible API. Please check your internet and retry.');
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      controller.abort();
      booksAbortRef.current?.abort();
      chaptersAbortRef.current?.abort();
      versesAbortRef.current?.abort();
    };
  }, [loadBooksForTranslation]);

  useEffect(() => {
    if (!books.length || !requestedBookParam || !Number.isFinite(requestedChapterParam)) {
      return;
    }

    navigateToReference(
      String(requestedBookParam),
      requestedChapterParam,
      Number.isFinite(requestedVerseParam) ? requestedVerseParam : null,
      Number.isFinite(requestedVerseParam) ? requestedVerseParam : null
    );
  }, [books.length, navigateToReference, requestedBookParam, requestedChapterParam, requestedVerseParam]);

  useEffect(() => {
    const target = pendingNavigationRef.current;

    if (!target || loading || !bibleText.length) {
      return;
    }

    if (target.book !== bibleBook || target.chapter !== bibleChapter) {
      return;
    }

    let timeoutId;
    let cancelled = false;
    let attempts = 0;

    const tryScrollToVerse = () => {
      if (cancelled) {
        return;
      }

      const verseTop = verseRefs.current[target.verse]?.y;
      if (typeof verseTop === 'number' && scrollViewRef.current?.scrollTo) {
        scrollViewRef.current.scrollTo({
          y: Math.max(0, verseTop - 24),
          animated: true,
        });
        pendingNavigationRef.current = null;
        return;
      }

      if (attempts < 8) {
        attempts += 1;
        timeoutId = setTimeout(tryScrollToVerse, 50);
      }
    };

    tryScrollToVerse();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [bibleBook, bibleChapter, bibleText.length, loading]);

  useEffect(() => {
    async function loadStoredStudyState() {
      try {
        const raw = await AsyncStorage.getItem(STUDY_STATE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSavedNotes(parsed.savedNotes && typeof parsed.savedNotes === 'object' ? parsed.savedNotes : {});
          setBookmarks(Array.isArray(parsed.bookmarks) ? parsed.bookmarks : []);
          setHighlightedVerses(Array.isArray(parsed.highlightedVerses) ? parsed.highlightedVerses : []);
        }
      } catch {
        // Keep the in-memory defaults if stored study state is unavailable.
      } finally {
        setStorageReady(true);
      }
    }

    void loadStoredStudyState();
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    void AsyncStorage.setItem(
      STUDY_STATE_KEY,
      JSON.stringify({
        savedNotes,
        bookmarks,
        highlightedVerses,
      })
    );
  }, [bookmarks, highlightedVerses, savedNotes, storageReady]);

  useEffect(() => {
    if (selectedVerse) {
      setVerseNote(savedNotes[getNoteKey(bibleBook, bibleChapter, selectedVerse.verse)] ?? '');
    }
  }, [bibleBook, bibleChapter, getNoteKey, savedNotes, selectedVerse]);

  const handleScriptureVersionChange = useCallback(
    (nextVersion) => {
      setScriptureVersion(nextVersion);
      const nextName = translations.find((translation) => translation.identifier === nextVersion)?.name;
      setTranslationName(nextName ?? 'Bible Translation');
      clearChapterState();
      void loadBooksForTranslation(nextVersion, bibleBook || DANIEL_BOOK_NAME, bibleChapter);
    },
    [bibleBook, bibleChapter, clearChapterState, loadBooksForTranslation, translations]
  );

  return (
    <>
      <BibleReaderScreen
        scrollViewRef={scrollViewRef}
        scriptureVersion={scriptureVersion}
        setScriptureVersion={handleScriptureVersionChange}
        bibleBook={bibleBook || DANIEL_BOOK_NAME}
        setBibleBook={setBibleBook}
        bibleChapter={bibleChapter}
        setBibleChapter={setBibleChapter}
        selectableBibleBooks={books.map((book) => ({ name: book.name }))}
        bibleChapterCount={chapters.length || 1}
        loading={loading}
        error={error}
        bibleText={bibleText}
        verseRefs={verseRefs}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        setSelectionStart={setSelectionStart}
        setSelectionEnd={setSelectionEnd}
        selectedVerse={selectedVerse}
        setSelectedVerse={setSelectedVerse}
        verseNote={verseNote}
        setVerseNote={setVerseNote}
        savedNotes={savedNotes}
        getNoteKey={getNoteKey}
        isDanielBibleView={selectedBook?.name === DANIEL_BOOK_NAME || bibleBook === DANIEL_BOOK_NAME}
        completedChapters={completedDanielChapters}
        toggleChapterCompletion={toggleChapterCompletion}
        saveNote={saveNote}
        bookmarks={bookmarks}
        setBookmarks={setBookmarks}
        highlightedVerses={highlightedVerses}
        setHighlightedVerses={setHighlightedVerses}
        navigationHighlight={navigationHighlight}
        crossReferenceOrigin={crossReferenceOrigin}
        returnToCrossReferenceOrigin={returnToCrossReferenceOrigin}
        selectedScriptureVersionLabel={selectedTranslation?.name ?? translationName}
        crossReferences={crossReferences}
        crossReferencesLoading={crossReferencesLoading}
        crossReferencesLoaded={crossReferencesLoaded}
        openCrossReference={openCrossReference}
        DANIEL_BOOK_NAME={DANIEL_BOOK_NAME}
        SCRIPTURE_VERSIONS={SCRIPTURE_VERSIONS}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <ChapterCompleteModal
        visible={showCompleteModal}
        chapter={bibleChapter}
        totalChapters={12}
        onClose={() => setShowCompleteModal(false)}
        onNextChapter={() => {
          setShowCompleteModal(false);
          if (bibleChapter < chapters.length) {
            setBibleChapter(bibleChapter + 1);
          }
        }}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BadgeEarnedToast
          badges={toastBadges}
          onComplete={() => setToastBadges([])}
          onPress={(badge) => setSelectedBadge(badge)}
        />
      </View>
      <BadgePreviewModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerShell: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    elevation: 6,
    marginHorizontal: 10,
    marginTop: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  collapsibleHeader: {
    overflow: 'hidden',
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  bookButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 38,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  versionButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  versionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  textButtonLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chapterStrip: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    color: '#dc2626',
  },
  readingArea: {
    gap: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  loadingShell: {
    gap: 24,
    paddingBottom: 24,
    paddingTop: 12,
    position: 'relative',
  },
  loadingHeader: {
    gap: 14,
  },
  loadingTitleBlock: {
    alignSelf: 'center',
    borderRadius: 18,
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: '52%',
    minWidth: 220,
  },
  loadingLine: {
    borderRadius: 999,
    height: 12,
  },
  loadingLineShort: {
    width: '42%',
  },
  loadingLineMedium: {
    width: '68%',
  },
  loadingChapterStrip: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  loadingChapterChip: {
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    width: 40,
  },
  loadingContent: {
    gap: 12,
  },
  loadingBookRow: {
    borderRadius: 18,
    gap: 14,
    overflow: 'hidden',
    padding: 16,
  },
  loadingBookLine: {
    borderRadius: 999,
    height: 28,
    width: '48%',
  },
  loadingVerseBlock: {
    gap: 10,
  },
  loadingVerseLine: {
    borderRadius: 999,
    height: 14,
    width: '100%',
  },
  loadingShimmer: {
    bottom: 0,
    left: '-30%',
    opacity: 0.5,
    position: 'absolute',
    right: '-30%',
    top: 0,
  },
  returnBanner: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  returnCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  returnKicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  returnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  returnOpen: {
    fontSize: 14,
    fontWeight: '600',
  },
  chapterHeader: {
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  chapterTitle: {
    fontSize: 72,
    fontWeight: '600',
    lineHeight: 72,
    letterSpacing: 0,
  },
  scriptureLabel: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  verseList: {
    gap: 4,
  },
  verseRow: {
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 4,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
    paddingTop: 4,
    width: 36,
  },
  verseText: {
    flex: 1,
    lineHeight: 35,
  },
  completeWrap: {
    alignItems: 'center',
    paddingTop: 16,
  },
  completeButton: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  completeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  chapterChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  chapterChipActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  chapterChipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  longPressOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  pointerEventsBoxNone: {
    pointerEvents: 'box-none',
  },
  longPressMenu: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderColor: '#334155',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  menuButtonNote: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuButtonHighlight: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,58,138,0.7)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuButtonMarker: {
    alignItems: 'center',
    backgroundColor: 'rgba(6,78,59,0.7)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  menuButtonNoteText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
  },
  menuButtonHighlightText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
  menuButtonMarkerText: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorOverlay: {
    backgroundColor: 'rgba(2,6,23,0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  selectorSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '72%',
    padding: 16,
  },
  selectorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectorClose: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectorRow: {
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  selectorRowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectorActiveTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(2,6,23,0.35)',
    flex: 1,
  },
  sheetKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    bottom: 0,
    elevation: 24,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    borderRadius: 3,
    height: 6,
    marginBottom: 8,
    width: 40,
  },
  sheetHandleArea: {
    paddingTop: 2,
    paddingBottom: 8,
  },
  sheetScrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  sheetRef: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sheetPassage: {
    gap: 4,
    marginBottom: 12,
  },
  sheetVerseText: {
    fontSize: 14,
    lineHeight: 22,
  },
  sheetVerseNumber: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 80,
    padding: 8,
    textAlignVertical: 'top',
    width: '100%',
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filledPill: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filledPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  outlinePill: {
    backgroundColor: 'transparent',
    borderColor: '#0f172a',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  outlinePillText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  closePill: {
    backgroundColor: 'transparent',
    marginLeft: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  closePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  crossRefSection: {
    borderTopWidth: 1,
    gap: 12,
    marginTop: 4,
    minHeight: 120,
    paddingTop: 12,
  },
  crossRefTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  crossRefState: {
    fontSize: 14,
  },
  crossRefList: {
    gap: 8,
  },
  crossRefItem: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  crossRefTarget: {
    fontSize: 14,
    fontWeight: '600',
  },
  crossRefNote: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
