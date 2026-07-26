import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { TermItem } from '@/types/daniel-study';

const TEXT = '#FFFFFF';
const TEXT_BODY = '#DDE9FF';
const SURFACE = '#0A1324';
const BORDER = 'rgba(148, 163, 184, 0.18)';
const DISPLAY_SERIF = 'Georgia';

type StudyGlossarySheetProps = {
  visible: boolean;
  terms: TermItem[];
  onClose: () => void;
};

export default function StudyGlossarySheet({ visible, terms, onClose }: StudyGlossarySheetProps) {
  if (terms.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Key Terms</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={TEXT_BODY} />
            </Pressable>
          </View>
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {terms.map((term) => (
              <View key={`${term.term}-${term.gloss}`} style={styles.termRow}>
                <Text style={styles.termOriginal}>{term.term}</Text>
                <Text style={styles.termGloss}>
                  {term.transliteration ? `${term.transliteration} - ` : ''}{term.gloss}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: SURFACE,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#FFD469',
    fontFamily: 'Cinzel',
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    maxHeight: 500,
  },
  termRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
  },
  termOriginal: {
    color: TEXT,
    fontFamily: DISPLAY_SERIF,
    fontSize: 15,
    fontWeight: '700',
  },
  termGloss: {
    color: TEXT_BODY,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
