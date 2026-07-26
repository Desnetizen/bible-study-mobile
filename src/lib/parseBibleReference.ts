import { BIBLE_BOOKS, DAILY_DANIEL_VERSES } from '@/constants/bible-connection';
import { BIBLE_VERSES } from '@/constants/bible-verse';

export interface ParsedReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
}

export interface ReferenceMatch extends ParsedReference {
  ref: string;
  index: number;
  length: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const BOOK_ALIASES: Record<string, string> = {
  Psalm: 'Psalms',
  'Deut.': 'Deuteronomy',
  Deut: 'Deuteronomy',
};

const ALL_BOOK_NAMES = (() => {
  const names = BIBLE_BOOKS.map((b) => b.name);
  for (const alias of Object.keys(BOOK_ALIASES)) {
    if (!names.includes(alias)) {
      names.push(alias);
    }
  }
  return names.sort((a, b) => b.length - a.length).map(escapeRegex).join('|');
})();

const VERSE_RANGE_SEP = '[-\\u2013\\u2014]';

const SINGLE_REF_REGEX = new RegExp(
  `^(${ALL_BOOK_NAMES})\\s+(\\d+)(?::(\\d+)(?:${VERSE_RANGE_SEP}(\\d+))?)?$`,
  'i'
);

const INLINE_REF_REGEX = new RegExp(
  `\\b(${ALL_BOOK_NAMES})\\s+(\\d+)(?::(\\d+)(?:${VERSE_RANGE_SEP}(\\d+))?)?\\b`,
  'gi'
);

function normalizeBookName(book: string): string {
  const lower = book.toLowerCase();
  const aliasMatch = Object.entries(BOOK_ALIASES).find(
    ([alias]) => alias.toLowerCase() === lower
  );
  if (aliasMatch) return aliasMatch[1];
  const matched = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === lower
  );
  return matched ? matched.name : book;
}

export function parseBibleReference(text: string): ParsedReference | null {
  const trimmed = text.trim();
  const match = trimmed.match(SINGLE_REF_REGEX);
  if (!match) return null;

  const [, book, chapterStr, verseStr, endVerseStr] = match;
  return {
    book: normalizeBookName(book),
    chapter: Number(chapterStr),
    ...(verseStr ? { verse: Number(verseStr) } : {}),
    ...(endVerseStr ? { endVerse: Number(endVerseStr) } : {}),
  };
}

export function findBibleReferences(text: string): ReferenceMatch[] {
  const results: ReferenceMatch[] = [];
  let match: RegExpExecArray | null;

  INLINE_REF_REGEX.lastIndex = 0;

  while ((match = INLINE_REF_REGEX.exec(text)) !== null) {
    const [, book, chapterStr, verseStr, endVerseStr] = match;

    const canonical = normalizeBookName(book);
    const canonicalEntry = BIBLE_BOOKS.find(
      (b) => b.name === canonical
    );
    if (!canonicalEntry) continue;

    const ref = match[0];
    results.push({
      ref,
      book: canonical,
      chapter: Number(chapterStr),
      index: match.index,
      length: ref.length,
      ...(verseStr ? { verse: Number(verseStr) } : {}),
      ...(endVerseStr ? { endVerse: Number(endVerseStr) } : {}),
    });
  }

  return results;
}

export function isRequestContainedInDefined(
  definedVerse?: number,
  definedEndVerse?: number,
  requestVerse?: number,
  requestEndVerse?: number
): boolean {
  const ds = definedVerse ?? 0;
  const de = definedEndVerse ?? definedVerse ?? Infinity;
  const rs = requestVerse ?? 0;
  const re = requestEndVerse ?? requestVerse ?? rs;
  return rs >= ds && re <= de;
}

const verseTextCache = new Map<string, string | null>();

function buildVerseTextKey(
  book: string,
  chapter: number,
  verse?: number,
  endVerse?: number
): string {
  return `${book}|${chapter}|${verse ?? ''}|${endVerse ?? ''}`;
}

export function getDefinedVerseText(
  book: string,
  chapter: number,
  verse?: number,
  endVerse?: number
): string | null {
  const key = buildVerseTextKey(book, chapter, verse, endVerse);
  const cached = verseTextCache.get(key);
  if (cached !== undefined) return cached;

  for (const entry of BIBLE_VERSES) {
    const parsed = parseBibleReference(entry.reference);
    if (!parsed) continue;
    if (
      parsed.book === book &&
      parsed.chapter === chapter &&
      isRequestContainedInDefined(parsed.verse, parsed.endVerse, verse, endVerse)
    ) {
      verseTextCache.set(key, entry.text);
      return entry.text;
    }
  }

  for (const entry of DAILY_DANIEL_VERSES) {
    if (
      entry.book === book &&
      entry.chapter === chapter &&
      isRequestContainedInDefined(entry.verse, undefined, verse, endVerse)
    ) {
      verseTextCache.set(key, entry.text);
      return entry.text;
    }
  }

  verseTextCache.set(key, null);
  return null;
}
