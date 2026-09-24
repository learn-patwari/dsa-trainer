import { patternName } from '../shared/patterns/index.ts';
import { getProblem, PROBLEMS } from '../shared/problems/index.ts';
import type { Progress, ReviewItem, ReviewState, ReviewSummary } from '../shared/types.ts';

/**
 * Spaced repetition over the problems you've attempted here.
 *
 * Solving a problem once doesn't keep it: the forgetting curve takes most of it
 * back within a month. So every graded attempt schedules the next one, at a
 * widening interval while you keep getting it right and back to the start when
 * you don't. Intervals follow the usual doubling-ish ladder used by Anki decks.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days until the next review, by how many reviews you've passed in a row. */
export const REVIEW_STEPS = [1, 3, 7, 21, 60] as const;

/** Above this you move up a step; below LAPSE_BELOW you go back to the start. */
export const PROMOTE_AT = 85;
export const LAPSE_BELOW = 60;

/** A problem is "learned" once it survives the longest interval. */
export const MASTERED_STEP = REVIEW_STEPS.length;

export type Grade = 'again' | 'hard' | 'good';

export function grade(percent: number): Grade {
  if (percent < LAPSE_BELOW) return 'again';
  return percent < PROMOTE_AT ? 'hard' : 'good';
}

function addDays(from: string, days: number): string {
  return new Date(Date.parse(from) + days * DAY_MS).toISOString();
}

/** Next review state after an attempt scoring `percent`, graded at `at`. */
export function schedule(prior: ReviewState | undefined, percent: number, at: string): ReviewState {
  const g = grade(percent);
  const step = g === 'again' ? 0 : g === 'hard' ? (prior?.step ?? 0) : Math.min((prior?.step ?? 0) + 1, MASTERED_STEP);
  // A lapse is only a lapse if you'd already learned it once.
  const lapses = (prior?.lapses ?? 0) + (g === 'again' && (prior?.step ?? 0) > 0 ? 1 : 0);
  const days = REVIEW_STEPS[Math.min(step, REVIEW_STEPS.length - 1)]!;
  return { step, dueAt: addDays(at, days), lapses, reviews: (prior?.reviews ?? 0) + 1, lastGrade: g };
}

function daysBetween(fromIso: string, to: number): number {
  return Math.floor((to - Date.parse(fromIso)) / DAY_MS);
}

function item(p: Progress, slug: string, review: ReviewState, now: number): ReviewItem | null {
  const problem = getProblem(slug);
  if (!problem) return null; // a problem dropped from the bank
  const entry = p.problems[slug];
  return {
    slug,
    title: problem.title,
    difficulty: problem.difficulty,
    pattern: problem.pattern,
    patternName: patternName(problem.pattern),
    dueAt: review.dueAt,
    overdueDays: Math.max(0, daysBetween(review.dueAt, now)),
    step: review.step,
    of: REVIEW_STEPS.length,
    lapses: review.lapses,
    lastPercent: entry?.lastPercent ?? 0,
  };
}

/** Everything due now, most overdue first. */
export function dueList(p: Progress, limit?: number, now = Date.now()): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const q of PROBLEMS) {
    const review = p.problems[q.slug]?.review;
    if (!review || Date.parse(review.dueAt) > now) continue;
    const row = item(p, q.slug, review, now);
    if (row) items.push(row);
  }
  items.sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  return limit == null ? items : items.slice(0, limit);
}

/** What's coming, soonest first — everything not due yet. */
export function upcomingList(p: Progress, limit?: number, now = Date.now()): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const q of PROBLEMS) {
    const review = p.problems[q.slug]?.review;
    if (!review || Date.parse(review.dueAt) <= now) continue;
    const row = item(p, q.slug, review, now);
    if (row) items.push(row);
  }
  items.sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  return limit == null ? items : items.slice(0, limit);
}

export function reviewSummary(p: Progress, now = Date.now()): ReviewSummary {
  let due = 0;
  let next7 = 0;
  let mastered = 0;
  let scheduled = 0;
  for (const entry of Object.values(p.problems)) {
    const review = entry.review;
    if (!review) continue;
    scheduled++;
    const at = Date.parse(review.dueAt);
    if (at <= now) due++;
    else if (at <= now + 7 * DAY_MS) next7++;
    if (review.step >= MASTERED_STEP) mastered++;
  }
  return { due, next7, scheduled, mastered };
}
