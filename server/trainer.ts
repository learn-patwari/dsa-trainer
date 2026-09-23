import { randomInt } from 'node:crypto';
import { getPattern, isPatternId, patternName, PATTERNS } from '../shared/patterns/index.ts';
import { getProblem, PROBLEMS, problemsForPattern } from '../shared/problems/index.ts';
import { scoreAttempt, START_RATING, tierFor, updateRating } from '../shared/scoring.ts';
import type {
  AttemptResult,
  AttemptSubmission,
  CuratedProblem,
  DashboardState,
  PatternDetail,
  PatternId,
  PatternSummary,
  PracticeMode,
  ProblemView,
  Progress,
  Recommendation,
  RunResult,
} from '../shared/types.ts';

const HISTORY_LIMIT = 1000;
/** Fewer LeetCode solves than this under a pattern's topic tags counts as "avoided". */
const AVOIDED_BELOW = 5;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function requireProblem(slug: string): CuratedProblem {
  const p = getProblem(slug);
  if (!p) throw new HttpError(404, `"${slug}" is not in the curated problem set.`);
  return p;
}

export function requirePatternId(id: string): PatternId {
  if (!isPatternId(id)) throw new HttpError(404, `Unknown pattern "${id}".`);
  return id;
}

export function parseMode(mode: unknown): PracticeMode {
  return mode === 'blind' ? 'blind' : 'pattern';
}

function shuffled<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function lcSolvedSet(p: Progress): Set<string> {
  return new Set(p.leetcode?.solvedSlugs ?? []);
}

// ---------------------------------------------------------------- problem page

export function problemView(p: Progress, slug: string, mode: PracticeMode): ProblemView {
  const problem = requireProblem(slug);
  const progress = p.problems[slug] ?? null;
  const reveal = mode === 'pattern' || attempted(p, slug);
  const siblings = problemsForPattern(problem.pattern);
  const idx = siblings.findIndex((s) => s.slug === slug);
  return {
    slug,
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    mode,
    pattern: reveal ? { id: problem.pattern, name: patternName(problem.pattern) } : null,
    quiz: {
      askPattern: mode === 'blind',
      insight: { q: problem.insight.q, options: shuffled(problem.insight.options) },
      vars: problem.vars ?? null,
      time: shuffled(problem.time),
      space: shuffled(problem.space),
      edgeCases: problem.edgeCases,
    },
    lcSolved: lcSolvedSet(p).has(slug),
    progress,
    nextInPattern: siblings[idx + 1]?.slug ?? null,
  };
}

// ---------------------------------------------------------------- grading

export function validateSubmission(body: unknown): AttemptSubmission {
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Expected a JSON body.');
  const b = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v.length <= 500 ? v : null);
  const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, v)) : 0);
  return {
    mode: parseMode(b.mode),
    pattern: isPatternId(b.pattern) ? b.pattern : null,
    insight: str(b.insight),
    time: str(b.time),
    space: str(b.space),
    edgeCasesHandled: Array.isArray(b.edgeCasesHandled) ? b.edgeCasesHandled.filter((i): i is number => Number.isInteger(i)) : [],
    hintsUsed: Math.floor(num(b.hintsUsed, 20)),
    elapsedSec: Math.round(num(b.elapsedSec, 24 * 3600)),
  };
}

/**
 * Grades an attempt and records it. Only the FIRST attempt at a problem moves your
 * pattern rating; later attempts are practice, since you've seen the answers.
 */
