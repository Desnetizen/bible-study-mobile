import { isRequestContainedInDefined } from '../parseBibleReference';

describe('isRequestContainedInDefined', () => {
  it('matches any verse when defined is chapter-only (no verse specified)', () => {
    const result = isRequestContainedInDefined(undefined, undefined, 1, 1);
    expect(result).toBe(true);
  });

  it('matches any verse range when defined is chapter-only', () => {
    const result = isRequestContainedInDefined(undefined, undefined, 5, 10);
    expect(result).toBe(true);
  });

  it('matches any single verse when defined is chapter-only', () => {
    const result = isRequestContainedInDefined(undefined, undefined, 7, undefined);
    expect(result).toBe(true);
  });

  it('matches exact verse', () => {
    const result = isRequestContainedInDefined(5, 5, 5, 5);
    expect(result).toBe(true);
  });

  it('matches verse within range', () => {
    const result = isRequestContainedInDefined(1, 10, 3, 7);
    expect(result).toBe(true);
  });

  it('rejects verse before defined range', () => {
    const result = isRequestContainedInDefined(5, 10, 1, 3);
    expect(result).toBe(false);
  });

  it('rejects verse after defined range', () => {
    const result = isRequestContainedInDefined(5, 10, 12, 15);
    expect(result).toBe(false);
  });

  it('rejects request that starts before defined range', () => {
    const result = isRequestContainedInDefined(5, 10, 3, 7);
    expect(result).toBe(false);
  });

  it('rejects request that extends beyond defined range', () => {
    const result = isRequestContainedInDefined(5, 10, 7, 12);
    expect(result).toBe(false);
  });

  it('matches single verse within defined chapter-only range', () => {
    const result = isRequestContainedInDefined(undefined, undefined, 3, undefined);
    expect(result).toBe(true);
  });
});
