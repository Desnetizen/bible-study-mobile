import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import DanielStudyPage from '@/components/DanielStudyPage';
import { useDanielProgress } from '@/lib/daniel-progress';

function getFocusChapter(completedChapters, requestedChapter) {
  if (Number.isFinite(requestedChapter) && requestedChapter >= 1 && requestedChapter <= 12) {
    return requestedChapter;
  }

  for (let chapter = 1; chapter <= 12; chapter += 1) {
    if (!completedChapters.includes(chapter)) {
      return chapter;
    }
  }

  return 12;
}

export default function DanielStudyTab() {
  const colorScheme = useColorScheme();
  const completedChapters = useDanielProgress();
  const { chapter: chapterParam, topic: topicParam } = useLocalSearchParams();

  const requestedChapter = Number(Array.isArray(chapterParam) ? chapterParam[0] : chapterParam);
  const selectedTopic = Array.isArray(topicParam) ? topicParam[0] : topicParam;
  const initialChapter = useMemo(
    () => getFocusChapter(completedChapters, requestedChapter),
    [completedChapters, requestedChapter]
  );

  const handleNavigate = (page, chapterNum) => {
    if (page === 'StudyChapter') {
      router.push({
        pathname: '/daniel-study/[chapter]',
        params: { chapter: String(chapterNum ?? initialChapter) },
      });
      return;
    }

    if (page === 'Bible') {
      router.push({
        pathname: '/bible',
        params: {
          book: 'Daniel',
          chapter: String(chapterNum ?? initialChapter),
        },
      });
      return;
    }

    if (page === 'Timeline') {
      router.push({
        pathname: '/daniel-study',
        params: { chapter: String(chapterNum ?? initialChapter) },
      });
    }
  };

  return (
    <DanielStudyPage
      embedded
      darkMode={colorScheme === 'dark'}
      initialChapter={initialChapter}
      completedChapters={completedChapters}
      selectedTopic={selectedTopic}
      onNavigate={handleNavigate}
      openChapterOnPress
    />
  );
}
