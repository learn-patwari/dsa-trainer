import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../server/store.ts';
import { delayedList, difficultyProgress, setPlan, streak, studyPlan } from '../server/plan.ts';
import { PROBLEMS } from '../shared/problems/index.ts';
import type { AttemptResult, Progress } from '../shared/types.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

/** An ISO timestamp n days ago, at the current time of day so it lands on that local date. */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString();
}

function withAttempts(dayOffsets: number[]): Progress {
  const p = emptyProgress();
  p.history = dayOffsets.map((d, i) => ({ at: daysAgo(d), slug: `p${i}` }) as AttemptResult);
  return p;
}

describe('streak', () => {
  it('is empty before the first attempt', () => {
    expect(streak(emptyProgress())).toEqual({ current: 0, best: 0, activeToday: false });
  });

  it('counts consecutive days ending today', () => {
    expect(streak(withAttempts([0, 1, 2, 5]))).toMatchObject({ current: 3, best: 3, activeToday: true });
  });

  it("keeps yesterday's streak alive until the day is missed", () => {
    expect(streak(withAttempts([1, 2]))).toMatchObject({ current: 2, activeToday: false });
    expect(streak(withAttempts([2, 3]))).toMatchObject({ current: 0, activeToday: false });
  });

  it('remembers the best run even after it breaks', () => {
    expect(streak(withAttempts([10, 11, 12, 13, 0]))).toMatchObject({ current: 1, best: 4 });
  });

  it('counts several attempts on one day once', () => {
    expect(streak(withAttempts([0, 0, 0]))).toMatchObject({ current: 1, best: 1 });
  });
});

describe('studyPlan', () => {
  it('is null until a plan is started', () => {
    expect(studyPlan(emptyProgress())).toBeNull();
  });

  it('spreads the work over the remaining days', () => {
    const p = emptyProgress();
    const plan = setPlan(p, 70, 10); // 70 days
    expect(plan).toMatchObject({ size: 70, weeks: 10, daysTotal: 70, daysElapsed: 1, done: 0, doneToday: 0 });
    expect(plan.todayTarget).toBe(1);
    expect(plan.behindBy).toBe(0); // day one isn't late until it's over
  });

  it('only counts problems attempted since the plan started', () => {
    const p = emptyProgress();
    p.problems['old'] = { attempts: 1, bestPercent: 80, lastPercent: 80, lastAt: daysAgo(30) };
    setPlan(p, 50, 5);
    p.problems['new'] = { attempts: 1, bestPercent: 90, lastPercent: 90, lastAt: new Date().toISOString() };
    expect(studyPlan(p)!.done).toBe(1);
  });

  it('counts a missed day as being behind', () => {
    const p = emptyProgress();
    setPlan(p, 56, 8); // one a day
    p.plan!.startedAt = daysAgo(4);
    expect(studyPlan(p)).toMatchObject({ daysElapsed: 5, behindBy: 4 });
  });

  it('reports being ahead of schedule as a negative gap', () => {
    const p = emptyProgress();
    setPlan(p, 20, 4);
    for (let i = 0; i < 5; i++) {
      p.problems[`q${i}`] = { attempts: 1, bestPercent: 100, lastPercent: 100, lastAt: new Date().toISOString() };
    }
    const plan = studyPlan(p)!;
    expect(plan.done).toBe(5);
    expect(plan.behindBy).toBeLessThan(0);
  });
});

describe('difficultyProgress', () => {
  it('covers the whole bank and counts LeetCode solves', () => {
    const p = emptyProgress();
    const easy = PROBLEMS.find((q) => q.difficulty === 'Easy')!;
    p.problems[easy.slug] = { attempts: 1, bestPercent: 100, lastPercent: 100, lastAt: new Date().toISOString() };
    p.leetcode = {
      username: 'u',
      importedAt: new Date().toISOString(),
      source: 'public',
      fullList: false,
      solvedCounts: { all: 1, easy: 1, medium: 0, hard: 0 },
      tagCounts: [],
      solvedSlugs: [easy.slug],
    };

    const rows = difficultyProgress(p);
    expect(rows.map((r) => r.difficulty)).toEqual(['Easy', 'Medium', 'Hard']);
    expect(rows.reduce((n, r) => n + r.total, 0)).toBe(PROBLEMS.length);
    expect(rows[0]).toMatchObject({ attempted: 1, lcSolved: 1 });
    expect(rows[1]).toMatchObject({ attempted: 0, lcSolved: 0 });
  });
});

describe('delayedList', () => {
  const attempt = (p: Progress, slug: string) => {
    p.problems[slug] = { attempts: 1, bestPercent: 80, lastPercent: 80, lastAt: new Date().toISOString() };
  };

  it('is empty without a plan, and on the first day', () => {
    expect(delayedList(emptyProgress())).toEqual([]);
    const p = emptyProgress();
    setPlan(p, 56, 8);
    expect(delayedList(p)).toEqual([]);
  });

  it('moves the problems of each missed day into the list, oldest first and later each day', () => {
    const p = emptyProgress();
    setPlan(p, 56, 8); // one a day
    p.plan!.startedAt = daysAgo(3); // days 1-3 are over, today is day 4
    const late = delayedList(p);
    expect(late.map((d) => d.slug)).toEqual(PROBLEMS.slice(0, 3).map((q) => q.slug));
    expect(late.map((d) => d.daysLate)).toEqual([3, 2, 1]);
  });

  it('drops a problem once it has been attempted, and the next one takes its place', () => {
    const p = emptyProgress();
    setPlan(p, 56, 8);
    p.plan!.startedAt = daysAgo(3);
    attempt(p, PROBLEMS[0]!.slug);
    const late = delayedList(p);
    expect(late).toHaveLength(2);
    expect(late.map((d) => d.slug)).toEqual([PROBLEMS[1]!.slug, PROBLEMS[2]!.slug]);
  });

  it('is empty when you are on schedule or ahead', () => {
    const p = emptyProgress();
    setPlan(p, 56, 8);
    p.plan!.startedAt = daysAgo(3);
    for (const q of PROBLEMS.slice(0, 3)) attempt(p, q.slug);
    expect(delayedList(p)).toEqual([]);
  });

  it('keeps ageing the leftovers after the plan has ended', () => {
    const p = emptyProgress();
    setPlan(p, 7, 1); // one a day for a week
    p.plan!.startedAt = daysAgo(10);
    const late = delayedList(p);
    expect(late).toHaveLength(7);
    expect(late[0]).toMatchObject({ slug: PROBLEMS[0]!.slug, daysLate: 10 });
    expect(late[6]!.daysLate).toBe(4);
  });
});
