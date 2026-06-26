import type { ContextData } from '@/types/context';

/**
 * A flat heading entry representing a section or subsection heading
 * in the document order they appear in the era content.
 */
export interface HeadingEntry {
  /** Unique identifier (section or subsection id) */
  id: string;
  /** Display label (just the heading text without numbering) */
  label: string;
  /** Full label with prefix/numbering (e.g., "I. Definitions" or "2.1 Fall of Assyria") */
  fullLabel: string;
  /** Depth level: 0 = top-level section, 1 = subsection */
  depth: number;
}

/**
 * Extract all heading entries from a contextData object.
 *
 * Behavior across the five eras:
 * - All eras have `sections[]` with `title` fields
 * - Some sections contain `subsections[]` with nested `title` fields
 * - Roman numeral prefixes (I., II., III.) appear in babylonContext and preExileContext
 * - Decimal prefixes (2.1, 2.2) appear in subsection titles within preExileContext
 * - medoPersianContext, romanContext, greekContext do not use Roman numeral prefixes
 * - babylonContext and preExileContext have an `abstract` section (id:'abstract')
 *
 * This function collects both section-level and subsection-level headings
 * in their natural document order.
 */
export function extractHeadings(contextData: ContextData): HeadingEntry[] {
  const headings: HeadingEntry[] = [];

  for (const section of contextData.sections) {
    // Section-level heading
    if (section.title) {
      headings.push({
        id: section.id,
        label: section.title,
        fullLabel: section.title,
        depth: 0,
      });
    }

    // Subsection-level headings (if present)
    if (section.subsections && section.subsections.length > 0) {
      for (const sub of section.subsections) {
        if (sub.title) {
          headings.push({
            id: sub.id,
            label: sub.title,
            fullLabel: sub.title,
            depth: 1,
          });
        }
      }
    }
  }

  return headings;
}

/**
 * Count total heading entries. Useful for sparse-content guard.
 */
export function countHeadings(contextData: ContextData): number {
  return extractHeadings(contextData).length;
}
