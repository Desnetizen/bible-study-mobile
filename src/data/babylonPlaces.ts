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
    role: 'Royal capital and imperial center',
    blurb: 'The magnificent capital on the Euphrates, seat of Nebuchadnezzar\'s power and the setting of Daniel\'s exile.',
    image: require('../../assets/Places/Babylon.png'),
  },
  {
    id: 'carchemish',
    name: 'Carchemish',
    role: 'Battle of Carchemish',
    blurb: 'The decisive 605 BC battle where Nebuchadnezzar defeated Egypt, marking Babylon\'s rise to dominance.',
    image: require('../../assets/Places/ziggurat in Babylon.png'),
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    role: 'Conquered Judean capital',
    blurb: 'Fallen to Babylon in 586 BC, the temple was destroyed and Judah\'s elite were taken into exile.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'susa',
    name: 'Susa',
    role: 'Persian administrative center',
    blurb: 'Later the Persian winter capital, where Daniel\'s visions extended beyond Babylon into the Medo-Persian era.',
    image: require('../../assets/Places/Shushan(Susa).jpg'),
  },
];

export const morePlaces: PlaceEntry[] = [
  {
    id: 'ur',
    name: 'Ur',
    role: 'Ancient Mesopotamian city',
    blurb: 'Abraham\'s birthplace, a prominent Sumerian city that remained significant through the Babylonian period.',
    image: require('../../assets/Places/Ur of the Chaldeans.png'),
  },
  {
    id: 'nineveh',
    name: 'Nineveh',
    role: 'Former Assyrian capital',
    blurb: 'The great Assyrian capital that fell to Babylon, paving the way for Babylonian supremacy.',
    image: require('../../assets/Places/Ancient ninevah.png'),
  },
  {
    id: 'ecbatana',
    name: 'Ecbatana',
    role: 'Median capital',
    blurb: 'The ancient Median capital that later became part of the Persian Empire after Babylon\'s fall.',
    image: require('../../assets/Places/Ecbatana.png'),
  },
  {
    id: 'hanging-gardens',
    name: 'Hanging Gardens',
    role: 'Wonders of Babylon',
    blurb: 'One of the Seven Wonders of the Ancient World, the legendary hanging gardens of Nebuchadnezzar\'s palace.',
    image: require('../../assets/Places/hanging-gardens.png'),
  },
];
