import { Image } from 'expo-image';

const STARTUP_IMAGE_SOURCES = [
  require('../../assets/bible-connection/splash-bg.png'),
  require('../../assets/bible-connection/logo.png'),
  require('../../assets/Places/Babylon.png'),
  require('../../assets/Places/Ancient Jerusalem.jpg'),
  require('../../assets/Places/Egypt (2).png'),
  require('../../assets/Places/Sinai.jpg'),
  require('../../assets/Places/Rome.jpg'),
  require('../../assets/Places/Shushan(Susa).jpg'),
  require('../../assets/Places/Ur of the Chaldeans.png'),
  require('../../assets/Places/ziggurat in Babylon.png'),
  require('../../assets/Places/Athens.jpg'),
  require('../../assets/Places/Ancient ninevah.png'),
  require('../../assets/Places/Ancient Susa.png'),
  require('../../assets/Places/Canaanite Lands.jpg'),
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

/**
 * Preloads all startup images, reporting real progress as each one settles
 * (loaded or failed) so callers can drive an honest progress indicator
 * instead of a timed fake.
 */
export async function preloadStartupImages(onProgress?: (progress: number) => void) {
  const uniqueSources = Array.from(new Set(STARTUP_IMAGE_SOURCES));
  const total = uniqueSources.length;
  let settledCount = 0;

  onProgress?.(0);

  await withTimeout(
    Promise.all(
      uniqueSources.map((source) =>
        Image.loadAsync(source)
          .catch(() => null)
          .finally(() => {
            settledCount += 1;
            onProgress?.(settledCount / total);
          })
      )
    ),
    12000
  );

  // Timeout path: any stragglers never got to report, so make sure the
  // bar still reaches completion rather than stalling below 100%.
  onProgress?.(1);
}
