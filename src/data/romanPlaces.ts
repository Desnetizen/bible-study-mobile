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
    id: 'rome',
    name: 'Rome',
    role: 'Imperial capital of the empire',
    blurb: 'The eternal city and seat of Roman power, from which emperors ruled the Mediterranean world.',
    image: require('../../assets/Places/Rome.jpg'),
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    role: 'Judean provincial capital',
    blurb: 'A contested city under Roman governors, where Jesus was crucified and the early church was born.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'caesarea',
    name: 'Caesarea',
    role: 'Roman administrative center',
    blurb: 'Herod\'s grand port city and the seat of Roman governors like Pontius Pilate in Judea.',
    image: require('../../assets/Places/Ancient Jerusalem.jpg'),
  },
  {
    id: 'antioch',
    name: 'Antioch',
    role: 'Early Christian hub',
    blurb: 'A major Roman city where believers were first called Christians and a base for Paul\'s missionary journeys.',
    image: require('../../assets/Places/Damascus.png'),
  },
];

export const morePlaces: PlaceEntry[] = [
  {
    id: 'ephesus',
    name: 'Ephesus',
    role: 'Major Roman provincial city',
    blurb: 'A key city in Asia Minor, site of Paul\'s ministry and one of the seven churches of Revelation.',
    image: require('../../assets/Places/Rome.jpg'),
  },
  {
    id: 'corinth',
    name: 'Corinth',
    role: 'Roman colony and trade hub',
    blurb: 'A thriving Roman colony where Paul planted a church and wrote two epistles to the Corinthians.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'athens',
    name: 'Athens',
    role: 'Intellectual center under Rome',
    blurb: 'Though politically diminished, Athens remained a center of philosophy where Paul addressed the Areopagus.',
    image: require('../../assets/Places/Athens.jpg'),
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    role: 'Egyptian intellectual hub',
    blurb: 'The second city of the Roman Empire and a center of Jewish learning and early Christian thought.',
    image: require('../../assets/Places/Athens.jpg'),
  },
];
