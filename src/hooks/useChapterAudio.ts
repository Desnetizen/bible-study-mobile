import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer } from 'expo-audio';

import { supabase } from '@/lib/supabase';
import { AUDIO_FILES } from '@/constants/audio-files';

type AudioPlayerInstance = ReturnType<typeof createAudioPlayer>;
type AudioPlayerSubscription = ReturnType<AudioPlayerInstance['addListener']>;

let activePlayer: AudioPlayerInstance | null = null;

export function useChapterAudio(chapterNumber: number) {
  const playerRef = useRef<AudioPlayerInstance | null>(null);
  const statusSubscriptionRef = useRef<AudioPlayerSubscription | null>(null);
  const filename = AUDIO_FILES[chapterNumber];
  const hasAudio = !!filename;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const getOrCreatePlayer = useCallback(() => {
    if (!playerRef.current) {
      try {
        if (activePlayer && activePlayer !== playerRef.current) {
          try {
            activePlayer.pause();
            activePlayer.remove();
          } catch {
            // ignore stale player teardown errors
          }
        }
        const p = createAudioPlayer(null);
        playerRef.current = p;
        activePlayer = p;
        statusSubscriptionRef.current = p.addListener('playbackStatusUpdate', (status: any) => {
          setCurrentTime(status.currentTime ?? 0);
          setDuration(status.duration ?? 0);
          setPlaying(status.playing ?? false);
          setIsLoaded(status.isLoaded ?? false);
        });
      } catch {
        setError('Audio player is not available. Try rebuilding the dev client.');
      }
    }
    return playerRef.current;
  }, []);

  const play = useCallback(async () => {
    if (!filename || !supabase) {
      if (!filename) setError('No audio file available for this chapter');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const player = getOrCreatePlayer();
      if (!player) throw new Error('Audio player unavailable');

      const { data } = supabase.storage.from('audio-files').getPublicUrl(filename);
      const signedUrl = data?.publicUrl;

      if (signedUrl) {
        try {
          player.replace(signedUrl);
          player.play();
          setPlaying(true);
        } catch {
          setError('Audio player failed to play');
        }
      } else {
        setError('Could not generate audio URL');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to play audio');
    } finally {
      setLoading(false);
    }
  }, [filename, getOrCreatePlayer]);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (!hasAudio) return;

    const player = playerRef.current;

    if (!player) {
      play();
      return;
    }

    if (playing) {
      player.pause();
      setPlaying(false);
    } else if (isLoaded) {
      const finished = duration > 0 && currentTime >= duration - 0.25;
      if (finished) player.seekTo(0);
      player.play();
      setPlaying(true);
    } else {
      play();
    }
  }, [hasAudio, playing, isLoaded, duration, currentTime, play]);

  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current === activePlayer) {
        try {
          statusSubscriptionRef.current?.remove();
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {
          // ignore teardown errors
        }
        activePlayer = null;
      }
      statusSubscriptionRef.current = null;
      playerRef.current = null;
    };
  }, []);

  return {
    player: {
      isLoaded,
      seekTo: (seconds: number) => { playerRef.current?.seekTo(seconds); },
      pause,
    },
    status: { duration, currentTime },
    loading,
    error,
    hasAudio,
    playing,
    play,
    toggle,
  };
}
