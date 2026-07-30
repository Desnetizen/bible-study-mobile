import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';

const BG_DEEP = '#0B0F16';
const ACCENT = '#D4A24C';
const TEXT_MUTED = '#94A3B8';
const BORDER = 'rgba(148, 163, 184, 0.18)';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type StudyAudioProps = {
  chapterTitle: string;
  player: { isLoaded: boolean; seekTo: (position: number) => void };
  status: { duration?: number; currentTime?: number };
  loading: boolean;
  hasAudio: boolean;
  playing: boolean;
  toggle: () => void;
  error: string | null;
};

export default function StudyAudio({ chapterTitle, player, status, loading, hasAudio, playing, toggle, error }: StudyAudioProps) {

  if (!hasAudio) {
    return (
      <View style={styles.centered}>
        <Text style={styles.mutedText}>No audio is available for this chapter yet.</Text>
      </View>
    );
  }

  const duration = status.duration ?? 0;
  const currentTime = status.currentTime ?? 0;
  const progressPct = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const canSeek = player.isLoaded;

  const skip = (delta: number) => {
    if (!canSeek) return;
    player.seekTo(Math.max(0, Math.min(duration, currentTime + delta)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={2}>{chapterTitle}</Text>
      <Text style={styles.subtitle}>Chapter Audio</Text>

      {error && <Text style={styles.errorText}>{'Couldn\u2019t load audio \u2014'} {error}</Text>}

      <View style={styles.trackWrap}>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${progressPct * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => skip(-15)} style={styles.skipButton} hitSlop={10} disabled={!canSeek}>
          <RotateCcw size={22} color={TEXT_MUTED} />
          <Text style={styles.skipText}>15</Text>
        </Pressable>

        <Pressable onPress={toggle} style={styles.playButton} hitSlop={10}>
          {loading
            ? <ActivityIndicator color={BG_DEEP} />
            : playing
              ? <Pause size={28} color={BG_DEEP} fill={BG_DEEP} />
              : <Play size={28} color={BG_DEEP} fill={BG_DEEP} />}
        </Pressable>

        <Pressable onPress={() => skip(15)} style={styles.skipButton} hitSlop={10} disabled={!canSeek}>
          <RotateCw size={22} color={TEXT_MUTED} />
          <Text style={styles.skipText}>15</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 24, backgroundColor: BG_DEEP, flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  mutedText: { color: TEXT_MUTED, fontFamily: 'Inter', fontSize: 13, textAlign: 'center' },
  errorText: { color: '#F87171', fontFamily: 'Inter', fontSize: 12, textAlign: 'center' },
  title: { color: '#FFFFFF', fontFamily: 'Cinzel', fontSize: 18, fontWeight: '700' },
  subtitle: { color: TEXT_MUTED, fontFamily: 'Inter', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  trackWrap: { gap: 8 },
  trackBg: { height: 4, borderRadius: 2, backgroundColor: BORDER, overflow: 'hidden' },
  trackFill: { height: 4, borderRadius: 2, backgroundColor: ACCENT },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: TEXT_MUTED, fontFamily: 'Inter', fontSize: 11, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  skipButton: { alignItems: 'center', gap: 2 },
  skipText: { color: TEXT_MUTED, fontFamily: 'Inter', fontSize: 10, fontWeight: '700' },
  playButton: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
});
