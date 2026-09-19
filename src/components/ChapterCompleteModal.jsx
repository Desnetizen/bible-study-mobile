import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Line, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { useReducedMotion } from '../hooks/use-reduced-motion';

const CHAPTER_DATA = [
  { chapter: 1, title: 'A Decision That Changed Everything', icon: '🌿', image: require('../../assets/Chapters/daniel-chapter-1.png'), message: "You started where Daniel started — with a decision. Choosing God's way even when the world offers something easier takes real courage. You've taken your first step. Keep going!" },
  { chapter: 2, title: 'The Blueprint of History', icon: '🗿', image: require('../../assets/Chapters/daniel-chapter-2.png'), message: "Nebuchadnezzar's wisest men couldn't answer — but Daniel went to his knees first. History belongs to the God who reveals secrets. You just studied the blueprint of world history. Incredible!" },
  { chapter: 3, title: 'Through the Fire', icon: '🔥', image: require('../../assets/Chapters/daniel-chapter-3.png'), message: "Shadrach, Meshach, and Abednego walked into the fire and came out without even the smell of smoke. When you face your furnace, remember — the fourth Man is still walking in it with you." },
  { chapter: 4, title: 'Heaven Rules', icon: '👑', image: require('../../assets/Chapters/daniel-chapter-4.png'), message: "The mightiest king on earth had to learn that heaven rules. Pride is the one thing God consistently brings low. You just studied the most powerful lesson in humility ever recorded." },
  { chapter: 5, title: 'The Writing on the Wall', icon: '✍️', image: require('../../assets/Chapters/daniel-chapter-5.png'), message: "A party silenced by a hand. Belshazzar had every warning and ignored every one. This chapter is God's reminder that His patience has a purpose — and His word always comes to pass." },
  { chapter: 6, title: 'The Open Window', icon: '🦁', image: require('../../assets/Chapters/daniel-chapter-6.png'), message: "Daniel didn't close his window. He didn't hide his faith. He prayed anyway — and God shut the mouths of lions. Your faithfulness in small things builds a faith that survives the big tests." },
  { chapter: 7, title: "Heaven's Perspective", icon: '☁️', image: require('../../assets/Chapters/daniel-chapter-7.png'), message: "Empires rise and fall, but the Ancient of Days sits on His throne — unmoved, eternal, and completely in control. You just saw the whole sweep of history from heaven's perspective. Extraordinary!" },
  { chapter: 8, title: 'Gabriel Was Sent for You', icon: '⚔️', image: require('../../assets/Chapters/daniel-chapter-8.png'), message: "Kingdoms clash and powers rise, but Gabriel was sent personally to help Daniel understand. God cares enough about you to send heaven's best to make sure you get the picture." },
  { chapter: 9, title: 'The Answer Was Already Coming', icon: '🙏', image: require('../../assets/Chapters/daniel-chapter-9.png'), message: "Daniel prayed with his whole heart — confessing, interceding, believing. And before he even finished, the answer was on its way. You just studied one of the most precise prophecies in all of Scripture. Be proud." },
  { chapter: 10, title: 'More Than You Can See', icon: '✨', image: require('../../assets/Chapters/daniel-chapter-10.png'), message: "Twenty-one days of spiritual warfare happening behind the scenes — and Daniel didn't even know it. Your prayers are never falling on deaf ears. There is more happening in the unseen realm than you can imagine." },
  { chapter: 11, title: 'History Written in Advance', icon: '📜', image: require('../../assets/Chapters/daniel-chapter-10.png'), message: "History written centuries before it happened — fulfilled detail by detail. This is the longest and most detailed prophecy in the entire Bible, and you just finished it. That is no small thing!" },
  { chapter: 12, title: 'Shine Like the Stars', icon: '⭐', image: require('../../assets/Chapters/daniel-chapter-12.png'), message: "Michael stands up, the dead awake, and those who turn many to righteousness shine like the stars forever. You didn't just read a book. You glimpsed eternity. Well done — faithful servant." },
];

