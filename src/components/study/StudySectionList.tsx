import { ChevronDown, Crown } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StudySection } from '@/types/daniel-study';
import { hexToRgba } from '@/lib/colors';

const ACCENT = '#D4A24C';
const TEXT = '#FFFFFF';
const TEXT_BODY = '#DDE9FF';
const TEXT_MUTED = '#94A3B8';
const SURFACE = '#0A1324';
const SURFACE_ALT = '#111B2C';
const BORDER = 'rgba(148, 163, 184, 0.18)';
const DISPLAY_SERIF = 'Georgia';

type StudySectionListProps = {
  sections: StudySection[];
  expandedSectionIds: string[];
  expandedSubsectionIds: string[];
  onToggleSection: (id: string) => void;
  onToggleSubsection: (id: string) => void;
};

function stripNumber(title: string): string {
  return title.replace(/^\d+(?:\.\d+)?\.?\s*/, '').trim();
}

function sectionLabel(title: string, fallback: number): string {
  const match = title.match(/^(\d+(?:\.\d+)?)/);
  return match?.[1] ?? String(fallback);
}

function splitParagraphs(content?: string): string[] {
  return (content ?? '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function TableView({ table, compact = false }: { table: NonNullable<StudySection['table']>; compact?: boolean }) {
  return (
    <View style={[styles.table, compact && styles.tableCompact]}>
      <View style={styles.tableRow}>
        {table.columns.map((column) => (
          <Text key={column} style={[styles.tableCell, styles.tableHead]}>{column}</Text>
        ))}
      </View>
      {table.rows.map((row, index) => (
        <View key={`${row.join('-')}-${index}`} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <Text key={`${cell}-${cellIndex}`} style={styles.tableCell}>{cell}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Prose({ content }: { content?: string }) {
  return (
    <>
      {splitParagraphs(content).map((paragraph, index) => (
        <Text key={`${paragraph.slice(0, 18)}-${index}`} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </>
  );
}

function SectionExtras({ node }: { node: StudySection }) {
  return (
    <>
      {node.table && <TableView table={node.table} />}
      {node.list && (
        <View style={styles.bulletList}>
          {node.list.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
      {node.quote && (
        <View style={styles.quoteBlock}>
          <Text style={styles.quoteText}>{node.quote}</Text>
          {node.quoteCitation && <Text style={styles.quoteCitation}>- {node.quoteCitation}</Text>}
        </View>
      )}
      {node.timelineTable && (
        <View style={styles.timelineBlock}>
          <Text style={styles.timelineTitle}>Empire Timeline</Text>
          <TableView table={node.timelineTable} compact />
        </View>
      )}
      {node.theme && (
        <View style={styles.themeCallout}>
          <Crown size={15} color="#A7F36E" />
          <Text style={styles.themeText}>Key Theme: {node.theme}</Text>
        </View>
      )}
    </>
  );
}

export default function StudySectionList({
  sections,
  expandedSectionIds,
  expandedSubsectionIds,
  onToggleSection,
  onToggleSubsection,
}: StudySectionListProps) {
  return (
    <View style={styles.container}>
      {sections.map((section, sectionIndex) => {
        const expanded = expandedSectionIds.includes(section.id);
        const label = sectionLabel(section.title, sectionIndex + 1);

        return (
          <View key={section.id} style={styles.sectionCard}>
            <Pressable
              onPress={() => onToggleSection(section.id)}
              style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}
            >
              <View style={styles.sectionIconWrap}>
                <Crown size={21} color={ACCENT} />
              </View>
              <View style={styles.sectionHeaderCopy}>
                <Text style={styles.sectionTitle}>{label}. {stripNumber(section.title)}</Text>
                {section.intro && <Text style={styles.sectionIntro}>{section.intro}</Text>}
              </View>
              <ChevronDown
                size={20}
                color={TEXT_MUTED}
                style={expanded ? styles.chevronOpen : undefined}
              />
            </Pressable>

            {expanded && (
              <View style={styles.sectionBody}>
                {section.content && <Prose content={section.content} />}
                <SectionExtras node={section} />
                {section.subsections && (
                  <View style={styles.subsectionStack}>
                    {section.subsections.map((subsection) => {
                      const subExpanded = expandedSubsectionIds.includes(subsection.id);
                      return (
                        <View
                          key={subsection.id}
                          style={[styles.subsectionRow, subExpanded && styles.subsectionRowActive]}
                        >
                          <Pressable
                            onPress={() => onToggleSubsection(subsection.id)}
                            style={({ pressed }) => [styles.subsectionPress, pressed && styles.pressed]}
                          >
                            <View style={styles.subCopy}>
                              <Text style={[styles.subTitle, subExpanded && styles.subTitleActive]}>
                                {subsection.title}
                              </Text>
                            </View>
                            <ChevronDown
                              size={18}
                              color={subExpanded ? ACCENT : TEXT_MUTED}
                              style={subExpanded ? styles.chevronOpen : undefined}
                            />
                          </Pressable>
                          {subExpanded && (
                            <View style={styles.subContent}>
                              <Prose content={subsection.content} />
                              <SectionExtras node={subsection} />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  sectionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexToRgba(ACCENT, 0.16),
    borderWidth: 1,
    borderColor: hexToRgba(ACCENT, 0.22),
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: '#FFD469',
    fontFamily: 'Cinzel',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  sectionIntro: {
    color: TEXT_MUTED,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 17,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  paragraph: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
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
    backgroundColor: ACCENT,
  },
  bulletText: {
    flex: 1,
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: hexToRgba(ACCENT, 0.55),
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tableCompact: {
    marginVertical: 4,
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
    color: TEXT_BODY,
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
  subsectionStack: {
    gap: 8,
    marginTop: 4,
  },
  subsectionRow: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: 10,
    backgroundColor: SURFACE_ALT,
    overflow: 'hidden',
  },
  subsectionRowActive: {
    borderColor: ACCENT,
  },
  subsectionPress: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  subCopy: {
    flex: 1,
  },
  subTitle: {
    color: TEXT,
    fontFamily: 'Cinzel',
    fontSize: 14,
    fontWeight: '700',
  },
  subTitleActive: {
    color: '#FFD469',
  },
  subContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    borderRadius: 8,
    backgroundColor: 'rgba(212,162,76,0.08)',
    padding: 14,
    marginVertical: 8,
  },
  quoteText: {
    color: '#F7EAC4',
    fontFamily: DISPLAY_SERIF,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteCitation: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'right',
  },
  timelineBlock: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(2,6,23,0.35)',
    marginTop: 6,
  },
  timelineTitle: {
    color: ACCENT,
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  themeCallout: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(167,243,110,0.25)',
    borderRadius: 8,
    backgroundColor: 'rgba(34,197,94,0.10)',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  themeText: {
    color: '#A7F36E',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.76,
  },
});
