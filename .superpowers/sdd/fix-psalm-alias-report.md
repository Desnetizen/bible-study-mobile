# fix-psalm-alias-report

**Status:** Done  
**Commit:** 9afbf45  
**Verification:** npx tsc --noEmit — clean  

## Tests (inline JS repro)
- `parseBibleReference("Psalm 119:105")` ? `{ book: "Psalms", chapter: 119, verse: 105 }` ?
- `parseBibleReference("Psalm 119:11")` ? `{ book: "Psalms", chapter: 119, verse: 11 }` ?
- `parseBibleReference("Psalms 23:1")` ? `{ book: "Psalms", chapter: 23, verse: 1 }` ? (canonical still works)
- `findBibleReferences("See Psalm 78:38 for reference")` ? single match, book `"Psalms"`, ref `"Psalm 78:38"` ?
- Only 1 match returned (no double-count) ?

## Changes
- Added `BOOK_ALIASES` map (`Psalm` ? `Psalms`)
- Built `ALL_BOOK_NAMES` including aliases for regex matching
- Updated `SINGLE_REF_REGEX` and `INLINE_REF_REGEX` to use `ALL_BOOK_NAMES`
- Updated `normalizeBookName` to resolve aliases before canonical lookup
- Updated `findBibleReferences` to use `normalizeBookName` instead of inline lookup
