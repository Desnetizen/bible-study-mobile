import LottieView from 'lottie-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { preparationLogoAnimation } from '../../assets/animations';

type PreparationLogoAnimationProps = {
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: (isCancelled: boolean) => void;
};

export function PreparationLogoAnimation({
  autoPlay = true,
  loop = false,
  speed = 1,
  style,
  onAnimationFinish,
}: PreparationLogoAnimationProps) {
  return (
    <LottieView
      autoPlay={autoPlay}
      loop={loop}
      onAnimationFinish={onAnimationFinish}
      resizeMode="contain"
      source={preparationLogoAnimation}
      speed={speed}
      style={style}
    />
  );
}
