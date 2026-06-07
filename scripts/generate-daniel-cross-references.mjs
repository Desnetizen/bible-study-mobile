import fs from 'node:fs/promises';
import path from 'node:path';

const csvPath = path.join(process.cwd(), '..', 'Downloads', 'daniel_all_cross_references_expanded.csv');
const outPath = path.join(process.cwd(), 'Data', 'danielCrossReferences.ts');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [headerLine, ...dataLines] = lines;
  const headers = parseCsvLine(headerLine);

  return dataLines.map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

function makeId(row) {
  return `daniel-${row.daniel_chapter}-${row.daniel_verse}-${row.target_book}-${row.target_chapter}-${row.target_verse_start}-${row.target_verse_end}`
    .replace(/\s+/g, '-')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '-');
}

const csvText = await fs.readFile(csvPath, 'utf8');
const rows = parseCsv(csvText).map((row) => ({
  id: makeId(row),
  daniel_chapter: Number(row.daniel_chapter),
  daniel_verse: Number(row.daniel_verse),
  target_book: row.target_book,
  target_chapter: Number(row.target_chapter),
  target_verse_start: Number(row.target_verse_start),
  target_verse_end: row.target_verse_end === '' ? null : Number(row.target_verse_end),
  note: row.note,
}));

const file = `export type DanielCrossReference = {
  id: string;
  daniel_chapter: number;
  daniel_verse: number;
  target_book: string;
  target_chapter: number;
  target_verse_start: number;
  target_verse_end: number | null;
  note: string;
};

export const DANIEL_CROSS_REFERENCES: DanielCrossReference[] = ${JSON.stringify(rows, null, 2)};

export function getFallbackCrossReferences(chapter: number, verse: number) {
  const danielChapter = Number(chapter);
  const danielVerse = Number(verse);

  if (!Number.isFinite(danielChapter) || !Number.isFinite(danielVerse)) {
    return [];
  }

  return DANIEL_CROSS_REFERENCES.filter(
    (reference) => reference.daniel_chapter === danielChapter && reference.daniel_verse === danielVerse
  );
}
`;

await fs.writeFile(outPath, file, 'utf8');
console.log(`Wrote ${outPath} with ${rows.length} cross references.`);
