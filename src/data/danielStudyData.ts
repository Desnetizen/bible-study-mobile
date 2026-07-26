import type { ImageSourcePropType } from 'react-native';

import { danielChapter2Study } from '@/data/danielChapter2Study';
import { danielChapter3Study } from '@/data/danielChapter3Study';
import { danielChapter4Study } from '@/data/danielChapter4Study';
import { danielChapter5Study } from '@/data/danielChapter5Study';
import { danielChapter6Study } from '@/data/danielChapter6Study';
import { danielChapter7Study } from '@/data/danielChapter7Study';
import { danielChapter8Study } from '@/data/danielChapter8Study';
import { danielChapter9Study } from '@/data/danielChapter9Study';
import { danielChapter10Study } from '@/data/danielChapter10Study';
import { danielChapter11Study } from '@/data/danielChapter11Study';
import { danielChapter12Study } from '@/data/danielChapter12Study';
import { CHAPTERS_DATA, CHAPTER_IMAGES } from '@/data/danielStudyChapters';
import type {
  DanielChapterStudy,
  StudySection,
  ChapterTag,
  ChapterDiscovery,
} from '@/types/daniel-study';

export function resolveChapterImage(chapterNumber: number): ImageSourcePropType | null {
  return CHAPTER_IMAGES[chapterNumber as keyof typeof CHAPTER_IMAGES] ?? null;
}

function buildOverviewSection(
  description: string,
  quote: string,
  quoteRef: string,
): StudySection {
  return {
    id: 'overview',
    title: '1. Overview',
    content: description,
    quote,
    quoteCitation: quoteRef,
  };
}

function buildQuickFactsSection(tags: ChapterTag[]): StudySection {
  return {
    id: 'quick-facts',
    title: '2. Quick Facts',
    table: {
      columns: ['Category', 'Detail'],
      rows: tags.map((tag) => [tag.label, tag.value]),
    },
  };
}

function buildDiscoverySection(discoveries: ChapterDiscovery[]): StudySection {
  return {
    id: 'discoveries',
    title: '3. What You Will Discover',
    list: discoveries.map((d) => `${d.title}: ${d.description}`),
  };
}

function buildReflectionSection(discoveries: ChapterDiscovery[]): StudySection {
  const questions = discoveries.map(
    (d) => `Consider how "${d.title.toLowerCase()}" shapes your understanding of this chapter.`,
  );
  return {
    id: 'reflection',
    title: '4. Reflection / Discussion Questions',
    list: questions,
  };
}

function buildTextReadingSection(chapterNumber: number): StudySection {
  return {
    id: 'reading-the-text',
    title: '5. Reading the Text',
    content: `Read Daniel chapter ${chapterNumber} in your preferred Bible version. As you read, notice the themes highlighted in the overview and consider how the passage speaks to both its original audience and today.`,
  };
}

function buildChapterStudy(chapterNumber: number): DanielChapterStudy {
  const data = CHAPTERS_DATA.find((c) => c.num === chapterNumber);
  if (!data) {
    return fallbackStudy(chapterNumber);
  }

  const overview = data.overview;
  const imageSource = resolveChapterImage(chapterNumber);
  const difficulty =
    chapterNumber <= 5
      ? 'Narrative Study'
      : chapterNumber <= 7
        ? 'Visionary Study'
        : 'Prophetic Study';
  const sectionCount = 5;
  const estimatedReadTime = `${8 + sectionCount * 3}-${12 + sectionCount * 4} min`;

  const sections: StudySection[] = [
    buildOverviewSection(overview.description, overview.quote, overview.quoteRef),
    buildQuickFactsSection(overview.tags),
    buildDiscoverySection(overview.discoveries),
    buildReflectionSection(overview.discoveries),
    buildTextReadingSection(chapterNumber),
  ];

  const reflectionPrompts = overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber,
    title: data.title,
    subtitle: data.ref,
    heroImage: imageSource,
    overview: {
      description: overview.description,
      quote: overview.quote,
      quoteRef: overview.quoteRef,
    },
    tags: overview.tags,
    discoveries: overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [{ author: 'Holy Bible', role: 'Primary Text' }],
    terms: [],
    estimatedReadTime,
    difficulty,
  };
}

