import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { getOrCreateDeviceId } from './device-id';
import { supabase } from './supabase';

const STORAGE_KEY = 'bible-connection:user-activity:v1';
const TABLE_NAME = 'user_activity';
const MAX_LOCAL_ITEMS = 100;

// ─── Types ──────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'chapter_completed'
  | 'note_saved'
  | 'bookmark_added'
  | 'verse_highlighted'
  | 'character_explored'
  | 'chapter_opened'
  | 'timeline_event_read';

export type ActivityItem = {
  id?: number;
  activity_type: ActivityType;
  label: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

// ─── In-memory store (useSyncExternalStore pattern) ─────────────────────────

type Listener = () => void;

let cachedActivities: ActivityItem[] = [];
const listeners = new Set<Listener>();
let storageLoaded = false;

function emitChange() {
  listeners.forEach((fn) => fn());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cachedActivities;
}

// ─── Persistence helpers ────────────────────────────────────────────────────

async function loadFromStorage(): Promise<ActivityItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveToStorage(items: ActivityItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_LOCAL_ITEMS)));
  } catch {
    // Silently ignore storage quota / availability issues.
  }
}

// ─── Time formatting ────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;

  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// ─── Core API ───────────────────────────────────────────────────────────────

/**
 * Log a user activity. Persists locally and syncs to Supabase.
 */
export async function trackActivity(
  activityType: ActivityType,
  label: string,
  metadata?: Record<string, unknown>,
) {
  const now = new Date().toISOString();
  const item: ActivityItem = {
    activity_type: activityType,
    label,
    metadata: metadata ?? {},
    created_at: now,
  };

  // Update in-memory cache immediately
  cachedActivities = [item, ...cachedActivities].slice(0, MAX_LOCAL_ITEMS);
  emitChange();

  // Persist to local storage
  await saveToStorage(cachedActivities);

  // Fire-and-forget Supabase insert
  if (supabase) {
    try {
      const deviceId = getOrCreateDeviceId();
      const { error } = await supabase.from(TABLE_NAME).insert({
        device_id: deviceId,
        activity_type: activityType,
        label,
        metadata: metadata ?? {},
        created_at: now,
      });

      if (error) {
        console.warn('Failed to log activity to Supabase:', error.message);
      }
    } catch (err: any) {
      console.warn('Unexpected error logging activity:', err?.message ?? err);
    }
  }
}

/**
 * Refresh activities from Supabase, merging with local cache.
 */
export async function refreshActivities(limit = MAX_LOCAL_ITEMS) {
  // Load from local storage first if we haven't yet
  if (!storageLoaded) {
    const stored = await loadFromStorage();
    if (stored.length > 0 && cachedActivities.length === 0) {
      cachedActivities = stored;
      emitChange();
    }
    storageLoaded = true;
  }

  if (!supabase) {
    return cachedActivities;
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id, activity_type, label, metadata, created_at')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Failed to load activities from Supabase:', error.message);
      return cachedActivities;
    }

    if (Array.isArray(data) && data.length > 0) {
      // Merge: Supabase is the source of truth for past activities.
      // Any local-only items (without id) that are newer than the latest
      // Supabase record are kept on top.
      const supabaseIds = new Set(data.map((r: any) => r.id));
      const latestSupabaseTime = data[0]?.created_at ?? '';

      const localOnlyNewer = cachedActivities.filter(
        (item) =>
          !item.id && item.created_at > latestSupabaseTime,
      );

      const merged: ActivityItem[] = [
        ...localOnlyNewer,
        ...data.map((row: any) => ({
          id: row.id,
          activity_type: row.activity_type as ActivityType,
          label: row.label ?? '',
          metadata: row.metadata ?? {},
          created_at: row.created_at ?? new Date().toISOString(),
        })),
      ].slice(0, MAX_LOCAL_ITEMS);

      cachedActivities = merged;
      emitChange();
      await saveToStorage(cachedActivities);
    }
  } catch {
    console.warn('Unexpected error refreshing activities from Supabase.');
  }

  return cachedActivities;
}

/**
 * Get the cached activities (synchronous).
 */
export function getRecentActivities(limit?: number) {
  if (limit !== undefined) {
    return cachedActivities.slice(0, limit);
  }
  return cachedActivities;
}

/**
 * Format an activity item for display, adding a relative time string.
 */
export function formatActivityTime(item: ActivityItem): string {
  return formatRelativeTime(item.created_at);
}

// ─── React Hook ─────────────────────────────────────────────────────────────

/**
 * React hook that returns recent activities with auto-refresh.
 * Uses useSyncExternalStore for tear-free reads.
 */
export function useRecentActivity(limit?: number) {
  const activities = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void refreshActivities();
  }, []);

  if (limit !== undefined) {
    return activities.slice(0, limit);
  }

  return activities;
}
