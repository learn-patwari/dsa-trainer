import { PROBLEMS } from '../shared/problems/index.ts';
import type { Difficulty, DifficultyProgress, Progress, StreakInfo, StudyPlan } from '../shared/types.ts';

/** Study plan, daily target and streak — the scheduling side of the trainer. */

const DAY_MS = 24 * 60 * 60 * 1000;
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

function today(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** Consecutive days with at least one attempt, counting back from today (or yesterday). */
export function streak(p: Progress): StreakInfo {
  const days = new Set(p.history.map((a) => localDay(a.at)));
  if (days.size === 0) return { current: 0, best: 0, activeToday: false };

  const sorted = [...days].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = (Date.parse(sorted[i]!) - Date.parse(sorted[i - 1]!)) / DAY_MS;
    run = gap === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // A streak survives a day that hasn't been used yet: start counting at yesterday.
  const activeToday = days.has(today());
  let cursor = activeToday ? new Date() : new Date(Date.now() - DAY_MS);
  let current = 0;
  while (days.has(cursor.toLocaleDateString('en-CA'))) {
    current++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return { current, best, activeToday };
}

export function studyPlan(p: Progress): StudyPlan | null {
  if (!p.plan) return null;
  const { size, weeks, startedAt } = p.plan;
  const started = Date.parse(startedAt);
  const daysTotal = Math.max(1, weeks * 7);
  const daysElapsed = Math.min(daysTotal, Math.floor((Date.now() - started) / DAY_MS) + 1);
  const done = Object.entries(p.problems).filter(([, v]) => v.attempts > 0 && v.lastAt >= startedAt).length;
  const perDay = size / daysTotal;
  // Today's share isn't overdue until today is over, so measure against the days already finished.
  const shouldHaveDone = Math.min(size, Math.ceil(perDay * (daysElapsed - 1)));
  const doneToday = p.history.filter((a) => localDay(a.at) === today()).length;
  const remainingDays = Math.max(1, daysTotal - daysElapsed + 1);
  const todayTarget = Math.max(0, Math.ceil((size - done) / remainingDays));
  return { size, weeks, startedAt, done, daysElapsed, daysTotal, todayTarget, doneToday, behindBy: shouldHaveDone - done };
}

export function difficultyProgress(p: Progress): DifficultyProgress[] {
  const solved = new Set(p.leetcode?.solvedSlugs ?? []);
  return DIFFICULTIES.map((difficulty) => {
    const inGroup = PROBLEMS.filter((q) => q.difficulty === difficulty);
    return {
      difficulty,
      total: inGroup.length,
      attempted: inGroup.filter((q) => (p.problems[q.slug]?.attempts ?? 0) > 0).length,
      lcSolved: inGroup.filter((q) => solved.has(q.slug)).length,
    };
  });
}

export function setPlan(p: Progress, size: number, weeks: number): StudyPlan {
  p.plan = { size, weeks, startedAt: new Date().toISOString() };
  return studyPlan(p)!;
}
