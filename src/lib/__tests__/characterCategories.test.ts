import { getCharacterTags, getRoleIconSource } from '../characterCategories';

const MOCK_ICONS = {
  bible: 'bible',
  angels: 'angels',
  companions: 'companions',
  crown: 'crown',
  official: 'official',
  scroll: 'scroll',
} as const;

describe('getCharacterTags', () => {
  const makeChar = (role: string, era = '', status = '', name = '') => ({
    role,
    era,
    status,
    name,
  });

  it('does not tag Arioch as a King', () => {
    const tags = getCharacterTags(makeChar("Captain of the King's Guard", 'Neo-Babylonian Court', 'Royal Executioner', 'Arioch'));
    expect(tags).toContain('Officials');
    expect(tags).not.toContain('Kings');
  });

  it('tags Kings correctly for actual kings', () => {
    const roles = [
      { role: 'King of Babylon', name: 'Nebuchadnezzar II' },
      { role: 'Vassal King of Babylon', name: 'Darius the Mede' },
      { role: 'King of Persia', name: 'Cyrus the Great' },
    ];
    for (const { role, name } of roles) {
      const tags = getCharacterTags(makeChar(role, '', '', name));
      expect(tags).toContain('Kings');
    }
  });

  it('tags Co-Regent as King', () => {
    const tags = getCharacterTags(makeChar('Co-Regent of Babylon', '', '', 'Belshazzar'));
    expect(tags).toContain('Kings');
  });

  it('tags Officials correctly', () => {
    const tags = getCharacterTags(makeChar('Captain of the King\'s Guard', '', '', 'Arioch'));
    expect(tags).toContain('Officials');
  });

  it('tags Prophets correctly', () => {
    const tags = getCharacterTags(makeChar('Prophet & Statesman', '', '', 'Daniel'));
    expect(tags).toContain('Prophets');
  });

  it('does not tag non-kings as Kings', () => {
    const nonKings = [
      makeChar('Hebrew Noble & Companion', '', '', 'Hananiah'),
      makeChar('Heavenly Messenger', '', '', 'Gabriel'),
      makeChar('Archangel & Warrior', '', '', 'Michael'),
      makeChar('Master of the Eunuchs', '', '', 'Ashpenaz'),
    ];
    for (const char of nonKings) {
      const tags = getCharacterTags(char);
      expect(tags).not.toContain('Kings');
    }
  });
});

describe('getRoleIconSource', () => {
  it('returns official icon for "Captain of the King\'s Guard"', () => {
    const result = getRoleIconSource("Captain of the King's Guard", MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.official);
  });

  it('returns crown icon for King roles', () => {
    const result = getRoleIconSource('King of Babylon', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.crown);
  });

  it('returns crown icon for Co-Regent', () => {
    const result = getRoleIconSource('Co-Regent of Babylon', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.crown);
  });

  it('returns scroll icon for Prophets', () => {
    const result = getRoleIconSource('Prophet & Statesman', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.scroll);
  });

  it('returns angels icon for Angel roles', () => {
    const result = getRoleIconSource('Heavenly Messenger', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.angels);
  });

  it('returns companions icon for Noble roles', () => {
    const result = getRoleIconSource('Hebrew Noble & Companion', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.companions);
  });

  it('returns bible icon for unmatched roles', () => {
    const result = getRoleIconSource('Some Unknown Role', MOCK_ICONS);
    expect(result).toBe(MOCK_ICONS.bible);
  });
});
