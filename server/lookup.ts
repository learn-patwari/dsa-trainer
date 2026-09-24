import { patternName } from '../shared/patterns/index.ts';
import { getProblem as getCurated, problemsForPattern } from '../shared/problems/index.ts';
import type { Difficulty, LeetCodeProblem, LookupResult, PatternId, Progress, SimilarProblem } from '../shared/types.ts';
import { inferPatterns } from './infer.ts';

/**
 * "Which pattern is this, and what else looks like it?" for any LeetCode problem,
 * curated or not.
 */

interface RawSimilar {
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
}

function parseSimilar(json: string | null): RawSimilar[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as RawSimilar[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function lookup(p: Progress, problem: LeetCodeProblem): LookupResult {
  const inference = inferPatterns(problem);
  const pattern: PatternId | null = inference.curated ?? inference.guesses[0]?.pattern ?? null;
  const solved = new Set(p.leetcode?.solvedSlugs ?? []);
  const seen = new Set<string>([problem.slug]);

  const similar: SimilarProblem[] = [];
  const push = (slug: string, title: string, difficulty: Difficulty, curated: boolean) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    similar.push({
      slug,
      title,
      difficulty,
      curated,
      lcSolved: solved.has(slug),
      attempted: (p.problems[slug]?.attempts ?? 0) > 0,
    });
  };

  // Same pattern from the curated bank first: those come with a lesson and an approach check.
  if (pattern) {
    for (const q of problemsForPattern(pattern).slice(0, 6)) push(q.slug, q.title, q.difficulty, true);
  }
  for (const s of parseSimilar(problem.similarQuestions).slice(0, 6)) {
    push(s.titleSlug, s.title, s.difficulty, getCurated(s.titleSlug) != null);
  }

  return {
    slug: problem.slug,
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    topicTags: problem.topicTags,
    curated: inference.curated ? { pattern: inference.curated, name: patternName(inference.curated) } : null,
    guesses: inference.guesses,
    similar,
    lcSolved: solved.has(problem.slug),
  };
}
