import type {
  AttemptSubmission,
  CuratedProblem,
  Difficulty,
  PatternId,
  QuestionResult,
  Tier,
} from './types.ts';

/** Points per question. Pattern is blind mode only; brute is asked when the problem has one. */
export const POINTS = { pattern: 3, brute: 1, insight: 3, time: 2, space: 1, edgeCases: 1 } as const;
/** Partial credit for picking a pattern listed in `alsoAccept`. */
export const ALT_PATTERN_POINTS = 2;
export const HINT_PENALTY = 1;

export const START_RATING = 1200;
/** Rating of the "opponent" in the Elo update, by difficulty. */
export const PROBLEM_RATING: Record<Difficulty, number> = { Easy: 1200, Medium: 1500, Hard: 1800 };

export interface ScoreOutcome {
  breakdown: QuestionResult[];
  score: number;
  maxScore: number;
  hintPenalty: number;
  percent: number;
}

export function scoreAttempt(
  problem: CuratedProblem,
  sub: AttemptSubmission,
  patternName: (id: PatternId) => string,
): ScoreOutcome {
  const breakdown: QuestionResult[] = [];

  if (sub.mode === 'blind') {
    const chosen = sub.pattern;
    let earned = 0;
    let verdict: QuestionResult['verdict'] = chosen ? 'wrong' : 'skipped';
    if (chosen === problem.pattern) {
      earned = POINTS.pattern;
      verdict = 'correct';
    } else if (chosen && problem.alsoAccept?.includes(chosen)) {
      earned = ALT_PATTERN_POINTS;
      verdict = 'partial';
    }
    const alts = problem.alsoAccept?.length
      ? ` (also workable: ${problem.alsoAccept.map(patternName).join(', ')})`
      : '';
    breakdown.push({
      key: 'pattern',
      label: 'Pattern',
      earned,
      max: POINTS.pattern,
      verdict,
      chosen: chosen ? patternName(chosen) : null,
      correct: patternName(problem.pattern) + alts,
    });
  }

  if (problem.brute) {
    // Striver's ladder: name the slow solution before the fast one.
    breakdown.push(choice('brute', 'Brute force', POINTS.brute, sub.brute, problem.brute.time[0], problem.brute.text));
  }

  breakdown.push(
    choice('insight', 'Key insight', POINTS.insight, sub.insight, problem.insight.options[0], problem.insight.why),
    choice('time', 'Time complexity', POINTS.time, sub.time, problem.time[0]),
    choice('space', 'Space complexity', POINTS.space, sub.space, problem.space[0]),
  );

  const n = problem.edgeCases.length;
  const handled = new Set(sub.edgeCasesHandled.filter((i) => Number.isInteger(i) && i >= 0 && i < n));
  breakdown.push({
    key: 'edgeCases',
    label: 'Edge cases (self-check)',
    earned: n === 0 ? POINTS.edgeCases : round2((POINTS.edgeCases * handled.size) / n),
    max: POINTS.edgeCases,
    verdict: handled.size === n ? 'correct' : handled.size === 0 ? 'wrong' : 'partial',
    chosen: `${handled.size} of ${n}`,
    correct: problem.edgeCases.join(' · '),
  });

  const maxScore = breakdown.reduce((s, q) => s + q.max, 0);
  const raw = breakdown.reduce((s, q) => s + q.earned, 0);
  const hintPenalty = Math.min(raw, Math.max(0, Math.floor(sub.hintsUsed)) * HINT_PENALTY);
  const score = round2(raw - hintPenalty);
  return { breakdown, score, maxScore, hintPenalty, percent: Math.round((100 * score) / maxScore) };
}

function choice(
  key: QuestionResult['key'],
  label: string,
  max: number,
  chosen: string | null,
  correct: string,
  explanation?: string,
): QuestionResult {
  const verdict = chosen == null ? 'skipped' : chosen === correct ? 'correct' : 'wrong';
  return { key, label, max, earned: verdict === 'correct' ? max : 0, verdict, chosen, correct, explanation };
}

/** Elo expected score of a player rated `rating` against a problem of this difficulty. */
export function expectedScore(rating: number, difficulty: Difficulty): number {
  return 1 / (1 + 10 ** ((PROBLEM_RATING[difficulty] - rating) / 400));
}

/** K-factor: larger for the first few rated attempts in a pattern so ratings settle quickly. */
export function kFactor(ratedAttemptsSoFar: number): number {
  return ratedAttemptsSoFar < 3 ? 48 : 32;
}

/** New pattern rating after scoring `percent` (0-100) on a problem. */
export function updateRating(rating: number, difficulty: Difficulty, percent: number, ratedAttemptsSoFar: number): number {
  const actual = Math.min(1, Math.max(0, percent / 100));
  return Math.round(rating + kFactor(ratedAttemptsSoFar) * (actual - expectedScore(rating, difficulty)));
}

export function tierFor(rating: number | null): Tier {
  if (rating == null) return 'Not started';
  if (rating < 1250) return 'Novice';
  if (rating < 1400) return 'Learning';
  if (rating < 1550) return 'Solid';
  if (rating < 1700) return 'Strong';
  return 'Expert';
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
