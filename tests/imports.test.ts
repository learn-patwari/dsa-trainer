import { describe, expect, it } from 'vitest';
import { importsFor, missingSymbols, prepare, resolveImports } from '../server/imports.ts';
import { compileAndRun, javaStatus, parseCompileErrors } from '../server/java-run.ts';
import type { LeetCodeProblem } from '../shared/types.ts';

describe('prepare', () => {
  it('supplies the imports LeetCode supplies, on one line', () => {
    const { source, offset, added } = prepare('class Solution {}');
    expect(source.split('\n')[0]).toContain('import java.util.*;');
    expect(source.split('\n')[0]).toContain('import java.util.stream.*;');
    expect(source.split('\n')[1]).toBe('class Solution {}');
    expect(offset).toBe(1); // exactly one line, so error lines shift by one
    expect(added).toEqual([]);
  });

  it('keeps a package declaration first, as Java requires', () => {
    const { source, offset } = prepare('package foo;\nclass Solution {}');
    expect(source.startsWith('package foo;')).toBe(true);
    expect(source).toContain('import java.util.*;');
    expect(offset).toBe(0); // nothing was pushed down
  });

  it('adds extra imports but never duplicates the prelude', () => {
    const { source, added } = prepare('class Solution {}', ['import java.io.IOException;', 'import java.util.*;']);
    expect(added).toEqual(['import java.io.IOException;']);
    expect(source.match(/import java\.util\.\*;/g)).toHaveLength(1);
  });

  it("leaves the author's own imports alone", () => {
    const code = 'import java.util.*;\nclass Solution {}';
    expect(prepare(code).source).toContain(code); // duplicate imports are legal Java
  });
});

describe('reading symbols off a compile error', () => {
  const output = [
    'Solution.java:3: error: cannot find symbol',
    '        BigInteger x = BigInteger.ONE;',
    '        ^',
    '  symbol:   class BigInteger',
    '  location: class Solution',
    'Solution.java:4: error: cannot find symbol',
    '  symbol:   class IOException',
    '  location: class Solution',
    '2 errors',
  ].join('\n');

  it('collects every unresolved class name', () => {
    expect(missingSymbols(output)).toEqual(['BigInteger', 'IOException']);
  });

  it('maps the ones it knows and ignores the rest', () => {
    expect(importsFor(['IOException'])).toEqual(['import java.io.IOException;']);
    expect(importsFor(['MyOwnHelper'])).toEqual([]);
    expect(importsFor(['IOException', 'IOException'])).toHaveLength(1);
  });

  it('offers a retry only when it can actually help', () => {
    expect(resolveImports(output)).toEqual(['import java.io.IOException;']);
    expect(resolveImports('Solution.java:2: error: ";" expected')).toBeNull();
    expect(resolveImports('Solution.java:3: error: cannot find symbol\n  symbol:   class Widget')).toBeNull();
  });
});

describe('parseCompileErrors', () => {
  it('subtracts the injected import line so it points at what you typed', () => {
    const out = 'Solution.java:5: error: ";" expected';
    expect(parseCompileErrors(out, 'Solution.java', 1)).toEqual([{ line: 4, message: '";" expected' }]);
    expect(parseCompileErrors(out, 'Solution.java', 0)).toEqual([{ line: 5, message: '";" expected' }]);
  });

  it('never reports a line above the first', () => {
    expect(parseCompileErrors('Solution.java:1: error: boom', 'Solution.java', 1)[0]!.line).toBe(1);
  });
});

const jdk = await javaStatus();

describe.skipIf(!jdk.available)('compiling without imports (needs a JDK)', () => {
  const twoSum: LeetCodeProblem = {
    slug: 'two-sum',
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    paidOnly: false,
    contentHtml: null,
    hints: [],
    topicTags: [],
    javaSnippet: null,
    exampleTestcases: ['[2,7,11,15]\n9'],
    metaData: JSON.stringify({
      name: 'twoSum',
      params: [
        { name: 'nums', type: 'integer[]' },
        { name: 'target', type: 'integer' },
      ],
      return: { type: 'integer[]' },
    }),
    similarQuestions: null,
    exampleOutputs: ['[0,1]'],
    fetchedAt: new Date().toISOString(),
  };

  it('compiles LeetCode-style code that imports nothing', async () => {
    const code = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[] { seen.get(target - nums[i]), i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`;
    const r = await compileAndRun(twoSum, code);
    expect(r.compileErrors).toEqual([]);
    expect(r.compiled).toBe(true);
    expect(r.passed).toBe(r.checked);
    expect(r.checked).toBeGreaterThan(0);
  }, 60_000);

  it('rescues a class outside the prelude and says so', async () => {
    const code = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        StringWriter unused = new StringWriter();
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[] { seen.get(target - nums[i]), i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`;
    const r = await compileAndRun(twoSum, code);
    expect(r.compiled).toBe(true);
    expect(r.note).toContain('java.io.StringWriter');
  }, 60_000);

  it('still reports a real error on the line you wrote', async () => {
    const r = await compileAndRun(twoSum, 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return oops;\n    }\n}');
    expect(r.compiled).toBe(false);
    expect(r.compileErrors[0]).toMatchObject({ line: 3 });
  }, 60_000);
});
