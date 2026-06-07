import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BookOpenText,
  Search,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { characterProfiles } from '../../Data/characterProfile';

const ICONS = {
  bible: require('../../assets/Icons/Bible.png'),
  angels: require('../../assets/Icons/Angels.png'),
  companions: require('../../assets/Icons/Companions.png'),
  crown: require('../../assets/Icons/crown.png'),
  official: require('../../assets/Icons/Official.png'),
  scroll: require('../../assets/Icons/Scroll.png'),
};

const FILTERS = [
  { id: 'All', label: 'All', icon: ICONS.bible },
  { id: 'Prophets', label: 'Prophets', icon: ICONS.scroll },
  { id: 'Kings', label: 'Kings', icon: ICONS.crown },
  { id: 'Officials', label: 'Officials', icon: ICONS.official },
  { id: 'Companions', label: 'Companions', icon: ICONS.companions },
  { id: 'Angels', label: 'Angels', icon: ICONS.angels },
];

const CHARACTER_REGIMES = {
  Daniel: 'Babylon & Persia',
  Hananiah: 'Babylon',
  Mishael: 'Babylon',
  Azariah: 'Babylon',
  'Nebuchadnezzar II': 'Babylonian Empire',
  Belshazzar: 'Babylonian Empire',
  'Darius the Mede': 'Medo-Persia',
  'Cyrus the Great': 'Persia',
  Gabriel: 'Heavenly Kingdom',
  Michael: 'Heavenly Kingdom',
  Ashpenaz: 'Babylon',
  Arioch: 'Babylon',
};

const PORTRAIT_POSITIONS = {
  Daniel: { card: '50% 0%', profile: '50% 8%' },
  Hananiah: { card: '50% 0%', profile: '50% 8%' },
  Mishael: { card: '50% 3%', profile: '50% 10%' },
  Azariah: { card: '50% 0%', profile: '50% 8%' },
  'Nebuchadnezzar II': { card: '50% 8%', profile: '50% 14%' },
  Belshazzar: { card: '50% 8%', profile: '50% 14%' },
  'Darius the Mede': { card: '50% 24%', profile: '50% 25%' },
  'Cyrus the Great': { card: '50% 8%', profile: '50% 14%' },
  Gabriel: { card: '50% 6%', profile: '50% 12%' },
  Michael: { card: '50% 4%', profile: '50% 10%' },
  Ashpenaz: { card: '50% 6%', profile: '50% 12%' },
  Arioch: { card: '50% 16%', profile: '50% 18%' },
};

const CONTAINED_CARD_PORTRAITS = new Set([
  'Daniel',
  'Hananiah',
  'Mishael',
  'Azariah',
  'Nebuchadnezzar II',
  'Belshazzar',
  'Cyrus the Great',
  'Gabriel',
  'Michael',
  'Ashpenaz',
]);

function cleanText(value) {
  return String(value ?? '')
    .replace(/â€“|â€”/g, '-')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€¦/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCharacterTags(character) {
  const haystack = `${character.role} ${character.era} ${character.status} ${character.name}`.toLowerCase();
  const tags = [];

  if (haystack.includes('prophet')) tags.push('Prophets');
  if (haystack.includes('king') || haystack.includes('regent')) tags.push('Kings');
  if (/(official|eunuch|guard|administrator|statesman|adviser|courtier)/.test(haystack)) tags.push('Officials');
  if (/(companion|noble)/.test(haystack)) tags.push('Companions');
  if (/(angel|archangel|heavenly)/.test(haystack)) tags.push('Angels');

  return tags;
}

function getRoleIconSource(role = '') {
  const value = role.toLowerCase();

  if (value.includes('angel') || value.includes('archangel') || value.includes('heavenly')) return ICONS.angels;
  if (value.includes('prophet') || value.includes('messenger')) return ICONS.scroll;
  if (value.includes('companion') || value.includes('noble')) return ICONS.companions;
  if (
    value.includes('official') ||
    value.includes('eunuch') ||
    value.includes('court') ||
    value.includes('administrator') ||
    value.includes('guard') ||
    value.includes('captain') ||
    value.includes('executioner') ||
    value.includes('officer') ||
    value.includes('master')
  ) {
    return ICONS.official;
  }
  if (value.includes('king') || value.includes('regent')) return ICONS.crown;

  return ICONS.bible;
}

function parseBibleReference(ref) {
  const normalized = cleanText(ref).replace(/[–—]/g, '-');
  const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+))?/);

  if (!match) {
    return null;
  }

  return {
    book: match[1].trim(),
    chapter: Number(match[2]),
    verse: match[3] ? Number(match[3]) : null,
  };
}

