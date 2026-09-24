import { describe, expect, it } from 'vitest';
import { compileAndRun, javaStatus, parseCompileErrors } from '../server/java-run.ts';
import type { LeetCodeProblem } from '../shared/types.ts';

const TWO_SUM: LeetCodeProblem = {
  slug: 'two-sum', id: 1, title: 'Two Sum', difficulty: 'Easy', paidOnly: false, contentHtml: null, hints: [],
  topicTags: [], javaSnippet: null, similarQuestions: null,
  exampleTestcases: ['[2,7,11,15]\n9', '[3,2,4]\n6', '[3,3]\n6'],
  exampleOutputs: ['[0,1]', '[1,2]', '[0,1]'],
  metaData: JSON.stringify({
    name: 'twoSum',
    params: [{ name: 'nums', type: 'integer[]' }, { name: 'target', type: 'integer' }],
    return: { type: 'integer[]' },
  }),
  fetchedAt: '',
};

const CORRECT = `import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[] {seen.get(target - nums[i]), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`;

describe('parseCompileErrors', () => {
  it('keeps line numbers from the solution file only', () => {
    const out = [
      'Solution.java:7: error: cannot find symbol',
      '        return resultt;',
      'Main.java:12: error: something in the harness',
      'Solution.java:9: warning: unchecked call',
    ].join('\n');
    expect(parseCompileErrors(out, 'Solution.java')).toEqual([
      { line: 7, message: 'cannot find symbol' },
      { line: null, message: 'something in the harness' },
    ]);
  });
});

const status = await javaStatus();

describe.skipIf(!status.available)('compileAndRun (needs a JDK)', () => {
  it('passes every example test for a correct solution', async () => {
    const r = await compileAndRun(TWO_SUM, CORRECT);
    expect(r.compiled).toBe(true);
    expect(r.compileErrors).toEqual([]);
    expect(r.tests.map((t) => t.verdict)).toEqual(['pass', 'pass', 'pass']);
    expect(r.passed).toBe(3);
    expect(r.checked).toBe(3);
    expect(r.tests[0]).toMatchObject({ input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]' });
  }, 60_000);

  it('reports the failing case with both values', async () => {
    const wrong = CORRECT.replace('return new int[] {seen.get(target - nums[i]), i};', 'return new int[] {i, i};');
    const r = await compileAndRun(TWO_SUM, wrong);
    expect(r.compiled).toBe(true);
    expect(r.passed).toBeLessThan(3);
    const failed = r.tests.find((t) => t.verdict === 'fail')!;
    expect(failed.expected).toBe('[0,1]');
    expect(failed.actual).toBe('[1,1]');
  }, 60_000);

  it('returns compile errors with line numbers and runs nothing', async () => {
    const r = await compileAndRun(TWO_SUM, 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return resultt;\n    }\n}');
    expect(r.compiled).toBe(false);
    expect(r.compileErrors[0]).toMatchObject({ line: 3 });
    expect(r.tests).toEqual([]);
  }, 60_000);

  it('catches a crash in one test without losing the others', async () => {
    const boom = CORRECT.replace('Map<Integer, Integer> seen = new HashMap<>();', 'Map<Integer, Integer> seen = new HashMap<>();\n        if (nums.length == 2) throw new IllegalStateException("boom");');
    const r = await compileAndRun(TWO_SUM, boom);
    const verdicts = r.tests.map((t) => t.verdict);
    expect(verdicts).toContain('error');
    expect(verdicts).toContain('pass');
    expect(r.tests.find((t) => t.verdict === 'error')!.error).toContain('boom');
  }, 60_000);

  it('captures what the solution prints', async () => {
    const chatty = CORRECT.replace('Map<Integer, Integer> seen = new HashMap<>();', 'Map<Integer, Integer> seen = new HashMap<>();\n        System.out.println("target=" + target);');
    const r = await compileAndRun(TWO_SUM, chatty);
    expect(r.tests[0]!.stdout.trim()).toBe('target=9');
    expect(r.tests[0]!.verdict).toBe('pass');
  }, 60_000);
});
