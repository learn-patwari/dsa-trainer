import { describe, expect, it } from 'vitest';
import { compareOutputs } from '../server/compare.ts';

describe('compareOutputs', () => {
  it('accepts formatting differences', () => {
    expect(compareOutputs('[0, 1]', '[0,1]')).toBe('pass');
    expect(compareOutputs('true', 'true')).toBe('pass');
    expect(compareOutputs('"BANC"', '"BANC"')).toBe('pass');
    expect(compareOutputs('BANC', '"BANC"')).toBe('pass'); // statements sometimes drop the quotes
  });

  it('compares doubles with LeetCode\'s tolerance', () => {
    expect(compareOutputs('12.75000', '12.75')).toBe('pass');
    expect(compareOutputs('12.75000', '12.750001')).toBe('pass');
    expect(compareOutputs('12.75000', '12.8')).toBe('fail');
  });

  it('falls back to an order-insensitive match and says so', () => {
    expect(compareOutputs('[[1,2],[3]]', '[[3],[2,1]]')).toBe('pass-unordered');
    expect(compareOutputs('[["bat"],["nat","tan"]]', '[["tan","nat"],["bat"]]')).toBe('pass-unordered');
  });

  it('rejects wrong answers', () => {
    expect(compareOutputs('[0,1]', '[]')).toBe('fail');
    expect(compareOutputs('[1,2,3]', '[1,2]')).toBe('fail');
    expect(compareOutputs('3', '-1')).toBe('fail');
    expect(compareOutputs('[]', 'null')).toBe('fail');
  });
});
