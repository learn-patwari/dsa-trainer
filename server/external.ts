import { getProblem as getCurated } from '../shared/problems/index.ts';
import type { CuratedProblem, ExternalSpec, LeetCodeProblem } from '../shared/types.ts';

/**
 * Problems that are not on LeetCode carry their own statement, signature and examples. This turns
 * one into the same shape LeetCode's API returns, so the statement view, the Java editor and the
 * test harness handle it without knowing the difference.
 */

const JAVA_TYPE: Record<string, string> = {
  integer: 'int',
  long: 'long',
  double: 'double',
  boolean: 'boolean',
  string: 'String',
  character: 'char',
  void: 'void',
  'integer[]': 'int[]',
  'long[]': 'long[]',
  'double[]': 'double[]',
  'string[]': 'String[]',
  'character[]': 'char[]',
  'boolean[]': 'boolean[]',
  'integer[][]': 'int[][]',
  'character[][]': 'char[][]',
  'list<integer>': 'List<Integer>',
  'list<string>': 'List<String>',
  'list<list<integer>>': 'List<List<Integer>>',
  ListNode: 'ListNode',
  TreeNode: 'TreeNode',
};

function starter(spec: ExternalSpec): string {
  const { name, params, returns } = spec.signature;
  const args = params.map((p) => `${JAVA_TYPE[p.type] ?? p.type} ${p.name}`).join(', ');
  return `class Solution {
    public ${JAVA_TYPE[returns] ?? returns} ${name}(${args}) {
        
    }
}
`;
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderExamples(spec: ExternalSpec): string {
  return spec.examples
    .map((ex, i) => {
      const input = spec.signature.params.map((p, k) => `${p.name} = ${ex.input[k] ?? ''}`).join(', ');
      const explain = ex.explain ? `\nExplanation: ${ex.explain}` : '';
      return `<p><strong>Example ${i + 1}:</strong></p>\n<pre>Input: ${escapeHtml(input)}\nOutput: ${escapeHtml(ex.output)}${escapeHtml(explain)}</pre>`;
    })
    .join('\n');
}

export function buildExternalProblem(p: CuratedProblem): LeetCodeProblem | null {
  const spec = p.external;
  if (!spec) return null;
  return {
    slug: p.slug,
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    paidOnly: false,
    contentHtml: `${spec.statement}\n${renderExamples(spec)}`,
    hints: spec.hints ?? [],
    topicTags: [],
    javaSnippet: spec.snippet ?? starter(spec),
    exampleTestcases: spec.examples.map((ex) => ex.input.join('\n')),
    metaData: JSON.stringify({
      name: spec.signature.name,
      params: spec.signature.params,
      return: { type: spec.signature.returns },
    }),
    similarQuestions: null,
    exampleOutputs: spec.examples.map((ex) => ex.output),
    source: spec.source,
    fetchedAt: new Date(0).toISOString(),
  };
}

/** The local copy of a non-LeetCode problem, or null when the slug is a LeetCode one. */
export function externalProblem(slug: string): LeetCodeProblem | null {
  const curated = getCurated(slug);
  return curated ? buildExternalProblem(curated) : null;
}
