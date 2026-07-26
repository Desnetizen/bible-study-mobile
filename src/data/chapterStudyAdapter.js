function toId(value) {
  return value
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getTitle(chapterNumber, title) {
  const match = title?.match(/Daniel Chapter \d+/i);
  return match?.[0] ?? `Daniel Chapter ${chapterNumber}`;
}

function toSourceItems(sources) {
  return (sources ?? []).map((source) =>
    typeof source === 'string'
      ? { author: source, role: 'Study source' }
      : { author: source.author, role: source.role ?? 'Study source' }
  );
}

function joinLines(lines) {
  return lines.filter(Boolean).join('\n\n');
}

function adaptChapterOne(chapterNumber, guide) {
  const historical = guide.historicalContext;

  return {
    id: `daniel-${chapterNumber}`,
    title: getTitle(chapterNumber, guide.title),
    subtitle: 'Faithfulness in Babylon',
    description: guide.description,
    sources: toSourceItems(guide.sources),
    terms: guide.glossary.map((entry) => ({ term: entry.term, gloss: entry.definition })),
    sections: [
      {
        id: 'historical-context',
        title: `1. ${historical.title}`,
        content: historical.intro,
        list: historical.keyElements.map((entry) => `${entry.name}: ${entry.detail}`),
        table: {
          columns: ['Event', 'Date', 'Note'],
          rows: historical.datingEvents.map((entry) => [entry.event, entry.date, entry.note ?? '']),
        },
      },
      {
        id: 'verse-by-verse-insights',
        title: '2. Verse-by-Verse Insights',
        subsections: guide.verseByVerseInsights.map((entry) => ({
          id: `insight-${toId(entry.section)}`,
          title: entry.section,
          content: joinLines([entry.historicalCulturalInsights, entry.theologicalInterpretiveDetail]),
        })),
      },
      {
        id: 'theological-themes',
        title: '3. Theological Themes',
        list: guide.theologicalThemes.map((entry) => `${entry.theme}: ${entry.description}`),
      },
      {
        id: 'character-study',
        title: `4. ${guide.characterStudy.title}`,
        content: `Figures: ${guide.characterStudy.figures.join(', ')}`,
        list: guide.characterStudy.points.map((entry) => `${entry.heading}: ${entry.detail}`),
      },
      {
        id: 'cross-references',
        title: '5. Cross-References',
        list: guide.crossReferences.map((entry) => `${entry.reference}: ${entry.connection}`),
      },
      {
        id: 'practical-application',
        title: '6. Practical Application',
        list: guide.practicalApplication.map((entry) => `${entry.title}: ${entry.detail}`),
      },
      {
        id: 'reflection-questions',
        title: '7. Reflection Questions',
        list: guide.quiz.map((entry) => entry.question),
      },
    ],
  };
}

function adaptChapterThree(chapterNumber, guide) {
  const context = guide.introductionAndHistoricalContext;
  const theologicalMessage = guide.centralTheologicalMessage;

  return {
    id: `daniel-${chapterNumber}`,
    title: getTitle(chapterNumber, guide.title),
    subtitle: guide.subtitle,
    description: theologicalMessage.summary,
    sections: [
      {
        id: 'historical-context',
        title: '1. Introduction and Historical Context',
        content: joinLines([
          `Date: ${context.historicalSetting.date}`,
          `Location: ${context.historicalSetting.location}`,
        ]),
        list: [...context.historicalSetting.backgroundEvents, ...context.politicalContext.babylonianEmpire],
      },
      {
        id: 'chapter-text',
        title: `2. Read the Chapter (${guide.chapterText.reference})`,
        subsections: guide.chapterText.sections.map((entry) => ({
          id: `text-${toId(entry.heading)}`,
          title: entry.heading,
          content: entry.verses.map((verse) => `${verse.v}. ${verse.text}`).join('\n'),
        })),
      },
      {
        id: 'verse-by-verse-analysis',
        title: '3. Detailed Verse-by-Verse Analysis',
        subsections: guide.detailedVerseByVerseAnalysis.map((entry) => ({
          id: `analysis-${toId(entry.title)}`,
          title: entry.title,
          subsections: entry.subsections.map((subsection) => ({
            id: `analysis-${toId(entry.title)}-${toId(subsection.heading)}`,
            title: subsection.heading,
            content: subsection.points.join('\n\n'),
          })),
        })),
      },
      {
        id: 'central-theological-message',
        title: '4. Central Theological Message',
        content: theologicalMessage.summary,
        table: {
          columns: ['Symbol', 'Meaning'],
          rows: theologicalMessage.symbolism.map((entry) => [entry.symbol, entry.meaning]),
        },
        list: [theologicalMessage.conclusion],
      },
    ],
  };
}

function adaptChapterStudyGuide(chapterNumber, guide) {
  if (chapterNumber === 1) return adaptChapterOne(chapterNumber, guide);
  if (chapterNumber === 3) return adaptChapterThree(chapterNumber, guide);

  throw new Error(`No study-guide adapter is available for Daniel ${chapterNumber}.`);
}

module.exports = { adaptChapterStudyGuide };
