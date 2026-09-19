export const VIDEO_BUCKET = 'video-files';

export const VIDEO_FILES: Record<string, string | undefined> = {
  bookOfDaniel: 'The_Book_of_Daniel.mp4',
  decodingDaniel8: 'Decoding_Daniel_8.mp4',
  dreamsOfNebuchadnezzar: 'Dreamss_of_Nebuchadnezzar.mp4',
  finalVision: 'The_Final_Vision.mp4',
  kingsOfDaniel: 'Kings_of_Daniel (1).mp4',
  hiddenPsychology: 'The_Hidden_Psychology_of_the_Book_of_Daniel.mp4',
  chapter3: 'Chapter_3_video.mp4',
  chapter5: 'Daniel_5.mp4',
  chapter9: 'Detective_Story_of_Daniel_9.mp4',
  chapter10: 'The_Unseen_War__Daniel_10.mp4',
  prophecy2300Days: '2300 day prophecy.mp4',
  stoneWithoutHands: 'God_s_eternal_kingdom__cutout_without_man_s_hands.mp4',
  medoPersia: 'How_Medo-Persia_Shaped_Biblical_History(short).mp4',
  israelFall: "Isreal's fall(short).mp4",
  trappedByLaw: 'Trapped_by_the_Law_of_the_Medes(short).mp4',
  themesOfDaniel: 'Themes of Daniel.mp4',
  decodingDaniel: 'Decoding_Daniel.mp4',
};

/**
 * The video bucket is private, so public URLs are not available. Use
 * `supabase.storage.from(VIDEO_BUCKET).createSignedUrl(filename, expiresIn)`
 * to get playback URLs.
 */
export function getVideoFilename(key: string): string | undefined {
  return VIDEO_FILES[key];
}