import type { LeetCodeProblem } from '../shared/types.ts';

/**
 * Builds the Java harness that runs a solution against LeetCode's example tests.
 * LeetCode's `metaData` describes the signature, so the harness can parse each input
 * line into the right type, call the method (or replay a design class's operations)
 * and print the result in LeetCode's own format.
 */

export interface HarnessFile {
  name: string;
  content: string;
}

export interface HarnessPlan {
  supported: boolean;
  /** Why tests can't run, when they can't. */
  reason: string | null;
  files: HarnessFile[];
  /** Raw LeetCode input lines per test case. */
  cases: string[][];
  expected: (string | null)[];
  /** True when the harness calls `new Solution()`. */
  needsSolutionClass: boolean;
  /** Results vary between runs (e.g. getRandom), so they can't be checked. */
  nonDeterministic: boolean;
}

interface TypeInfo {
  java: string;
  conv: string;
}

const TYPES: Record<string, TypeInfo> = {
  integer: { java: 'int', conv: 'J.toInt' },
  long: { java: 'long', conv: 'J.toLong' },
  double: { java: 'double', conv: 'J.toDouble' },
  boolean: { java: 'boolean', conv: 'J.toBool' },
  string: { java: 'String', conv: 'J.toStr' },
  character: { java: 'char', conv: 'J.toChar' },
  'integer[]': { java: 'int[]', conv: 'J.toIntArray' },
  'long[]': { java: 'long[]', conv: 'J.toLongArray' },
  'double[]': { java: 'double[]', conv: 'J.toDoubleArray' },
  'boolean[]': { java: 'boolean[]', conv: 'J.toBoolArray' },
  'character[]': { java: 'char[]', conv: 'J.toCharArray' },
  'string[]': { java: 'String[]', conv: 'J.toStringArray' },
  'integer[][]': { java: 'int[][]', conv: 'J.toIntArray2' },
  'character[][]': { java: 'char[][]', conv: 'J.toCharArray2' },
  'string[][]': { java: 'String[][]', conv: 'J.toStringArray2' },
  'double[][]': { java: 'double[][]', conv: 'J.toDoubleArray2' },
  'list<integer>': { java: 'List<Integer>', conv: 'J.toListInt' },
  'list<string>': { java: 'List<String>', conv: 'J.toListStr' },
  'list<double>': { java: 'List<Double>', conv: 'J.toListDouble' },
  'list<boolean>': { java: 'List<Boolean>', conv: 'J.toListBool' },
  'list<list<integer>>': { java: 'List<List<Integer>>', conv: 'J.toListListInt' },
  'list<list<string>>': { java: 'List<List<String>>', conv: 'J.toListListStr' },
  ListNode: { java: 'ListNode', conv: 'J.toListNode' },
  'ListNode[]': { java: 'ListNode[]', conv: 'J.toListNodeArray' },
  TreeNode: { java: 'TreeNode', conv: 'J.toTreeNode' },
};

/** Problems whose output legitimately differs between runs. */
const NON_DETERMINISTIC = new Set(['insert-delete-getrandom-o1']);

const LIST_NODE = `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}`;

const TREE_NODE = `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}`;

interface Param {
  name: string;
  type: string;
}

interface FunctionMeta {
  name: string;
  params: Param[];
  return: { type: string };
}

interface DesignMeta {
  classname: string;
  constructor: { params: Param[] };
  methods: { name: string; params: Param[]; return: { type: string } }[];
}

function declares(code: string, className: string): boolean {
  return new RegExp(`\\b(?:class|interface|record|enum)\\s+${className}\\b`).test(code);
}

function usedTypes(meta: FunctionMeta | DesignMeta): string[] {
  if ('classname' in meta) {
    return [...meta.constructor.params.map((p) => p.type), ...meta.methods.flatMap((m) => [...m.params.map((p) => p.type), m.return.type])];
  }
  return [...meta.params.map((p) => p.type), meta.return.type];
}

/** ListNode and TreeNode print as [] when empty, so they need their own serializers. */
function serialize(type: string, expr: string): string {
  if (type === 'ListNode') return `J.serListNode(${expr})`;
  if (type === 'TreeNode') return `J.serTreeNode(${expr})`;
  return `J.ser(${expr})`;
}

function unsupported(reason: string): HarnessPlan {
  return { supported: false, reason, files: [], cases: [], expected: [], needsSolutionClass: false, nonDeterministic: false };
}

function nodeFile(code: string): HarnessFile[] {
  // J.java references both node types, so whichever the solution doesn't define must be supplied.
  const parts: string[] = [];
  if (!declares(code, 'ListNode')) parts.push(LIST_NODE);
  if (!declares(code, 'TreeNode')) parts.push(TREE_NODE);
  return parts.length ? [{ name: 'Nodes.java', content: parts.join('\n\n') + '\n' }] : [];
}

export function planHarness(problem: LeetCodeProblem, code: string): HarnessPlan {
  if (!problem.metaData) return unsupported("LeetCode didn't describe this problem's signature, so tests can't be generated.");
  let meta: FunctionMeta | DesignMeta;
  try {
    meta = JSON.parse(problem.metaData) as FunctionMeta | DesignMeta;
  } catch {
    return unsupported("LeetCode's signature data for this problem couldn't be read.");
  }

  const unknown = usedTypes(meta).filter((t) => t !== 'void' && !TYPES[t]);
  if (unknown.length) {
    return unsupported(`Tests can't run here yet: unsupported parameter type ${[...new Set(unknown)].join(', ')}. Compile-only.`);
  }

  const cases = problem.exampleTestcases.map((c) => c.split('\n'));
  if (cases.length === 0) return unsupported('LeetCode listed no example test cases for this problem.');
  const expected = cases.map((_, i) => problem.exampleOutputs[i] ?? null);
  const nonDeterministic = NON_DETERMINISTIC.has(problem.slug);

  const plan = 'classname' in meta ? designPlan(meta, code, cases) : functionPlan(meta, code, cases);
  if (!plan.supported) return plan;
  return { ...plan, cases, expected, nonDeterministic };
}

