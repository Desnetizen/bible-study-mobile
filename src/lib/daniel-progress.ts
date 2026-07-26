import 'expo-sqlite/localStorage/install';

import { useEffect, useSyncExternalStore } from 'react';

import { getOrCreateDeviceId } from './device-id';
import { withRetry } from './retry-helper';
import { getProgress, upsertProgress } from '@/services/progressService';

const STORAGE_KEY = 'bible-connection:daniel-progress:v1';
const SYNC_STATUS_KEY = 'bible-connection:daniel-sync-status:v1';

type ProgressListener = () => void;

export type ChapterSyncStatus = 'synced' | 'pending' | 'failed';

let cachedCompletedChapters = readCachedProgress();
let cachedSyncStatus = readSyncStatus();
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

function readSyncStatus(): Record<number, ChapterSyncStatus> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(SYNC_STATUS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persistSyncStatus(status: Record<number, ChapterSyncStatus>) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  } catch {
    // Ignore.
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

export function getSyncStatusSnapshot(): Record<number, ChapterSyncStatus> {
  return cachedSyncStatus;
}

export function subscribeDanielProgress(listener: ProgressListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function refreshDanielProgress() {
  try {
    const deviceId = getOrCreateDeviceId();
    const row = await withRetry(
      () => getProgress(deviceId),
      (err) => err instanceof TypeError,
    );

    if (!row) {
      return cachedCompletedChapters;
    }

    const nextChapters = normalizeChapters(row.completed_chapters);
    setCachedProgress(nextChapters);

    cachedSyncStatus = {};
    for (const ch of nextChapters) {
      cachedSyncStatus[ch] = 'synced';
    }
    persistSyncStatus(cachedSyncStatus);

    return nextChapters;
  } catch {
    console.warn('Unexpected error while loading Daniel progress from Supabase.');
    return cachedCompletedChapters;
  }
}

export async function saveDanielProgress(chapters: number[]) {
  const nextChapters = normalizeChapters(chapters);

  for (const ch of nextChapters) {
    cachedSyncStatus[ch] = 'pending';
  }
  persistSyncStatus(cachedSyncStatus);

  setCachedProgress(nextChapters);

  try {
    const deviceId = getOrCreateDeviceId();
    await withRetry(
      () => upsertProgress(deviceId, nextChapters),
      (err) => err instanceof TypeError,
    );

    for (const ch of nextChapters) {
      cachedSyncStatus[ch] = 'synced';
    }
    persistSyncStatus(cachedSyncStatus);
    emitChange();
  } catch {
    for (const ch of nextChapters) {
      cachedSyncStatus[ch] = 'failed';
    }
    persistSyncStatus(cachedSyncStatus);
    emitChange();
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

export function useSyncStatus(): Record<number, ChapterSyncStatus> {
  return useSyncExternalStore(
    subscribeDanielProgress,
    getSyncStatusSnapshot,
    getSyncStatusSnapshot,
  );
}
