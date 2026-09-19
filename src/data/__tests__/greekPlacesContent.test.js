import { describe, expect, it } from '@jest/globals';

import { greekPlacesContent } from '../greekPlacesContent';
import { medoPersianPlacesContent } from '../medoPersianPlacesContent';
import { preExilicPlacesContent } from '../preExilicPlacesContent';
import { romanPlacesContent } from '../romanPlacesContent';

const placeContentMaps = [
  ['Greek', greekPlacesContent],
  ['Medo-Persian', medoPersianPlacesContent],
  ['Pre-Exilic', preExilicPlacesContent],
  ['Roman', romanPlacesContent],
];

describe('place content maps', () => {
  it.each(placeContentMaps)('exports readable %s place content', (_period, contentMap) => {
    expect(Object.keys(contentMap).length).toBeGreaterThan(0);

    for (const content of Object.values(contentMap)) {
      expect(typeof content).toBe('string');
      expect(content.trim().length).toBeGreaterThan(100);
    }
  });
});