const renderRays = () => {
  const rays = [];
  const rayCount = 64; // dense fine lines
  const center = 120;
  
  for (let i = 0; i < rayCount; i++) {
    const angleRad = (i * 2 * Math.PI) / rayCount;
    const startRadius = 72; // starts just inside the 186px circle (radius 93)
    
    // Vary lengths for an organic shimmering effect
    let endRadius = 115;
    if (i % 3 === 0) endRadius = 125;
    if (i % 6 === 0) endRadius = 135;
    
    const x1 = center + startRadius * Math.cos(angleRad);
    const y1 = center + startRadius * Math.sin(angleRad);
    const x2 = center + endRadius * Math.cos(angleRad);
    const y2 = center + endRadius * Math.sin(angleRad);
    
    // Vary opacity for texture
    let opacity = 0.16;
    if (i % 3 === 0) opacity = 0.28;
    if (i % 6 === 0) opacity = 0.45;
    
    const strokeWidth = i % 3 === 0 ? 1.2 : 0.8;
    
    rays.push(
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#fbbf24" // gold/amber
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap="round"
      />
    );
  }
  return rays;
};

// Depends on nothing, so build it once instead of on every render.
const RAYS = renderRays();

const PARTICLE_COLORS = ['#fde68a', '#93c5fd', '#6ee7b7', '#f9a8d4', '#c4b5fd', '#fca5a5', '#fdba74'];
const PARTICLE_SHAPES = ['\u25a0', '\u25cf', '\u25b2', '\u25c6', '\u2605'];

function makeParticles(count = 28) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)],
    fontSize: 10 + Math.random() * 10,
    delay: Math.random() * 220,
    startX: (Math.random() - 0.5) * 60,
  }));
}

function Particle({ color, shape, fontSize, delay, startX, screenWidth, screenHeight }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  // Captured once. Reading these from props inside the effect would restart
  // every particle mid-flight whenever the window dimensions change.
  const flight = useRef({
    endX: (Math.random() - 0.5) * screenWidth * 0.9,
    endY: -(screenHeight * 0.55 + Math.random() * screenHeight * 0.25),
    scaleTo: 0.6 + Math.random() * 0.8,
    riseDuration: 1100 + Math.random() * 500,
    spin: (Math.random() - 0.5) * 6,
  }).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: flight.scaleTo, friction: 4, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: flight.endY, duration: flight.riseDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateX, { toValue: flight.endX, duration: flight.riseDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: flight.spin, duration: 1200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(700),
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, flight, opacity, rotate, scale, translateX, translateY]);

  const rotateDeg = rotate.interpolate({ inputRange: [-6, 6], outputRange: ['-360deg', '360deg'] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        bottom: 0,
        left: screenWidth / 2 + startX,
        color,
        fontSize,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }, { rotate: rotateDeg }],
      }}>
      {shape}
    </Animated.Text>
  );
}