function functionPlan(meta: FunctionMeta, code: string, cases: string[][]): HarnessPlan {
  const expectedArgs = meta.params.length;
  if (cases.some((c) => c.length < expectedArgs)) {
    return unsupported("LeetCode's example inputs don't match the method signature, so tests can't be generated.");
  }

  const decls = meta.params
    .map((p, i) => `                ${TYPES[p.type]!.java} p${i} = ${TYPES[p.type]!.conv}(J.parse(raw.get(${i})));`)
    .join('\n');
  const args = meta.params.map((_, i) => `p${i}`).join(', ');
  const call =
    meta.return.type === 'void'
      ? // In-place problems: LeetCode's expected output is the mutated first argument.
        `                new Solution().${meta.name}(${args});\n                out = ${serialize(meta.params[0]?.type ?? '', 'p0')};`
      : `                ${TYPES[meta.return.type]!.java} result = new Solution().${meta.name}(${args});\n                out = ${serialize(meta.return.type, 'result')};`;

  const main = `import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.List;

/** Generated by DSA Trainer: runs Solution.${meta.name} against LeetCode's example tests. */
public class Main {
    public static void main(String[] argv) throws Exception {
        List<List<String>> cases = J.readCases(argv[0]);
        PrintStream real = System.out;
        for (int i = 0; i < cases.size(); i++) {
            List<String> raw = cases.get(i);
            String out = null, err = null;
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            long t0 = System.nanoTime();
            try {
${decls}
                System.setOut(new PrintStream(buf, true, "UTF-8"));
${call}
                System.setOut(real);
            } catch (Throwable t) {
                System.setOut(real);
                err = t.toString();
            }
            long ms = (System.nanoTime() - t0) / 1000000L;
            J.emit(i, out, err, ms, buf.toString("UTF-8"));
        }
    }
}
`;

  return {
    supported: true,
    reason: null,
    files: [...nodeFile(code), { name: 'Main.java', content: main }],
    cases,
    expected: [],
    needsSolutionClass: true,
    nonDeterministic: false,
  };
}

function designPlan(meta: DesignMeta, code: string, cases: string[][]): HarnessPlan {
  if (cases.some((c) => c.length < 2)) {
    return unsupported("This problem's tests need LeetCode's own runner (operations and arguments are not listed).");
  }
  const first = cases[0]![0]!;
  if (!first.includes(`"${meta.classname}"`)) {
    return unsupported("This problem's tests need LeetCode's own runner (its example isn't a list of operations).");
  }

  const ctorArgs = meta.constructor.params.map((p, i) => `${TYPES[p.type]!.conv}(a.get(${i}))`).join(', ');
  const branches = meta.methods
    .map((m) => {
      const callArgs = m.params.map((p, i) => `${TYPES[p.type]!.conv}(a.get(${i}))`).join(', ');
      const invoke = `obj.${m.name}(${callArgs})`;
      const body =
        m.return.type === 'void'
          ? `${invoke}; outB.append("null");`
          : `outB.append(${serialize(m.return.type, invoke)});`;
      return `                    } else if (op.equals("${m.name}")) {\n                        ${body}`;
    })
    .join('\n');

  const main = `import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.List;

/** Generated by DSA Trainer: replays LeetCode's operation list against ${meta.classname}. */
public class Main {
    public static void main(String[] argv) throws Exception {
        List<List<String>> cases = J.readCases(argv[0]);
        PrintStream real = System.out;
        for (int i = 0; i < cases.size(); i++) {
            List<Object> ops = J.list(J.parse(cases.get(i).get(0)));
            List<Object> allArgs = J.list(J.parse(cases.get(i).get(1)));
            StringBuilder outB = new StringBuilder("[");
            String err = null;
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            long t0 = System.nanoTime();
            try {
                System.setOut(new PrintStream(buf, true, "UTF-8"));
                ${meta.classname} obj = null;
                for (int k = 0; k < ops.size(); k++) {
                    String op = J.toStr(ops.get(k));
                    List<Object> a = k < allArgs.size() ? J.list(allArgs.get(k)) : new java.util.ArrayList<Object>();
                    if (k > 0) outB.append(',');
                    if (op.equals("${meta.classname}")) {
                        obj = new ${meta.classname}(${ctorArgs});
                        outB.append("null");
${branches}
                    } else {
                        outB.append("null");
                    }
                }
                System.setOut(real);
            } catch (Throwable t) {
                System.setOut(real);
                err = t.toString();
            }
            outB.append(']');
            long ms = (System.nanoTime() - t0) / 1000000L;
            J.emit(i, err == null ? outB.toString() : null, err, ms, buf.toString("UTF-8"));
        }
    }
}
`;

  return {
    supported: true,
    reason: null,
    files: [...nodeFile(code), { name: 'Main.java', content: main }],
    cases,
    expected: [],
    needsSolutionClass: false,
    nonDeterministic: false,
  };
}

/** Java requires a public class to live in a file of the same name. */
export function solutionFileName(code: string): string {
  const m = /public\s+(?:final\s+|abstract\s+)?class\s+(\w+)/.exec(code);
  return `${m?.[1] ?? 'Solution'}.java`;
}
