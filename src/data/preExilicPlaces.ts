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
    id: 'jerusalem',
    name: 'Jerusalem',
    role: 'Royal capital of Judah',
    blurb: 'The fortified city of David, seat of the Davidic dynasty, and the spiritual heart of Israel\'s worship.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'lachish',
    name: 'Lachish',
    role: 'Fortified Judean city',
    blurb: 'A key stronghold in the Shephelah, conquered by the Assyrians during Hezekiah\'s reign.',
    image: require('../../assets/Places/Canaanite Lands.jpg'),
  },
  {
    id: 'bethel',
    name: 'Bethel',
    role: 'Religious center of Israel',
    blurb: 'A significant worship site where Jeroboam set up a golden calf, representing Israel\'s apostasy.',
    image: require('../../assets/Places/Canaanite Lands.jpg'),
  },
  {
    id: 'samaria',
    name: 'Samaria',
    role: 'Capital of the northern kingdom',
    blurb: 'The capital of the ten northern tribes, destroyed by Assyria in 722 BC as judgment for idolatry.',
    image: require('../../assets/Places/Canaanite Lands.jpg'),
  },
];

export const morePlaces: PlaceEntry[] = [
  {
    id: 'megiddo',
    name: 'Megiddo',
    role: 'Strategic fortress and battle site',
    blurb: 'A crucial fortified city controlling the Valley of Jezreel, often a battleground for regional powers.',
    image: require('../../assets/Places/Canaanite Lands.jpg'),
  },
  {
    id: 'beersheba',
    name: 'Beersheba',
    role: 'Southern gateway of Judah',
    blurb: 'Abraham\'s well and the southern boundary of the promised land, a site of patriarchal memory.',
    image: require('../../assets/Places/Sinai.jpg'),
  },
  {
    id: 'dan',
    name: 'Dan',
    role: 'Northern tribal capital',
    blurb: 'The northernmost city of Israel, where Jeroboam erected a golden calf for worship.',
    image: require('../../assets/Places/Canaanite Lands.jpg'),
  },
  {
    id: 'hebron',
    name: 'Hebron',
    role: 'City of the patriarchs',
    blurb: 'David\'s first capital and the burial place of Abraham, Sarah, Isaac, and Jacob.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
];
