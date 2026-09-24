import { useEffect, useRef, useState } from 'react';
import { getDefinedVerseText } from '@/lib/parseBibleReference';

export interface VerseReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

export interface VerseTextState {
  text: string | null;
  verses: { verse: number; text: string }[] | null;
  translationId: string | null;
  translationLabel: string | null;
  loading: boolean;
  error: string | null;
}

const IDLE_STATE: VerseTextState = {
  text: null,
  verses: null,
  translationId: null,
  translationLabel: null,
  loading: false,
  error: null,
};

const VERSE_API_ROOT = 'https://bible-api.com';
const DEFAULT_TRANSLATION = 'kjv';

function buildReferenceQuery({ book, chapter, verse, endVerse }: VerseReference): string {
  let ref = `${book} ${chapter}`;
  if (verse) {
    ref += `:${verse}`;
    if (endVerse && endVerse !== verse) ref += `-${endVerse}`;
  }
  return ref.replace(/\s+/g, '+');
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function useVerseText(reference: VerseReference | null): VerseTextState {
  const refKey = reference
    ? `${reference.book}:${reference.chapter}:${reference.verse ?? ''}-${reference.endVerse ?? ''}`
    : null;

  const definedText = reference
    ? getDefinedVerseText(
        reference.book,
        reference.chapter,
        reference.verse,
        reference.endVerse,
      )
    : null;

  const [asyncState, setAsyncState] = useState<{
    key: string | null;
    state: VerseTextState;
  }>({
    key: null,
    state: IDLE_STATE,
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!reference || definedText != null) {
      return;
    }

    const currentKey = refKey;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    const url = `${VERSE_API_ROOT}/${buildReferenceQuery(reference)}?translation=${DEFAULT_TRANSLATION}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (requestIdRef.current !== requestId) return;
        const text = typeof data?.text === 'string' ? normalizeText(data.text) : null;
        if (!text) {
          setAsyncState({
            key: currentKey,
            state: {
              text: null,
              verses: null,
              translationId: null,
              translationLabel: null,
              loading: false,
              error: 'Verse not found.',
            },
          });
          return;
        }
        const verses = Array.isArray(data?.verses)
          ? data.verses
              .filter((v: unknown): v is { verse: number; text: string } =>
                typeof v === 'object' && v !== null && typeof (v as any).text === 'string' && typeof (v as any).verse === 'number',
              )
              .map((v: { verse: number; text: string }) => ({ verse: v.verse, text: normalizeText(v.text) }))
          : null;
        setAsyncState({
          key: currentKey,
          state: {
            text,
            verses,
            translationId: typeof data?.translation_id === 'string' ? data.translation_id : null,
            translationLabel: typeof data?.translation_name === 'string' ? data.translation_name : null,
            loading: false,
            error: null,
          },
        });
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId || err?.name === 'AbortError') return;
        setAsyncState({
          key: currentKey,
          state: {
            text: null,
            verses: null,
            translationId: null,
            translationLabel: null,
            loading: false,
            error: 'Could not load this verse.',
          },
        });
      });

    return () => controller.abort();
  }, [refKey, reference, definedText]);

  if (!reference) {
    return IDLE_STATE;
  }

  if (definedText != null) {
    return {
      text: normalizeText(definedText),
      verses: null,
      translationId: null,
      translationLabel: null,
      loading: false,
      error: null,
    };
  }

  if (asyncState.key !== refKey) {
    return {
      text: null,
      verses: null,
      translationId: null,
      translationLabel: null,
      loading: true,
      error: null,
    };
  }

  return asyncState.state;
}