function getServedRegime(character) {
  return CHARACTER_REGIMES[character.name] ?? cleanText(character.era);
}

function getPortraitPosition(character, large = false) {
  const position = PORTRAIT_POSITIONS[character.name];

  if (position) {
    return large ? position.profile : position.card;
  }

  return large ? '50% 24%' : '50% 22%';
}

function CharacterArtwork({ character, large = false }) {
  const roleIconSource = getRoleIconSource(character.role);
  const image = character.landingImage || character.image;
  const containerStyle = [styles.artwork, large && styles.profileArtwork];
  const iconStyle = large ? styles.roleArtworkIconLarge : styles.roleArtworkIcon;
  const useContainedPortrait = !large && CONTAINED_CARD_PORTRAITS.has(character.name);

  if (image) {
    return (
      <View style={containerStyle}>
        <Image
          source={image}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          contentPosition={getPortraitPosition(character, large)}
          transition={250}
        />
        {useContainedPortrait ? (
          <>
            <View style={styles.portraitBackdrop} />
            <Image
              source={image}
              style={styles.containedPortraitImage}
              contentFit="contain"
              contentPosition="center"
              transition={250}
            />
          </>
        ) : null}
        <LinearGradient
          colors={['rgba(3,8,20,0)', 'rgba(3,8,20,0.52)', 'rgba(3,8,20,0.96)']}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.artBadge}>
          <Image source={roleIconSource} style={styles.artBadgeIcon} contentFit="contain" tintColor="#d6ad57" />
        </View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: character.color }]}>
      <LinearGradient
        colors={[`${character.color}99`, '#071225']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.artBadge}>
        <Image source={roleIconSource} style={styles.artBadgeIcon} contentFit="contain" tintColor="#d6ad57" />
      </View>
      <Image source={roleIconSource} style={iconStyle} contentFit="contain" tintColor="#d6ad57" />
    </View>
  );
}

