import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

const CHAPTER_DATA = [
  { chapter: 1, title: 'A Decision That Changed Everything', icon: '🌿', message: "You started where Daniel started — with a decision. Choosing God's way even when the world offers something easier takes real courage. You've taken your first step. Keep going!" },
  { chapter: 2, title: 'The Blueprint of History', icon: '🗿', message: "Nebuchadnezzar's wisest men couldn't answer — but Daniel went to his knees first. History belongs to the God who reveals secrets. You just studied the blueprint of world history. Incredible!" },
  { chapter: 3, title: 'Through the Fire', icon: '🔥', message: "Shadrach, Meshach, and Abednego walked into the fire and came out without even the smell of smoke. When you face your furnace, remember — the fourth Man is still walking in it with you." },
  { chapter: 4, title: 'Heaven Rules', icon: '👑', message: "The mightiest king on earth had to learn that heaven rules. Pride is the one thing God consistently brings low. You just studied the most powerful lesson in humility ever recorded." },
  { chapter: 5, title: 'The Writing on the Wall', icon: '✍️', message: "A party silenced by a hand. Belshazzar had every warning and ignored every one. This chapter is God's reminder that His patience has a purpose — and His word always comes to pass." },
  { chapter: 6, title: 'The Open Window', icon: '🦁', message: "Daniel didn't close his window. He didn't hide his faith. He prayed anyway — and God shut the mouths of lions. Your faithfulness in small things builds a faith that survives the big tests." },
  { chapter: 7, title: "Heaven's Perspective", icon: '☁️', message: "Empires rise and fall, but the Ancient of Days sits on His throne — unmoved, eternal, and completely in control. You just saw the whole sweep of history from heaven's perspective. Extraordinary!" },
  { chapter: 8, title: 'Gabriel Was Sent for You', icon: '⚔️', message: "Kingdoms clash and powers rise, but Gabriel was sent personally to help Daniel understand. God cares enough about you to send heaven's best to make sure you get the picture." },
  { chapter: 9, title: 'The Answer Was Already Coming', icon: '🙏', message: "Daniel prayed with his whole heart — confessing, interceding, believing. And before he even finished, the answer was on its way. You just studied one of the most precise prophecies in all of Scripture. Be proud." },
  { chapter: 10, title: 'More Than You Can See', icon: '✨', message: "Twenty-one days of spiritual warfare happening behind the scenes — and Daniel didn't even know it. Your prayers are never falling on deaf ears. There is more happening in the unseen realm than you can imagine." },
  { chapter: 11, title: 'History Written in Advance', icon: '📜', message: "History written centuries before it happened — fulfilled detail by detail. This is the longest and most detailed prophecy in the entire Bible, and you just finished it. That is no small thing!" },
  { chapter: 12, title: 'Shine Like the Stars', icon: '⭐', message: "Michael stands up, the dead awake, and those who turn many to righteousness shine like the stars forever. You didn't just read a book. You glimpsed eternity. Well done — faithful servant." },
];

