import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MODAL_IMAGE_HEIGHT = SCREEN_H * 0.8;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  images: ImageSourcePropType[];
  initialIndex?: number;
  accentColor: string;
}

function ZoomableImage({ source }: { source: ImageSourcePropType }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.max(1, Math.min(savedScale.value * e.scale, MAX_SCALE));
      const centerX = SCREEN_W / 2;
      const centerY = MODAL_IMAGE_HEIGHT / 2;
      const dx = e.focalX - centerX - translateX.value;
      const dy = e.focalY - centerY - translateY.value;
      const ratio = newScale / scale.value;
      translateX.value += dx * (1 - ratio);
      translateY.value += dy * (1 - ratio);
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value <= 1) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      if (savedScale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        return;
      }
      const maxTranslateX = (SCREEN_W * (savedScale.value - 1)) / 2;
      const maxTranslateY = (MODAL_IMAGE_HEIGHT * (savedScale.value - 1)) / 2;
      const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value));
      const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value));
      translateX.value = withSpring(clampedX);
      translateY.value = withSpring(clampedY);
      savedTranslateX.value = clampedX;
      savedTranslateY.value = clampedY;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      const zoomingIn = savedScale.value <= 1;
      const nextScale = zoomingIn ? DOUBLE_TAP_SCALE : 1;
      const centerX = SCREEN_W / 2;
      const centerY = MODAL_IMAGE_HEIGHT / 2;

      if (zoomingIn) {
        const dx = e.x - centerX - translateX.value;
        const dy = e.y - centerY - translateY.value;
        const ratio = nextScale / savedScale.value;
        const newTX = translateX.value + dx * (1 - ratio);
        const newTY = translateY.value + dy * (1 - ratio);
        translateX.value = withSpring(newTX);
        translateY.value = withSpring(newTY);
        savedTranslateX.value = newTX;
        savedTranslateY.value = newTY;
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }

      scale.value = withSpring(nextScale);
      savedScale.value = nextScale;
    });

  const composedGesture = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.imageWrap, animatedStyle]}>
        <Image source={source} style={styles.fullImage} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

export default function ImageModal({
  visible,
  onClose,
  images,
  initialIndex = 0,
  accentColor,
}: ImageModalProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible && scrollRef.current) {
      setActiveIndex(initialIndex);
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_W, animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, initialIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(index);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.closeButton, { top: insets.top + 12, borderColor: accentColor }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close image viewer"
        >
          <X size={22} color={accentColor} />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
        >
          {images.map((source, i) => (
            <View key={`image-${i}`} style={styles.page}>
              <ZoomableImage source={source} />
            </View>
          ))}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex
                    ? [styles.dotActive, { backgroundColor: accentColor }]
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}

        <Text style={styles.hint}>
          {images.length > 1
            ? 'Swipe to browse · Double-tap or pinch to zoom'
            : 'Double-tap or pinch to zoom'}
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 17, 31, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 17, 31, 0.6)',
    zIndex: 10,
  },
  page: {
    width: SCREEN_W,
    height: MODAL_IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: SCREEN_W,
    height: MODAL_IMAGE_HEIGHT,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  hint: {
    position: 'absolute',
    bottom: 32,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
    fontSize: 11,
  },
});
