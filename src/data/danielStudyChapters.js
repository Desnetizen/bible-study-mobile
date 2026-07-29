export const CHAPTER_COLORS = {
  1: '#3730a3',
  2: '#7e22ce',
  3: '#c2410c',
  4: '#047857',
  5: '#475569',
  6: '#b45309',
  7: '#6d28d9',
  8: '#0e7490',
  9: '#1d4ed8',
  10: '#0369a1',
  11: '#9f1239',
  12: '#15803d',
};

export const CHAPTER_IMAGES = {
  1: require('../../assets/Chapters/daniel-chapter-1.png'),
  2: require('../../assets/Chapters/daniel-chapter-2.png'),
  3: require('../../assets/Chapters/daniel-chapter-3.png'),
  4: require('../../assets/Chapters/daniel-chapter-4.png'),
  5: require('../../assets/Chapters/daniel-chapter-5.png'),
  6: require('../../assets/Chapters/daniel-chapter-6.png'),
  7: require('../../assets/Chapters/daniel-chapter-7.png'),
  8: require('../../assets/Chapters/daniel-chapter-8.png'),
  9: require('../../assets/Chapters/daniel-chapter-9.png'),
  10: require('../../assets/Chapters/daniel-chapter-10.png'),
  12: require('../../assets/Chapters/daniel-chapter-12.png'),
};

export const TABS = [
  { id: 'Chapters', label: 'Chapters', icon: 'bookOpen' },
  { id: 'Overview', label: 'Overview', icon: 'grid' },
  { id: 'Symbols', label: 'Symbols', icon: 'sparkle' },
  { id: 'Compare', label: 'Compare', icon: 'compare' },
  { id: 'Study Tools', label: 'Study Tools', icon: 'briefcase' },
];

function buildPlaceholder(id, title, subtitle, topics, quote, description, tagValues, discoveries) {
  return {
    id,
    num: id,
    title,
    subtitle,
    topics,
    ref: `Daniel ${id}`,
    status: 'not-started',
    image: CHAPTER_IMAGES[id] ?? null,
    overview: {
      description,
      quote,
      quoteRef: `Daniel ${id}:1`,
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: tagValues[0] },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: tagValues[1] },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: tagValues[2] },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: tagValues[3] },
      ],
      discoveries,
    },
  };
}

