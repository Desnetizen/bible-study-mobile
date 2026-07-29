import { Bookmark, Headphones, Highlighter, StickyNote, Share2 } from 'lucide-react-native';
import React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hexToRgba } from '@/lib/colors';

const ACCENT = '#D4A24C';
const TEXT_BODY = '#DDE9FF';
const BORDER = 'rgba(148, 163, 184, 0.18)';

type StudyActionsProps = {
  bookmarked: boolean;
  onToggleBookmark: () => void;
  highlighted: boolean;
  onToggleHighlight: () => void;
  onAddNotes: () => void;
  onShare: () => void;
  onPlayAudio: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export default function StudyActions({
  bookmarked,
  onToggleBookmark,
  highlighted,
  onToggleHighlight,
  onAddNotes,
  onShare,
  onPlayAudio,
  onLayout,
}: StudyActionsProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (isMobile) {
    return (
      <View style={[styles.footerMobile, { paddingBottom: insets.bottom + 10 }]} onLayout={onLayout}>
        <View style={styles.footerMobileUtils}>
          <Pressable
            style={({ pressed }) => [
              styles.footerIconBtn,
              bookmarked && styles.footerIconBtnActive,
              pressed && styles.pressed,
            ]}
            onPress={onToggleBookmark}
          >
            <Bookmark size={18} color={bookmarked ? ACCENT : TEXT_BODY} fill={bookmarked ? ACCENT : 'transparent'} />
            <Text style={styles.footerIconText}>Bookmark</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.footerIconBtn, pressed && styles.pressed]}
            onPress={onAddNotes}
          >
            <StickyNote size={18} color={TEXT_BODY} />
            <Text style={styles.footerIconText}>Add Notes</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.footerIconBtn,
              highlighted && styles.footerIconBtnActive,
              pressed && styles.pressed,
            ]}
            onPress={onToggleHighlight}
          >
            <Highlighter size={18} color={highlighted ? ACCENT : TEXT_BODY} />
            <Text style={styles.footerIconText}>Highlights</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.footerIconBtn, pressed && styles.pressed]}
            onPress={onShare}
          >
            <Share2 size={18} color={TEXT_BODY} />
            <Text style={styles.footerIconText}>Share</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.footerIconBtn, pressed && styles.pressed]}
            onPress={onPlayAudio}
          >
            <Headphones size={18} color={TEXT_BODY} />
            <Text style={styles.footerIconText}>Audio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]} onLayout={onLayout}>
      <View style={styles.footerLeft}>
        <Pressable
          style={({ pressed }) => [
            styles.footerIconButton,
            bookmarked && styles.footerIconButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={onToggleBookmark}
        >
          <Bookmark size={20} color={bookmarked ? ACCENT : TEXT_BODY} fill={bookmarked ? ACCENT : 'transparent'} />
          <Text style={styles.footerIconText}>Bookmark</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.footerIconButton, pressed && styles.pressed]}
          onPress={onAddNotes}
        >
          <StickyNote size={20} color={TEXT_BODY} />
          <Text style={styles.footerIconText}>Add Notes</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.footerIconButton,
            highlighted && styles.footerIconButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={onToggleHighlight}
        >
          <Highlighter size={20} color={highlighted ? ACCENT : TEXT_BODY} />
          <Text style={styles.footerIconText}>Highlights</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.footerIconButton, pressed && styles.pressed]}
          onPress={onShare}
        >
          <Share2 size={20} color={TEXT_BODY} />
          <Text style={styles.footerIconText}>Share</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.audioButton, pressed && styles.pressed]}
        onPress={onPlayAudio}
      >
        <Headphones size={22} color={TEXT_BODY} />
        <Text style={styles.audioText}>Audio</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: 'rgba(7,17,31,0.96)',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  footerIconButton: {
    minWidth: 62,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
  },
  footerIconButtonActive: {
    backgroundColor: hexToRgba(ACCENT, 0.11),
  },
  footerIconText: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 10,
  },
  audioButton: {
    minWidth: 96,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(12,20,32,0.8)',
    paddingHorizontal: 14,
  },
  audioText: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
  },
  footerMobile: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: 'rgba(7,17,31,0.96)',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  footerMobileUtils: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerIconBtn: {
    minWidth: 56,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
  },
  footerIconBtnActive: {
    backgroundColor: hexToRgba(ACCENT, 0.11),
  },
  pressed: {
    opacity: 0.76,
  },
});
