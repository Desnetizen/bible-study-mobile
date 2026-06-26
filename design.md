# Bible Study Mobile — Design System

> **Canonical reference**: The Home tab ([`app/(tabs)/index.tsx`](file:///c:/Users/desvo/bible-study-mobile/app/(tabs)/index.tsx)) is the quintessential model. Every new screen, component, or feature **must** match its visual language.

---

## 1. Color Palette

### 1.1 Background Tiers

| Token | Hex | Usage |
|---|---|---|
| **Background** | `#040f2d` | Root container, `StatusBar backgroundColor`, scroll view bg |
| **Background Alt** | `#07111F` | Detail screens (Babylon, Historical Context, etc.) |
| **Surface** | `#1a2947` | Elevated cards, lists (e.g. Recent Activity `activityList`) |
| **Surface Subtle** | `#0A1324` / `#0C1420` | Secondary cards, info panels, era cards |
| **Surface Glass** | `rgba(255,255,255,0.04)` | Glass-morphism inner fill (quick-access cards) |
| **Splash BG** | `#060e1f` | Animated splash screen container |

### 1.2 Primary & Accent Colors

| Token | Hex | Role |
|---|---|---|
| **Primary Blue** | `#2463ff` | Main CTA buttons, active states, progress bars, milestone icons |
| **Soft Blue** | `#2f8cff` | Progress ring stroke, secondary blue accents |
| **Sky Blue** | `#5fa5ff` | Section icon placeholders, verse reference links |
| **Light Blue** | `#93C5FD` | Tab bar active tint (dark mode), explore button text |
| **Blue Glow** | `rgba(55, 139, 255, 0.28)` | Card border glow (study card) |
| **Amber/Gold** | `#E8A838` | Historical context accent, timeline tab tint |
| **Chapter Gold** | `#f1a23a` | Study card chapter number |
| **Streak Amber** | `#f59e0b` | Streak badge active state |
| **Emerald** | `#10b981` | Connections card, "Completed" activity icon bg |
| **Orange** | `#ff9500` | Historical Context card, "Note" activity icon |
| **Cyan** | `#06b6d4` | Patterns card, "Explored" activity icon |
| **Purple** | `#a855f7` | Bookmark/Highlight activity icon |
| **Lavender** | `#A78BFA` | Greek era accent |
| **Persian Teal** | `#4ECDC4` | Persian era accent |
| **Danger Red** | `#EF4444` / `#F87171` | Special timeline nodes, Roman era accent |

### 1.3 Text Colors

| Token | Hex / RGBA | Usage |
|---|---|---|
| **Text Primary** | `#ffffff` | Headings, card titles, button text |
| **Text Warm** | `#e6eeff` / `#e5efff` | Hero kicker, warm body text |
| **Text Body** | `#dde9ff` / `#dce9ff` / `#c8deff` | Descriptions, verse button text |
| **Text Secondary** | `#b6c9ea` | Quick-access card descriptions, "View All" button |
| **Text Muted** | `#c8d3e8` | Verse date, light metadata |
| **Text Tertiary** | `#8b96a8` | Activity timestamps, verse book label |
| **Text Dim** | `#94A3B8` | Hero subtitles in detail screens, era summaries |
| **Text Inactive** | `#6b7a94` | Streak badge inactive label |
| **Text Date** | `#64748B` | Era date ranges |
| **Text Separator** | `rgba(255,255,255,0.4)` | Dot separators |

### 1.4 Border & Divider Colors

| Token | Value | Usage |
|---|---|---|
| **Border Card** | `rgba(55, 139, 255, 0.12)` – `rgba(55, 139, 255, 0.28)` | Card borders, activity list |
| **Border Verse** | `rgba(143, 193, 255, 0.12)` | Verse card border |
| **Border Accent** | `{color} + '40'` | Quick-access card borders (40 = 25% opacity hex suffix) |
| **Border CTA** | `rgba(10, 92, 255, 0.45)` | Verse "Open verse" button border |
| **Divider Row** | `rgba(255, 255, 255, 0.06)` | Activity row bottom divider |
| **Divider Subtle** | `rgba(255, 255, 255, 0.08)` | "View All" button border, sub-nav bar |
| **Tab Bar Border** | `rgba(148, 163, 184, 0.25)` (dark) | Tab bar top border |

### 1.5 Opacity Conventions

Use the **hex suffix** pattern for quick opacity on accent colors:

| Suffix | Opacity | Example |
|---|---|---|
| `'12'` | ~7% | Interior gradient glow: `color + '12'` |
| `'20'` | ~12% | Button background: `color + '20'` |
| `'22'` | ~13% | Card border: `color + '22'` |
| `'40'` | ~25% | Card border glow: `color + '40'` |
| `'55'` | ~33% | Bottom-sheet handle: `color + '55'` |
| `'60'` | ~38% | Active event row border: `color + '60'` |

For more precise opacity control, use `rgba()` or the `hexToRgba()` utility from [`lib/colors.ts`](file:///c:/Users/desvo/bible-study-mobile/lib/colors.ts).

---

## 2. Typography

### 2.1 Font Families

| Token | Value | Usage |
|---|---|---|
| **Sans** | `'Inter'` | Default for all body text, labels, buttons |
| **Display** | `'Cinzel'` | Section titles, hero titles on detail screens, quote symbols |
| **System** | Platform `Fonts` map | Fallback (see [`constants/theme.ts`](file:///c:/Users/desvo/bible-study-mobile/constants/theme.ts)) |

### 2.2 Type Scale

All sizes are in `px` (React Native points). Use these exact values:

| Name | Size | Line Height | Weight | Example Usage |
|---|---|---|---|---|
| **Display** | 30–32 | 34–38 | 600–800 | Hero heading, study chapter number |
| **Hero Kicker** | 26 | 30 | 700 | "Welcome back," greeting |
| **Title Large** | 28–30 | – | bold | Detail screen hero title (Cinzel) |
| **Title** | 18 | 22 | 600 | Section titles |
| **Subtitle** | 15–16 | 21–22 | 600 | Quick-access card title, study title |
| **Body** | 13–14 | 17–18 | 400–600 | Labels, button text, activity labels |
| **Caption** | 11–12 | 14–17 | 400–600 | Descriptions, verse text, study desc |
| **Micro** | 9–10 | 12–13 | 500–700 | Verse book label, date, fact labels |
| **Eyebrow** | 11–12 | – | 700–800 | Era labels, section eyebrows (uppercase, letter-spacing 1–1.5) |

### 2.3 Typography Rules

- **All uppercase labels** use `letterSpacing: 0.8–1.5` and `fontWeight: '700'–'800'`
- **Verse references** use `fontWeight: '700'`, `color: '#5fa5ff'`
- **Italic** is reserved for verse text: `fontStyle: 'italic'`
- **Tabular numbers** for progress ring: `fontVariant: ['tabular-nums']`
- **Hero heading character-split**: Individual `<Animated.Text>` per character with staggered `FadeInDown` entry

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (8px Base)

| Token | Value | Usage |
|---|---|---|
| `space-xs` | 4 | Gap between micro elements |
| `space-sm` | 6–8 | Inner card gaps, icon margins |
| `space-md` | 12 | Card margins, section gaps, grid gaps |
| `space-lg` | 16 | Page padding, section padding |
| `space-xl` | 24 | Section bottom margins |
| `space-2xl` | 32 | Large section separators |

### 3.2 Content Layout

```
streamContent: { padding: 16, paddingBottom: 120 }
```

- **Page padding**: `16px` horizontal
- **Bottom padding**: `120px` (clears tab bar)
- **Hero**: Full-bleed (negative horizontal margin: `marginHorizontal: -16`)
- **Cards**: `12–16px` margin-bottom between cards
- **Grid**: 2-column, `48%` width per card, `12px` gap

### 3.3 Touch Targets

All interactive elements must meet **44×44pt minimum**:
- Buttons: `minHeight: 44`, with `paddingVertical: 10–12`, `paddingHorizontal: 16`
- Icon buttons: `width: 38, height: 38` minimum
- Quick-access buttons: `minHeight: 44, minWidth: '100%'`

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| **radius-sm** | 2–4 | Progress bar segments, dividers |
| **radius-md** | 6–8 | Small buttons, verse button, CTA buttons |
| **radius-lg** | 12–14 | Cards, explore cards, era cards |
| **radius-xl** | 16 | Study card, quote card |
| **radius-2xl** | 20–24 | Quick-access cards, pill badges, activity list, bottom sheet |
| **radius-full** | 50% of size | Circles (icons, progress ring, streak pill) |

---

## 5. Gradients & Overlays

### 5.1 Hero Gradients (4-edge fade system)

The hero banner uses **four directional `LinearGradient` overlays** to create a cinematic vignette:

```
Left:    ['rgba(4,15,45,0.9)', 'transparent']         width: 80px
Right:   ['transparent', 'rgba(4,15,45,0.9)']         width: 80px
Top:     ['rgba(4,15,45,0.5)', 'transparent']          height: 50px
Bottom:  ['transparent', 'rgba(4,15,45,0.98)']         height: 170px (strongest)
```

### 5.2 Card Image Overlays

**Study card** (left-to-right + bottom):
```jsx
// Left → Right text readability
colors={['rgba(3,10,28,0.95)', 'rgba(3,10,28,0.6)', 'rgba(3,10,28,0.15)']}

// Bottom fade
colors={['transparent', 'rgba(3,10,28,0.85)', 'rgba(3,10,28,0.98)']}
locations={[0, 0.55, 1]}
```

**Verse card** (left → right, multi-stop):
```jsx
colors={['#011634', '#011634', 'rgba(1,22,52,0.92)', 'rgba(1,22,52,0.4)', 'transparent']}
locations={[0, 0.35, 0.55, 0.75, 1]}
```

**Detail hero** (multi-layer):
```jsx
// Depth layer
colors={['rgba(7,17,31,0.4)', 'rgba(7,17,31,0.8)', '#07111F']}
locations={[0, 0.6, 1]}

// Accent wash (diagonal)
colors={[hexToRgba(ACCENT, 0.15), 'rgba(7,17,31,0)']}
start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.8 }}
```

### 5.3 Splash Loading Bar Gradient

```jsx
colors={['#8f6420', '#d6a747', '#fff0a8']}  // Dark gold → bright gold → pale gold
```

---

## 6. Elevation & Shadows

React Native shadows (iOS only, Android uses `elevation`):

| Level | shadowOffset | shadowOpacity | shadowRadius | elevation | Usage |
|---|---|---|---|---|---|
| **Low** | `{0, 4}` | 0.04 | 6 | 3 | Fact cards |
| **Medium** | `{0, 6}` | 0.08–0.14 | 10–12 | 4 | Era cards, quote cards |
| **High** | `{0, -4}` | 0.4 | 12 | 24 | Bottom sheet |

- **Shadow colors** match the card accent (e.g. `shadowColor: '#2563EB'` for blue cards, `shadowColor: ACCENT` for era cards)

---

## 7. Glass-Morphism

Used on **Quick-Access cards** via `expo-blur`:

```jsx
<BlurView intensity={18} tint="dark" style={[styles.quickAccessCard, { borderColor: item.color + '40' }]}>
  <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: 16 }}>
    {/* content */}
  </View>
</BlurView>
```

Key properties:
- `intensity={18}` — subtle blur
- `tint="dark"` — dark glass
- Inner fill: `rgba(255,255,255,0.04)`
- Colored border: accent color at 25% opacity (`+ '40'`)

---

## 8. Animation Patterns

### 8.1 Entry Animations (Reanimated)

All sections use **staggered entrance** via `FadeInDown` / `FadeInUp`:

```
Hero:         FadeInDown.delay(80).springify()
Study card:   FadeInDown.delay(200).springify()
Verse card:   FadeInUp.delay(260).duration(500)
Badges:       FadeInDown.delay(320).springify()
Quick Access: FadeInDown.delay(360).springify()
Recent:       FadeInDown.delay(420).springify()
```

**Quick-access cards** get per-item stagger:
```
FadeInDown.delay(300 + index * 60).springify()
```

**Activity rows** get per-item stagger:
```
FadeInDown.delay(index * 80).springify()
```

**Character-by-character hero heading**:
```
FadeInDown.delay(200 + index * 40).springify()
```

### 8.2 Detail Screen Entries (RN Animated API)

For screens using React Native's built-in `Animated`:

```js
// Easing curve (used everywhere in detail screens)
Easing.bezier(0.23, 1, 0.32, 1)    // Strong ease-out (Emil's framework)

// Entry animation
Animated.parallel([
  Animated.timing(fadeAnim, { toValue: 1, duration: 350 }),
  Animated.timing(slideAnim, { toValue: 0, duration: 350 }),
])

// Press feedback
Animated.timing(pressScale, { toValue: 0.965, duration: 120 })  // Press in
Animated.timing(pressScale, { toValue: 1, duration: 160 })      // Press out
```

### 8.3 Micro-Animations

| Animation | Implementation | Duration |
|---|---|---|
| **Shiny sweep** on CTA button | `withRepeat(withTiming(400, { duration: 2200 }), -1, false)` — translating a gradient strip | 2200ms loop |
| **Aurora glow** behind study card | `withRepeat(withTiming(0.22, { duration: 3000 }), -1, true)` — pulsing opacity 0.10↔0.22 | 3000ms bounce |
| **Hero image crossfade** | `withTiming(1, { duration: 1000 })` on opacity | 1000ms, every 2min |
| **Image load fade-in** | `withTiming(1, { duration: 500 })` | 500ms |
| **Hero parallax** | `interpolate(scrollY, [0, 300], [0, -80])` | Continuous |
| **Verse parallax** | `interpolate(scrollY, [0, 600], [0, -40])` | Continuous |
| **Press scale** (spring) | `withSpring(0.96)` press in, `withSpring(1)` press out | Spring physics |
| **3D tilt** on cards | Pan gesture → `rotateX/rotateY` ±8°, `perspective: 800` | Spring reset |
| **Progress ring** | `withTiming(progress, { duration: 1200 })` + `useAnimatedReaction` for display text | 1200ms |
| **Splash loading bar** | Fill to 70% in 1800ms → crawl to 85% in 2000ms → snap to 100% on ready | ~4000ms total |
| **Splash bar glow** | `withRepeat` opacity 0.4↔0.8, 1000ms each direction | Infinite bounce |
| **Streak milestone bounce** | `withSequence(withSpring(1.18, {damping:4}), withSpring(1, {damping:8}))` | Spring physics |

### 8.4 Splash Screen Exit

```
1. Cancel glow animation
2. Fill loading bar to 100% (proportional duration: remaining% × 15ms, clamp 400–1000ms)
3. Scale content to 1.06 (portal zoom effect, 600ms)
4. Fade container to 0 (600ms, Easing.bezier(0.25, 0.1, 0.25, 1))
5. Call onAnimationComplete
```

---

## 9. Component Patterns

### 9.1 Card Anatomy

Every card follows this structure:

```
┌─────────────────────────────┐  ← borderRadius, borderWidth: 1, borderColor (accent-glow)
│ [Background Image Layer]     │  ← absolute fill, with gradient overlay(s)
│ [Optional: Aurora/Glow SVG]  │  ← absolute, z-index 0, animated opacity
│                              │
│   [Content Layer]            │  ← padding 12–16, z-index 1
│     [Eyebrow / Label]        │  ← uppercase, small, accent color
│     [Title]                  │  ← white, bold
│     [Description]            │  ← muted text, 2-line max
│     [Action / Button]        │  ← pill or full-width
│                              │
└─────────────────────────────┘
```

### 9.2 Section Headers

```jsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
  <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#5fa5ff' }} />
  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', fontFamily: 'Cinzel' }}>
    Section Title
  </Text>
</View>
```

### 9.3 Detail Screen Hero

```
┌──────────────────────────────────────┐
│ [ImageBackground - full width]        │
│   [LinearGradient - depth]            │
│   [LinearGradient - accent wash]      │
│                                       │
│   [Back Button]  ← circular, accent   │
│                                       │
│   [Eyebrow]      ← UPPERCASE, accent  │
│   [Title]        ← Cinzel, bold       │
│   [Date Badge]   ← pill, accent       │
└──────────────────────────────────────┘
│ [Sub-Navigation Bar]                  │
│   Overview | Places | Read            │
│   ─── active indicator ───            │
└──────────────────────────────────────┘
```

### 9.4 Bottom Sheet Modal

```
- Backdrop: rgba(0,0,0,0.75)
- Sheet BG: #0F1E30
- Border radius: 22 (top corners only)
- Border: rgba(148,163,184,0.18)
- Handle: 36×4, borderRadius 2, bg: accent + '55'
- Entry: translateY 900→0, 300ms, Easing.bezier(0.32, 0.72, 0, 1)
- Exit: translateY 0→900, 250ms, Easing.bezier(0.25, 1, 0.5, 1)
```

### 9.5 Skeleton Loading

Render skeleton placeholders while images load, then fade in the real content:

```jsx
// Show skeleton when image hasn't loaded
{!imageLoaded && <ImageSkeleton width="100%" height="100%" borderRadius={0} />}

// Fade in actual content
const loadedOpacity = useSharedValue(0);
const onImageLoad = () => { loadedOpacity.set(withTiming(1, { duration: 500 })); };
<Animated.View style={useAnimatedStyle(() => ({ opacity: loadedOpacity.get() }))}>
  <ImageBackground onLoad={onImageLoad} ... />
</Animated.View>
```

### 9.6 Interactive Press Feedback

**Option A — Spring scale (Reanimated)**:
```jsx
onPressIn={() => scale.set(withSpring(0.96))}
onPressOut={() => scale.set(withSpring(1))}
```

**Option B — Timed scale (RN Animated)**:
```jsx
onPressIn  → Animated.timing(scale, { toValue: 0.965, duration: 120 })
onPressOut → Animated.timing(scale, { toValue: 1, duration: 160 })
```

**Option C — Style callback** (simple):
```jsx
<Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}>
```

---

## 10. Tab Bar

```jsx
tabBarStyle: {
  backgroundColor: 'rgba(7, 17, 31, 0.9)',     // Dark glass
  borderTopColor: 'rgba(148, 163, 184, 0.25)',  // Subtle separator
  height: 80,
  paddingTop: 8,
}

// Default tints (dark mode)
activeTint:   '#93C5FD'
inactiveTint: '#94A3B8'

// Custom tints per tab
Timeline:          active '#E8A838', inactive '#8B7D6B'
Historical Context: active '#C9A84C', inactive '#9A9A8A'
```

---

## 11. Era / Theme Color Map

Each historical era has a dedicated accent color used throughout its screens:

| Era | Accent | Detail Route |
|---|---|---|
| Pre-Exilic | `#E8A838` | `/pre-exilic-detail` |
| Babylonian | `#E8A838` | `/babylon-detail` |
| Medo-Persian | `#4ECDC4` | `/medo-persian-detail` |
| Greek Empire | `#A78BFA` | `/greek-detail` |
| Roman Empire | `#F87171` | `/roman-detail` |

Apply the accent color to: eyebrow text, icons, badge borders, timeline nodes, card border glow (`hexToRgba(ACCENT, 0.18)`), back button chevron, section headers, and CTA buttons.

---

## 12. Iconography

- **Icon library**: `lucide-react-native`
- **Custom icons**: PNG assets in `assets/Icons/` rendered via `expo-image`
- **Icon sizing**:
  - Tab bar: `24×24`
  - Card icons: `32×32` (in `56×56` circle container)
  - Inline icons: `12–16` with `strokeWidth: 2–2.4`
  - Timeline nodes: `18` in `44×44` circle with `borderWidth: 2`
- **Icon tinting**: Tab bar icons use `tintColor={color}` from tab bar props

---

## 13. Image Handling

- **Library**: `expo-image` (`Image`, `ImageBackground`)
- **Cache policy**: `cachePolicy="memory-disk"` on all images
- **Transitions**: `transition={300}` for smooth image swaps
- **Content fit**: `contentFit="cover"` for backgrounds, `contentFit="contain"` for logos/icons
- **Hero rotation**: Crossfade between images every 2 minutes with `withTiming` opacity
- **Chapter artwork**: Mapped per chapter number with custom gradient overlays

---

## 14. Accessibility

- Progress elements use `accessibilityRole="progressbar"` with `accessibilityValue={{ min, max, now }}`
- Interactive elements use `accessibilityRole="button"` with descriptive `accessibilityLabel`
- Touch targets enforce `minHeight: 44` for all tappable areas
- Verse text is `selectable` for copy functionality
- Splash screen uses `pointerEvents` toggling: `'auto'` during entry, `'none'` during exit

---

## 15. Quick Reference — New Screen Checklist

When creating a new screen, apply these patterns from the index page:

- [ ] `backgroundColor: '#040f2d'` (or `#07111F` for detail screens)
- [ ] `StatusBar barStyle="light-content"` with matching background
- [ ] Use `useSafeAreaInsets()` for `paddingTop` on hero and `paddingBottom` on scroll content
- [ ] Staggered `FadeInDown.delay(N).springify()` entry for each section
- [ ] Image backgrounds with multi-layer gradient overlays
- [ ] Skeleton loading placeholders with `withTiming` fade-in on load
- [ ] Card borders using accent color at low opacity
- [ ] `fontFamily: 'Inter'` for all text, `'Cinzel'` for display titles
- [ ] Animated press feedback (spring scale) on all interactive elements
- [ ] `minHeight: 44` on all buttons and touch targets
- [ ] Match the spacing scale (8px base) — don't invent new spacing values
- [ ] Use `hexToRgba()` from `lib/colors.ts` for computed opacity values
