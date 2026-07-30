import { useCallback, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { supabase } from '@/lib/supabase';
import { AUDIO_FILES } from '@/constants/audio-files';

export function useChapterAudio(chapterNumber: number) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = AUDIO_FILES[chapterNumber];
  const hasAudio = !!filename;

  const play = useCallback(async () => {
    if (!filename || !supabase) return;

    setError(null);
    setLoading(true);

    const signedUrl = supabase.storage.from('audio-files').getPublicUrl(filename).data.publicUrl;

    setLoading(false);

    if (signedUrl) {
      player.replace(signedUrl);
      player.play();
    } else {
      setError('Could not generate audio URL');
    }
  }, [filename, player]);

  const toggle = useCallback(() => {
    if (!hasAudio) return;

    if (player.playing) {
      player.pause();
    } else if (player.isLoaded) {
      const finished = status.duration > 0 && status.currentTime >= status.duration - 0.25;
      if (finished) player.seekTo(0);
      player.play();
    } else {
      play();
    }
  }, [hasAudio, player, play, status.duration, status.currentTime]);

  return { player, status, loading, error, hasAudio, playing: player.playing, play, toggle };
}
