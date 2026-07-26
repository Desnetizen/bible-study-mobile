import { supabase } from '@/lib/supabase';

const PROGRESS_TABLE = 'daniel_progress';

export type ProgressRow = {
  device_id: string;
  completed_chapters: number[];
  updated_at: string;
  user_id?: string;
};

export async function getProgress(deviceId: string): Promise<ProgressRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select('device_id, completed_chapters, updated_at')
    .eq('device_id', deviceId)
    .limit(1);

  if (error) throw new Error(`[progressService.getProgress] ${error.message}`);

  const row = Array.isArray(data) ? (data[0] as ProgressRow | undefined) : undefined;
  return row ?? null;
}

export async function upsertProgress(
  deviceId: string,
  completedChapters: number[],
): Promise<void> {
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .upsert(
      {
        device_id: deviceId,
        user_id: userId,
        completed_chapters: completedChapters,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' },
    );

  if (error) throw new Error(`[progressService.upsertProgress] ${error.message}`);
}
