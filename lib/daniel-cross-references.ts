import { supabase } from './supabase';
import { getFallbackCrossReferences } from '../Data/danielCrossReferences';

export type DanielCrossReference = {
  id: string;
  daniel_chapter: number;
  daniel_verse: number;
  target_book: string;
  target_chapter: number;
  target_verse_start: number;
  target_verse_end: number | null;
  note: string | null;
};

type CrossReferenceRow = Record<string, unknown>;

const CROSS_REFERENCE_TABLE = 'daniel_cross_references_expanded';
const cache = new Map<string, DanielCrossReference[]>();

function toFiniteNumber(value: unknown) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
}

function toText(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
}

function pickNumber(row: CrossReferenceRow, keys: string[]) {
  for (const key of keys) {
    const nextValue = toFiniteNumber(row[key]);
    if (nextValue !== null) {
      return nextValue;
    }
  }

  return null;
}

function pickText(row: CrossReferenceRow, keys: string[]) {
  for (const key of keys) {
    const nextValue = toText(row[key]);
    if (nextValue) {
      return nextValue;
    }
  }

  return '';
}

function normalizeCrossReference(row: CrossReferenceRow): DanielCrossReference | null {
  const danielChapter = pickNumber(row, ['daniel_chapter', 'chapter', 'source_chapter']);
  const danielVerse = pickNumber(row, ['daniel_verse', 'verse', 'source_verse']);
  const targetBook = pickText(row, ['target_book', 'book', 'targetBook']);
  const targetChapter = pickNumber(row, ['target_chapter', 'chapter', 'targetChapter']);
  const targetVerseStart = pickNumber(row, ['target_verse_start', 'verse_start', 'targetVerseStart']);

  if (
    danielChapter === null ||
    danielVerse === null ||
    !targetBook ||
    targetChapter === null ||
    targetVerseStart === null
  ) {
    return null;
  }

  const targetVerseEnd = pickNumber(row, ['target_verse_end', 'verse_end', 'targetVerseEnd']);
  const id = pickText(row, ['id', 'reference_id', 'referenceId']) || `${danielChapter}:${danielVerse}:${targetBook}:${targetChapter}:${targetVerseStart}`;
  const note = pickText(row, ['note', 'comment', 'description']) || null;

  return {
    id,
    daniel_chapter: danielChapter,
    daniel_verse: danielVerse,
    target_book: targetBook,
    target_chapter: targetChapter,
    target_verse_start: targetVerseStart,
    target_verse_end: targetVerseEnd,
    note,
  };
}

function sortCrossReferences(references: DanielCrossReference[]) {
  return [...references].sort((left, right) => {
    const bookCompare = left.target_book.localeCompare(right.target_book);
    if (bookCompare !== 0) {
      return bookCompare;
    }

    if (left.target_chapter !== right.target_chapter) {
      return left.target_chapter - right.target_chapter;
    }

    if (left.target_verse_start !== right.target_verse_start) {
      return left.target_verse_start - right.target_verse_start;
    }

    return (left.target_verse_end ?? left.target_verse_start) - (right.target_verse_end ?? right.target_verse_start);
  });
}

export async function loadDanielCrossReferences(chapter: number, verse: number) {
  const cacheKey = `${chapter}:${verse}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const fallbackCrossReferences = sortCrossReferences(
    getFallbackCrossReferences(chapter, verse)
      .map((row) => normalizeCrossReference(row))
      .filter((row): row is DanielCrossReference => Boolean(row))
  );

  if (!supabase) {
    cache.set(cacheKey, fallbackCrossReferences);
    return fallbackCrossReferences;
  }

  try {
    const { data, error } = await supabase
      .from(CROSS_REFERENCE_TABLE)
      .select('*')
      .eq('daniel_chapter', chapter)
      .eq('daniel_verse', verse);

    if (error) {
      console.warn('Failed to load Daniel cross references from Supabase:', error.message);
      cache.set(cacheKey, fallbackCrossReferences);
      return fallbackCrossReferences;
    }

    const remoteCrossReferences = sortCrossReferences(
      (Array.isArray(data) ? data : [])
        .map((row) => normalizeCrossReference(row as CrossReferenceRow))
        .filter((row): row is DanielCrossReference => Boolean(row))
    );

    const nextCrossReferences = remoteCrossReferences.length ? remoteCrossReferences : fallbackCrossReferences;
    cache.set(cacheKey, nextCrossReferences);
    return nextCrossReferences;
  } catch {
    cache.set(cacheKey, fallbackCrossReferences);
    return fallbackCrossReferences;
  }
}
