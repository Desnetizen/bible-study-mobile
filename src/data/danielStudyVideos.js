import { CHAPTER_IMAGES } from './danielStudyChapters';

// Category taxonomy for the Study Videos library. Every video belongs to
// exactly one of these, and the library screen filters/groups by this list.
export const VIDEO_CATEGORIES = [
  {
    id: 'chapters',
    label: 'Chapter Studies',
    shortLabel: 'Chapters',
    icon: 'BookOpen',
    color: '#2f8cff',
    description: 'Walk through Daniel chapter by chapter.',
  },
  {
    id: 'prophecies',
    label: 'Prophecies',
    shortLabel: 'Prophecies',
    icon: 'Crown',
    color: '#f1a23a',
    description: 'The four beasts, the little horn, the seventy weeks, and more.',
  },
  {
    id: 'characters',
    label: 'Characters',
    shortLabel: 'Characters',
    icon: 'User',
    color: '#a855f7',
    description: 'Daniel, Nebuchadnezzar, Belshazzar, Cyrus, and Darius.',
  },
  {
    id: 'historical-context',
    label: 'Historical Context',
    shortLabel: 'History',
    icon: 'Landmark',
    color: '#C9A84C',
    description: 'Babylon, Medo-Persia, Jerusalem, and the exile.',
  },
  {
    id: 'symbols',
    label: 'Symbols',
    shortLabel: 'Symbols',
    icon: 'Compass',
    color: '#10b981',
    description: 'The imagery behind Daniel\u2019s visions, explained.',
  },
  {
    id: 'review',
    label: 'Review',
    shortLabel: 'Review',
    icon: 'RotateCcw',
    color: '#38bdf8',
    description: 'Short recaps summarizing what you have studied.',
  },
  {
    id: 'study-tips',
    label: 'Study Tips',
    shortLabel: 'Tips',
    icon: 'Lightbulb',
    color: '#f97316',
    description: 'How to approach Daniel and prepare for Bible Connection.',
  },
];

export function getCategoryMeta(categoryId) {
  return VIDEO_CATEGORIES.find((c) => c.id === categoryId) ?? VIDEO_CATEGORIES[0];
}

// Local, reusable art. Category videos that aren't tied to a single chapter
// borrow from the existing character/place/aesthetic art so every card has a
// real thumbnail instead of a broken image.
const ART = {
  danielVisions: require('../../assets/Aesthetics/Daniel-Visions.png'),
  bible: require('../../assets/Aesthetics/Bible.jpg'),
  daniel: require('../../assets/Characters/Daniel.jpeg'),
  nebuchadnezzar: require('../../assets/Characters/Nebuchadnezzar II.png'),
  belshazzar: require('../../assets/Characters/Belshazzar.png'),
  cyrus: require('../../assets/Characters/Cyrus the Great.png'),
  darius: require('../../assets/Characters/Darius the Mede.png'),
  babylon: require('../../assets/Places/Babylon.png'),
  jerusalem: require('../../assets/Places/Ancient Jerusalem.jpg'),
  persepolis: require('../../assets/Places/Persepolis.png'),
  hangingGardens: require('../../assets/Places/hanging-gardens.png'),
  medoPersianMap: require('../../assets/Maps/medo-persian.jpg'),
  babylonMap: require('../../assets/Maps/neo-babylon-empire.png'),
};

/**
 * Every video's `source` describes where the player screen should pull
 * playback from once real footage is attached:
 *   { type: 'youtube', videoId: '...' }  -> embedded YouTube player
 *   { type: 'hosted', uri: 'https://...' } -> expo-video, for self-hosted mp4/HLS
 *   { bucketFile: 'name.mp4' } -> expo-video, streamed from the Supabase
 *     `video-files` bucket via a freshly-signed URL each time it plays
 *   null -> not attached yet; the player screen shows a "coming soon" state
 * so the library is safe to ship before every video is recorded.
 */
