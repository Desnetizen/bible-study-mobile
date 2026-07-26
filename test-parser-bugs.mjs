import { readFileSync } from 'fs';

const src = readFileSync('src/lib/parseBibleReference.ts', 'utf8');
const connSrc = readFileSync('src/constants/bible-connection.ts', 'utf8');

const namesMatch = connSrc.match(/name:\s*'([^']+)'/g);
const bookNames = namesMatch ? namesMatch.map(m => m.replace(/name:\s*'([^']+)'/, '$1')) : [];

const aliasesMatch = src.match(/BOOK_ALIASES[^=]*=\s*(\{[\s\S]*?\});/);

console.log('=== parseBibleReference Bug Check ===\n');
console.log(`Books in BIBLE_BOOKS: ${bookNames.length}`);
console.log(`BOOK_ALIASES: ${aliasesMatch ? aliasesMatch[1].trim() : 'MISSING'}`);

const hasPsalmAlias = aliasesMatch && aliasesMatch[1].includes('Psalm');
console.log(`Psalm alias present: ${hasPsalmAlias}`);

const allBookNames = [...new Set([...bookNames, ...(hasPsalmAlias ? ['Psalm'] : [])])];
const sorted = allBookNames.sort((a, b) => b.length - a.length);
const escaped = sorted.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const regexStr = `\\b(${escaped.join('|')})\\s+(\\d+)(?::(\\d+)(?:[-\u2013](\\d+))?)?\\b`;
const testRegex = new RegExp(regexStr, 'gi');

const edgeCases = [
  'Genesis 1:1',
  '1 Samuel 16:7',
  'Song of Solomon 2:3',
  '2 Timothy 2:15',
  'Jude 1:4',
  'Revelation 22:20-21',
  'Psalm 23:1',
  'Psalm 119:105',
  'Psalms 119:11',
  '2 Chronicles 7:14',
  'Obadiah 1:5',
  'Philemon 1:4',
  'See Genesis 1:1 for creation',
  'John 3:16 and Romans 8:28',
  'No references here',
  '(Psalm 78:38)',
];

console.log('\n--- Regex edge case tests ---');
edgeCases.forEach(tc => {
  testRegex.lastIndex = 0;
  const m = testRegex.exec(tc);
  console.log(`"${tc}": ${m ? `✓ book="${m[1]}" ch=${m[2]} v=${m[3]||'-'}` : '✗ NO MATCH'}`);
});

// Check VerseLink for press feedback
const verseLinkSrc = readFileSync('src/components/VerseLink.tsx', 'utf8');
console.log('\n--- VerseLink ---');
console.log(`Has opacity feedback: ${verseLinkSrc.includes('opacity')}`);
console.log(`Has scale feedback: ${verseLinkSrc.includes('scale')}`);

// Check LinkedText
const linkedTextSrc = readFileSync('src/components/LinkedText.tsx', 'utf8');
console.log('\n--- LinkedText ---');
console.log(`Null guard for segments: ${linkedTextSrc.includes('if (!segments)')}`);
console.log(`Uses /bible path: ${linkedTextSrc.includes("pathname: '/bible'")}`);

// Check Array<T> → T[] compliance
console.log(`\n--- Style compliance ---`);
console.log(`Array<T> style (bad): ${linkedTextSrc.includes('Array<')}`);
console.log(`T[] style (good): ${linkedTextSrc.includes('}[] = []')}`);

// Check getDefinedVerseText
console.log('\n--- getDefinedVerseText ---');
console.log(`Function exported: ${src.includes('export function getDefinedVerseText')}`);
console.log(`Contains containment check: ${src.includes('isRequestContainedInDefined')}`);
console.log(`BIBLE_VERSES imported: ${src.includes("BIBLE_VERSES")}`);
console.log(`DAILY_DANIEL_VERSES imported: ${src.includes("DAILY_DANIEL_VERSES")}`);
console.log(`Has cache: ${src.includes('verseTextCache')}`);

// Check LinkedText uses getDefinedVerseText
console.log('\n--- LinkedText inline verse ---');
console.log(`Imports getDefinedVerseText: ${linkedTextSrc.includes('getDefinedVerseText')}`);
console.log(`Has RefSegment component: ${linkedTextSrc.includes('function RefSegment')}`);
console.log(`Has expanded state: ${linkedTextSrc.includes('setExpanded')}`);
console.log(`Has italic verse text style: ${linkedTextSrc.includes("fontStyle: 'italic'")}`);
console.log(`Has disclosure indicator: ${linkedTextSrc.includes('▸')}`);

console.log('\n=== Done ===');
