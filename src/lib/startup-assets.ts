import { Image } from 'expo-image';

const STARTUP_IMAGE_SOURCES = [
  require('../../assets/bible-connection/splash-bg.png'),
  require('../../assets/bible-connection/logo.png'),
  require('../../assets/Places/Babylon.png'),
  require('../../assets/Aesthetics/Bible.jpg'),
  require('../../assets/Chapters/daniel-chapter-1.png'),
  require('../../assets/Chapters/daniel-chapter-2.png'),
  require('../../assets/Chapters/daniel-chapter-3.png'),
  require('../../assets/Chapters/daniel-chapter-4.png'),
  require('../../assets/Chapters/daniel-chapter-5.png'),
  require('../../assets/Chapters/daniel-chapter-6.png'),
  require('../../assets/Chapters/daniel-chapter-7.png'),
  require('../../assets/Chapters/daniel-chapter-8.png'),
  require('../../assets/Chapters/daniel-chapter-9.png'),
  require('../../assets/Chapters/daniel-chapter-10.png'),
  require('../../assets/Chapters/daniel-chapter-12.png'),
  require('../../assets/Icons/crown.png'),
  require('../../assets/Icons/Building.png'),
  require('../../assets/Icons/Connection.png'),
  require('../../assets/Icons/Timeline.png'),
  require('../../assets/Icons/Patterns.png'),
  require('../../assets/Icons/Notes.png'),
];

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(undefined as T), timeoutMs);
    }),
  ]);
}

export async function preloadStartupImages() {
  const uniqueSources = Array.from(new Set(STARTUP_IMAGE_SOURCES));

  await withTimeout(
    Promise.all(
      uniqueSources.map((source) =>
        Image.loadAsync(source).catch(() => null)
      )
    ),
    12000
  );
}
