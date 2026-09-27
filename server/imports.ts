/**
 * Java imports, supplied for you.
 *
 * LeetCode's editor compiles your solution inside a file that already imports
 * half the JDK, so nobody types `import java.util.*;` any more. Paste that same
 * code here and javac rightly says "cannot find symbol: class HashMap".
 *
 * So every compile gets a prelude, and if javac still can't find a symbol we
 * look it up and add that import too, then try again. Your editor content is
 * never touched — the imports live only in the temporary file javac sees.
 */

/** Always available, matching what LeetCode's Java environment provides. */
const PRELUDE = [
  'java.util.*',
  'java.util.function.*',
  'java.util.stream.*',
  'java.math.*',
  'java.util.concurrent.*',
  'java.util.concurrent.atomic.*',
  'java.util.regex.*',
].map((p) => `import ${p};`);

/**
 * Classes worth resolving from a compile error, beyond the prelude's packages.
 * Deliberately small: a wrong guess turns a clear error into a confusing one.
 */
const KNOWN: Record<string, string> = {
  BufferedReader: 'java.io.BufferedReader',
  InputStreamReader: 'java.io.InputStreamReader',
  PrintWriter: 'java.io.PrintWriter',
  IOException: 'java.io.IOException',
  StringWriter: 'java.io.StringWriter',
  Instant: 'java.time.Instant',
  Duration: 'java.time.Duration',
  LocalDate: 'java.time.LocalDate',
  LocalDateTime: 'java.time.LocalDateTime',
  Charset: 'java.nio.charset.Charset',
  StandardCharsets: 'java.nio.charset.StandardCharsets',
  Files: 'java.nio.file.Files',
  Paths: 'java.nio.file.Paths',
  Array: 'java.lang.reflect.Array',
  Field: 'java.lang.reflect.Field',
  Method: 'java.lang.reflect.Method',
  Normalizer: 'java.text.Normalizer',
  DecimalFormat: 'java.text.DecimalFormat',
  SimpleDateFormat: 'java.text.SimpleDateFormat',
};

export interface Prepared {
  /** What javac actually compiles. */
  source: string;
  /** Lines added above the author's first line, so error lines can be mapped back. */
  offset: number;
  /** Imports added beyond the prelude, for the run note. */
  added: string[];
}

/** A `package` line, if any, must stay the first statement in the file. */
const PACKAGE_RE = /^\s*package\s+[\w.]+\s*;/m;

/**
 * Puts `imports` above the author's code. They go on a single line so a compile
 * error's line number is only ever one off, and `offset` says by how much.
 */
export function prepare(code: string, extra: string[] = []): Prepared {
  const added = extra.filter((i) => !PRELUDE.includes(i));
  const line = [...PRELUDE, ...added].join(' ');

  const pkg = PACKAGE_RE.exec(code);
  if (pkg) {
    const cut = pkg.index + pkg[0].length;
    return { source: `${code.slice(0, cut)} ${line}${code.slice(cut)}`, offset: 0, added };
  }
  return { source: `${line}\n${code}`, offset: 1, added };
}

/**
 * Class names javac couldn't resolve. It reports the symbol on its own line
 * under the error, e.g. "  symbol:   class BigInteger".
 */
export function missingSymbols(compilerOutput: string): string[] {
  const names = new Set<string>();
  for (const m of compilerOutput.matchAll(/^\s*symbol:\s*class\s+(\w+)/gm)) names.add(m[1]!);
  return [...names];
}

/** Imports that would resolve those symbols; unknown names are left alone. */
export function importsFor(symbols: string[]): string[] {
  const out: string[] = [];
  for (const name of symbols) {
    const fqn = KNOWN[name];
    if (fqn) out.push(`import ${fqn};`);
  }
  return [...new Set(out)];
}

/** One retry's worth of imports, or null when nothing here would help. */
export function resolveImports(compilerOutput: string): string[] | null {
  const imports = importsFor(missingSymbols(compilerOutput));
  return imports.length > 0 ? imports : null;
}