export function recordAttempt(p: Progress, slug: string, sub: AttemptSubmission): AttemptResult {
  const problem = requireProblem(slug);
  const outcome = scoreAttempt(problem, sub, patternName);
  const prior = p.problems[slug];
  const rated = !attempted(p, slug);
  const before = p.ratings[problem.pattern] ?? START_RATING;
  const ratedSoFar = p.ratedAttempts[problem.pattern] ?? 0;
  const after = rated ? updateRating(before, problem.difficulty, outcome.percent, ratedSoFar) : before;

  const result: AttemptResult = {
    slug,
    title: problem.title,
    mode: sub.mode,
    pattern: problem.pattern,
    ...outcome,
    rated,
    ratingBefore: before,
    ratingAfter: after,
    approach: problem.approach,
    at: new Date().toISOString(),
    elapsedSec: sub.elapsedSec,
  };

  if (rated) {
    p.ratings[problem.pattern] = after;
    p.ratedAttempts[problem.pattern] = ratedSoFar + 1;
  }
  p.problems[slug] = {
    ...prior,
    attempts: (prior?.attempts ?? 0) + 1,
    bestPercent: Math.max(prior?.bestPercent ?? 0, outcome.percent),
    lastPercent: outcome.percent,
    lastAt: result.at,
    lastResult: result,
  };
  p.history.push(result);
  if (p.history.length > HISTORY_LIMIT) p.history.splice(0, p.history.length - HISTORY_LIMIT);
  return result;
}

export function saveWork(p: Progress, slug: string, body: unknown): void {
  requireProblem(slug);
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const text = (v: unknown, field: string) => {
    if (v === undefined) return undefined;
    if (typeof v !== 'string' || v.length > 100_000) throw new HttpError(400, `"${field}" must be a string under 100 KB.`);
    return v;
  };
  const code = text(b.code, 'code');
  const notes = text(b.notes, 'notes');
  const existing = p.problems[slug];
  // Saving code or notes shouldn't count as an attempt, so keep attempts at 0 until graded.
  p.problems[slug] = {
    attempts: 0,
    bestPercent: 0,
    lastPercent: 0,
    lastAt: '',
    ...existing,
    ...(code !== undefined ? { code } : {}),
    ...(notes !== undefined ? { notes } : {}),
  };
}

/** Records a compile & run: the code that ran plus a summary for the "code verified" badge. */
export function recordRun(p: Progress, slug: string, code: string, result: RunResult): void {
  saveWork(p, slug, { code });
  p.problems[slug]!.lastRun = {
    at: result.at,
    compiled: result.compiled,
    passed: result.passed,
    checked: result.checked,
    total: result.total,
  };
}

export function codeVerified(p: Progress, slug: string): boolean {
  const run = p.problems[slug]?.lastRun;
  return run != null && run.compiled && run.checked > 0 && run.passed === run.checked;
}

// ---------------------------------------------------------------- summaries

function lcTagSolved(p: Progress, id: PatternId): number | null {
  const tags = getPattern(id).leetcodeTags;
  if (!p.leetcode || tags.length === 0) return null;
  return Math.max(0, ...tags.map((t) => p.leetcode!.tagCounts.find((c) => c.tagSlug === t)?.solved ?? 0));
}

function attempted(p: Progress, slug: string): boolean {
  return (p.problems[slug]?.attempts ?? 0) > 0;
}

export function patternSummary(p: Progress, id: PatternId): PatternSummary {
  const pattern = getPattern(id);
  const problems = problemsForPattern(id);
  const solvedOnLc = lcSolvedSet(p);
  const rating = p.ratings[id] ?? null;
  return {
    id,
    name: pattern.name,
    group: pattern.group,
    summary: pattern.summary,
    rating,
    tier: tierFor(rating),
    ratedAttempts: p.ratedAttempts[id] ?? 0,
    total: problems.length,
    attempted: problems.filter((q) => attempted(p, q.slug)).length,
    lcSolvedInSet: problems.filter((q) => solvedOnLc.has(q.slug)).length,
    lcTagSolved: lcTagSolved(p, id),
  };
}

export function patternDetail(p: Progress, id: PatternId): PatternDetail {
  const solvedOnLc = lcSolvedSet(p);
  return {
    pattern: getPattern(id),
    summary: patternSummary(p, id),
    problems: problemsForPattern(id).map((q) => ({
      slug: q.slug,
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      attempts: p.problems[q.slug]?.attempts ?? 0,
      bestPercent: attempted(p, q.slug) ? (p.problems[q.slug]?.bestPercent ?? 0) : null,
      lcSolved: solvedOnLc.has(q.slug),
      codeVerified: codeVerified(p, q.slug),
    })),
  };
}

/** Rated attempts before a pattern's rating is considered settled (and "Up next" moves on). */
const SETTLE_AFTER = 3;

