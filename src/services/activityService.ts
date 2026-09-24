import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';

export type ActivityType =
  | 'chapter_completed'
  | 'note_saved'
  | 'bookmark_added'
  | 'verse_highlighted'
  | 'character_explored'
  | 'chapter_opened'
  | 'timeline_event_read';

export interface ActivityMetadata {
  book?:      string;
  chapter?:   number;
  verse?:     number;
  character?: string;
  [key: string]: unknown;
}

export interface Activity {
  id:            number;
  client_id:     string;
  activity_type: ActivityType;
  label:         string;
  metadata:      ActivityMetadata;
  created_at:    string;
}

export async function logActivity(
  type:     ActivityType,
  label:    string,
  metadata: ActivityMetadata = {},
  client_id: string,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('recent_activity')
    .upsert(
      {
        client_id,
        device_id: getOrCreateDeviceId(),
        activity_type: type,
        label,
        metadata,
      },
      { onConflict: 'client_id' },
    );

  if (error) throw new Error(`[activityService.logActivity] ${error.message}`);
}

export async function getActivityFeed(limit = 50): Promise<Activity[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('recent_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`[activityService.getActivityFeed] ${error.message}`);
  return (data ?? []) as Activity[];
}

export async function getActivitiesByType(type: ActivityType): Promise<Activity[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('recent_activity')
    .select('*')
    .eq('activity_type', type)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`[activityService.getActivitiesByType] ${error.message}`);
  return (data ?? []) as Activity[];
}
