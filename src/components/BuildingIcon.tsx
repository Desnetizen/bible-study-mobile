import { Image } from 'expo-image';

interface BuildingIconProps {
  color: string;
  size?: number;
}

export function BuildingIcon({ color, size = 24 }: BuildingIconProps) {
  return (
    <Image
      source={require('../../assets/Icons/Building.png')}
      style={{ width: size, height: size, tintColor: color }}
      contentFit="contain"
    />
  );
}
