import type { ImageSourcePropType } from 'react-native';

export interface PlaceEntry {
  id: string;
  name: string;
  role: string;
  blurb: string;
  image: ImageSourcePropType;
}

export const keyPlaces: PlaceEntry[] = [
  {
    id: 'athens',
    name: 'Athens',
    role: 'Cultural heart of Greece',
    blurb: 'The intellectual and cultural center of ancient Greece, home to the Academy and the Parthenon.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    role: 'Hellenistic capital of Egypt',
    blurb: 'Founded by Alexander, it became the intellectual hub of the ancient world with its legendary library.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    role: 'Contested Judean capital',
    blurb: 'Caught between Ptolemaic and Seleucid empires, Jerusalem endured Hellenistic cultural pressure and the Maccabean revolt.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'antioch',
    name: 'Antioch',
    role: 'Seleucid royal capital',
    blurb: 'The western capital of the Seleucid Empire, from which Antiochus IV Epiphanes enforced Hellenistic decrees.',
    image: require('../../assets/Places/Damascus.png'),
  },
];

export const morePlaces: PlaceEntry[] = [
  {
    id: 'sparta',
    name: 'Sparta',
    role: 'Military rival of Athens',
    blurb: 'The formidable Greek city-state whose military culture contrasted sharply with Athenian democracy.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'corinth',
    name: 'Corinth',
    role: 'Major trade and naval power',
    blurb: 'A strategic city on the isthmus connecting mainland Greece to the Peloponnese.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'ephesus',
    name: 'Ephesus',
    role: 'Major Ionian city',
    blurb: 'A prominent Greek city on the coast of Asia Minor, home to the Temple of Artemis.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'macedonia',
    name: 'Macedonia',
    role: 'Alexander\'s homeland',
    blurb: 'The northern kingdom from which Alexander the Great launched his conquest of the known world.',
    image: require('../../assets/Places/Athens.jpg'),
  },
];
