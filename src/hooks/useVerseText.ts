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
  const [state, setState] = useState<VerseTextState>(IDLE_STATE);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!reference) {
      setState(IDLE_STATE);
      return;
    }

    const defined = getDefinedVerseText(
      reference.book,
      reference.chapter,
      reference.verse,
      reference.endVerse,
    );

    if (defined != null) {
      setState({
        text: normalizeText(defined),
        verses: null,
        translationId: null,
        translationLabel: null,
        loading: false,
        error: null,
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    setState({ text: null, verses: null, translationId: null, translationLabel: null, loading: true, error: null });

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
          setState({
            text: null,
            verses: null,
            translationId: null,
            translationLabel: null,
            loading: false,
            error: 'Verse not found.',
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
        setState({
          text,
          verses,
          translationId: typeof data?.translation_id === 'string' ? data.translation_id : null,
          translationLabel: typeof data?.translation_name === 'string' ? data.translation_name : null,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId || err?.name === 'AbortError') return;
        setState({
          text: null,
          verses: null,
          translationId: null,
          translationLabel: null,
          loading: false,
          error: 'Could not load this verse.',
        });
      });

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference?.book, reference?.chapter, reference?.verse, reference?.endVerse]);

  return state;
}