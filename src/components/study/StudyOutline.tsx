import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

const ACCENT = '#D4A24C';
const TEXT_BODY = '#DDE9FF';
const TEXT_MUTED = '#94A3B8';
const SURFACE = '#0A1324';
const SURFACE_ALT = '#111B2C';
const BORDER = 'rgba(148, 163, 184, 0.18)';

export type OutlineItem = {
  id: string;
  title: string;
  label: string;
  level: 0 | 1;
};

type StudyOutlineProps = {
  items: OutlineItem[];
  currentId?: string;
  onSelect: (id: string) => void;
};

export default function StudyOutline({ items, currentId, onSelect }: StudyOutlineProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item.id)}
          style={({ pressed }) => [
            styles.outlineItem,
            item.level === 1 && styles.outlineSubItem,
            currentId === item.id && styles.outlineItemActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.outlineNumber, currentId === item.id && styles.outlineNumberActive]}>
            {item.label}
          </Text>
          <Text style={[styles.outlineText, currentId === item.id && styles.outlineTextActive]}>
            {item.title}
          </Text>
          <ChevronRight size={16} color={currentId === item.id ? ACCENT : TEXT_MUTED} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  outlineItem: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: SURFACE,
    paddingHorizontal: 12,
  },
  outlineSubItem: {
    marginLeft: 24,
    backgroundColor: SURFACE_ALT,
  },
  outlineItemActive: {
    borderColor: ACCENT,
  },
  outlineNumber: {
    width: 42,
    color: TEXT_MUTED,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
  },
  outlineNumberActive: {
    color: ACCENT,
  },
  outlineText: {
    flex: 1,
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
  outlineTextActive: {
    color: '#FFD469',
  },
  pressed: {
    opacity: 0.76,
  },
});
