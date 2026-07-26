import { Menu } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const BG_DEEP = '#0B0F16';
const ACCENT = '#D4A24C';
const TEXT_MUTED = '#94A3B8';
const BORDER = 'rgba(148, 163, 184, 0.18)';

export type StudyTabId = 'overview' | 'read' | 'outline';

type StudyTabsProps = {
  activeTab: StudyTabId;
  onTabChange: (tab: StudyTabId) => void;
  isWide: boolean;
  sectionsDrawerOpen: boolean;
  onToggleSections: () => void;
};

const TABS: { id: StudyTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'read', label: 'Read' },
  { id: 'outline', label: 'Outline' },
];

export default function StudyTabs({
  activeTab,
  onTabChange,
  isWide,
  sectionsDrawerOpen,
  onToggleSections,
}: StudyTabsProps) {
  return (
    <View style={styles.tabs}>
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Pressable key={tab.id} onPress={() => onTabChange(tab.id)} style={styles.tabButton}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
          </Pressable>
        );
      })}
      {!isWide && (
        <Pressable style={styles.sectionsToggle} onPress={onToggleSections}>
          <Menu size={16} color={ACCENT} />
          <Text style={styles.sectionsToggleText}>Sections</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG_DEEP,
    paddingHorizontal: 14,
  },
  tabButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabText: {
    color: TEXT_MUTED,
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
  },
  tabTextActive: {
    color: ACCENT,
  },
  tabUnderline: {
    height: 2,
    marginTop: 7,
    borderRadius: 2,
  },
  tabUnderlineActive: {
    backgroundColor: ACCENT,
  },
  sectionsToggle: {
    marginLeft: 'auto',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionsToggleText: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
});
