const KING_PATTERN = /\bking(s)?\b(?!')/i;

export function getCharacterTags(character: {
  role: string;
  era: string;
  status: string;
  name: string;
}): string[] {
  const haystack = `${character.role} ${character.era} ${character.status} ${character.name}`.toLowerCase();
  const tags: string[] = [];

  if (haystack.includes('prophet')) tags.push('Prophets');
  if (KING_PATTERN.test(haystack) || haystack.includes('regent')) tags.push('Kings');
  if (/(official|eunuch|guard|administrator|statesman|adviser|courtier)/.test(haystack)) tags.push('Officials');
  if (/(companion|noble)/.test(haystack)) tags.push('Companions');
  if (/(angel|archangel|heavenly)/.test(haystack)) tags.push('Angels');

  return tags;
}

export function getRoleIconSource(
  role: string,
  icons: Record<string, unknown>,
): unknown {
  const value = role.toLowerCase();

  if (value.includes('angel') || value.includes('archangel') || value.includes('heavenly'))
    return icons.angels;
  if (value.includes('prophet') || value.includes('messenger')) return icons.scroll;
  if (value.includes('companion') || value.includes('noble')) return icons.companions;
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
    return icons.official;
  }
  if (KING_PATTERN.test(value) || value.includes('regent')) return icons.crown;

  return icons.bible;
}
