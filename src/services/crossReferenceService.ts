import { supabase } from '@/lib/supabase';

const CROSS_REFERENCE_TABLE = 'cross_references';

export interface CrossReferenceRow {
  id?: number;
  daniel_chapter?: number;
  daniel_verse?: number;
  target_book?: string;
  target_chapter?: number;
  target_verse_start?: number;
  target_verse_end?: number | null;
  note?: string | null;
  [key: string]: unknown;
}

export async function getCrossReferences(
  chapter: number,
  verse: number,
): Promise<CrossReferenceRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(CROSS_REFERENCE_TABLE)
    .select('*')
    .eq('daniel_chapter', chapter)
    .eq('daniel_verse', verse);

  if (error) throw new Error(`[crossReferenceService.getCrossReferences] ${error.message}`);

  return (Array.isArray(data) ? data : []) as CrossReferenceRow[];
}
