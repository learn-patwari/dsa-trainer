import { describe, expect, it } from 'vitest';
import { dueList, grade, MASTERED_STEP, REVIEW_STEPS, reviewSummary, schedule, upcomingList } from '../server/review.ts';
import { emptyProgress } from '../server/store.ts';
import { recordAttempt } from '../server/trainer.ts';
import { getProblem } from '../shared/problems/index.ts';
import type { AttemptSubmission, Progress, ReviewState } from '../shared/types.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = '2026-09-24T09:00:00.000Z';

function daysUntil(state: ReviewState, from = NOW): number {
  return Math.round((Date.parse(state.dueAt) - Date.parse(from)) / DAY_MS);
}

describe('grade', () => {
  it('splits scores into forget / shaky / solid', () => {
    expect(grade(0)).toBe('again');
    expect(grade(59)).toBe('again');
    expect(grade(60)).toBe('hard');
    expect(grade(84)).toBe('hard');
    expect(grade(85)).toBe('good');
    expect(grade(100)).toBe('good');
  });
});

describe('schedule', () => {
  it('widens the interval while you keep getting it right', () => {
    let state = schedule(undefined, 100, NOW);
    expect(daysUntil(state)).toBe(REVIEW_STEPS[1]); // first pass moves to step 1
    const seen = [daysUntil(state)];
    for (let i = 0; i < 4; i++) {
      state = schedule(state, 100, NOW);
      seen.push(daysUntil(state));
    }
    expect(seen).toEqual([3, 7, 21, 60, 60]);
    expect(state.step).toBe(MASTERED_STEP);
  });

  it('holds the interval when the score is shaky', () => {
    const first = schedule(undefined, 100, NOW);
    const again = schedule(first, 70, NOW);
    expect(again.step).toBe(first.step);
    expect(daysUntil(again)).toBe(daysUntil(first));
    expect(again.lapses).toBe(0);
  });

  it('sends a forgotten problem back to the start and counts the lapse', () => {
    let state = schedule(undefined, 100, NOW);
    state = schedule(state, 100, NOW);
    expect(state.step).toBe(2);

    const lapsed = schedule(state, 30, NOW);
    expect(lapsed.step).toBe(0);
    expect(daysUntil(lapsed)).toBe(REVIEW_STEPS[0]);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.reviews).toBe(3);
  });

  it("doesn't count a first bad attempt as forgetting", () => {
    expect(schedule(undefined, 20, NOW)).toMatchObject({ step: 0, lapses: 0, lastGrade: 'again' });
  });
});

function answers(slug: string): AttemptSubmission {
  const p = getProblem(slug)!;
  return {
    mode: 'pattern',
    pattern: p.pattern,
    brute: p.brute?.time[0] ?? null,
    insight: p.insight.options[0],
    time: p.time[0],
    space: p.space[0],
    edgeCasesHandled: p.edgeCases.map((_, i) => i),
    hintsUsed: 0,
    elapsedSec: 30,
  };
}

/** Pretends the attempt happened `days` ago, so it can come due. */
function backdate(p: Progress, slug: string, days: number): void {
  const entry = p.problems[slug]!;
  const shifted = new Date(Date.now() - days * DAY_MS).toISOString();
  entry.review = schedule(undefined, entry.lastPercent, shifted);
}

describe('the queue', () => {
  it('schedules every attempt and surfaces it when it comes due', () => {
    const p = emptyProgress();
    recordAttempt(p, 'two-sum', answers('two-sum'));
    expect(p.problems['two-sum']!.review).toBeDefined();

    // A perfect attempt today is due tomorrow, not now.
    expect(dueList(p)).toEqual([]);
    expect(upcomingList(p).map((r) => r.slug)).toEqual(['two-sum']);
    expect(reviewSummary(p)).toMatchObject({ due: 0, next7: 1, scheduled: 1 });

    backdate(p, 'two-sum', 4); // perfect score => 3-day interval, so it fell due yesterday
    const due = dueList(p);
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ slug: 'two-sum', overdueDays: 1, of: REVIEW_STEPS.length });
    expect(reviewSummary(p)).toMatchObject({ due: 1, next7: 0 });
  });

  it('puts the most overdue problem first', () => {
    const p = emptyProgress();
    for (const slug of ['two-sum', 'valid-anagram', 'contains-duplicate']) {
      recordAttempt(p, slug, answers(slug));
    }
    backdate(p, 'two-sum', 3);
    backdate(p, 'valid-anagram', 10);
    backdate(p, 'contains-duplicate', 5);
    expect(dueList(p).map((r) => r.slug)).toEqual(['valid-anagram', 'contains-duplicate', 'two-sum']);
    expect(dueList(p, 2)).toHaveLength(2);
  });

  it('counts a problem as settled once it survives the longest interval', () => {
    const p = emptyProgress();
    recordAttempt(p, 'two-sum', answers('two-sum'));
    let state = p.problems['two-sum']!.review!;
    for (let i = 0; i < REVIEW_STEPS.length; i++) state = schedule(state, 100, new Date().toISOString());
    p.problems['two-sum']!.review = state;
    expect(reviewSummary(p)).toMatchObject({ mastered: 1, scheduled: 1 });
  });
});
