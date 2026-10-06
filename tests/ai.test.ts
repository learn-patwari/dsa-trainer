import { describe, expect, it } from 'vitest';
import { buildReviewPrompt, statementToText, type ReviewContext } from '../shared/ai-prompt.ts';
import type { AttemptResult, RunResult } from '../shared/types.ts';

const base: ReviewContext = {
  url: 'https://leetcode.com/problems/two-sum/',
  slug: 'two-sum',
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  statement: 'Given an array of integers, return indices of the two numbers that add up to target.',
  pattern: 'Hash Map / Set',
  code: 'class Solution { public int[] twoSum(int[] a, int t) { return new int[0]; } }',
  attempt: null,
  run: null,
  referenceApproach: 'Walk once with a HashMap of value to index.',
  notes: null,
};

describe('buildReviewPrompt', () => {
  it('gives the model the problem, the code and what to produce', () => {
    const p = buildReviewPrompt(base);
    expect(p).toContain('1. Two Sum (Easy)');
    expect(p).toContain('https://leetcode.com/problems/two-sum/');
    expect(p).toContain('Given an array of integers');
    expect(p).toContain('```java');
    expect(p).toContain('**Verdict**');
    expect(p).toContain('**Complexity**');
    expect(p).toContain('**Approach vs code**');
  });

  it('leaves out sections it has nothing for', () => {
    const bare = buildReviewPrompt({ ...base, statement: null, code: null, referenceApproach: null, pattern: null });
    expect(bare).not.toContain('## Problem');
    expect(bare).not.toContain("## The candidate's Java");
    expect(bare).not.toContain('## Reference approach');
    expect(bare).toContain('1. Two Sum (Easy)');
  });

  it('shows what the candidate claimed against what was right', () => {
    const attempt = {
      score: 6,
      maxScore: 8,
      percent: 75,
      breakdown: [
        { key: 'time', label: 'Time complexity', earned: 0, max: 2, verdict: 'wrong', chosen: 'O(n log n)', correct: 'O(n)' },
        { key: 'space', label: 'Space complexity', earned: 1, max: 1, verdict: 'correct', chosen: 'O(n)', correct: 'O(n)' },
        { key: 'brute', label: 'Brute force', earned: 0, max: 1, verdict: 'skipped', chosen: null, correct: 'O(n²)' },
      ],
    } as unknown as AttemptResult;

    const p = buildReviewPrompt({ ...base, attempt });
    expect(p).toContain('Scored 6/8 (75%)');
    expect(p).toContain('Time complexity: said "O(n log n)" — expected: O(n)');
    expect(p).toContain('Space complexity: said "O(n)" — correct');
    expect(p).toContain('Brute force: said "(skipped)"');
  });

  it('reports a failed compile instead of pretending the tests ran', () => {
    const run = { compiled: false, compileErrors: [{ line: 3, message: "';' expected" }], tests: [], passed: 0, checked: 0 } as unknown as RunResult;
    const p = buildReviewPrompt({ ...base, run });
    expect(p).toContain('It does not compile');
    expect(p).toContain("line 3: ';' expected");
  });

  it('names the failing example tests', () => {
    const run = {
      compiled: true,
      compileErrors: [],
      passed: 1,
      checked: 2,
      tests: [
        { verdict: 'pass', input: '[1,2]\n3', expected: '[0,1]', actual: '[0,1]', error: null },
        { verdict: 'fail', input: '[3,3]\n6', expected: '[0,1]', actual: '[]', error: null },
      ],
    } as unknown as RunResult;
    const p = buildReviewPrompt({ ...base, run });
    expect(p).toContain('1/2 of the example tests pass');
    expect(p).toContain('got [], expected [0,1]');
  });

  it('never leaves a ragged run of blank lines', () => {
    expect(buildReviewPrompt({ ...base, notes: null, run: null })).not.toMatch(/\n{3}/);
  });
});

describe('statementToText', () => {
  it('turns a LeetCode statement into something a prompt can carry', () => {
    const html = '<p>Given <code>nums</code>, return&nbsp;indices.</p><ul><li>2 &lt;= n &lt;= 10</li></ul><br/><p>Example:</p>';
    // The <br> earns its blank line; everything else collapses.
    expect(statementToText(html)).toBe('Given nums, return indices.\n- 2 <= n <= 10\n\nExample:');
  });

  it('drops scripts and styles rather than inlining them', () => {
    expect(statementToText('<style>p{color:red}</style><p>Hi</p>')).toBe('Hi');
    expect(statementToText('<script>alert(1)</script><p>Hi</p>')).toBe('Hi');
  });

  it('passes null through', () => {
    expect(statementToText(null)).toBeNull();
  });
});
