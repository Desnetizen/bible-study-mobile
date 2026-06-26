import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { Badge } from '../lib/badges';

export function BadgePreviewModal({
  badge,
  onClose,
}: {
  badge: Badge | null;
  onClose: () => void;
}) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (badge) {
      scale.set(withSpring(1, { damping: 12, stiffness: 160 }));
      opacity.set(withSpring(1, { damping: 14, stiffness: 140 }));
    }
  }, [badge, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: opacity.get(),
  }));

  return (
    <Modal
      visible={badge !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.content, animatedStyle]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={(e) => e.stopPropagation()}
        >
          {badge && (
            <>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <X size={20} color="#ffffff" strokeWidth={2.5} />
              </Pressable>

              <View
                style={[
                  styles.imageWrap,
                  { borderColor: badge.color + '80' },
                ]}
              >
                <Image
                  source={badge.image}
                  style={styles.image}
                  contentFit="contain"
                />
              </View>

              <Text style={styles.name}>{badge.name}</Text>
              <Text style={styles.chapter}>Chapter {badge.chapter}</Text>
            </>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const BADGE_DISPLAY_SIZE = 260;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  closeButton: {
    position: 'absolute',
    top: -100,
    right: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageWrap: {
    width: BADGE_DISPLAY_SIZE,
    height: BADGE_DISPLAY_SIZE,
    borderRadius: BADGE_DISPLAY_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Cinzel',
    textAlign: 'center',
    lineHeight: 28,
  },
  chapter: {
    color: '#8b96a8',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