function inProgress(s: PatternSummary): boolean {
  return s.ratedAttempts > 0 && s.ratedAttempts < SETTLE_AFTER && s.attempted < s.total;
}

/**
 * Patterns ordered from "most needs work" to "least": finish settling patterns you've
 * started, then low ratings, then patterns you've avoided on LeetCode.
 */
function prioritizedPatterns(p: Progress): PatternSummary[] {
  const order = new Map(PATTERNS.map((pt, i) => [pt.id, i]));
  const weight = (s: PatternSummary) =>
    (s.rating ?? START_RATING) -
    (inProgress(s) ? 150 : 0) -
    (s.lcTagSolved != null && s.lcTagSolved < AVOIDED_BELOW ? 60 : 0) +
    (s.attempted >= s.total ? 10_000 : 0);
  return PATTERNS.map((pt) => patternSummary(p, pt.id)).sort(
    (a, b) => weight(a) - weight(b) || order.get(a.id)! - order.get(b.id)!,
  );
}

/** The next unattempted problem in a pattern, preferring ones you haven't already solved on LeetCode. */
function nextProblem(p: Progress, id: PatternId, exclude?: string): CuratedProblem | undefined {
  const solvedOnLc = lcSolvedSet(p);
  const open = problemsForPattern(id).filter((q) => !attempted(p, q.slug) && q.slug !== exclude);
  return open.find((q) => !solvedOnLc.has(q.slug)) ?? open[0];
}

function reasonFor(s: PatternSummary): string {
  const left = s.total - s.attempted;
  if (inProgress(s)) {
    const more = SETTLE_AFTER - s.ratedAttempts;
    return `Keep going: ${more} more problem${more === 1 ? '' : 's'} to settle this rating (now ${s.rating})`;
  }
  if (s.rating == null) {
    return s.lcTagSolved != null && s.lcTagSolved < AVOIDED_BELOW
      ? `New pattern, and you've solved only ${s.lcTagSolved} related problem${s.lcTagSolved === 1 ? '' : 's'} on LeetCode`
      : 'New pattern: read the lesson, then try its first problem';
  }
  return `Rating ${s.rating} (${s.tier}), ${left} problem${left === 1 ? '' : 's'} left`;
}

export function recommendations(p: Progress, limit = 3): Recommendation[] {
  const out: Recommendation[] = [];
  for (const s of prioritizedPatterns(p)) {
    const next = nextProblem(p, s.id);
    if (!next) continue;
    out.push({
      slug: next.slug,
      title: next.title,
      difficulty: next.difficulty,
      pattern: s.id,
      patternName: s.name,
      reason: reasonFor(s),
    });
    if (out.length === limit) break;
  }
  return out;
}

/** A problem for blind practice, drawn from the next problems of your five weakest patterns. */
export function pickBlind(p: Progress, exclude?: string): string {
  const pool = prioritizedPatterns(p)
    .slice(0, 5)
    .flatMap((s) => {
      const open = problemsForPattern(s.id).filter((q) => !attempted(p, q.slug) && q.slug !== exclude);
      return open.slice(0, 2);
    });
  const fallback = PROBLEMS.filter((q) => !attempted(p, q.slug) && q.slug !== exclude);
  const choices = pool.length ? pool : fallback.length ? fallback : PROBLEMS.filter((q) => q.slug !== exclude);
  return choices[randomInt(choices.length)]!.slug;
}

export function dashboard(p: Progress, sessionConfigured: boolean): DashboardState {
  const patterns = PATTERNS.map((pt) => patternSummary(p, pt.id));
  const rated = patterns.filter((s) => s.rating != null);
  const overall = rated.length ? Math.round(rated.reduce((sum, s) => sum + s.rating!, 0) / rated.length) : null;
  return {
    overall,
    overallTier: tierFor(overall),
    attemptedProblems: PROBLEMS.filter((q) => attempted(p, q.slug)).length,
    totalProblems: PROBLEMS.length,
    patterns,
    upNext: recommendations(p),
    recent: p.history.slice(-8).reverse(),
    leetcode: p.leetcode ?? null,
    sessionConfigured,
  };
}
