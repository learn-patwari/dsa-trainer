import { describe, expect, it } from 'vitest';
import { getProblem, problemsForPattern } from '../shared/problems/index.ts';
import { START_RATING } from '../shared/scoring.ts';
import type { AttemptSubmission, LeetCodeImport } from '../shared/types.ts';
import { emptyProgress } from '../server/store.ts';
import {
  dashboard,
  isBlank,
  patternSummary,
  pickBlind,
  problemView,
  recommendations,
  recordAttempt,
  revisitList,
  saveWork,
  validateSubmission,
} from '../server/trainer.ts';

function answers(slug: string, mode: AttemptSubmission['mode'] = 'pattern'): AttemptSubmission {
  const p = getProblem(slug)!;
  return {
    mode,
    pattern: p.pattern,
    brute: p.brute?.time[0] ?? null,
    insight: p.insight.options[0],
    time: p.time[0],
    space: p.space[0],
    edgeCasesHandled: p.edgeCases.map((_, i) => i),
    hintsUsed: 0,
    activeSec: 20,
    elapsedSec: 30,
  };
}

describe('a blank submission', () => {
  const nothing: AttemptSubmission = {
    mode: 'pattern',
    pattern: null,
    brute: null,
    insight: null,
    time: null,
    space: null,
    edgeCasesHandled: [],
    hintsUsed: 0,
    elapsedSec: 5,
    activeSec: 5,
  };

  it('is recognised as a slip', () => {
    expect(isBlank(nothing)).toBe(true);
    expect(isBlank({ ...nothing, edgeCasesHandled: [0] })).toBe(false);
    expect(isBlank({ ...nothing, time: 'O(n)' })).toBe(false);
    expect(isBlank({ ...nothing, pattern: 'hashing' })).toBe(false);
  });

  it('is refused rather than spending the one rated attempt on a zero', () => {
    const p = emptyProgress();
    expect(() => recordAttempt(p, 'two-sum', nothing)).toThrow(/at least one question/i);
    expect(p.history).toEqual([]);
    expect(p.problems['two-sum']).toBeUndefined();
    expect(p.ratings.hashing).toBeUndefined();
  });

  it('accepts an attempt that answers only the edge-case check', () => {
    const p = emptyProgress();
    const r = recordAttempt(p, 'two-sum', { ...nothing, edgeCasesHandled: [0] });
    expect(r.rated).toBe(true);
    expect(r.percent).toBeGreaterThan(0);
  });
});

describe('recordAttempt', () => {
  it('rates only the first attempt at a problem', () => {
    const p = emptyProgress();
    const first = recordAttempt(p, 'two-sum', answers('two-sum'));
    expect(first.rated).toBe(true);
    expect(first.ratingAfter).toBeGreaterThan(START_RATING);
    expect(p.ratings.hashing).toBe(first.ratingAfter);

    const second = recordAttempt(p, 'two-sum', answers('two-sum'));
    expect(second.rated).toBe(false);
    expect(second.ratingAfter).toBe(first.ratingAfter);
    expect(p.problems['two-sum']).toMatchObject({ attempts: 2, bestPercent: 100 });
    expect(p.history).toHaveLength(2);
  });

  it('still rates the first graded attempt when code was saved beforehand', () => {
    const p = emptyProgress();
    saveWork(p, 'two-sum', { code: 'class Solution {}' });
    expect(recordAttempt(p, 'two-sum', answers('two-sum')).rated).toBe(true);
    expect(p.problems['two-sum']!.code).toBe('class Solution {}');
  });
});

describe('problemView', () => {
  it('hides the pattern in blind mode until the problem is attempted', () => {
    const p = emptyProgress();
    saveWork(p, 'two-sum', { notes: 'hmm' });
    expect(problemView(p, 'two-sum', 'blind').pattern).toBeNull();
    expect(problemView(p, 'two-sum', 'blind').quiz.askPattern).toBe(true);
    expect(problemView(p, 'two-sum', 'pattern').pattern?.id).toBe('hashing');
    recordAttempt(p, 'two-sum', answers('two-sum', 'blind'));
    expect(problemView(p, 'two-sum', 'blind').pattern?.id).toBe('hashing');
  });

  it('sends every option, shuffled, and never marks which one is correct', () => {
    const view = problemView(emptyProgress(), '3sum', 'pattern');
    const p = getProblem('3sum')!;
    expect([...view.quiz.insight.options].sort()).toEqual([...p.insight.options].sort());
    expect(JSON.stringify(view)).not.toContain('"approach"');
    expect(JSON.stringify(view)).not.toContain('"why"');
  });
});

