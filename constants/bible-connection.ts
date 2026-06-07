export type BibleBook = {
  name: string;
  chapters: number;
};

export type DanielChapter = {
  chapter: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
};

export type DailyVerse = {
  text: string;
  ref: string;
  book: string;
  chapter: number;
  verse: number;
};

export type QuickAction = {
  title: string;
  subtitle: string;
  href: string;
  accent: string;
  icon: 'book.closed.fill' | 'crown.fill' | 'clock.fill' | 'gearshape.fill' | 'person.2.fill';
};

export const STUDY_USER = {
  username: 'Desvorn',
  progress: 42,
  completedChapters: 5,
  notesTaken: 18,
  bookmarks: 23,
  charactersExplored: 14,
};

export const DAILY_DANIEL_VERSES: DailyVerse[] = [
  { text: 'Blessed be the name of God for ever and ever: for wisdom and might are his.', ref: 'Daniel 2:20', book: 'Daniel', chapter: 2, verse: 20 },
  { text: 'He revealeth the deep and secret things: he knoweth what is in the darkness.', ref: 'Daniel 2:22', book: 'Daniel', chapter: 2, verse: 22 },
  { text: 'The God of heaven shall set up a kingdom, which shall never be destroyed.', ref: 'Daniel 2:44', book: 'Daniel', chapter: 2, verse: 44 },
  { text: 'Our God whom we serve is able to deliver us from the burning fiery furnace.', ref: 'Daniel 3:17', book: 'Daniel', chapter: 3, verse: 17 },
  { text: 'The most High ruleth in the kingdom of men, and giveth it to whomsoever he will.', ref: 'Daniel 4:17', book: 'Daniel', chapter: 4, verse: 17 },
  { text: 'Thou art weighed in the balances, and art found wanting.', ref: 'Daniel 5:27', book: 'Daniel', chapter: 5, verse: 27 },
  { text: 'My God hath sent his angel, and hath shut the lions mouths.', ref: 'Daniel 6:22', book: 'Daniel', chapter: 6, verse: 22 },
  { text: 'The saints of the most High shall take the kingdom, and possess the kingdom for ever.', ref: 'Daniel 7:18', book: 'Daniel', chapter: 7, verse: 18 },
  { text: 'Unto two thousand and three hundred days; then shall the sanctuary be cleansed.', ref: 'Daniel 8:14', book: 'Daniel', chapter: 8, verse: 14 },
  { text: 'O Lord, hear; O Lord, forgive; O Lord, hearken and do.', ref: 'Daniel 9:19', book: 'Daniel', chapter: 9, verse: 19 },
  { text: 'Fear not, Daniel: for from the first day that thou didst set thine heart to understand.', ref: 'Daniel 10:12', book: 'Daniel', chapter: 10, verse: 12 },
  { text: 'The people that do know their God shall be strong, and do exploits.', ref: 'Daniel 11:32', book: 'Daniel', chapter: 11, verse: 32 },
  { text: 'They that be wise shall shine as the brightness of the firmament.', ref: 'Daniel 12:3', book: 'Daniel', chapter: 12, verse: 3 },
];

export const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

export const DANIEL_CHAPTERS: DanielChapter[] = [
  { chapter: 1, title: 'In Babylon', description: 'Daniel and his friends stand faithful in exile.', status: 'completed' },
  { chapter: 2, title: "The King's Dream", description: 'Nebuchadnezzar has a dream that reveals future kingdoms.', status: 'in-progress' },
  { chapter: 3, title: 'The Fiery Furnace', description: 'Faith is tested before the image of gold.', status: 'completed' },
  { chapter: 4, title: 'The Humbling of a King', description: 'Pride gives way to the rule of Heaven.', status: 'completed' },
  { chapter: 5, title: 'The Writing on the Wall', description: 'Babylon is weighed and found wanting.', status: 'completed' },
  { chapter: 6, title: "The Lions' Den", description: 'Daniel is preserved through prayer and courage.', status: 'completed' },
  { chapter: 7, title: 'Four Beasts', description: 'A vision of kingdoms and the Son of Man.', status: 'upcoming' },
  { chapter: 8, title: 'The Ram and Goat', description: 'A prophecy of empire, conflict, and cleansing.', status: 'upcoming' },
  { chapter: 9, title: 'Seventy Weeks', description: 'Daniel prays and receives a prophetic timeline.', status: 'upcoming' },
  { chapter: 10, title: 'The Heavenly Messenger', description: 'Spiritual conflict frames earthly history.', status: 'upcoming' },
  { chapter: 11, title: 'Kings of North and South', description: 'Prophecy traces turbulent kingdoms.', status: 'upcoming' },
  { chapter: 12, title: 'The Time of the End', description: 'Hope, resurrection, and sealed words.', status: 'upcoming' },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Daniel Study', subtitle: 'Explore all 12 chapters', href: '/study', accent: '#3B82F6', icon: 'crown.fill' },
  { title: 'Bible Reader', subtitle: 'Open any book and chapter', href: '/bible', accent: '#06B6D4', icon: 'book.closed.fill' },
  { title: 'Characters', subtitle: 'Timelines, events, scriptures', href: '/characters', accent: '#A78BFA', icon: 'person.2.fill' },
  { title: 'Timeline', subtitle: 'Walk through Daniel history', href: '/timeline', accent: '#F59E0B', icon: 'clock.fill' },
  { title: 'Profile', subtitle: 'Progress, notes, bookmarks', href: '/settings', accent: '#10B981', icon: 'gearshape.fill' },
];

export const RECENT_ACTIVITY = [
  { label: 'Completed Daniel 2', time: '2 hours ago' },
  { label: 'Added note on Daniel 2:44', time: 'Yesterday' },
  { label: 'Bookmarked Daniel 3:16-18', time: '2 days ago' },
  { label: 'Explored Nebuchadnezzar', time: '3 days ago' },
];

export const TIMELINE_EVENTS = [
  {
    title: 'Exile to Babylon',
    ref: 'Daniel 1',
    date: '605 BC',
    detail: 'Daniel and his friends are taken from Jerusalem and trained in Babylon.',
    image: 'hero',
    accent: '#3B82F6',
  },
  {
    title: "The King's Dream",
    ref: 'Daniel 2',
    date: '603 BC',
    detail: 'A statue of kingdoms reveals that earthly empires are temporary.',
    image: 'chapter2',
    accent: '#F59E0B',
  },
  {
    title: 'Fall of Babylon',
    ref: 'Daniel 5',
    date: '539 BC',
    detail: 'The writing on the wall announces the end of Babylonian rule.',
    image: 'chapter5',
    accent: '#06B6D4',
  },
  {
    title: "Daniel in the Lions' Den",
    ref: 'Daniel 6',
    date: '538 BC',
    detail: 'Daniel remains faithful in prayer and is delivered through the night.',
    image: 'chapter6',
    accent: '#10B981',
  },
  {
    title: 'The Time of the End',
    ref: 'Daniel 12',
    date: 'Future hope',
    detail: 'Daniel closes with resurrection, wisdom, and endurance.',
    image: 'chapter12',
    accent: '#A78BFA',
  },
];

const displayDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function getDailyVerse(date = new Date()) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((today - start) / 86_400_000);

  return DAILY_DANIEL_VERSES[dayOfYear % DAILY_DANIEL_VERSES.length];
}

export function formatDisplayDate(date = new Date()) {
  return displayDateFormatter.format(date);
}