function fallbackStudy(chapterNumber: number): DanielChapterStudy {
  return {
    chapterNumber,
    title: `Daniel Chapter ${chapterNumber}`,
    subtitle: `Daniel ${chapterNumber}`,
    heroImage: resolveChapterImage(chapterNumber),
    overview: {
      description: `Study of Daniel chapter ${chapterNumber}.`,
      quote: '',
      quoteRef: `Daniel ${chapterNumber}:1`,
    },
    tags: [],
    discoveries: [],
    sections: [],
    reflectionPrompts: [],
    sources: [{ author: 'Holy Bible', role: 'Primary Text' }],
    terms: [],
    estimatedReadTime: '8-12 min',
    difficulty: 'Study',
  };
}

function buildChapter2Study(): DanielChapterStudy {
  const data = danielChapter2Study;
  const imageSource = resolveChapterImage(2);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionSection = data.sections.find(
    (s) => /reflection|discussion/i.test(s.title),
  );
  const reflectionPrompts = reflectionSection?.list?.slice(0, 5) ?? [];

  return {
    chapterNumber: 2,
    title: "The King's Dream",
    subtitle: "Nebuchadnezzar's Dream and the Stone Kingdom",
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: "There is a God in heaven who reveals secrets.",
      quoteRef: 'Daniel 2:28',
    },
    tags: CHAPTERS_DATA[1].overview.tags,
    discoveries: CHAPTERS_DATA[1].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'צֶלֶם', transliteration: 'tselem', gloss: 'Image, statue' },
      { term: 'מַלְכוּת', transliteration: 'malkuth', gloss: 'Kingdom, dominion' },
      { term: 'אֱלָהּ', transliteration: 'elah', gloss: 'God' },
      { term: 'חֲזוֹן', transliteration: 'chezev', gloss: 'Vision, sight' },
    ],
    estimatedReadTime: '45-55 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter3Study(): DanielChapterStudy {
  const data = danielChapter3Study;
  const imageSource = resolveChapterImage(3);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[2].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 3,
    title: 'The Golden Image and the Fiery Furnace',
    subtitle: 'Faith Tested and God Glorified',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'But if not, be it known unto thee, O king, that we will not serve thy gods, nor worship the golden image which thou hast set up.',
      quoteRef: 'Daniel 3:18',
    },
    tags: CHAPTERS_DATA[2].overview.tags,
    discoveries: CHAPTERS_DATA[2].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'עִלָּאָה', transliteration: 'illai', gloss: 'Most High (Aramaic, of God)' },
      { term: 'צָלֵם', transliteration: 'tzelem', gloss: 'Image, statue' },
    ],
    estimatedReadTime: '50-60 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter4Study(): DanielChapterStudy {
  const data = danielChapter4Study;
  const imageSource = resolveChapterImage(4);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[3].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 4,
    title: 'Nebuchadnezzar Humbled',
    subtitle: 'Pride Cast Down and Grace Exalted',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'Those who walk in pride He is able to put down.',
      quoteRef: 'Daniel 4:37',
    },
    tags: CHAPTERS_DATA[3].overview.tags,
    discoveries: CHAPTERS_DATA[3].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'עִיר', transliteration: 'iyr', gloss: 'Watcher, angelic vigilant' },
      { term: 'רַעְנָן', transliteration: 'ra\'anan', gloss: 'Flourishing, green (of a tree)' },
    ],
    estimatedReadTime: '55-65 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter5Study(): DanielChapterStudy {
  const data = danielChapter5Study;
  const imageSource = resolveChapterImage(5);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[4].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 5,
    title: 'The Writing on the Wall',
    subtitle: 'The Weighing of a Kingdom',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'You have been weighed in the balances and found wanting.',
      quoteRef: 'Daniel 5:27',
    },
    tags: CHAPTERS_DATA[4].overview.tags,
    discoveries: CHAPTERS_DATA[4].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'מְנֵא', transliteration: 'mene', gloss: 'Numbered, counted' },
      { term: 'תְּקֵל', transliteration: 'tekel', gloss: 'Weighed' },
      { term: 'פְּרֵס', transliteration: 'peres', gloss: 'Divided' },
    ],
    estimatedReadTime: '45-55 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter6Study(): DanielChapterStudy {
  const data = danielChapter6Study;
  const imageSource = resolveChapterImage(6);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[5].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 6,
    title: "Daniel in the Lions' Den",
    subtitle: 'Daniel 6: A Comprehensive Commentary',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: "My God sent his angel, and he shut the mouths of the lions.",
      quoteRef: 'Daniel 6:22',
    },
    tags: CHAPTERS_DATA[5].overview.tags,
    discoveries: CHAPTERS_DATA[5].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'regash (רְגַשׁ)', transliteration: 'regash', gloss: 'Tumultuous gathering, conspiracy' },
      { term: 'דָּרְיָוֶשׁ', transliteration: 'Daryavesh', gloss: 'Darius, possibly a throne-name or title' },
    ],
    estimatedReadTime: '45-55 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter7Study(): DanielChapterStudy {
  const data = danielChapter7Study;
  const imageSource = resolveChapterImage(7);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[6].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 7,
    title: 'The Four Beasts',
    subtitle: 'The Four Beasts, the Ancient of Days, and the Kingdom of the Saints',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'The judgment was set, and the books were opened.',
      quoteRef: 'Daniel 7:10',
    },
    tags: CHAPTERS_DATA[6].overview.tags,
    discoveries: CHAPTERS_DATA[6].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'The Great Controversy' },
    ],
    terms: [
      { term: 'bar \'enash (בַּר אֱנָשׁ)', transliteration: 'bar enash', gloss: 'Son of Man, messianic title' },
      { term: 'עַתִּיק יוֹמִין', transliteration: 'Attik Yomin', gloss: 'Ancient of Days' },
    ],
    estimatedReadTime: '55-65 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter8Study(): DanielChapterStudy {
  const data = danielChapter8Study;
  const imageSource = resolveChapterImage(8);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[7].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 8,
    title: 'The Ram and the Goat',
    subtitle: 'The Ram, the Goat, and the 2,300 Evenings and Mornings',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'Unto two thousand and three hundred evenings and mornings; then shall the sanctuary be cleansed.',
      quoteRef: 'Daniel 8:14',
    },
    tags: CHAPTERS_DATA[7].overview.tags,
    discoveries: CHAPTERS_DATA[7].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'חָזוֹן', transliteration: 'chazon', gloss: 'Vision, prophetic revelation' },
      { term: 'צָבָא', transliteration: 'tzava', gloss: 'Host, army (heavenly host)' },
    ],
    estimatedReadTime: '45-55 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter9Study(): DanielChapterStudy {
  const data = danielChapter9Study;
  const imageSource = resolveChapterImage(9);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[8].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 9,
    title: 'The Seventy Weeks',
    subtitle: 'The Seventy Sevens and the Coming of the Messiah',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'Seventy sevens are decreed for your people and your holy city.',
      quoteRef: 'Daniel 9:24',
    },
    tags: CHAPTERS_DATA[8].overview.tags,
    discoveries: CHAPTERS_DATA[8].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'שָׁבוּעִים', transliteration: 'shavu\'im', gloss: 'Weeks, sevens (of years)' },
      { term: 'חָמַד', transliteration: 'chamad', gloss: 'Greatly beloved, highly esteemed' },
    ],
    estimatedReadTime: '55-65 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter10Study(): DanielChapterStudy {
  const data = danielChapter10Study;
  const imageSource = resolveChapterImage(10);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[9].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 10,
    title: 'Heavenly Vision',
    subtitle: 'The Final Vision: Preparation and the Unseen Conflict',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'Fear not, Daniel: for from the first day... thy words were heard.',
      quoteRef: 'Daniel 10:12',
    },
    tags: CHAPTERS_DATA[9].overview.tags,
    discoveries: CHAPTERS_DATA[9].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'שַׂר', transliteration: 'sar', gloss: 'Prince, chief, ruler (human or angelic)' },
      { term: 'חָמַד', transliteration: 'chamad', gloss: 'Greatly beloved, highly esteemed' },
    ],
    estimatedReadTime: '55-65 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter11Study(): DanielChapterStudy {
  const data = danielChapter11Study;
  const imageSource = resolveChapterImage(11);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[10].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 11,
    title: 'The Kings of the North and South',
    subtitle: 'Prophecy as Pre-written History',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'The people who know their God will display strength and take action.',
      quoteRef: 'Daniel 11:32',
    },
    tags: CHAPTERS_DATA[10].overview.tags,
    discoveries: CHAPTERS_DATA[10].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
      { author: 'Ellen G. White', role: 'The Great Controversy' },
    ],
    terms: [
      { term: 'עֶרֶב-בֹּקֶר', transliteration: 'erev-boker', gloss: 'Evening-morning (day unit of 2,300)' },
      { term: 'צָבָא', transliteration: 'tzava', gloss: 'Army, host (heavenly or earthly)' },
    ],
    estimatedReadTime: '60-75 min',
    difficulty: 'Advanced Study',
  };
}

