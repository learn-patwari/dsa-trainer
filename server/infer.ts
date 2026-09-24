import { patternName } from '../shared/patterns/index.ts';
import { getProblem } from '../shared/problems/index.ts';
import type { LeetCodeProblem, PatternGuess, PatternId } from '../shared/types.ts';

/**
 * Guesses which of the 23 patterns an arbitrary LeetCode problem needs, from its topic
 * tags plus a few give-away phrases in the title and statement. Curated problems use
 * their hand-assigned pattern instead, which is always right.
 */

type Weighted = [PatternId, number];

/** LeetCode topic tag → the patterns it suggests. Generic tags (array, string, math) say nothing. */
const TAG_WEIGHTS: Record<string, Weighted[]> = {
  'sliding-window': [['sliding-window', 4]],
  'two-pointers': [['two-pointers', 3], ['fast-slow', 1]],
  'hash-table': [['hashing', 2]],
  'prefix-sum': [['prefix-sum', 4]],
  'binary-search': [['binary-search', 4]],
  stack: [['stack', 3], ['monotonic-stack', 1]],
  'monotonic-stack': [['monotonic-stack', 4]],
  'monotonic-queue': [['sliding-window', 2], ['monotonic-stack', 2]],
  queue: [['tree-bfs', 1], ['graph-traversal', 1]],
  'linked-list': [['linked-list', 3], ['fast-slow', 1]],
  tree: [['tree-dfs', 2], ['tree-bfs', 1]],
  'binary-tree': [['tree-dfs', 2], ['tree-bfs', 1]],
  'binary-search-tree': [['tree-dfs', 2], ['binary-search', 1]],
  'depth-first-search': [['graph-traversal', 2], ['tree-dfs', 1], ['backtracking', 1]],
  'breadth-first-search': [['graph-traversal', 2], ['tree-bfs', 2]],
  graph: [['graph-traversal', 3]],
  matrix: [['graph-traversal', 1], ['dp-2d', 1]],
  'topological-sort': [['topological-sort', 4]],
  'union-find': [['union-find', 4]],
  'shortest-path': [['shortest-path', 4]],
  'minimum-spanning-tree': [['union-find', 3]],
  'heap-priority-queue': [['heap', 3]],
  'quickselect': [['heap', 2]],
  greedy: [['greedy', 3]],
  backtracking: [['backtracking', 4]],
  recursion: [['tree-dfs', 1], ['backtracking', 1]],
  memoization: [['dp-1d', 1], ['dp-2d', 1]],
  'dynamic-programming': [['dp-1d', 2], ['dp-2d', 2]],
  trie: [['trie', 4]],
  'bit-manipulation': [['bit-manipulation', 3]],
  bitmask: [['bit-manipulation', 2], ['dp-2d', 1]],
  'line-sweep': [['intervals', 4]],
  sorting: [['intervals', 1], ['greedy', 1], ['two-pointers', 1]],
  counting: [['hashing', 1]],
  'ordered-set': [['heap', 1], ['binary-search', 1]],
  'divide-and-conquer': [['binary-search', 1], ['heap', 1]],
  'string-matching': [['sliding-window', 1], ['trie', 1]],
};

/** Phrases that point at a pattern regardless of how the problem is tagged. */
const PHRASES: { match: RegExp; add: Weighted[]; why: string }[] = [
  { match: /\b(substring|subarray)\b/, add: [['sliding-window', 2], ['prefix-sum', 1]], why: 'asks about a contiguous substring/subarray' },
  { match: /\bsorted\b/, add: [['binary-search', 1], ['two-pointers', 1]], why: 'the input is sorted' },
  { match: /\bcycle\b/, add: [['fast-slow', 2], ['graph-traversal', 1]], why: 'mentions a cycle' },
  { match: /\b(kth|k-?th|top k|k closest|k most)\b/, add: [['heap', 3]], why: 'wants the k best items' },
  { match: /\bpalindrom/, add: [['two-pointers', 1], ['dp-2d', 1]], why: 'about palindromes' },
  { match: /\b(prerequisite|course)\b/, add: [['topological-sort', 3]], why: 'dependencies between tasks' },
  { match: /\b(island|grid|cell)\b/, add: [['graph-traversal', 2]], why: 'explores a grid' },
  { match: /\b(interval|meeting|overlap)/, add: [['intervals', 3]], why: 'about intervals and overlaps' },
  { match: /\bsubsequence\b/, add: [['dp-1d', 2], ['dp-2d', 1]], why: 'about subsequences' },
  { match: /\b(permutation|combination|subsets|all possible|generate all)\b/, add: [['backtracking', 3]], why: 'enumerates every possibility' },
  { match: /\bprefix\b/, add: [['trie', 2], ['prefix-sum', 1]], why: 'mentions prefixes' },
  { match: /\b(minimum|shortest|cheapest) (path|cost|time|effort)\b/, add: [['shortest-path', 2], ['graph-traversal', 1]], why: 'a cheapest-path question' },
  { match: /\b(linked list|listnode)\b/, add: [['linked-list', 2]], why: 'operates on a linked list' },
  { match: /\bwindow\b/, add: [['sliding-window', 2]], why: 'mentions a window' },
  { match: /\bparenthes/, add: [['stack', 2]], why: 'matching brackets' },
  { match: /\bnext greater|warmer|span\b/, add: [['monotonic-stack', 3]], why: 'looks for the next greater element' },
];

export interface Inference {
  /** Set when the problem is in the curated bank, where the pattern is hand-assigned. */
  curated: PatternId | null;
  guesses: PatternGuess[];
}

export function inferPatterns(problem: Pick<LeetCodeProblem, 'slug' | 'title' | 'topicTags' | 'contentHtml'>): Inference {
  const curatedProblem = getProblem(problem.slug);
  const scores = new Map<PatternId, number>();
  const reasons = new Map<PatternId, string[]>();

  const add = (weights: Weighted[], why: string) => {
    for (const [id, w] of weights) {
      scores.set(id, (scores.get(id) ?? 0) + w);
      const list = reasons.get(id) ?? [];
      if (!list.includes(why)) list.push(why);
      reasons.set(id, list);
    }
  };

  for (const tag of problem.topicTags) {
    const weights = TAG_WEIGHTS[tag.slug];
    if (weights) add(weights, `tagged "${tag.name}"`);
  }

  const text = `${problem.title} ${stripHtml(problem.contentHtml ?? '')}`.toLowerCase();
  for (const p of PHRASES) {
    if (p.match.test(text)) add(p.add, p.why);
  }

  const total = [...scores.values()].reduce((a, b) => a + b, 0);
  const guesses: PatternGuess[] = [...scores.entries()]
    .map(([id, score]) => ({
      pattern: id,
      name: patternName(id),
      score,
      confidence: total === 0 ? 0 : Math.round((100 * score) / total),
      why: reasons.get(id) ?? [],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { curated: curatedProblem?.pattern ?? null, guesses };
}

/** Which patterns count as a correct answer for this problem in challenge mode. */
export function acceptedPatterns(slug: string, inference: Inference): PatternId[] {
  const curated = getProblem(slug);
  if (curated) return [curated.pattern, ...(curated.alsoAccept ?? [])];
  const top = inference.guesses[0];
  if (!top) return [];
  // Anything close to the top guess counts: tags rarely pin down a single pattern.
  return inference.guesses.filter((g) => g.score >= top.score * 0.7).map((g) => g.pattern);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}
