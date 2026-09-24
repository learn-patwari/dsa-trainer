import { randomInt } from 'node:crypto';
import { patternName } from '../shared/patterns/index.ts';
import { getProblem, PROBLEMS } from '../shared/problems/index.ts';
import type { ChallengeAnswer, ChallengeStats, LeetCodeProblem, PatternId, Progress } from '../shared/types.ts';
import { freeProblems, getCatalog, type CatalogEntry } from './catalog.ts';
import { acceptedPatterns, inferPatterns } from './infer.ts';

/**
 * Challenge mode: "which pattern does this need?" over the whole LeetCode catalog.
 * Curated problems are graded against their hand-assigned pattern; everything else
 * against what the topic tags imply.
 */

/** Most interview problems are Medium, so lean the draw that way. */
const DIFFICULTY_ODDS: Record<string, number> = { Easy: 25, Medium: 55, Hard: 20 };
/** How often to draw from the curated bank rather than the wider catalog. */
const CURATED_SHARE = 0.4;

export function emptyStats(): ChallengeStats {
  return { asked: 0, correct: 0, streak: 0, bestStreak: 0 };
}

export function challengeStats(p: Progress): ChallengeStats {
  const c = p.challenge;
  return c ? { asked: c.asked, correct: c.correct, streak: c.streak, bestStreak: c.bestStreak } : emptyStats();
}

function weightedDifficulty(): string {
  const roll = randomInt(100);
  return roll < DIFFICULTY_ODDS.Easy! ? 'Easy' : roll < DIFFICULTY_ODDS.Easy! + DIFFICULTY_ODDS.Medium! ? 'Medium' : 'Hard';
}

/** Picks the next problem: sometimes from your bank, sometimes from anywhere on LeetCode. */
export async function pickChallenge(exclude?: string): Promise<{ slug: string; curated: boolean }> {
  const wantCurated = randomInt(100) < CURATED_SHARE * 100;
  if (wantCurated) {
    const pool = PROBLEMS.filter((p) => p.slug !== exclude);
    return { slug: pool[randomInt(pool.length)]!.slug, curated: true };
  }
  const catalog = await getCatalog();
  const difficulty = weightedDifficulty();
  const pool = freeProblems(catalog).filter((p) => p.difficulty === difficulty && p.slug !== exclude);
  const fallback: CatalogEntry[] = pool.length ? pool : freeProblems(catalog);
  const pick = fallback[randomInt(fallback.length)]!;
  return { slug: pick.slug, curated: getProblem(pick.slug) != null };
}

/** Grades a pattern answer and updates the recognition stats. */
export function gradeChallenge(p: Progress, problem: LeetCodeProblem, chosen: PatternId | null): ChallengeAnswer {
  const inference = inferPatterns(problem);
  const accepted = acceptedPatterns(problem.slug, inference);
  const curated = getProblem(problem.slug) != null;
  const correct = chosen != null && accepted.includes(chosen);

  const stats = p.challenge ?? { ...emptyStats(), perPattern: {} };
  stats.asked += 1;
  if (correct) {
    stats.correct += 1;
    stats.streak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
  } else {
    stats.streak = 0;
  }
  const key = accepted[0];
  if (key) {
    const per = stats.perPattern[key] ?? { asked: 0, correct: 0 };
    per.asked += 1;
    if (correct) per.correct += 1;
    stats.perPattern[key] = per;
  }
  p.challenge = stats;

  return {
    correct,
    chosen,
    accepted: accepted.map((id) => ({ pattern: id, name: patternName(id) })),
    why: curated ? ['This problem is in your curated bank, so the pattern is hand-assigned.'] : (inference.guesses[0]?.why ?? []),
    curated,
    stats: challengeStats(p),
    lessonPattern: accepted[0] ?? null,
  };
}
