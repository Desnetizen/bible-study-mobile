import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function StudyIcon({ name, size = 20, color = '#64748b' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...props}>
          <Path d="M4 11.5 12 5l8 6.5" />
          <Path d="M6.5 10.5V19h11v-8.5" />
        </Svg>
      );
    case 'book':
    case 'bookOpen':
      return (
        <Svg {...props}>
          <Path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H18v16H8.5A2.5 2.5 0 0 0 6 21Z" />
          <Path d="M6 5.5V21" />
          <Path d="M9.5 7.5h5M9.5 11h5M9.5 14.5h3.5" />
        </Svg>
      );
    case 'crown':
      return (
        <Svg {...props}>
          <Path d="M4 17.5 6.5 7l5.5 5 5.5-5L20 17.5Z" />
          <Path d="M5.5 20h13" />
          <Circle cx={6.5} cy={7} r={1.1} />
          <Circle cx={12} cy={12} r={1.1} />
          <Circle cx={17.5} cy={7} r={1.1} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...props}>
          <Circle cx={12} cy={12} r={8} />
          <Path d="M12 8v4.5l2.8 1.8" />
        </Svg>
      );
    case 'grid':
      return (
        <Svg {...props}>
          <Rect x={4} y={4} width={6} height={6} rx={1.2} />
          <Rect x={14} y={4} width={6} height={6} rx={1.2} />
          <Rect x={4} y={14} width={6} height={6} rx={1.2} />
          <Rect x={14} y={14} width={6} height={6} rx={1.2} />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...props}>
          <Path d="M12 3.5 13.8 9l5.2 1.8-5.2 1.7L12 18l-1.8-5.5L5 10.8 10.2 9 12 3.5Z" />
          <Path d="M18.5 3.8v2.2M19.6 4.9h-2.2M5.2 17.2v2M6.2 18.2h-2" />
        </Svg>
      );
    case 'compare':
      return (
        <Svg {...props}>
          <Path d="M7 7h12" />
          <Path d="M13 3l6 4-6 4" />
          <Path d="M17 17H5" />
          <Path d="m11 13-6 4 6 4" />
        </Svg>
      );
    case 'briefcase':
      return (
        <Svg {...props}>
          <Path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
          <Rect x={4} y={7} width={16} height={12} rx={2} />
          <Path d="M4 12h16M10 12v2M14 12v2" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...props}>
          <Path d="m9 5 7 7-7 7" />
        </Svg>
      );
    case 'checkCircle':
      return (
        <Svg {...props}>
          <Circle cx={12} cy={12} r={8} />
          <Path d="m8.8 12 2.2 2.2 4.4-4.6" />
        </Svg>
      );
    case 'halfClock':
      return (
        <Svg {...props}>
          <Circle cx={12} cy={12} r={8} />
          <Path d="M12 7.8v4.4l2.8 1.7" />
          <Path d="M12 4a8 8 0 0 1 8 8" />
        </Svg>
      );
    case 'circle':
      return (
        <Svg {...props}>
          <Circle cx={12} cy={12} r={8} />
        </Svg>
      );
    case 'star':
      return (
        <Svg {...props}>
          <Path d="m12 4 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.2l5-.7L12 4Z" />
        </Svg>
      );
    case 'pin':
      return (
        <Svg {...props}>
          <Path d="M12 20s5-4.7 5-9a5 5 0 1 0-10 0c0 4.3 5 9 5 9Z" />
          <Circle cx={12} cy={11} r={1.8} />
        </Svg>
      );
    case 'pillar':
      return (
        <Svg {...props}>
          <Path d="M6 20h12M8 20V8.5M12 20V6M16 20v-9.5" />
          <Path d="M7 8.5h2M11 6h2M15 10.5h2" />
        </Svg>
      );
    case 'pencil':
      return (
        <Svg {...props}>
          <Path d="m5 19 3.5-.7L18 8.8 15.2 6 5.7 15.5 5 19Z" />
          <Path d="m13.8 7.4 2.8 2.8" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...props}>
          <Path d="M12 3.8 18 6v5.2c0 4-2.4 6.5-6 8.9-3.6-2.4-6-4.9-6-8.9V6l6-2.2Z" />
        </Svg>
      );
    case 'scales':
      return (
        <Svg {...props}>
          <Path d="M12 5v15M7 8h10M5 20h14" />
          <Path d="m7 8-3 5h6l-3-5ZM17 8l-3 5h6l-3-5Z" />
        </Svg>
      );
    case 'document':
      return (
        <Svg {...props}>
          <Path d="M8 4.5h8l3 3V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
          <Path d="M16 4.5v3h3M9 12h6M9 15.5h6" />
        </Svg>
      );
    case 'network':
      return (
        <Svg {...props}>
          <Circle cx={6} cy={12} r={2.2} />
          <Circle cx={18} cy={6.5} r={2.2} />
          <Circle cx={18} cy={17.5} r={2.2} />
          <Path d="M8.1 11.1 15.9 7.4M8.1 12.9l7.8 3.7" />
        </Svg>
      );
    default:
      return (
        <Svg {...props}>
          <Circle cx={12} cy={12} r={8} />
        </Svg>
      );
  }
}