function Particle({ color, delay, startX, screenWidth, screenHeight }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const endX = (Math.random() - 0.5) * screenWidth * 0.9;
    const endY = -(screenHeight * 0.55 + Math.random() * screenHeight * 0.25);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 0.6 + Math.random() * 0.8, friction: 4, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: endY, duration: 1100 + Math.random() * 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateX, { toValue: endX, duration: 1100 + Math.random() * 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: (Math.random() - 0.5) * 6, duration: 1200, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(700),
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [delay, opacity, rotate, scale, screenHeight, screenWidth, startX, translateX, translateY]);

  const rotateDeg = rotate.interpolate({ inputRange: [-6, 6], outputRange: ['-360deg', '360deg'] });
  const shapes = ['■', '●', '▲', '◆', '★'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        bottom: 0,
        left: screenWidth / 2 + startX,
        color,
        fontSize: 10 + Math.random() * 10,
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
    Animated.parallel([
      Animated.timing(scale, { toValue: 2.2, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
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
        alignSelf: 'center',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export default function ChapterCompleteModal({ visible, chapter, totalChapters = 12, onClose, onNextChapter }) {
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

  const [particles, setParticles] = useState([]);
  const [burstKey, setBurstKey] = useState(0);
  const [internalVisible, setInternalVisible] = useState(false);

  const chapterData = CHAPTER_DATA.find((d) => d.chapter === chapter) ?? CHAPTER_DATA[0];
  const isLastChapter = chapter >= totalChapters;
  const progressPercent = chapter / totalChapters;

  useEffect(() => {
    if (!internalVisible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowPulse, internalVisible]);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
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

      const COLORS = ['#fde68a', '#93c5fd', '#6ee7b7', '#f9a8d4', '#c4b5fd', '#fca5a5', '#fdba74'];
      setParticles(Array.from({ length: 28 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 220,
        startX: (Math.random() - 0.5) * 60,
      })));
      setBurstKey((k) => k + 1);

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
      ]).start();

      Animated.sequence([Animated.delay(260), Animated.spring(iconBounce, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true })]).start();
      Animated.sequence([Animated.delay(380), Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ])]).start();
      Animated.sequence([Animated.delay(520), Animated.timing(messageOpacity, { toValue: 1, duration: 340, useNativeDriver: true })]).start();
      Animated.sequence([Animated.delay(680), Animated.timing(actionsOpacity, { toValue: 1, duration: 300, useNativeDriver: true })]).start();
      Animated.sequence([Animated.delay(500), Animated.timing(progressWidth, { toValue: progressPercent, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false })]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 0.88, duration: 220, useNativeDriver: true }),
      ]).start(() => setInternalVisible(false));
    }
  }, [
    actionsOpacity,
    backdropOpacity,
    cardOpacity,
    cardScale,
    cardTranslateY,
    glowPulse,
    iconBounce,
    messageOpacity,
    progressPercent,
    progressWidth,
    titleOpacity,
    titleTranslateY,
    visible,
  ]);

  const iconScale = iconBounce.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const progressBarWidth = progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const cardMaxWidth = Math.min(screenWidth - 40, 400);

  if (!internalVisible) return null;

  return (
    <Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { width: cardMaxWidth, backgroundColor: dark ? '#0c1526' : '#ffffff', borderColor: dark ? '#1e3a5f' : '#e0f2fe', opacity: cardOpacity, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] }]}>

              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {particles.map((p) => (
                  <Particle key={p.id} color={p.color} delay={p.delay} startX={p.startX} screenWidth={cardMaxWidth} screenHeight={screenHeight} />
                ))}
                <RingBurst key={burstKey} visible={visible} />
              </View>

              <Animated.View pointerEvents="none" style={[styles.iconGlow, { backgroundColor: dark ? 'rgba(251,191,36,0.13)' : 'rgba(251,191,36,0.18)', transform: [{ scale: glowPulse }] }]} />

              <View style={[styles.chapterBadge, { backgroundColor: dark ? '#1e3a5f' : '#dbeafe' }]}>
                <Text style={[styles.chapterBadgeText, { color: dark ? '#93c5fd' : '#1d4ed8' }]}>CHAPTER {chapter} OF {totalChapters}</Text>
              </View>

              <Animated.Text style={[styles.icon, { transform: [{ scale: iconScale }] }]}>{chapterData.icon}</Animated.Text>

              <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }], alignItems: 'center', gap: 4 }}>
                <Text style={[styles.completedLabel, { color: dark ? '#fbbf24' : '#d97706' }]}>✦ Chapter Complete ✦</Text>
                <Text style={[styles.chapterTitle, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{chapterData.title}</Text>
              </Animated.View>

              <View style={[styles.divider, { backgroundColor: dark ? '#1e3a5f' : '#e0f2fe' }]} />

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
                    <Text style={[styles.nextPrompt, { color: dark ? '#94a3b8' : '#64748b' }]}>Would you like to continue to Chapter {chapter + 1}?</Text>
                    <View style={styles.buttonRow}>
                      <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, { borderColor: dark ? '#334155' : '#cbd5e1', opacity: pressed ? 0.72 : 1 }]}>
                        <Text style={[styles.secondaryButtonText, { color: dark ? '#94a3b8' : '#64748b' }]}>Not Now</Text>
                      </Pressable>
                      <Pressable onPress={onNextChapter} style={({ pressed }) => [styles.primaryButton, styles.primaryButtonFlex, { opacity: pressed ? 0.82 : 1 }]}>
                        <Text style={styles.primaryButtonText}>Next Chapter →</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </Animated.View>

            </Animated.View>
          </TouchableWithoutFeedback>
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
