import 'expo-sqlite/localStorage/install';

import { useEffect, useSyncExternalStore } from 'react';

import { getOrCreateDeviceId } from './device-id';
import { supabase } from './supabase';

const STORAGE_KEY = 'bible-connection:daniel-progress:v1';
const PROGRESS_TABLE = 'daniel_progress';

type ProgressListener = () => void;

type ProgressRow = {
  device_id?: string;
  completed_chapters?: unknown;
  updated_at?: string;
};

let cachedCompletedChapters = readCachedProgress();
const listeners = new Set<ProgressListener>();

function normalizeChapters(chapters: unknown) {
  if (!Array.isArray(chapters)) {
    return [];
  }

  const uniqueChapters = new Set<number>();

  for (const chapter of chapters) {
    const value = Number(chapter);

    if (Number.isFinite(value) && value >= 1 && value <= 12) {
      uniqueChapters.add(value);
    }
  }

  return Array.from(uniqueChapters).sort((a, b) => a - b);
}

function readCachedProgress() {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return normalizeChapters(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persistCachedProgress(chapters: number[]) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
  } catch {
    // Ignore storage quota / availability issues and keep the in-memory copy.
  }
}


function emitChange() {
  listeners.forEach((listener) => listener());
}

function setCachedProgress(nextChapters: number[]) {
  cachedCompletedChapters = normalizeChapters(nextChapters);
  persistCachedProgress(cachedCompletedChapters);
  emitChange();
}

export function getDanielProgressSnapshot() {
  return cachedCompletedChapters;
}

export function subscribeDanielProgress(listener: ProgressListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function refreshDanielProgress() {
  if (!supabase) {
    return cachedCompletedChapters;
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select('device_id, completed_chapters, updated_at')
      .eq('device_id', deviceId)
      .limit(1);

    if (error) {
      console.warn('Failed to load Daniel progress from Supabase:', error.message);
      return cachedCompletedChapters;
    }

    const row = Array.isArray(data) ? (data[0] as ProgressRow | undefined) : undefined;

    if (!row) {
      return cachedCompletedChapters;
    }

    const nextChapters = normalizeChapters(row.completed_chapters);
    setCachedProgress(nextChapters);
    return nextChapters;
  } catch {
    console.warn('Unexpected error while loading Daniel progress from Supabase.');
    return cachedCompletedChapters;
  }
}

export async function saveDanielProgress(chapters: number[]) {
  const nextChapters = normalizeChapters(chapters);
  setCachedProgress(nextChapters);

  if (!supabase) {
    return nextChapters;
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const { error } = await supabase.from(PROGRESS_TABLE).upsert(
      {
        device_id: deviceId,
        completed_chapters: nextChapters,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'device_id',
      }
    );

    if (error) {
      console.warn('Failed to save Daniel progress to Supabase:', error.message);
    }
  } catch (err: any) {
    console.warn('Unexpected error while saving Daniel progress to Supabase:', err.message || err.toString());
  }

  return nextChapters;
}

export function useDanielProgress() {
  const completedChapters = useSyncExternalStore(
    subscribeDanielProgress,
    getDanielProgressSnapshot,
    getDanielProgressSnapshot
  );

  useEffect(() => {
    void refreshDanielProgress();
  }, []);

  return completedChapters;
}
