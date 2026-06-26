import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  PanResponder,
  StyleSheet,
  ScrollView as RNScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import type { HeadingEntry } from '@/data/extractHeadings';

export interface OutlineScrubberProps {
  headings: HeadingEntry[];
  accentColor: string;
  scrollRef?: React.RefObject<RNScrollView | null>;
  scrollY?: Animated.Value;
  scrollViewHeightRef?: React.MutableRefObject<number>;
  scrollViewContentHeightRef?: React.MutableRefObject<number>;
  rootOffset: number;
  sectionPositions: React.MutableRefObject<Record<string, number>>;
}

const OverlayBackground: React.FC<{ children: React.ReactNode; style: any }> = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return <View style={[style, { backgroundColor: '#0C1420FA' }]}>{children}</View>;
  }
  return (
    <BlurView intensity={65} tint="dark" style={style}>
      {children}
    </BlurView>
  );
};

const OutlineScrubber: React.FC<OutlineScrubberProps> = ({
  headings,
  accentColor,
  scrollRef,
  scrollY,
  scrollViewHeightRef,
  scrollViewContentHeightRef,
  rootOffset,
  sectionPositions,
}) => {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollYVal = useRef(0);
  const isDraggingRef = useRef(false);
  const lastActiveIndexRef = useRef(-1);
  const lastScrollTrackTimeRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide timer for overlay
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 1500);
  }, []);

  // Throttled scroll position tracker (updates overlay highlight during normal scrolling)
  const throttleScrollTracking = useCallback((scrollOffsetValue: number) => {
    const now = Date.now();
    if (now - lastScrollTrackTimeRef.current < 100) return; // 100ms throttle
    lastScrollTrackTimeRef.current = now;

    const targetY = scrollOffsetValue - rootOffset;
    let closestIndex = 0;
    let minDiff = Infinity;

    for (let i = 0; i < headings.length; i++) {
      const hY = sectionPositions.current[headings[i].id] ?? 0;
      const diff = Math.abs(hY - targetY);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = closestIndex;
      setActiveIndex(closestIndex);
    }
  }, [headings, rootOffset, sectionPositions]);

  // Sync scroll values from the parent scroll container
  useEffect(() => {
    if (!scrollY) return;
    const id = scrollY.addListener(({ value }) => {
      scrollYVal.current = value;
      // Only track scroll changes when the user is scrolling normally
      if (!isDraggingRef.current && visible) {
        throttleScrollTracking(value);
      }
    });
    return () => {
      scrollY.removeListener(id);
    };
  }, [scrollY, visible, throttleScrollTracking]);

  // Cleanup hide timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Map touch positions proportionally to ScrollView Y values
  const handleDrag = useCallback((moveY: number) => {
    const viewportHeight = scrollViewHeightRef?.current || Dimensions.get('window').height;
    const contentHeight = scrollViewContentHeightRef?.current || 0;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);

    // Dynamic track positioning and bounds
    const scrollYValNum = scrollYVal.current;
    const Y_track_screen = Math.max(0, rootOffset - scrollYValNum);
    const H_scrubber = viewportHeight - Y_track_screen;

    // Relative vertical coordinates
    const Y_drag = Math.min(Math.max(moveY - Y_track_screen, 0), H_scrubber);
    const pct = H_scrubber > 0 ? Y_drag / H_scrubber : 0;

    // Direct scroll update (no animations for real-time tracking)
    const Y_target = pct * maxScroll;
    if (scrollRef?.current) {
      scrollRef.current.scrollTo({ y: Y_target, animated: false });
    }

    // Determine currently selected index
    const index = Math.min(
      Math.max(Math.round(pct * (headings.length - 1)), 0),
      headings.length - 1
    );

    if (index !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = index;
      setActiveIndex(index);
    }
  }, [headings, rootOffset, scrollRef, scrollViewHeightRef, scrollViewContentHeightRef]);

  // Gestures setup
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        isDraggingRef.current = true;
        setVisible(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        handleDrag(gestureState.moveY || gestureState.y0);
      },
      onPanResponderMove: (e, gestureState) => {
        handleDrag(gestureState.moveY);
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        // Snap scroll view to the exact coordinate of the chosen heading
        const activeHeading = headings[lastActiveIndexRef.current];
        if (activeHeading && scrollRef?.current) {
          const targetY = sectionPositions.current[activeHeading.id];
          if (targetY !== undefined) {
            scrollRef.current.scrollTo({
              y: rootOffset + targetY,
              animated: true,
            });
          }
        }
        resetHideTimer();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        resetHideTimer();
      },
    })
  ).current;

  // Sparse-content guard
  if (!headings || headings.length < 3) {
    return null;
  }

  // Handle active states
  const handleWidth = visible ? 6 : 4;
  const handleOpacity = visible ? 0.85 : 0.35;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Tap-outside dismiss backdrop */}
      {visible && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setVisible(false)}
        />
      )}

      {/* Scrubber Handle */}
      <View
        {...panResponder.panHandlers}
        style={styles.handleContainer}
        accessibilityRole="adjustable"
        accessibilityLabel="Document outline scrubber. Drag vertically to scroll."
        accessibilityHint="Toggles list overlay of section headings on tap."
        hitSlop={{ top: 20, bottom: 20, left: 15, right: 10 }}
      >
        <Pressable
          onPress={() => {
            // Accessible toggle fallback
            if (visible) {
              setVisible(false);
            } else {
              setVisible(true);
              resetHideTimer();
            }
          }}
          style={styles.handleTouchWrap}
        >
          <View
            style={[
              styles.handle,
              {
                backgroundColor: accentColor,
                width: handleWidth,
                opacity: handleOpacity,
              },
            ]}
          />
        </Pressable>
      </View>

      {/* Overlay Headings List */}
      {visible && (
        <View style={styles.overlayContainer}>
          <OverlayBackground style={styles.overlayInner}>
            <RNScrollView
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
              contentContainerStyle={styles.scrollContent}
            >
              {headings.map((h, i) => {
                const isActive = i === activeIndex;
                const isSub = h.depth === 1;

                return (
                  <Pressable
                    key={h.id}
                    style={({ pressed }) => [
                      styles.headingItem,
                      isSub && styles.subHeadingItem,
                      isActive && [styles.activeHeadingItem, { backgroundColor: accentColor + '1D' }],
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      setActiveIndex(i);
                      lastActiveIndexRef.current = i;
                      if (scrollRef?.current) {
                        const targetY = sectionPositions.current[h.id];
                        if (targetY !== undefined) {
                          scrollRef.current.scrollTo({
                            y: rootOffset + targetY,
                            animated: true,
                          });
                        }
                      }
                      resetHideTimer();
                    }}
                  >
                    <Text
                      style={[
                        styles.headingText,
                        isSub && styles.subHeadingText,
                        isActive && { color: accentColor, fontWeight: '700' },
                      ]}
                      numberOfLines={2}
                    >
                      {h.label}
                    </Text>
                  </Pressable>
                );
              })}
            </RNScrollView>
          </OverlayBackground>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  handleContainer: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  handleTouchWrap: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  handle: {
    height: 60,
    borderRadius: 3,
  },
  overlayContainer: {
    position: 'absolute',
    right: 32,
    top: '10%',
    bottom: '10%',
    width: 240,
    zIndex: 9999,
  },
  overlayInner: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 20, 32, 0.85)',
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 2,
  },
  headingItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  subHeadingItem: {
    paddingLeft: 22,
  },
  activeHeadingItem: {
    borderLeftWidth: 2.5,
    borderLeftColor: '#FFFFFF',
  },
  headingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 17,
  },
  subHeadingText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
});

export default OutlineScrubber;
