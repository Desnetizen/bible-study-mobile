const { getDanielChapterStudy } = require('./src/data/danielStudyData');

for (let i = 1; i <= 12; i++) {
  try {
    const study = getDanielChapterStudy(i);
    console.log(`Chapter ${i}: SUCCESS - ${study.title}, ${study.sections ? study.sections.length : 0} sections`);
  } catch (err) {
    console.error(`Chapter ${i}: ERROR`, err);
  }
}
