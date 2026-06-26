import 'expo-sqlite/localStorage/install';

import { useEffect, useSyncExternalStore } from 'react';

import { getOrCreateDeviceId } from './device-id';
import { getProgress, upsertProgress } from '@/services/progressService';

const STORAGE_KEY = 'bible-connection:daniel-progress:v1';

type ProgressListener = () => void;

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
  try {
    const deviceId = getOrCreateDeviceId();
    const row = await getProgress(deviceId);

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

  try {
    const deviceId = getOrCreateDeviceId();
    await upsertProgress(deviceId, nextChapters);
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
