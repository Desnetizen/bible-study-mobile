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
    id: 'babylon',
    name: 'Babylon',
    role: 'Royal capital and cultural heart',
    blurb: 'Conquered by Cyrus in 539 BC, it remained an imperial center of the Persian Empire.',
    image: require('../../assets/Places/Babylon.png'),
  },
  {
    id: 'susa',
    name: 'Susa',
    role: 'Winter capital and royal residence',
    blurb: 'Where Nehemiah served as cupbearer before being sent to rebuild Jerusalem.',
    image: require('../../assets/Places/Shushan(Susa).jpg'),
  },
  {
    id: 'persepolis',
    name: 'Persepolis',
    role: 'Ceremonial capital and seat of the empire',
    blurb: 'Built by Darius I as the grand ceremonial center of Persian power.',
    image: require('../../assets/Places/Persepolis.png'),
  },
  {
    id: 'ecbatana',
    name: 'Ecbatana',
    role: 'Ancient Median capital and royal stronghold',
    blurb: 'The seat of Median power, later a summer residence for Persian kings.',
    image: require('../../assets/Places/Ecbatana.png'),
  },
  {
    id: 'pasargadae',
    name: 'Pasargadae',
    role: 'Cyrus the Great\'s tomb and early royal center',
    blurb: 'The first capital of Cyrus, where his monumental tomb still stands.',
    image: require('../../assets/Places/Pasagradae.png'),
  },
];

export const morePlaces: PlaceEntry[] = [
  {
    id: 'ecbatana-more',
    name: 'Ecbatana',
    role: 'Median royal stronghold',
    blurb: 'The historic capital of Media, integrated into Persian administration.',
    image: require('../../assets/Places/Ecbatana.png'),
  },
  {
    id: 'pasargadae-more',
    name: 'Pasargadae',
    role: 'Cyrus the Great\'s tomb',
    blurb: 'The monumental tomb of Cyrus, a pilgrimage site through the centuries.',
    image: require('../../assets/Places/Pasagradae.png'),
  },
  {
    id: 'memphis',
    name: 'Memphis',
    role: 'Egyptian administrative hub',
    blurb: 'The historic capital of Egypt, conquered by Cambyses in 525 BC.',
    image: require('../../assets/Places/Memphis.png'),
  },
  {
    id: 'sardis',
    name: 'Sardis',
    role: 'Lydia\'s royal capital',
    blurb: 'The wealthy capital of Lydia, conquered by Cyrus around 547 BC.',
    image: require('../../assets/Places/Sardis.png'),
  },
  {
    id: 'damascus',
    name: 'Damascus',
    role: 'Strategic city on trade routes',
    blurb: 'A strategic hub on the Silk Road, integral to imperial commerce.',
    image: require('../../assets/Places/Damascus.png'),
  },
];