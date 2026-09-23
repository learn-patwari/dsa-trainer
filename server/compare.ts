export type CompareVerdict = 'pass' | 'pass-unordered' | 'fail';

const TOLERANCE = 1e-5;

/**
 * Compares a program's output with LeetCode's expected output. Numbers are compared with
 * the tolerance LeetCode uses for doubles. When a strict comparison fails, the values are
 * compared again ignoring order, which many problems allow ("in any order").
 */
export function compareOutputs(expected: string, actual: string): CompareVerdict {
  const e = parseLoose(expected);
  const a = parseLoose(actual);
  if (e.ok && a.ok) {
    if (deepEqual(e.value, a.value)) return 'pass';
    if (deepEqual(sortDeep(e.value), sortDeep(a.value))) return 'pass-unordered';
    return 'fail';
  }
  return unquote(expected) === unquote(actual) ? 'pass' : 'fail';
}

function parseLoose(s: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) as unknown };
  } catch {
    return { ok: false };
  }
}

function unquote(s: string): string {
  const t = s.trim();
  return t.length > 1 && t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) <= TOLERANCE : Object.is(a, b);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  }
  return a === b;
}

/** Recursively sorts arrays by their serialized form, so order stops mattering. */
function sortDeep(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map(sortDeep).sort((x, y) => (JSON.stringify(x) < JSON.stringify(y) ? -1 : 1));
}
