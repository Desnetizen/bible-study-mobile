import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import ChapterStudyContent from '@/components/ChapterStudyContent';
import { getDanielChapterStudy } from '@/data/danielStudyData';

function getChapterParam(value) {
  const chapter = Number(Array.isArray(value) ? value[0] : value);

  if (Number.isFinite(chapter) && chapter >= 1 && chapter <= 12) {
    return chapter;
  }

  return 1;
}

export default function DanielStudyChapterScreen() {
  const { chapter: chapterParam } = useLocalSearchParams();
  const chapter = useMemo(() => getChapterParam(chapterParam), [chapterParam]);
  const chapterStudy = useMemo(() => getDanielChapterStudy(chapter), [chapter]);

  return (
    <>
      <Stack.Screen options={{ title: chapterStudy.title }} />
      <ChapterStudyContent chapter={chapterStudy} />
    </>
  );
}
