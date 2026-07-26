const test = require('node:test');
const assert = require('node:assert/strict');

const chapter1Guide = require('../src/data/daniel-chapter-1-study-guide');
const chapter3Guide = require('../src/data/daniel-chapter-3-study-guide');
const { adaptChapterStudyGuide } = require('../src/data/chapterStudyAdapter');

test('adapts the chapter 1 topic guide into modal sections and glossary terms', () => {
  const study = adaptChapterStudyGuide(1, chapter1Guide);

  assert.equal(study.id, 'daniel-1');
  assert.equal(study.title, 'Daniel Chapter 1');
  assert.ok(study.sections.some((section) => section.id === 'historical-context'));
  assert.ok(study.sections.some((section) => section.id === 'reflection-questions'));
  assert.deepEqual(study.terms[0], {
    term: 'Akkadian',
    gloss: 'The national language of Babylon during Daniel\'s time.',
  });
});

test('adapts the chapter 3 verse and analysis guide into a readable modal outline', () => {
  const study = adaptChapterStudyGuide(3, chapter3Guide);
  const analysis = study.sections.find((section) => section.id === 'verse-by-verse-analysis');

  assert.equal(study.id, 'daniel-3');
  assert.equal(study.title, 'Daniel Chapter 3');
  assert.ok(study.sections.some((section) => section.id === 'chapter-text'));
  assert.equal(analysis.subsections.length, 5);
  assert.equal(analysis.subsections[0].id, 'analysis-a-the-image-nebuchadnezzars-false-hope-daniel-3-1-7');
});
