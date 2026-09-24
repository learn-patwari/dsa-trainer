import { describe, expect, it } from 'vitest';
import { slugFromInput } from '../server/catalog.ts';
import { gradeChallenge } from '../server/challenge.ts';
import { acceptedPatterns, inferPatterns } from '../server/infer.ts';
import { lookup } from '../server/lookup.ts';
import { emptyProgress } from '../server/store.ts';
import type { LeetCodeProblem } from '../shared/types.ts';

function problem(over: Partial<LeetCodeProblem>): LeetCodeProblem {
  return {
    slug: 'some-problem', id: 9999, title: 'Some Problem', difficulty: 'Medium', paidOnly: false, contentHtml: null,
    hints: [], topicTags: [], javaSnippet: null, exampleTestcases: [], metaData: null, similarQuestions: null,
    exampleOutputs: [], fetchedAt: '', ...over,
  };
}

const tags = (...slugs: string[]) => slugs.map((slug) => ({ slug, name: slug.replace(/-/g, ' ') }));

describe('inferPatterns', () => {
  it('uses the hand-assigned pattern for curated problems', () => {
    const inference = inferPatterns(problem({ slug: 'two-sum', title: 'Two Sum', topicTags: tags('array', 'hash-table') }));
    expect(inference.curated).toBe('hashing');
    expect(acceptedPatterns('two-sum', inference)).toEqual(['hashing']);
  });

  it('accepts the alternatives a curated problem allows', () => {
    const inference = inferPatterns(problem({ slug: 'trapping-rain-water' }));
    expect(acceptedPatterns('trapping-rain-water', inference)).toEqual(['two-pointers', 'monotonic-stack', 'prefix-sum']);
  });

  it.each([
    ['sliding-window', tags('array', 'sliding-window'), 'Longest Subarray of 1s'],
    ['topological-sort', tags('graph', 'topological-sort'), 'Course Order'],
    ['union-find', tags('union-find', 'graph'), 'Redundant Edge'],
    ['trie', tags('trie', 'string'), 'Word Prefixes'],
    ['heap', tags('heap-priority-queue', 'array'), 'Kth Largest Thing'],
    ['bit-manipulation', tags('bit-manipulation'), 'Single Bit'],
  ])('infers %s from the topic tags of an uncurated problem', (expected, topicTags, title) => {
    const inference = inferPatterns(problem({ topicTags, title }));
    expect(inference.curated).toBeNull();
    expect(inference.guesses[0]!.pattern).toBe(expected);
    expect(inference.guesses[0]!.confidence).toBeGreaterThan(0);
  });

  it('reads give-away phrases when the tags are vague', () => {
    const inference = inferPatterns(
      problem({ title: 'Minimum Meeting Rooms', topicTags: tags('array', 'sorting'), contentHtml: '<p>Given meeting interval times, find the overlap…</p>' }),
    );
    expect(inference.guesses[0]!.pattern).toBe('intervals');
    expect(inference.guesses[0]!.why.join(' ')).toMatch(/intervals/);
  });

  it('returns nothing to guess for a problem with no pattern-bearing tags', () => {
    expect(inferPatterns(problem({ topicTags: tags('math', 'simulation'), title: 'Roman Numerals' })).guesses).toEqual([]);
  });
});

describe('challenge grading', () => {
  it('counts a close relative of the top guess as correct, and tracks the streak', () => {
    const p = emptyProgress();
    const dfsBfs = problem({ slug: 'flood-it', title: 'Flood It', topicTags: tags('depth-first-search', 'breadth-first-search', 'graph') });
    const first = gradeChallenge(p, dfsBfs, 'graph-traversal');
    expect(first.correct).toBe(true);
    expect(first.stats).toMatchObject({ asked: 1, correct: 1, streak: 1, bestStreak: 1 });

    const wrong = gradeChallenge(p, dfsBfs, 'trie');
    expect(wrong.correct).toBe(false);
    expect(wrong.stats).toMatchObject({ asked: 2, correct: 1, streak: 0, bestStreak: 1 });
    expect(wrong.accepted.map((a) => a.pattern)).toContain('graph-traversal');
  });

  it('treats a skipped answer as wrong but still explains', () => {
    const p = emptyProgress();
    const r = gradeChallenge(p, problem({ slug: 'two-sum' }), null);
    expect(r).toMatchObject({ correct: false, chosen: null, curated: true, lessonPattern: 'hashing' });
  });
});

describe('lookup', () => {
  it('lists curated problems of the same pattern first, marked as curated', () => {
    const r = lookup(emptyProgress(), problem({ slug: 'uncurated-prefix', title: 'Count Nice Subarrays', topicTags: tags('prefix-sum', 'hash-table') }));
    expect(r.curated).toBeNull();
    expect(r.guesses[0]!.pattern).toBe('prefix-sum');
    expect(r.similar.length).toBeGreaterThan(0);
    expect(r.similar.every((s) => s.curated)).toBe(true);
    expect(r.similar.map((s) => s.slug)).toContain('subarray-sum-equals-k');
  });

  it('adds LeetCode\'s own similar questions after the curated ones', () => {
    const r = lookup(
      emptyProgress(),
      problem({
        slug: 'x', topicTags: tags('hash-table'),
        similarQuestions: JSON.stringify([{ title: 'Some Other Problem', titleSlug: 'some-other-problem', difficulty: 'Hard' }]),
      }),
    );
    expect(r.similar.find((s) => s.slug === 'some-other-problem')).toMatchObject({ curated: false, difficulty: 'Hard' });
  });
});

describe('slugFromInput', () => {
  it('pulls the slug out of links and accepts bare slugs', () => {
    expect(slugFromInput('https://leetcode.com/problems/two-sum/description/')).toBe('two-sum');
    expect(slugFromInput('leetcode.com/problems/course-schedule-ii')).toBe('course-schedule-ii');
    expect(slugFromInput('rotting-oranges')).toBe('rotting-oranges');
    expect(slugFromInput('rotting oranges')).toBeNull();
    expect(slugFromInput('twosum')).toBeNull();
  });
});