describe('recommendations', () => {
  it('starts a new learner at the first pattern', () => {
    const recs = recommendations(emptyProgress());
    expect(recs[0]).toMatchObject({ slug: 'contains-duplicate', pattern: 'hashing' });
  });

  it('prefers patterns avoided on LeetCode and skips problems already solved there', () => {
    const p = emptyProgress();
    const lc: LeetCodeImport = {
      username: 'someone',
      importedAt: new Date().toISOString(),
      source: 'public',
      fullList: false,
      solvedCounts: { all: 100, easy: 50, medium: 40, hard: 10 },
      // Plenty solved everywhere except tries.
      tagCounts: ['hash-table', 'two-pointers', 'sliding-window', 'prefix-sum', 'binary-search', 'stack', 'monotonic-stack',
        'linked-list', 'binary-tree', 'breadth-first-search', 'heap-priority-queue', 'line-sweep', 'greedy', 'backtracking',
        'graph', 'topological-sort', 'union-find', 'shortest-path', 'dynamic-programming', 'bit-manipulation']
        .map((tagSlug) => ({ tagSlug, tagName: tagSlug, solved: 30 })),
      solvedSlugs: ['implement-trie-prefix-tree'],
    };
    p.leetcode = lc;
    const recs = recommendations(p);
    expect(recs[0]!.pattern).toBe('trie');
    expect(recs[0]!.slug).toBe('design-add-and-search-words-data-structure');
    expect(recs[0]!.reason).toMatch(/solved only 0 related problems/);
  });

  it('keeps you on a pattern until its rating has settled', () => {
    const p = emptyProgress();
    recordAttempt(p, 'contains-duplicate', answers('contains-duplicate'));
    const first = recommendations(p)[0]!;
    expect(first).toMatchObject({ pattern: 'hashing', slug: 'valid-anagram' });
    expect(first.reason).toMatch(/2 more problems to settle/);
    recordAttempt(p, 'valid-anagram', answers('valid-anagram'));
    recordAttempt(p, 'two-sum', answers('two-sum'));
    expect(recommendations(p)[0]!.pattern).not.toBe('hashing'); // settled with a good rating: move on
  });

  it('moves on to the weakest pattern once you have ratings', () => {
    const p = emptyProgress();
    p.ratings = { hashing: 1500, 'two-pointers': 1100 };
    p.ratedAttempts = { hashing: 3, 'two-pointers': 3 };
    expect(recommendations(p)[0]!.pattern).toBe('two-pointers');
  });
});

describe('revisit and pattern completion', () => {
  const daysAgo = (d: number) => Math.floor(Date.now() / 1000) - d * 86_400;

  function withImport(solved: Record<string, number>) {
    const p = emptyProgress();
    p.leetcode = {
      username: 'me', importedAt: new Date().toISOString(), source: 'public', fullList: false,
      solvedCounts: { all: 3, easy: 3, medium: 0, hard: 0 }, tagCounts: [],
      solvedSlugs: Object.keys(solved), solvedAt: solved,
    };
    return p;
  }

  it('lists only solves older than two months, oldest first', () => {
    const p = withImport({ 'two-sum': daysAgo(3), 'valid-anagram': daysAgo(70), 'contains-duplicate': daysAgo(400) });
    expect(revisitList(p).map((r) => r.slug)).toEqual(['contains-duplicate', 'valid-anagram']);
    expect(revisitList(p)[0]).toMatchObject({ patternName: 'Hash Map / Set', days: 400 });
  });

  it('needs two real LeetCode solves before a pattern counts as complete', () => {
    const p = withImport({ 'two-sum': daysAgo(10) });
    for (const slug of ['contains-duplicate', 'valid-anagram', 'two-sum']) recordAttempt(p, slug, answers(slug));
    expect(patternSummary(p, 'hashing')).toMatchObject({ ratedAttempts: 3, lcSolvedInSet: 1, complete: false });
    expect(recommendations(p)[0]!.reason).toMatch(/solve 1 more of these on LeetCode/);

    p.leetcode!.solvedSlugs.push('valid-anagram');
    expect(patternSummary(p, 'hashing').complete).toBe(true);
  });
});

describe('pickBlind', () => {
  it('never picks an attempted or excluded problem while others remain', () => {
    const p = emptyProgress();
    for (const q of problemsForPattern('hashing')) recordAttempt(p, q.slug, answers(q.slug));
    for (let i = 0; i < 50; i++) {
      const slug = pickBlind(p, 'valid-palindrome');
      expect(p.problems[slug]).toBeUndefined();
      expect(slug).not.toBe('valid-palindrome');
    }
  });
});

describe('validateSubmission', () => {
  it('coerces junk into a safe submission', () => {
    const s = validateSubmission({ mode: 'weird', pattern: 'nope', insight: 5, edgeCasesHandled: ['x', 1, 2.5], hintsUsed: -3, elapsedSec: 1e12 });
    expect(s).toMatchObject({ mode: 'pattern', pattern: null, insight: null, edgeCasesHandled: [1], hintsUsed: 0, elapsedSec: 86400 });
  });
});

describe('dashboard', () => {
  it('averages only rated patterns', () => {
    const p = emptyProgress();
    p.ratings = { hashing: 1300, 'two-pointers': 1500 };
    const d = dashboard(p, false);
    expect(d.overall).toBe(1400);
    expect(d.overallTier).toBe('Solid');
    expect(d.patterns).toHaveLength(23);
    expect(d.totalProblems).toBe(197);
  });
});
