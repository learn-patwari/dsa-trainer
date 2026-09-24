import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../server/store.ts';
import { addTime, HttpError, recordAttempt, validateSubmission } from '../server/trainer.ts';
import { getProblem } from '../shared/problems/index.ts';
import type { AttemptSubmission } from '../shared/types.ts';

describe('addTime', () => {
  it('accumulates across calls and records both clocks', () => {
    const p = emptyProgress();
    expect(addTime(p, 'two-sum', { elapsedSec: 120, activeSec: 90 })).toMatchObject({ totalSec: 120, activeSec: 90 });
    expect(addTime(p, 'two-sum', { elapsedSec: 60, activeSec: 15 })).toMatchObject({ totalSec: 180, activeSec: 105 });
    expect(p.problems['two-sum']!.time!.updatedAt).toBeTruthy();
  });

  it('never lets the active clock outrun the wall clock', () => {
    const p = emptyProgress();
    expect(addTime(p, 'two-sum', { elapsedSec: 30, activeSec: 5000 })).toMatchObject({ totalSec: 30, activeSec: 30 });
  });

  it('ignores junk and clamps an implausible jump', () => {
    const p = emptyProgress();
    expect(addTime(p, 'two-sum', { elapsedSec: -10, activeSec: 'x' })).toMatchObject({ totalSec: 0, activeSec: 0 });
    expect(addTime(p, 'two-sum', { elapsedSec: 99_999_999, activeSec: 10 })).toMatchObject({ totalSec: 6 * 3600 });
  });

  it('banks time without inventing an attempt', () => {
    const p = emptyProgress();
    addTime(p, 'two-sum', { elapsedSec: 45, activeSec: 45 });
    expect(p.problems['two-sum']).toMatchObject({ attempts: 0, bestPercent: 0 });
    expect(p.history).toEqual([]);
  });

  it('keeps the attempt history when time is added afterwards', () => {
    const p = emptyProgress();
    const q = getProblem('two-sum')!;
    const sub: AttemptSubmission = {
      mode: 'pattern',
      pattern: q.pattern,
      brute: q.brute!.time[0],
      insight: q.insight.options[0],
      time: q.time[0],
      space: q.space[0],
      edgeCasesHandled: q.edgeCases.map((_, i) => i),
      hintsUsed: 0,
      elapsedSec: 200,
      activeSec: 150,
    };
    const result = recordAttempt(p, 'two-sum', sub);
    expect(result).toMatchObject({ elapsedSec: 200, activeSec: 150 });

    addTime(p, 'two-sum', { elapsedSec: 60, activeSec: 60 });
    expect(p.problems['two-sum']).toMatchObject({ attempts: 1, bestPercent: 100 });
    expect(p.problems['two-sum']!.lastResult).toBeDefined();
    expect(p.problems['two-sum']!.time).toMatchObject({ totalSec: 60 });
  });

  it('rejects an unknown problem and a non-object body', () => {
    const p = emptyProgress();
    expect(() => addTime(p, 'not-a-problem', { elapsedSec: 5, activeSec: 5 })).toThrow(HttpError);
    expect(() => addTime(p, 'two-sum', null)).toThrow(HttpError);
  });
});

describe('validateSubmission', () => {
  it('reads both clocks and defaults them to zero', () => {
    expect(validateSubmission({ mode: 'pattern', elapsedSec: 300, activeSec: 200 })).toMatchObject({ elapsedSec: 300, activeSec: 200 });
    expect(validateSubmission({ mode: 'pattern' })).toMatchObject({ elapsedSec: 0, activeSec: 0 });
    expect(validateSubmission({ mode: 'pattern', elapsedSec: 10, activeSec: -5 })).toMatchObject({ activeSec: 0 });
  });

  it('caps a submitted attempt at a day', () => {
    expect(validateSubmission({ mode: 'pattern', elapsedSec: 1e9, activeSec: 1e9 })).toMatchObject({
      elapsedSec: 86_400,
      activeSec: 86_400,
    });
  });
});

describe('recordAttempt', () => {
  it("won't let a reported active time exceed the attempt", () => {
    const p = emptyProgress();
    const q = getProblem('valid-anagram')!;
    const result = recordAttempt(p, 'valid-anagram', {
      mode: 'pattern',
      pattern: q.pattern,
      brute: q.brute!.time[0],
      insight: q.insight.options[0],
      time: q.time[0],
      space: q.space[0],
      edgeCasesHandled: [],
      hintsUsed: 0,
      elapsedSec: 60,
      activeSec: 9999,
    });
    expect(result.activeSec).toBe(60);
  });
});
