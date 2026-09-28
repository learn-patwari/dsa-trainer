/**
 * Pulling the methods back out of a Java file.
 *
 * LeetCode's editor hands you an empty `class Solution { … }` and expects you
 * to fill it in. Our editor holds a whole file. Copying the whole thing over
 * their template works, but it's easier to paste just the methods — so this
 * finds the class body, drops the imports and the wrapper, and re-indents it
 * to sit inside their braces.
 */

/** Walks Java source, reporting only braces that are really code. */
function* codeChars(src: string): Generator<{ i: number; ch: string }> {
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    yield { i, ch };
    i++;
  }
}

/** Index of the `}` closing the `{` at `open`, or -1 if the braces don't balance. */
function matchBrace(src: string, open: number): number {
  let depth = 0;
  for (const { i, ch } of codeChars(src)) {
    if (i < open) continue;
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  return -1;
}

const CLASS_RE = /(?:^|\n)[ \t]*(?:(?:public|final|abstract|static|strictfp)\s+)*(?:class|interface|enum|record)\s+(\w+)[^{]*\{/g;

interface Found {
  name: string;
  open: number;
}

/** Top-level type declarations, in source order. */
function topLevelTypes(code: string): Found[] {
  const found: Found[] = [];
  CLASS_RE.lastIndex = 0;
  for (const m of code.matchAll(CLASS_RE)) {
    const open = m.index! + m[0].length - 1;
    // Nested types sit inside another type's braces; skip them.
    if (found.some((f) => open < matchBrace(code, f.open))) continue;
    found.push({ name: m[1]!, open });
  }
  return found;
}

/** Removes the shared leading whitespace, then indents every line by four spaces. */
function reindent(body: string): string {
  const lines = body.replace(/\t/g, '    ').split('\n');
  const widths = lines.filter((l) => l.trim() !== '').map((l) => l.length - l.trimStart().length);
  const base = widths.length > 0 ? Math.min(...widths) : 0;
  return lines
    .map((l) => (l.trim() === '' ? '' : '    ' + l.slice(base)))
    .join('\n')
    .replace(/^\n+|\s+$/g, '');
}

/**
 * The methods and fields to paste inside LeetCode's `class Solution { }`.
 * Falls back to the whole file, minus imports, when there's no class to unwrap.
 */
export function methodsForLeetCode(code: string): string {
  const withoutImports = code.replace(/^[ \t]*import\s+[^;]+;[ \t]*\r?\n?/gm, '').replace(/^[ \t]*package\s+[^;]+;[ \t]*\r?\n?/gm, '');
  const types = topLevelTypes(withoutImports);
  if (types.length === 0) return withoutImports.trim();

  // Whatever LeetCode calls the class it gives you; otherwise the first one.
  const primary = types.find((t) => t.name === 'Solution') ?? types[0]!;
  const close = matchBrace(withoutImports, primary.open);
  if (close < 0) return withoutImports.trim(); // unbalanced braces — hand back what we have

  const body = reindent(withoutImports.slice(primary.open + 1, close));

  // A helper class declared beside Solution has to travel with it.
  const helpers = types
    .filter((t) => t !== primary && !SUPPLIED_BY_LEETCODE.has(t.name))
    .map((t) => {
      const end = matchBrace(withoutImports, t.open);
      if (end < 0) return '';
      const start = withoutImports.lastIndexOf('\n', t.open) + 1;
      return withoutImports.slice(start, end + 1).trim();
    })
    .filter(Boolean);

  return [body, ...helpers].join('\n\n');
}

/** LeetCode defines these for you; pasting them back in is a duplicate-class error. */
const SUPPLIED_BY_LEETCODE = new Set(['ListNode', 'TreeNode', 'Node', 'Employee', 'NestedInteger', 'Interval']);
