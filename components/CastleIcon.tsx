import Svg, { Path } from 'react-native-svg';

interface CastleIconProps {
  color: string;
  size?: number;
}

export function CastleIcon({ color, size = 24 }: CastleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21h18M5 21V9l2-2V3h3v3h4V3h3v4l2 2v12M9 21v-4a3 3 0 0 1 6 0v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