export const CHAPTERS_DATA = [
  {
    id: 1,
    num: 1,
    title: 'Royal Training',
    subtitle: 'Royal Education & Faithfulness',
    topics: ['characters'],
    ref: 'Daniel 1',
    status: 'completed',
    image: CHAPTER_IMAGES[1],
    overview: {
      description:
        'Daniel and his friends arrive in Babylon as gifted exiles. They are immersed in royal education, renamed for Babylonian service, and tested in whether they will absorb the empire or remain faithful to God.',
      quote: 'Daniel purposed in his heart that he would not defile himself.',
      quoteRef: 'Daniel 1:8',
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: 'Royal training begins' },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: 'Daniel, Hananiah, Mishael, Azariah' },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: 'Faithfulness, identity, discipline' },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: 'Babylon' },
      ],
      discoveries: [
        { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Training under empire', description: 'How Babylon tried to reshape belief, identity, and future leadership.' },
        { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'A quiet act of resistance', description: 'Why the food test mattered spiritually more than socially.' },
        { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Wisdom from God', description: 'God gives learning and discernment while His servants remain faithful.' },
        { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Related Connections', description: 'Identity and faithfulness carry forward into the rest of the book.', links: [{ label: 'Daniel 3: Courage in crisis', chapter: 3 }, { label: 'Daniel 6: Faithfulness under decree', chapter: 6 }] },
      ],
    },
  },
  {
    id: 2,
    num: 2,
    title: "The King's Dream",
    subtitle: 'The Statue of Empires',
    topics: ['prophecy', 'kingdoms', 'symbols'],
    ref: 'Daniel 2',
    status: 'completed',
    image: CHAPTER_IMAGES[2],
    overview: {
      description:
        'Nebuchadnezzar demands the dream and its interpretation, exposing the limits of Babylonian wisdom. Daniel turns to prayer, receives revelation from God, and explains the statue of kingdoms and the everlasting kingdom that will replace them.',
      quote: 'There is a God in heaven who reveals secrets.',
      quoteRef: 'Daniel 2:28',
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: 'Dream interpreted' },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: 'Nebuchadnezzar, Daniel' },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: 'Revelation, kingdoms, sovereignty' },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: 'Babylonian court' },
      ],
      discoveries: [
        { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Empires on borrowed time', description: 'Why the image of metals frames the instability of human kingdoms.' },
        { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'Prayer before interpretation', description: 'Daniel seeks God before speaking to power.' },
        { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'The stone kingdom', description: 'God establishes a kingdom that does not depend on human strength.' },
        { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Related Connections', description: 'The vision lays the foundation for Daniel 7 and later prophecy.', links: [{ label: 'Daniel 7: Beasts and kingdoms', chapter: 7 }, { label: 'Daniel 5: Babylon weighed', chapter: 5 }] },
      ],
    },
  },
  {
    id: 3,
    num: 3,
    title: 'The Fiery Furnace',
    subtitle: 'Courage in the Furnace',
    topics: ['characters'],
    ref: 'Daniel 3',
    status: 'completed',
    image: CHAPTER_IMAGES[3],
    overview: {
      description:
        'Nebuchadnezzar erects a golden image and commands universal worship. Shadrach, Meshach, and Abednego refuse to bow, are thrown into the furnace, and are preserved by God in the midst of the fire.',
      quote: 'Our God whom we serve is able to deliver us.',
      quoteRef: 'Daniel 3:17',
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: 'Refusal to bow' },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: 'Shadrach, Meshach, Abednego' },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: 'Worship, courage, deliverance' },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: 'Plain of Dura' },
      ],
      discoveries: [
        { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Public pressure and worship', description: 'The furnace story is about allegiance before it is about rescue.' },
        { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'Faith without conditions', description: 'Their obedience does not depend on a guaranteed outcome.' },
        { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Presence in the fire', description: 'God does not abandon His people inside the trial.' },
        { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Related Connections', description: 'Chapter 3 mirrors later scenes of endurance under pressure.', links: [{ label: 'Daniel 1: Early faithfulness', chapter: 1 }, { label: 'Daniel 6: Loyalty under decree', chapter: 6 }] },
      ],
    },
  },
  {
    id: 4,
    num: 4,
    title: 'Nebuchadnezzar Humbled',
    subtitle: 'The Pride of Nebuchadnezzar',
    topics: ['kingdoms', 'visions'],
    ref: 'Daniel 4',
    status: 'completed',
    image: CHAPTER_IMAGES[4],
    overview: {
      description:
        'Nebuchadnezzar dreams of a great tree cut down. Daniel warns him about pride, yet the king exalts himself and loses his reason until he finally looks to heaven and honors the Most High.',
      quote: 'Those who walk in pride He is able to put down.',
      quoteRef: 'Daniel 4:37',
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: 'The king is humbled' },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: 'Nebuchadnezzar, Daniel' },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: 'Pride, repentance, sovereignty' },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: 'Babylon' },
      ],
      discoveries: [
        { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'A king under warning', description: 'Daniel speaks truth to power with courage and compassion.' },
        { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'The tree vision', description: 'A visible symbol of greatness cut back by divine judgment.' },
        { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Restoration after humility', description: 'Acknowledging heaven becomes the turning point for recovery.' },
        { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Related Connections', description: 'Chapter 4 prepares the contrast with Belshazzar in chapter 5.', links: [{ label: 'Daniel 2: God reveals and rules', chapter: 2 }, { label: 'Daniel 5: Pride without repentance', chapter: 5 }] },
      ],
    },
  },
  {
    id: 5,
    num: 5,
    title: 'The Writing on the Wall',
    subtitle: 'The Fall of Babylon',
    topics: ['kingdoms', 'characters'],
    ref: 'Daniel 5',
    status: 'in-progress',
    image: CHAPTER_IMAGES[5],
    overview: {
      description:
        "Belshazzar, the last king of Babylon, holds a great feast using the sacred vessels from the temple in Jerusalem. That night, a mysterious hand writes on the wall, and Daniel is called to interpret the message.",
      quote: 'You have been weighed in the balances and found wanting.',
      quoteRef: 'Daniel 5:27',
      tags: [
        { label: 'Key Event', icon: 'crown', color: '#d97706', bgColor: '#fffbeb', value: 'Writing on the wall' },
        { label: 'Key People', icon: 'user', color: '#2563eb', bgColor: '#eff6ff', value: 'Belshazzar, Daniel' },
        { label: 'Themes', icon: 'star', color: '#059669', bgColor: '#f0fdf4', value: 'Pride, Judgment, Sovereignty' },
        { label: 'Location', icon: 'pin', color: '#7c3aed', bgColor: '#f5f3ff', value: 'Babylon' },
      ],
      discoveries: [
        { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'The rise and fall of Babylon', description: 'How pride and idolatry led to judgment.' },
        { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'The mysterious writing', description: 'Understanding "MENE, MENE, TEKEL, UPHARSIN".' },
        { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: "God's sovereignty", description: "History is in God's hands, not human power." },
        { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Related Connections', description: 'Judgment in chapter 5 ties directly back to earlier warnings.', links: [{ label: 'Daniel 2: Kingdoms', chapter: 2 }, { label: "Daniel 4: Nebuchadnezzar's Pride", chapter: 4 }] },
      ],
    },
  },
  buildPlaceholder(6, "Daniel in the Lions' Den", 'Faithfulness in the Den', ['characters'], 'Your God whom you serve continually, He will deliver you.', "Daniel remains faithful in prayer under a new empire and is preserved through a night in the lions' den.", ['Prayer under pressure', 'Daniel, Darius', 'Faithfulness, deliverance', 'Medo-Persia'], [
    { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Integrity tested', description: 'Faithfulness is challenged through law and politics.' },
    { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Deliverance in danger', description: 'God preserves His servant without compromise.' },
  ]),
  buildPlaceholder(7, 'The Four Beasts', 'The Four Beasts Vision', ['prophecy', 'kingdoms', 'symbols', 'visions'], 'The saints of the Most High shall receive the kingdom.', "Daniel's vision of four beasts reveals the instability of earthly empires and the certainty of God's kingdom.", ['Four beasts vision', 'Daniel, Ancient of Days', 'Kingdoms, judgment, hope', 'Night vision'], [
    { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Empire imagery', description: 'Beasts portray violent human rule.' },
    { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Connection to chapter 2', description: 'The same succession appears through different symbols.' },
  ]),
  buildPlaceholder(8, 'The Ram and the Goat', 'The Ram & Male Goat Vision', ['prophecy', 'symbols', 'visions'], 'The vision shall be for many days.', 'The vision of the ram and the goat narrows the prophetic focus and highlights conflict, desecration, and eventual vindication.', ['Ram and goat vision', 'Daniel, Gabriel', 'Conflict, sanctuary, prophecy', 'Vision setting'], [
    { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Prophetic detail', description: 'The vision becomes more specific and historically pointed.' },
    { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Heavenly interpretation', description: 'Gabriel helps Daniel understand what he sees.' },
  ]),
  buildPlaceholder(9, 'Seventy Weeks', 'The Seventy Weeks Prophecy', ['prophecy', 'visions'], 'At the beginning of your supplications the command went out.', "Daniel prays for restoration, and Gabriel brings one of the book's most significant prophetic messages.", ['Seventy weeks prophecy', 'Daniel, Gabriel', 'Prayer, restoration, prophecy', 'Exile context'], [
    { icon: 'pencil', iconBg: '#eff6ff', iconColor: '#2563eb', title: 'Prayerful interpretation', description: 'Prophecy emerges in the context of confession and pleading.' },
    { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Hope beyond exile', description: 'God gives a timeline that reaches beyond the immediate crisis.' },
  ]),
  buildPlaceholder(10, 'Heavenly Vision', 'The Final Vision', ['visions', 'prophecy'], 'Fear not, Daniel: for from the first day... thy words were heard.', 'Daniel encounters a heavenly messenger and sees that earthly conflict is tied to unseen spiritual struggle.', ['Heavenly encounter', 'Daniel, angelic messenger', 'Prayer, conflict, revelation', 'Tigris River'], [
    { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Spiritual conflict', description: 'The chapter lifts the curtain on the unseen realm.' },
    { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Continuation into 11', description: 'This vision frames the details that follow.' },
  ]),
  buildPlaceholder(11, 'Kings in Conflict', 'Kings of North & South', ['prophecy', 'kingdoms'], 'Yet he shall come to his end, and none shall help him.', "Chapter 11 traces complex political conflict and reminds the reader that even long struggles stay within God's boundaries.", ['Northern and southern kings', 'Competing rulers', 'Conflict, endurance, prophecy', 'Regional powers'], [
    { icon: 'pillar', iconBg: '#fffbeb', iconColor: '#d97706', title: 'Detailed conflict', description: 'Prophecy follows the turbulence of shifting powers.' },
    { icon: 'shield', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Limits of power', description: 'No ruler escapes the end appointed by God.' },
  ]),
  buildPlaceholder(12, 'Time of the End', 'The Time of the End', ['prophecy', 'visions', 'symbols'], 'Those who are wise shall shine like the brightness of the firmament.', 'The book closes with deliverance, resurrection hope, and a call to live wisely while trusting what God has sealed for its time.', ['Time of the end', 'Daniel, Michael', 'Hope, resurrection, wisdom', 'Final vision'], [
    { icon: 'star', iconBg: '#f0fdf4', iconColor: '#059669', title: 'Hope beyond history', description: 'The ending points beyond empire to final deliverance.' },
    { icon: 'network', iconBg: '#f5f3ff', iconColor: '#7c3aed', title: 'Bookwide resolution', description: 'Themes of wisdom, endurance, and kingdom come together.' },
  ]),
];