function CharacterCard({ character, onPress, compact }) {
  const regime = getServedRegime(character);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.cardCompact : styles.cardWide,
        pressed && styles.cardPressed,
      ]}
    >
      <CharacterArtwork character={character} />
      <View style={styles.cardBody}>
        <Text selectable numberOfLines={1} style={styles.cardName}>{character.name}</Text>
        <Text selectable numberOfLines={1} style={styles.cardRole}>{cleanText(character.role)}</Text>
        <Text selectable numberOfLines={1} style={styles.cardRegime}>{regime}</Text>
        <Text selectable numberOfLines={2} style={styles.cardDescription}>
          {cleanText(character.description)}
        </Text>
      </View>
    </Pressable>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text selectable style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function CharactersTabScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const compactCards = width < 720;

  const filteredCharacters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return characterProfiles.filter((character) => {
      const haystack = cleanText(
        `${character.name} ${character.role} ${character.era} ${character.status} ${character.hebrewMeaning} ${character.babylonianMeaning}`
      ).toLowerCase();
      const tags = getCharacterTags(character);
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = activeFilter === 'All' || tags.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, searchTerm]);

  const openScripture = (ref) => {
    const parsed = parseBibleReference(ref);

    if (!parsed) {
      return;
    }

    router.push({
      pathname: '/bible',
      params: {
        book: parsed.book,
        chapter: String(parsed.chapter),
        ...(parsed.verse ? { verse: String(parsed.verse) } : {}),
      },
    });
  };

  if (selectedCharacter) {
    const selectedRegime = getServedRegime(selectedCharacter);

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#071225" />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.profileContent, { paddingTop: insets.top + 14 }]}
        >
          <Pressable onPress={() => setSelectedCharacter(null)} style={styles.backButton}>
            <ArrowLeft size={18} color="#f1d78c" />
            <Text style={styles.backButtonText}>Characters</Text>
          </Pressable>

          <View style={styles.profileHero}>
            <CharacterArtwork character={selectedCharacter} large />
            <View style={styles.profileHeroCopy}>
              <View style={styles.profileRolePill}>
                <Text selectable style={styles.profileRolePillText}>{cleanText(selectedCharacter.role)}</Text>
              </View>
              <Text selectable style={styles.profileName}>{selectedCharacter.name}</Text>
              <Text selectable style={styles.profileMeaning}>{cleanText(selectedCharacter.hebrewMeaning)}</Text>
              <Text selectable style={styles.profileDescription}>{cleanText(selectedCharacter.description)}</Text>
            </View>
          </View>

          <View style={styles.metadataGrid}>
            {[
              ['Regime(s)', selectedRegime],
              ['Era', selectedCharacter.era],
              ['Status', selectedCharacter.status],
              ['First Mention', selectedCharacter.firstMention],
              ['Babylonian Name', selectedCharacter.babylonianName],
            ].map(([label, value]) => (
              <View key={label} style={styles.metadataCard}>
                <Text selectable style={styles.metadataLabel}>{label}</Text>
                <Text selectable style={styles.metadataValue}>{cleanText(value)}</Text>
              </View>
            ))}
          </View>

          <Section title="Character Traits">
            <View style={styles.traitsList}>
              {selectedCharacter.characteristics?.map((trait) => (
                <View key={trait.label} style={styles.traitRow}>
                  <View style={styles.traitHeader}>
                    <Text selectable style={styles.traitLabel}>{cleanText(trait.label)}</Text>
                    <Text selectable style={styles.traitValue}>{trait.value}%</Text>
                  </View>
                  <View style={styles.traitTrack}>
                    <View
                      style={[
                        styles.traitFill,
                        { width: `${trait.value}%`, backgroundColor: selectedCharacter.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Key Moments">
            <View style={styles.momentList}>
              {selectedCharacter.keyMoments?.map((moment, index) => (
                <View key={moment.title} style={styles.momentRow}>
                  <View style={styles.momentNumber}>
                    <Text style={styles.momentNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.momentCopy}>
                    <Text selectable style={styles.momentTitle}>{cleanText(moment.title)}</Text>
                    <Text selectable style={styles.momentText}>{cleanText(moment.description)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Scripture References">
            <View style={styles.scriptureList}>
              {selectedCharacter.scriptures?.map((entry) => (
                <Pressable key={entry.ref} onPress={() => openScripture(entry.ref)} style={styles.scriptureRow}>
                  <View style={styles.scriptureCopy}>
                    <Text selectable style={styles.scriptureRef}>{cleanText(entry.ref)}</Text>
                    <Text selectable style={styles.scriptureDescription}>{cleanText(entry.description)}</Text>
                  </View>
                  <BookOpenText size={18} color="#e1b64b" />
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Quick Note">
            <Text selectable style={styles.quickNote}>{cleanText(selectedCharacter.quickNote)}</Text>
          </Section>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071225" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 14 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text selectable style={styles.eyebrow}>Daniel Study</Text>
          <Text selectable style={styles.title}>Characters</Text>
          <Text selectable style={styles.subtitle}>
            Explore prophets, rulers, companions, officials, and heavenly messengers connected to Daniel.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color="#91a4c5" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search characters"
            placeholderTextColor="#72819d"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
          {FILTERS.map((filter) => {
            const iconSource = filter.icon;
            const active = activeFilter === filter.id;

            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Image
                  source={iconSource}
                  style={[styles.filterIcon, active && styles.filterIconActive]}
                  contentFit="contain"
                  tintColor={active ? '#071225' : '#d6ad57'}
                />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text selectable style={styles.summaryLabel}>Characters</Text>
            <Text selectable style={styles.summaryValue}>{characterProfiles.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text selectable style={styles.summaryLabel}>Showing</Text>
            <Text selectable style={styles.summaryValue}>{filteredCharacters.length}</Text>
          </View>
        </View>

        <View style={compactCards ? styles.cardList : styles.cardGrid}>
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.name}
              character={character}
              compact={compactCards}
              onPress={() => setSelectedCharacter(character)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071225',
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 112,
  },
  profileContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 112,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: '#e1b64b',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontFamily: 'Cinzel',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 44,
  },
  subtitle: {
    color: '#c7d2e7',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#0a1120',
    borderColor: '#6a4e16',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: '#ffffff',
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 15,
  },
  filterStrip: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    alignItems: 'center',
    borderColor: '#6a4e16',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  filterChipActive: {
    backgroundColor: '#e1b64b',
    borderColor: '#e1b64b',
  },
  filterIcon: {
    width: 14,
    height: 14,
  },
  filterIconActive: {
  },
  filterText: {
    color: '#d8c178',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#071225',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#0d1424',
    borderColor: '#6a4e16',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  summaryLabel: {
    color: '#8d97af',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  cardList: {
    gap: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#09111f',
    borderColor: '#6a4e16',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
  },
  cardWide: {
    width: '48%',
  },
  cardCompact: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  artwork: {
    alignItems: 'center',
    backgroundColor: '#06101f',
    height: 220,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  profileArtwork: {
    borderRadius: 14,
    height: 280,
  },
  cardBody: {
    gap: 6,
    padding: 14,
    paddingTop: 13,
  },
  portraitBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 8, 20, 0.52)',
  },
  containedPortraitImage: {
    height: '100%',
    width: '100%',
  },
  roleArtworkIcon: {
    height: 42,
    width: 42,
  },
  roleArtworkIconLarge: {
    height: 72,
    width: 72,
  },
  artBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 17, 31, 0.92)',
    borderColor: '#d6ad57',
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 42,
    zIndex: 2,
  },
  artBadgeIcon: {
    height: 20,
    width: 20,
  },
  cardName: {
    color: '#f6f1e4',
    fontFamily: 'Cinzel',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  cardRole: {
    color: '#8fbaff',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  cardRegime: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#ced8e8',
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 19,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#d6ad57',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
  },
  profileHero: {
    backgroundColor: '#08111f',
    borderColor: '#6a4e16',
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    overflow: 'hidden',
    padding: 12,
  },
  profileHeroCopy: {
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  profileRolePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0b1324',
    borderColor: '#d6ad57',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  profileRolePillText: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  profileName: {
    color: '#f6f1e4',
    fontFamily: 'Cinzel',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 44,
  },
  profileMeaning: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  profileDescription: {
    color: '#e2d5b8',
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 24,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metadataCard: {
    backgroundColor: '#0d1424',
    borderColor: '#6a4e16',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 84,
    padding: 13,
    width: '48%',
  },
  metadataLabel: {
    color: '#8d97af',
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metadataValue: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 6,
  },
  section: {
    backgroundColor: '#0d1424',
    borderColor: '#6a4e16',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'Cinzel',
    fontSize: 18,
    fontWeight: '700',
  },
  traitsList: {
    gap: 13,
  },
  traitRow: {
    gap: 8,
  },
  traitHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  traitLabel: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
  },
  traitValue: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  traitTrack: {
    backgroundColor: '#1e2a45',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  traitFill: {
    borderRadius: 999,
    height: 8,
  },
  momentList: {
    gap: 11,
  },
  momentRow: {
    flexDirection: 'row',
    gap: 11,
  },
  momentNumber: {
    alignItems: 'center',
    backgroundColor: '#d6ad5722',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  momentNumberText: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
  },
  momentCopy: {
    flex: 1,
    gap: 3,
  },
  momentTitle: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
  },
  momentText: {
    color: '#9aa7bf',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 19,
  },
  scriptureList: {
    gap: 2,
  },
  scriptureRow: {
    alignItems: 'center',
    borderBottomColor: '#1e2a45',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  scriptureCopy: {
    flex: 1,
    gap: 3,
  },
  scriptureRef: {
    color: '#d6ad57',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
  },
  scriptureDescription: {
    color: '#8d97af',
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
  },
  quickNote: {
    color: '#e2d5b8',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 23,
  },
});