export const STUDY_VIDEOS = [
  // ── Chapter Studies ────────────────────────────────────────────────
  { id: 'ch-1', category: 'chapters', chapter: 1, title: 'Daniel 1: Royal Training', subtitle: 'Why the food test mattered more than the menu', duration: '11:40', thumbnail: CHAPTER_IMAGES[1], source: { bucketFile: 'Decoding_Daniel.mp4' } },
  { id: 'ch-2', category: 'chapters', chapter: 2, title: 'Daniel 2: The King\u2019s Dream', subtitle: 'Reading the statue of empires', duration: '12:45', thumbnail: CHAPTER_IMAGES[2], source: null },
  { id: 'ch-3', category: 'chapters', chapter: 3, title: 'Daniel 3: The Fiery Furnace', subtitle: 'Worship without a guaranteed outcome', duration: '14:22', thumbnail: CHAPTER_IMAGES[3], source: { bucketFile: 'Chapter_3_video.mp4' } },
  { id: 'ch-4', category: 'chapters', chapter: 4, title: 'Daniel 4: Nebuchadnezzar Humbled', subtitle: 'The tree vision and a king brought low', duration: '13:05', thumbnail: CHAPTER_IMAGES[4], source: null },
  { id: 'ch-5', category: 'chapters', chapter: 5, title: 'Daniel 5: The Writing on the Wall', subtitle: 'MENE, MENE, TEKEL, UPHARSIN', duration: '14:22', thumbnail: CHAPTER_IMAGES[5], source: { bucketFile: 'Daniel_5.mp4' } },
  { id: 'ch-6', category: 'chapters', chapter: 6, title: 'Daniel 6: Faithfulness in the Den', subtitle: 'Prayer that outlasts a royal decree', duration: '15:20', thumbnail: CHAPTER_IMAGES[6], source: null },
  { id: 'ch-7', category: 'chapters', chapter: 7, title: 'Daniel 7 Explained', subtitle: 'Understanding the Four Beasts', duration: '24:18', thumbnail: CHAPTER_IMAGES[7], source: null, featured: true },
  { id: 'ch-8', category: 'chapters', chapter: 8, title: 'Daniel 8: The Ram and the Goat', subtitle: 'A vision that narrows the focus', duration: '17:10', thumbnail: CHAPTER_IMAGES[8], source: { bucketFile: 'Decoding_Daniel_8.mp4' } },
  { id: 'ch-9', category: 'chapters', chapter: 9, title: 'Daniel 9: Seventy Weeks', subtitle: 'Confession, prayer, and a prophetic timeline', duration: '19:50', thumbnail: CHAPTER_IMAGES[9], source: { bucketFile: 'Detective_Story_of_Daniel_9.mp4' } },
  { id: 'ch-10', category: 'chapters', chapter: 10, title: 'Daniel 10: Heavenly Vision', subtitle: 'What was happening while Daniel prayed', duration: '13:35', thumbnail: CHAPTER_IMAGES[10], source: { bucketFile: 'The_Unseen_War__Daniel_10.mp4' } },
  { id: 'ch-11', category: 'chapters', chapter: 11, title: 'Daniel 11 Overview', subtitle: 'Kings of the North and South', duration: '16:40', thumbnail: null, source: { bucketFile: 'Kings_of_Daniel (1).mp4' } },
  { id: 'ch-12', category: 'chapters', chapter: 12, title: 'Daniel 12: Time of the End', subtitle: 'Deliverance, resurrection, and wisdom', duration: '15:05', thumbnail: CHAPTER_IMAGES[12], source: { bucketFile: 'The_Final_Vision.mp4' } },

  // ── Prophecies ─────────────────────────────────────────────────────
  { id: 'pr-four-beasts', category: 'prophecies', chapter: 7, title: 'The Four Beasts of Daniel 7', subtitle: 'What each beast represents, and why', duration: '18:12', thumbnail: ART.danielVisions, source: null },
  { id: 'pr-little-horn', category: 'prophecies', chapter: 7, title: 'The Little Horn Explained', subtitle: 'Tracing a small power with a large claim', duration: '16:04', thumbnail: ART.danielVisions, source: null },
  { id: 'pr-seventy-weeks', category: 'prophecies', chapter: 9, title: 'The Seventy Weeks Prophecy', subtitle: 'From decree to Messiah, week by week', duration: '21:38', thumbnail: CHAPTER_IMAGES[9], source: null },
  { id: 'pr-statue-to-beasts', category: 'prophecies', chapter: 2, title: 'From Head of Gold to Four Beasts', subtitle: 'How Daniel 2 and Daniel 7 describe the same kingdoms', duration: '17:55', thumbnail: CHAPTER_IMAGES[2], source: null },
  { id: 'pr-abomination', category: 'prophecies', chapter: 8, title: 'The Ram, the Goat, and the 2300 Days', subtitle: 'Reading Daniel 8 in its own terms', duration: '19:02', thumbnail: CHAPTER_IMAGES[8], source: { bucketFile: '2300 day prophecy.mp4' } },

  // ── Characters ─────────────────────────────────────────────────────
  { id: 'ch-daniel', category: 'characters', chapter: 1, title: 'Daniel: A Life of Integrity', subtitle: 'From exile to the lions\u2019 den', duration: '15:47', thumbnail: ART.daniel, source: { bucketFile: 'The_Hidden_Psychology_of_the_Book_of_Daniel.mp4' } },
  { id: 'ch-nebuchadnezzar', category: 'characters', chapter: 4, title: 'Nebuchadnezzar: From Pride to Praise', subtitle: 'The empire builder God humbled', duration: '14:30', thumbnail: ART.nebuchadnezzar, source: { bucketFile: 'Dreamss_of_Nebuchadnezzar.mp4' } },
  { id: 'ch-belshazzar', category: 'characters', chapter: 5, title: 'Belshazzar: The Feast That Ended an Empire', subtitle: 'A king who ignored what he already knew', duration: '12:58', thumbnail: ART.belshazzar, source: null },
  { id: 'ch-cyrus', category: 'characters', chapter: 10, title: 'Cyrus the Great and Bible Prophecy', subtitle: 'Named by Isaiah more than a century in advance', duration: '13:26', thumbnail: ART.cyrus, source: null },
  { id: 'ch-darius', category: 'characters', chapter: 6, title: 'Darius the Mede', subtitle: 'The king caught between his decree and his friend', duration: '11:15', thumbnail: ART.darius, source: { bucketFile: 'Trapped_by_the_Law_of_the_Medes(short).mp4' } },

  // ── Historical Context ─────────────────────────────────────────────
  { id: 'hc-babylon', category: 'historical-context', chapter: 1, title: 'Babylon: City of Gold', subtitle: 'Life inside the empire that took Daniel captive', duration: '16:33', thumbnail: ART.babylon, source: null },
  { id: 'hc-hanging-gardens', category: 'historical-context', chapter: 4, title: 'The Splendor Nebuchadnezzar Built', subtitle: 'Babylon\u2019s architecture and the pride behind it', duration: '13:48', thumbnail: ART.hangingGardens, source: null },
  { id: 'hc-medo-persia', category: 'historical-context', chapter: 6, title: 'The Rise of Medo-Persia', subtitle: 'How the empire that conquered Babylon worked', duration: '15:12', thumbnail: ART.medoPersianMap, source: { bucketFile: 'How_Medo-Persia_Shaped_Biblical_History(short).mp4' } },
  { id: 'hc-jerusalem-exile', category: 'historical-context', chapter: 1, title: 'Jerusalem and the Exile', subtitle: 'What Daniel and his companions left behind', duration: '14:05', thumbnail: ART.jerusalem, source: { bucketFile: "Isreal's fall(short).mp4" } },
  { id: 'hc-persepolis', category: 'historical-context', chapter: 6, title: 'Persepolis: Heart of the Persian Empire', subtitle: 'The capital city behind Medo-Persian rule', duration: '12:16', thumbnail: ART.persepolis, source: null },
  { id: 'hc-babylon-empire', category: 'historical-context', chapter: 4, title: 'Babylon\u2019s Empire at Its Height', subtitle: 'The reach of Nebuchadnezzar\u2019s kingdom on the map', duration: '13:52', thumbnail: ART.babylonMap, source: null },

  // ── Symbols ────────────────────────────────────────────────────────
  { id: 'sy-statue', category: 'symbols', chapter: 2, title: 'The Statue of Empires', subtitle: 'Gold, silver, bronze, iron, and clay', duration: '12:20', thumbnail: CHAPTER_IMAGES[2], source: null },
  { id: 'sy-beasts', category: 'symbols', chapter: 7, title: 'Reading Beasts as Symbols', subtitle: 'Why Scripture uses animals to describe kingdoms', duration: '13:10', thumbnail: ART.danielVisions, source: null },
  { id: 'sy-stone', category: 'symbols', chapter: 2, title: 'The Stone Cut Without Hands', subtitle: 'A kingdom that doesn\u2019t rely on human strength', duration: '10:44', thumbnail: CHAPTER_IMAGES[2], source: { bucketFile: 'God_s_eternal_kingdom__cutout_without_man_s_hands.mp4' } },
  { id: 'sy-numbers', category: 'symbols', chapter: 9, title: 'Numbers and Time in Daniel', subtitle: 'Making sense of days, weeks, and times', duration: '14:58', thumbnail: ART.bible, source: null },

  // ── Review ─────────────────────────────────────────────────────────
  { id: 'rv-1-6', category: 'review', title: 'Daniel 1\u20136 in Ten Minutes', subtitle: 'The narrative chapters, recapped', duration: '10:02', thumbnail: CHAPTER_IMAGES[3], source: null },
  { id: 'rv-7-12', category: 'review', title: 'Daniel 7\u201312 in Ten Minutes', subtitle: 'The prophetic chapters, recapped', duration: '10:47', thumbnail: CHAPTER_IMAGES[9], source: { bucketFile: 'Themes of Daniel.mp4' } },
  { id: 'rv-whole-book', category: 'review', title: 'The Whole Book of Daniel, Reviewed', subtitle: 'One story, two halves, and a common thread', duration: '18:30', thumbnail: ART.danielVisions, source: { bucketFile: 'The_Book_of_Daniel.mp4' } },

  // ── Study Tips ─────────────────────────────────────────────────────
  { id: 'tp-read-prophecy', category: 'study-tips', title: 'How to Read Prophecy Responsibly', subtitle: 'Letting Scripture interpret Scripture', duration: '11:52', thumbnail: ART.bible, source: null },
  { id: 'tp-prepare', category: 'study-tips', title: 'Preparing for Bible Connection', subtitle: 'Getting the most out of group study', duration: '9:38', thumbnail: ART.jerusalem, source: null },
  { id: 'tp-habit', category: 'study-tips', title: 'Building a Daniel Study Habit', subtitle: 'A simple weekly rhythm that sticks', duration: '8:54', thumbnail: ART.bible, source: null },
];

export function getVideoById(id) {
  return STUDY_VIDEOS.find((v) => v.id === id) ?? null;
}

export function getVideosByCategory(categoryId) {
  return STUDY_VIDEOS.filter((v) => v.category === categoryId);
}

export function getFeaturedVideo() {
  return STUDY_VIDEOS.find((v) => v.featured) ?? STUDY_VIDEOS[0];
}

export function getRelatedVideos(video, limit = 6) {
  if (!video) return [];
  return STUDY_VIDEOS.filter((v) => v.id !== video.id && v.category === video.category).slice(0, limit);
}
