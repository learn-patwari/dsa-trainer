import type { PatternId } from '../types.ts';
import { binarySearch, bits, greedy, hashing, intervals, monotonicStack, prefixSum, slidingWindow, stack, twoPointers } from './arrays.ts';
import { backtracking, dp1d, dp2d } from './dp.ts';
import { graphTraversal, shortestPath, topologicalSort, unionFind } from './graphs.ts';
import { fastSlow, linkedList } from './lists.ts';
import { heap, treeBfs, treeDfs, trie } from './trees.ts';
import type { PatternAnimation } from './types.ts';

export type * from './types.ts';

/**
 * One animation per pattern. Each builder runs the real algorithm on a small
 * example and records a frame at every step, so they are only built on demand.
 */
const BUILDERS: Record<PatternId, () => PatternAnimation> = {
  hashing,
  'two-pointers': twoPointers,
  'sliding-window': slidingWindow,
  'prefix-sum': prefixSum,
  'binary-search': binarySearch,
  stack,
  'monotonic-stack': monotonicStack,
  'linked-list': linkedList,
  'fast-slow': fastSlow,
  'tree-dfs': treeDfs,
  'tree-bfs': treeBfs,
  heap,
  intervals,
  greedy,
  backtracking,
  'graph-traversal': graphTraversal,
  'topological-sort': topologicalSort,
  'union-find': unionFind,
  'shortest-path': shortestPath,
  'dp-1d': dp1d,
  'dp-2d': dp2d,
  trie,
  'bit-manipulation': bits,
};

const cache = new Map<PatternId, PatternAnimation>();

export function animationFor(pattern: PatternId): PatternAnimation {
  let a = cache.get(pattern);
  if (!a) {
    a = BUILDERS[pattern]();
    cache.set(pattern, a);
  }
  return a;
}

export const ANIMATED_PATTERNS = Object.keys(BUILDERS) as PatternId[];
