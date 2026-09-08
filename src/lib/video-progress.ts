import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bible-connection:daniel-video-progress:v1';

export type VideoProgressEntry = {
  percent: number; // 0-100
  updatedAt: number;
};

export type VideoProgressMap = Record<string, VideoProgressEntry>;

let cache: VideoProgressMap | null = null;
let loadPromise: Promise<VideoProgressMap> | null = null;
const listeners = new Set<() => void>();

async function loadFromStorage(): Promise<VideoProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function ensureLoaded(): Promise<VideoProgressMap> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = loadFromStorage().then((data) => {
      cache = data;
      return data;
    });
  }
  return loadPromise;
}

function emit() {
  listeners.forEach((listener) => listener());
}

async function persist(next: VideoProgressMap) {
  cache = next;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures; the in-memory cache still reflects the update.
  }
  emit();
}

/** Record how far into a video the person has watched (0-100). */
export async function recordVideoProgress(videoId: string, percent: number) {
  const current = await ensureLoaded();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const next = {
    ...current,
    [videoId]: { percent: clamped, updatedAt: Date.now() },
  };
  await persist(next);
}

export async function clearVideoProgress(videoId: string) {
  const current = await ensureLoaded();
  if (!(videoId in current)) return;
  const next = { ...current };
  delete next[videoId];
  await persist(next);
}

export async function getAllVideoProgress(): Promise<VideoProgressMap> {
  return ensureLoaded();
}

/** React hook returning the full watch-progress map, refreshed on focus by the caller. */
export function useVideoProgress() {
  const [progress, setProgress] = useState<VideoProgressMap>(cache ?? {});

  const refresh = useCallback(() => {
    void ensureLoaded().then(setProgress);
  }, []);

  useEffect(() => {
    listeners.add(refresh);
    refresh();
    return () => {
      listeners.delete(refresh);
    };
  }, [refresh]);

  return { progress, refresh };
}

/**
 * Videos the person has partly watched, most recent first. Falls back to
 * `null` when there is nothing in progress so callers can show a sensible
 * "start here" default instead of an empty row.
 */
export function getInProgressVideoIds(progress: VideoProgressMap, limit = 6): string[] {
  return Object.entries(progress)
    .filter(([, entry]) => entry.percent > 0 && entry.percent < 100)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, limit)
    .map(([id]) => id);
}
