import Ionicons from '@expo/vector-icons/Ionicons';

type IconSymbolName =
  | 'house.fill'
  | 'book.closed.fill'
  | 'people.fill'
  | 'crown.fill'
  | 'clock.fill'
  | 'gearshape.fill';

type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color: string;
};

const ICON_MAP: Record<IconSymbolName, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'book.closed.fill': 'book',
  'people.fill': 'people',
  'crown.fill': 'trophy',
  'clock.fill': 'time',
  'gearshape.fill': 'settings',
};

export function IconSymbol({ name, size = 24, color }: IconSymbolProps) {
  return <Ionicons name={ICON_MAP[name]} size={size} color={color} />;
}