function RingBurst({ visible }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.3);
    opacity.setValue(0.9);
    const anim = Animated.parallel([
      Animated.timing(scale, { toValue: 2.2, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [opacity, scale, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        borderColor: '#fde68a',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export default function ChapterCompleteModal({ visible, chapter, totalChapters = 12, onClose, onNextChapter }) {
  const reducedMotion = useReducedMotion();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.72)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(16)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const rayRotation = useRef(new Animated.Value(0)).current;

  const [particles, setParticles] = useState([]);
  const [burstKey, setBurstKey] = useState(0);
  const [internalVisible, setInternalVisible] = useState(false);

  const chapterData = CHAPTER_DATA.find((d) => d.chapter === chapter) ?? CHAPTER_DATA[0];
  const isLastChapter = chapter >= totalChapters;
  const progressPercent = chapter / totalChapters;

  const exitAnimRef = useRef(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!internalVisible || reducedMotion) return;
    
    // Slow pulsing for ambient effects
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    
    // Smooth infinite rotation for sunburst rays
    rayRotation.setValue(0);
    const rotateLoop = Animated.loop(
      Animated.timing(rayRotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [glowPulse, rayRotation, internalVisible, reducedMotion]);

  useEffect(() => {
    if (visible) {
      // A close may still be running. Cancel it so its completion callback
      // cannot unmount the modal in the middle of this entrance.
      exitAnimRef.current?.stop();
      exitAnimRef.current = null;
      hasOpenedRef.current = true;

      if (reducedMotion) {
        backdropOpacity.setValue(1);
        cardScale.setValue(1);
        cardOpacity.setValue(1);
        cardTranslateY.setValue(0);
        iconBounce.setValue(1);
        titleOpacity.setValue(1);
        titleTranslateY.setValue(0);
        messageOpacity.setValue(1);
        actionsOpacity.setValue(1);
        progressWidth.setValue(progressPercent);
        setParticles([]);
        setInternalVisible(true);
        return;
      }

      // Reset synchronously, before the commit that mounts the modal, so the
      // first painted frame is the start of the animation and not its end.
      backdropOpacity.setValue(0);
      cardScale.setValue(0.72);
      cardOpacity.setValue(0);
      cardTranslateY.setValue(40);
      iconBounce.setValue(0);
      titleOpacity.setValue(0);
      titleTranslateY.setValue(16);
      messageOpacity.setValue(0);
      actionsOpacity.setValue(0);
      progressWidth.setValue(0);

      setParticles(makeParticles());
      setBurstKey((k) => k + 1);
      setInternalVisible(true);

      const entrance = [
        Animated.parallel([
          Animated.timing(backdropOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(80),
            Animated.parallel([
              Animated.spring(cardScale, { toValue: 1, friction: 7, tension: 65, useNativeDriver: true }),
              Animated.timing(cardOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
              Animated.timing(cardTranslateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
            ]),
          ]),
        ]),
        Animated.sequence([Animated.delay(260), Animated.spring(iconBounce, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true })]),
        Animated.sequence([Animated.delay(380), Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(titleTranslateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ])]),
        Animated.sequence([Animated.delay(520), Animated.timing(messageOpacity, { toValue: 1, duration: 340, useNativeDriver: true })]),
        Animated.sequence([Animated.delay(680), Animated.timing(actionsOpacity, { toValue: 1, duration: 300, useNativeDriver: true })]),
        Animated.sequence([Animated.delay(500), Animated.timing(progressWidth, { toValue: progressPercent, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false })]),
      ];
      entrance.forEach((a) => a.start());
      return () => entrance.forEach((a) => a.stop());
    }

    // Nothing to close on first mount.
    if (!hasOpenedRef.current) return;

    if (reducedMotion) {
      setInternalVisible(false);
      setParticles([]);
      return;
    }

    const exit = Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.88, duration: 220, useNativeDriver: true }),
    ]);
    exitAnimRef.current = exit;
    exit.start(({ finished }) => {
      // An interrupted close still fires this callback, with finished === false.
      if (!finished) return;
      exitAnimRef.current = null;
      setInternalVisible(false);
      setParticles([]);
    });
    return () => exit.stop();
  }, [
    actionsOpacity,
    backdropOpacity,
    cardOpacity,
    cardScale,
    cardTranslateY,
    iconBounce,
    messageOpacity,
    progressPercent,
    progressWidth,
    reducedMotion,
    titleOpacity,
    titleTranslateY,
    visible,
  ]);

  const iconScale = iconBounce.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const glowOpacity = glowPulse.interpolate({
    inputRange: [1, 1.08],
    outputRange: [0.35, 0.65],
  });
  const rayRotateInterpolate = rayRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const progressBarWidth = progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const cardMaxWidth = Math.min(screenWidth - 40, 400);

  if (!internalVisible) return null;

  return (
    <Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { width: cardMaxWidth, backgroundColor: dark ? '#07101f' : '#ffffff', borderColor: dark ? 'rgba(184,134,11,0.2)' : 'rgba(37,99,235,0.15)', opacity: cardOpacity, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] }]}>

              {/* Gold top shimmer */}
              <View pointerEvents="none" style={{
                position: 'absolute',
                top: 0, left: 60, right: 60,
                height: 1,
                backgroundColor: 'rgba(251,191,36,0.25)',
                borderRadius: 999,
              }} />

              <View pointerEvents="none" style={{
                position: 'absolute', top: 20, alignSelf: 'center',
                width: 180, height: 180, borderRadius: 90,
                backgroundColor: dark ? 'rgba(37,99,235,0.09)' : 'rgba(219,234,254,0.5)'
              }} />

              <Animated.View pointerEvents="none" style={[styles.iconGlow, { backgroundColor: dark ? 'rgba(251,191,36,0.13)' : 'rgba(251,191,36,0.18)', transform: [{ scale: glowPulse }] }]} />

              <View style={[styles.chapterBadge, { backgroundColor: dark ? '#1e3a5f' : '#dbeafe' }]}>
                <Text style={[styles.chapterBadgeText, { color: dark ? '#93c5fd' : '#1d4ed8' }]}>CHAPTER {chapter} OF {totalChapters}</Text>
              </View>

              <Animated.View style={{
                width: 240,
                height: 240,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                overflow: 'visible',
                transform: [{ scale: iconScale }],
              }}>

                {/* Ambient Soft Glow Background */}
                <Animated.View pointerEvents="none" style={{
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  backgroundColor: 'rgba(251,191,36,0.12)',
                  transform: [{ scale: glowPulse }],
                  opacity: glowOpacity,
                }} />

                {!reducedMotion && <RingBurst key={burstKey} visible={visible} />}

                {/* Rotating Sunburst Rays */}
                <Animated.View pointerEvents="none" style={{
                  position: 'absolute',
                  width: 240,
                  height: 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ rotate: rayRotateInterpolate }],
                }}>
                  <Svg width="240" height="240" viewBox="0 0 240 240">
                    {RAYS}
                  </Svg>
                </Animated.View>

                {/* Outer metallic gold ring */}
                <View style={{
                  position: 'absolute',
                  width: 196,
                  height: 196,
                  borderRadius: 98,
                  borderWidth: 1.5,
                  borderColor: '#f5c542',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} />

                {/* Mid spacing ring (metallic gold gradient border simulator) */}
                <View style={{
                  position: 'absolute',
                  width: 193,
                  height: 193,
                  borderRadius: 96.5,
                  borderWidth: 2.5,
                  borderColor: '#9a7b2c',
                }} />

                {/* Inner gold border right around the image */}
                <View style={{
                  width: 186,
                  height: 186,
                  borderRadius: 93,
                  borderWidth: 2,
                  borderColor: '#f5c542',
                  overflow: 'hidden',
                  backgroundColor: '#07101f',
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}>
                  <Image
                    source={chapterData.image}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>

                {/* Overlapping Shield Badge */}
                <View style={{
                  position: 'absolute',
                  bottom: -16,
                  width: 104,
                  height: 114,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                  elevation: 8,
                }}>
                  <Svg width="104" height="114" viewBox="0 0 100 110" style={StyleSheet.absoluteFill}>
                    <Defs>
                      <SvgLinearGradient id="shieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#0d254c" />
                        <Stop offset="100%" stopColor="#050e1c" />
                      </SvgLinearGradient>
                    </Defs>
                    {/* Outer Shield Path */}
                    <Path
                      d="M 50, 12 Q 75, 8 90, 16 C 90, 50 85, 90 50, 108 C 15, 90 10, 50 10, 16 Q 25, 8 50, 12 Z"
                      fill="url(#shieldBg)"
                      stroke="#d4af37"
                      strokeWidth={2}
                    />
                    {/* Inner Inset Shield Path */}
                    <Path
                      d="M 50, 17 Q 73, 13 86, 20 C 86, 50 81, 86 50, 102 C 19, 86 14, 50 14, 20 Q 27, 13 50, 17 Z"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth={0.8}
                      opacity={0.8}
                    />
                    {/* Top Diamond Ornament */}
                    <Path
                      d="M 50, 20 L 52, 22 L 50, 24 L 48, 22 Z"
                      fill="#f5c542"
                    />
                    {/* Left Spark/Star */}
                    <Path
                      d="M 28, 43 Q 28, 48 23, 48 Q 28, 48 28, 53 Q 28, 48 33, 48 Q 28, 48 28, 43 Z"
                      fill="#f5c542"
                      opacity={0.95}
                    />
                    {/* Right Spark/Star */}
                    <Path
                      d="M 72, 43 Q 72, 48 67, 48 Q 72, 48 72, 53 Q 72, 48 77, 48 Q 72, 48 72, 43 Z"
                      fill="#f5c542"
                      opacity={0.95}
                    />
                    {/* Gold Crown at Bottom */}
                    <Path
                      d="M 39, 96 L 61, 96 L 63, 89 L 55, 92 L 50, 84 L 45, 92 L 37, 89 Z"
                      fill="#f5c542"
                    />
                    <Circle cx="37" cy="87" r="1" fill="#f5c542" />
                    <Circle cx="50" cy="82" r="1.2" fill="#f5c542" />
                    <Circle cx="63" cy="87" r="1" fill="#f5c542" />
                  </Svg>

                  {/* Shield Text Overlay */}
                  <View style={{
                    position: 'absolute',
                    top: 14,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}>
                    {/* DANIEL Book Title */}
                    <Text style={{
                      color: '#f5c542',
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 1.8,
                      fontFamily: 'serif',
                    }}>
                      DANIEL
                    </Text>

                    {/* Chapter Number Center */}
                    <View style={{
                      position: 'absolute',
                      top: 26,
                      left: 0,
                      right: 0,
                      height: 52,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{
                        color: '#f5c542',
                        fontSize: chapter > 9 ? 30 : 36,
                        fontWeight: 'bold',
                        fontFamily: 'serif',
                        includeFontPadding: false,
                        textAlign: 'center',
                      }}>
                        {chapter}
                      </Text>
                    </View>
                  </View>
                </View>

              </Animated.View>

              <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }], alignItems: 'center', gap: 4, width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
                  <View style={{ flex: 1, height: 0.5, backgroundColor: dark ? 'rgba(251,191,36,0.3)' : 'rgba(217,119,6,0.3)' }} />
                  <Text style={[styles.completedLabel, { color: dark ? '#fbbf24' : '#d97706' }]}>✦ Chapter Complete ✦</Text>
                  <View style={{ flex: 1, height: 0.5, backgroundColor: dark ? 'rgba(251,191,36,0.3)' : 'rgba(217,119,6,0.3)' }} />
                </View>
                <Text style={[styles.chapterTitle, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{chapterData.title}</Text>
              </Animated.View>

              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8, marginVertical: 4 }}>
                <View style={{ flex: 1, height: 0.5, backgroundColor: dark ? 'rgba(184,134,11,0.3)' : 'rgba(37,99,235,0.15)' }} />
                <Text style={{ fontSize: 14, color: '#b8860b' }}>♛</Text>
                <View style={{ flex: 1, height: 0.5, backgroundColor: dark ? 'rgba(184,134,11,0.3)' : 'rgba(37,99,235,0.15)' }} />
              </View>

              <Animated.Text style={[styles.message, { color: dark ? '#cbd5e1' : '#475569', opacity: messageOpacity }]}>{chapterData.message}</Animated.Text>

              <Animated.View style={{ opacity: actionsOpacity, width: '100%' }}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: dark ? '#64748b' : '#94a3b8' }]}>Daniel Progress</Text>
                  <Text style={[styles.progressLabel, { color: dark ? '#64748b' : '#94a3b8' }]}>{chapter}/{totalChapters}</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]}>
                  <Animated.View style={[styles.progressFill, { width: progressBarWidth, backgroundColor: isLastChapter ? '#16a34a' : '#2563eb' }]} />
                </View>
              </Animated.View>

              <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
                {isLastChapter ? (
                  <>
                    <Text style={[styles.finishedNote, { color: dark ? '#6ee7b7' : '#059669' }]}>🎉 You have completed the entire Book of Daniel!</Text>
                    <Pressable onPress={onClose} style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.82 : 1 }]}>
                      <Text style={styles.primaryButtonText}>Finish</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View style={{
                      width: '100%',
                      backgroundColor: dark ? 'rgba(14,26,48,0.8)' : 'rgba(239,246,255,0.8)',
                      borderRadius: 16,
                      borderWidth: 0.5,
                      borderColor: dark ? 'rgba(99,144,210,0.18)' : 'rgba(219,234,254,0.9)',
                      padding: 16,
                      gap: 12,
                      alignItems: 'center',
                    }}>
                      {/* book icon circle */}
                      <View style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: dark ? 'rgba(30,58,95,0.8)' : 'rgba(219,234,254,0.9)',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4,
                      }}>
                        <Text style={{ fontSize: 22 }}>📖</Text>
                      </View>
                      <Text style={[styles.nextPrompt, { color: dark ? '#94a3b8' : '#64748b' }]}>Would you like to continue to Chapter {chapter + 1}?</Text>
                      <View style={styles.buttonRow}>
                        <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, { borderColor: dark ? '#334155' : '#cbd5e1', opacity: pressed ? 0.72 : 1 }]}>
                          <Text style={[styles.secondaryButtonText, { color: dark ? '#94a3b8' : '#64748b' }]}>Not Now</Text>
                        </Pressable>
                        <Pressable onPress={onNextChapter} style={({ pressed }) => [styles.primaryButton, styles.primaryButtonFlex, { opacity: pressed ? 0.82 : 1 }]}>
                          <Text style={styles.primaryButtonText}>Next Chapter →</Text>
                        </Pressable>
                      </View>
                    </View>
                  </>
                )}
              </Animated.View>

            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Outside the card: styles.card sets overflow:'hidden', which was
              clipping the burst a few hundred pixels into its flight. */}
          {!reducedMotion && particles.length > 0 && (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {particles.map((p) => (
                <Particle
                  key={`${burstKey}-${p.id}`}
                  color={p.color}
                  shape={p.shape}
                  fontSize={p.fontSize}
                  delay={p.delay}
                  startX={p.startX}
                  screenWidth={screenWidth}
                  screenHeight={screenHeight}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.62)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: { borderRadius: 28, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center', gap: 16, overflow: 'hidden', elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.35, shadowRadius: 32 },
  iconGlow: { position: 'absolute', top: 40, width: 140, height: 140, borderRadius: 70 },
  chapterBadge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  chapterBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  icon: { fontSize: 68, lineHeight: 80 },
  completedLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  chapterTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2, lineHeight: 30 },
  divider: { width: '100%', height: 1, borderRadius: 1, marginVertical: 2 },
  message: { fontSize: 15, lineHeight: 24, textAlign: 'center', fontStyle: 'italic' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  progressTrack: { width: '100%', height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  actions: { width: '100%', gap: 12, marginTop: 4 },
  nextPrompt: { fontSize: 14, textAlign: 'center', fontWeight: '500' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButtonFlex: { flex: 1 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  secondaryButton: { borderRadius: 999, borderWidth: 1, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  finishedNote: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
});