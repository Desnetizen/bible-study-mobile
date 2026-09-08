export const VIDEO_BUCKET = 'video-files';

export const VIDEO_FILES: Record<string, string | undefined> = {
  bookOfDaniel: 'The_Book_of_Daniel.mp4',
  decodingDaniel8: 'Decoding_Daniel_8.mp4',
  dreamsOfNebuchadnezzar: 'Dreamss_of_Nebuchadnezzar.mp4',
  finalVision: 'The_Final_Vision.mp4',
  kingsOfDaniel: 'Kings_of_Daniel (1).mp4',
  hiddenPsychology: 'The_Hidden_Psychology_of_the_Book_of_Daniel.mp4',
};

/**
 * The video bucket is private, so public URLs are not available. Use
 * `supabase.storage.from(VIDEO_BUCKET).createSignedUrl(filename, expiresIn)`
 * to get playback URLs.
 */
export function getVideoFilename(key: string): string | undefined {
  return VIDEO_FILES[key];
}