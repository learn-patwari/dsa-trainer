import { PATTERN_IDS, type CuratedProblem, type PatternId } from '../types.ts';
import { hashingProblems, slidingWindowProblems, twoPointerProblems } from './arrays-a.ts';
import { binarySearchProblems, prefixSumProblems } from './arrays-b.ts';
import { bitProblems, dp1dProblems, dp2dProblems, trieProblems } from './dp.ts';
import { extraArrayProblems, extraStackListProblems, extraTreeHeapProblems } from './extra-a.ts';
import { externalArraysA } from './external-a.ts';
import { externalDpGreedy } from './external-b.ts';
import { externalGraphsTrees } from './external-c.ts';
import { extraDpProblems, extraGraphProblems, extraTechniqueProblems } from './extra-b.ts';
import { graphTraversalProblems, shortestPathProblems, topoSortProblems, unionFindProblems } from './graphs.ts';
import { fastSlowProblems, linkedListProblems, monotonicStackProblems, stackProblems } from './lists.ts';
import { backtrackingProblems, greedyProblems, intervalProblems } from './techniques.ts';
import { heapProblems, treeBfsProblems, treeDfsProblems } from './trees.ts';

const all: CuratedProblem[] = [
  ...hashingProblems,
  ...twoPointerProblems,
  ...slidingWindowProblems,
  ...prefixSumProblems,
  ...binarySearchProblems,
  ...stackProblems,
  ...monotonicStackProblems,
  ...linkedListProblems,
  ...fastSlowProblems,
  ...treeDfsProblems,
  ...treeBfsProblems,
  ...heapProblems,
  ...intervalProblems,
  ...greedyProblems,
  ...backtrackingProblems,
  ...graphTraversalProblems,
  ...topoSortProblems,
  ...unionFindProblems,
  ...shortestPathProblems,
  ...dp1dProblems,
  ...dp2dProblems,
  ...trieProblems,
  ...bitProblems,
  // Second pass: two more problems for every pattern.
  ...extraArrayProblems,
  ...extraStackListProblems,
  ...extraTreeHeapProblems,
  ...extraTechniqueProblems,
  ...extraGraphProblems,
  ...extraDpProblems,
  // Problems from outside LeetCode.
  ...externalArraysA,
  ...externalDpGreedy,
  ...externalGraphsTrees,
];

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;

/** Curated problems in curriculum order: pattern order, then Easy → Hard (stable within a difficulty). */
export const PROBLEMS: CuratedProblem[] = PATTERN_IDS.flatMap((id) =>
  all
    .filter((p) => p.pattern === id)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => DIFFICULTY_ORDER[a.p.difficulty] - DIFFICULTY_ORDER[b.p.difficulty] || a.i - b.i)
    .map(({ p }) => p),
);

const bySlug = new Map(PROBLEMS.map((p) => [p.slug, p]));

export function getProblem(slug: string): CuratedProblem | undefined {
  return bySlug.get(slug);
}

export function problemsForPattern(id: PatternId): CuratedProblem[] {
  return PROBLEMS.filter((p) => p.pattern === id);
}
