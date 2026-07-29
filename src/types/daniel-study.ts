import type { ImageSourcePropType } from 'react-native';

export interface ChapterTag {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  value: string;
}

export interface ChapterDiscovery {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  links?: { label: string; chapter: number }[];
}

export interface ChapterTable {
  columns: string[];
  rows: string[][];
}

export interface StudySection {
  id: string;
  title: string;
  content?: string;
  intro?: string;
  table?: ChapterTable;
  list?: string[];
  subsections?: StudySection[];
  quote?: string;
  quoteCitation?: string;
  theme?: string;
  timelineTable?: ChapterTable;
  keyFocus?: string;
  verses?: string;
  purpose?: string;
}

export interface SourceItem {
  author: string;
  role: string;
}

export interface TermItem {
  term: string;
  transliteration?: string;
  gloss: string;
}

export interface DanielChapterStudy {
  chapterNumber: number;
  title: string;
  subtitle: string;
  heroImage: ImageSourcePropType | null;
  overview: {
    description: string;
    quote: string;
    quoteRef: string;
  };
  tags: ChapterTag[];
  discoveries: ChapterDiscovery[];
  sections: StudySection[];
  reflectionPrompts: string[];
  sources: SourceItem[];
  terms: TermItem[];
  estimatedReadTime: string;
  difficulty: string;
}
