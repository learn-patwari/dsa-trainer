import { describe, expect, it } from 'vitest';
import { planHarness, solutionFileName } from '../server/harness.ts';
import type { LeetCodeProblem } from '../shared/types.ts';

function problem(over: Partial<LeetCodeProblem>): LeetCodeProblem {
  return {
    slug: 'x', id: 1, title: 'X', difficulty: 'Easy', paidOnly: false, contentHtml: null, hints: [],
    topicTags: [], javaSnippet: null, exampleTestcases: ['[1,2]\n3'], metaData: null, similarQuestions: null,
    exampleOutputs: ['[0,1]'], fetchedAt: '', ...over,
  };
}

const twoSumMeta = JSON.stringify({
  name: 'twoSum',
  params: [{ name: 'nums', type: 'integer[]' }, { name: 'target', type: 'integer' }],
  return: { type: 'integer[]' },
});

describe('planHarness', () => {
  it('generates a call with parsed arguments for a plain method', () => {
    const plan = planHarness(problem({ metaData: twoSumMeta }), 'class Solution {}');
    expect(plan.supported).toBe(true);
    const main = plan.files.find((f) => f.name === 'Main.java')!.content;
    expect(main).toContain('int[] p0 = J.toIntArray(J.parse(raw.get(0)));');
    expect(main).toContain('int p1 = J.toInt(J.parse(raw.get(1)));');
    expect(main).toContain('new Solution().twoSum(p0, p1)');
    expect(plan.cases).toEqual([['[1,2]', '3']]);
    expect(plan.expected).toEqual(['[0,1]']);
  });

  it('serializes the mutated argument for in-place (void) problems', () => {
    const meta = JSON.stringify({ name: 'sortColors', params: [{ name: 'nums', type: 'integer[]' }], return: { type: 'void' } });
    const main = planHarness(problem({ metaData: meta }), 'class Solution {}').files.find((f) => f.name === 'Main.java')!.content;
    expect(main).toContain('new Solution().sortColors(p0);');
    expect(main).toContain('out = J.ser(p0);');
  });

  it('uses the node serializers so an empty list or tree prints as []', () => {
    const meta = JSON.stringify({ name: 'invertTree', params: [{ name: 'root', type: 'TreeNode' }], return: { type: 'TreeNode' } });
    const main = planHarness(problem({ metaData: meta }), 'class Solution {}').files.find((f) => f.name === 'Main.java')!.content;
    expect(main).toContain('J.toTreeNode(J.parse(raw.get(0)))');
    expect(main).toContain('out = J.serTreeNode(result);');
  });

  it('supplies node definitions only when the solution lacks them', () => {
    const meta = JSON.stringify({ name: 'f', params: [{ name: 'head', type: 'ListNode' }], return: { type: 'ListNode' } });
    const withOwn = planHarness(problem({ metaData: meta }), 'class ListNode { int val; ListNode next; }\nclass Solution {}');
    expect(withOwn.files.find((f) => f.name === 'Nodes.java')!.content).not.toContain('class ListNode');
    expect(withOwn.files.find((f) => f.name === 'Nodes.java')!.content).toContain('class TreeNode');
    const without = planHarness(problem({ metaData: meta }), 'class Solution {}');
    expect(without.files.find((f) => f.name === 'Nodes.java')!.content).toContain('class ListNode');
  });

  it('replays operations for a design class', () => {
    const meta = JSON.stringify({
      classname: 'LRUCache',
      constructor: { params: [{ type: 'integer', name: 'capacity' }] },
      methods: [
        { name: 'get', params: [{ type: 'integer', name: 'key' }], return: { type: 'integer' } },
        { name: 'put', params: [{ type: 'integer', name: 'key' }, { type: 'integer', name: 'value' }], return: { type: 'void' } },
      ],
    });
    const plan = planHarness(
      problem({ metaData: meta, exampleTestcases: ['["LRUCache","put","get"]\n[[2],[1,1],[1]]'], exampleOutputs: ['[null,null,1]'] }),
      'class LRUCache {}',
    );
    expect(plan.supported).toBe(true);
    const main = plan.files.find((f) => f.name === 'Main.java')!.content;
    expect(main).toContain('obj = new LRUCache(J.toInt(a.get(0)));');
    expect(main).toContain('} else if (op.equals("get")) {');
    expect(main).toContain('obj.put(J.toInt(a.get(0)), J.toInt(a.get(1))); outB.append("null");');
  });

  it('explains why a problem cannot be run instead of failing', () => {
    const meta = JSON.stringify({ name: 'cloneGraph', params: [{ name: 'node', type: 'Node' }], return: { type: 'Node' } });
    const plan = planHarness(problem({ metaData: meta }), 'class Solution {}');
    expect(plan.supported).toBe(false);
    expect(plan.reason).toContain('Node');
    expect(planHarness(problem({ metaData: null }), '').supported).toBe(false);
    expect(planHarness(problem({ metaData: twoSumMeta, exampleTestcases: [] }), '').reason).toContain('no example test cases');
  });

  it('marks problems whose output is random as unverifiable', () => {
    const meta = JSON.stringify({ classname: 'RandomizedSet', constructor: { params: [] }, methods: [] });
    const plan = planHarness(
      problem({ slug: 'insert-delete-getrandom-o1', metaData: meta, exampleTestcases: ['["RandomizedSet"]\n[[]]'] }),
      'class RandomizedSet {}',
    );
    expect(plan.nonDeterministic).toBe(true);
  });
});

describe('solutionFileName', () => {
  it('matches a public class name, defaulting to Solution', () => {
    expect(solutionFileName('class Solution {}')).toBe('Solution.java');
    expect(solutionFileName('public class LRUCache {}')).toBe('LRUCache.java');
    expect(solutionFileName('import java.util.*;\npublic final class Trie { }')).toBe('Trie.java');
  });
});