function buildChapter12Study(): DanielChapterStudy {
  const data = danielChapter12Study;
  const imageSource = resolveChapterImage(12);

  function mapSection(s: any): StudySection {
    const section: StudySection = {
      id: s.id,
      title: s.title,
      content: s.content,
      intro: s.intro,
      table: s.table,
      list: s.list,
      quote: s.quote,
      quoteCitation: s.quoteCitation,
      theme: s.theme,
      timelineTable: s.timelineTable,
    };
    if (Array.isArray(s.subsections)) {
      section.subsections = s.subsections.map((sub: any) => {
        const subSection: StudySection = {
          id: sub.id,
          title: sub.title,
          content: sub.content,
          intro: sub.intro,
          table: sub.table,
          list: sub.list,
          quote: sub.quote,
          quoteCitation: sub.quoteCitation,
          theme: sub.theme,
          timelineTable: sub.timelineTable,
        };
        if (Array.isArray(sub.subsections)) {
          subSection.subsections = sub.subsections.map((subsub: any): StudySection => ({
            id: subsub.id,
            title: subsub.title,
            content: subsub.content,
            table: subsub.table,
            list: subsub.list,
            quote: subsub.quote,
            quoteCitation: subsub.quoteCitation,
            theme: subsub.theme,
            timelineTable: subsub.timelineTable,
          }));
        }
        return subSection;
      });
    }
    return section;
  }

  const sections: StudySection[] = data.sections.map(mapSection);

  const reflectionPrompts = CHAPTERS_DATA[11].overview.discoveries.map(
    (d: ChapterDiscovery) => `Reflect on: ${d.title} — ${d.description}`,
  );

  return {
    chapterNumber: 12,
    title: 'Time of the End',
    subtitle: 'Resurrection, Judgment, and Final Inheritance',
    heroImage: imageSource,
    overview: {
      description: data.description,
      quote: 'Those who are wise shall shine like the brightness of the firmament.',
      quoteRef: 'Daniel 12:3',
    },
    tags: CHAPTERS_DATA[11].overview.tags,
    discoveries: CHAPTERS_DATA[11].overview.discoveries,
    sections,
    reflectionPrompts,
    sources: [
      { author: 'Rev. John Schultz', role: 'Daniel Commentary' },
      { author: 'C. Mervyn Maxwell', role: 'God Cares, Vol. 1' },
      { author: 'Uriah Smith', role: 'Daniel and Revelation' },
      { author: 'Ellen G. White', role: 'Prophets and Kings' },
    ],
    terms: [
      { term: 'מַשְׂכִּילִים', transliteration: 'maskilim', gloss: 'Wise, those with spiritual discernment' },
      { term: 'עָמַד', transliteration: 'amad', gloss: 'To stand, arise, take a stand' },
    ],
    estimatedReadTime: '55-65 min',
    difficulty: 'Advanced Study',
  };
}

const studyCache = new Map<number, DanielChapterStudy>();

export function getDanielChapterStudy(chapterNumber: number): DanielChapterStudy {
  if (chapterNumber < 1 || chapterNumber > 12) {
    return fallbackStudy(1);
  }

  const cached = studyCache.get(chapterNumber);
  if (cached) return cached;

  const study =
    chapterNumber === 2
      ? buildChapter2Study()
      : chapterNumber === 3
        ? buildChapter3Study()
        : chapterNumber === 4
          ? buildChapter4Study()
          : chapterNumber === 5
            ? buildChapter5Study()
            : chapterNumber === 6
              ? buildChapter6Study()
              : chapterNumber === 7
                ? buildChapter7Study()
                : chapterNumber === 8
                  ? buildChapter8Study()
                  : chapterNumber === 9
                    ? buildChapter9Study()
                    : chapterNumber === 10
                      ? buildChapter10Study()
                      : chapterNumber === 11
                        ? buildChapter11Study()
                        : chapterNumber === 12
                          ? buildChapter12Study()
                        : buildChapterStudy(chapterNumber);

  studyCache.set(chapterNumber, study);
  return study;
}
