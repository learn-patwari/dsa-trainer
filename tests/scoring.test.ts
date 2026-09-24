import { describe, expect, it } from 'vitest';
import { patternName } from '../shared/patterns/index.ts';
import { getProblem } from '../shared/problems/index.ts';
import { expectedScore, scoreAttempt, tierFor, updateRating } from '../shared/scoring.ts';
import type { AttemptSubmission } from '../shared/types.ts';

const twoSum = getProblem('two-sum')!;
const rainWater = getProblem('trapping-rain-water')!; // pattern two-pointers, also accepts monotonic-stack

function perfect(mode: AttemptSubmission['mode'], p = twoSum): AttemptSubmission {
  return {
    mode,
    pattern: p.pattern,
    brute: p.brute?.time[0] ?? null,
    insight: p.insight.options[0],
    time: p.time[0],
    space: p.space[0],
    edgeCasesHandled: p.edgeCases.map((_, i) => i),
    hintsUsed: 0,
    activeSec: 20,
    elapsedSec: 60,
  };
}

describe('scoreAttempt', () => {
  it('awards full marks in blind mode (pattern question included)', () => {
    const r = scoreAttempt(twoSum, perfect('blind'), patternName);
    expect(r.maxScore).toBe(11);
    expect(r.score).toBe(11);
    expect(r.percent).toBe(100);
    expect(r.breakdown.map((q) => q.key)).toEqual(['pattern', 'brute', 'insight', 'time', 'space', 'edgeCases']);
  });

  it('skips the pattern question in pattern mode', () => {
    const r = scoreAttempt(twoSum, perfect('pattern'), patternName);
    expect(r.maxScore).toBe(8);
    expect(r.breakdown.some((q) => q.key === 'pattern')).toBe(false);
    expect(r.percent).toBe(100);
  });

  it('gives partial credit for an alternative pattern and none for a wrong one', () => {
    const alt = scoreAttempt(rainWater, { ...perfect('blind', rainWater), pattern: 'monotonic-stack' }, patternName);
    expect(alt.breakdown[0]).toMatchObject({ verdict: 'partial', earned: 2 });
    const wrong = scoreAttempt(rainWater, { ...perfect('blind', rainWater), pattern: 'trie' }, patternName);
    expect(wrong.breakdown[0]).toMatchObject({ verdict: 'wrong', earned: 0 });
  });

  it('marks wrong and skipped answers', () => {
    const r = scoreAttempt(
      twoSum,
      { ...perfect('pattern'), insight: twoSum.insight.options[1], time: null, space: 'nonsense' },
      patternName,
    );
    const byKey = Object.fromEntries(r.breakdown.map((q) => [q.key, q]));
    expect(byKey.insight).toMatchObject({ verdict: 'wrong', earned: 0 });
    expect(byKey.time).toMatchObject({ verdict: 'skipped', earned: 0 });
    expect(byKey.space).toMatchObject({ verdict: 'wrong', earned: 0 });
    expect(r.score).toBe(2); // only the brute force and the edge-case self-check
  });

  it('prorates the edge-case self-check and ignores bogus indexes', () => {
    const n = twoSum.edgeCases.length;
    const r = scoreAttempt(twoSum, { ...perfect('pattern'), edgeCasesHandled: [0, 0, 99, -1] }, patternName);
    const edge = r.breakdown.find((q) => q.key === 'edgeCases')!;
    expect(edge.earned).toBeCloseTo(1 / n, 2);
    expect(edge.verdict).toBe('partial');
  });

  it('subtracts hint penalties without going below zero', () => {
    expect(scoreAttempt(twoSum, { ...perfect('blind'), hintsUsed: 2 }, patternName)).toMatchObject({ score: 9, hintPenalty: 2 });
    const none = scoreAttempt(
      twoSum,
      { mode: 'blind', pattern: null, brute: null, insight: null, time: null, space: null, edgeCasesHandled: [], hintsUsed: 5, elapsedSec: 0, activeSec: 0 },
      patternName,
    );
    expect(none.score).toBe(0);
    expect(none.percent).toBe(0);
  });
});

describe('ratings', () => {
  it('expects a 50% score against an equally rated problem', () => {
    expect(expectedScore(1200, 'Easy')).toBeCloseTo(0.5);
    expect(expectedScore(1200, 'Hard')).toBeLessThan(expectedScore(1200, 'Medium'));
  });

  it('rewards beating expectations more on harder problems', () => {
    const easy = updateRating(1200, 'Easy', 100, 10) - 1200;
    const hard = updateRating(1200, 'Hard', 100, 10) - 1200;
    expect(easy).toBe(16);
    expect(hard).toBeGreaterThan(easy);
  });

  it('drops the rating for a poor score and moves faster while provisional', () => {
    expect(updateRating(1400, 'Easy', 20, 10)).toBeLessThan(1400);
    expect(Math.abs(updateRating(1200, 'Easy', 0, 0) - 1200)).toBeGreaterThan(Math.abs(updateRating(1200, 'Easy', 0, 5) - 1200));
  });

  it('maps ratings to tiers', () => {
    expect(tierFor(null)).toBe('Not started');
    expect(tierFor(1249)).toBe('Novice');
    expect(tierFor(1250)).toBe('Learning');
    expect(tierFor(1400)).toBe('Solid');
    expect(tierFor(1550)).toBe('Strong');
    expect(tierFor(1700)).toBe('Expert');
  });
});
