import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { CompileError, JavaStatus, LeetCodeProblem, RunResult, TestResult, TestVerdict } from '../shared/types.ts';
import { compareOutputs } from './compare.ts';
import { planHarness, solutionFileName } from './harness.ts';

const exec = promisify(execFile);
const COMPILE_TIMEOUT_MS = 30_000;
const RUN_TIMEOUT_MS = 10_000;
const MAX_OUTPUT = 4 * 1024 * 1024;
const J_JAVA = join(dirname(fileURLToPath(import.meta.url)), 'java', 'J.java');

interface Jdk {
  javac: string;
  java: string;
  version: string;
}

let detected: Jdk | null | undefined;

async function detectJdk(): Promise<Jdk | null> {
  if (detected !== undefined) return detected;
  const home = process.env.JAVA_HOME?.trim();
  const candidates: Jdk[] = [
    ...(home ? [{ javac: join(home, 'bin', 'javac'), java: join(home, 'bin', 'java'), version: '' }] : []),
    { javac: 'javac', java: 'java', version: '' },
  ];
  for (const c of candidates) {
    try {
      const { stdout, stderr } = await exec(c.javac, ['-version'], { timeout: 15_000 });
      detected = { ...c, version: `${stdout}${stderr}`.trim() };
      return detected;
    } catch {
      // try the next candidate
    }
  }
  detected = null;
  return null;
}

export async function javaStatus(): Promise<JavaStatus> {
  const jdk = await detectJdk();
  return jdk
    ? { available: true, version: jdk.version, message: null }
    : {
        available: false,
        version: null,
        message: 'No JDK found. Install one (e.g. Temurin 21) or set JAVA_HOME, then restart the server to compile and run your code.',
      };
}

/** javac prints "File.java:12: error: message"; keep the line numbers from the solution file. */
export function parseCompileErrors(output: string, solutionFile: string): CompileError[] {
  const errors: CompileError[] = [];
  for (const line of output.split(/\r?\n/)) {
    const m = /^(.*?):(\d+):\s*(error|warning):\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    if (m[3] !== 'error') continue;
    const file = m[1]!.replace(/\\/g, '/').split('/').pop();
    errors.push({ line: file === solutionFile ? Number(m[2]) : null, message: m[4]!.trim() });
  }
  return errors;
}

interface Emitted {
  i: number;
  out: string | null;
  err: string | null;
  ms: number;
  log: string;
}

function parseEmitted(stdout: string): Emitted[] {
  const out: Emitted[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.startsWith('@@T ')) continue;
    try {
      out.push(JSON.parse(line.slice(4)) as Emitted);
    } catch {
      // ignore a truncated line (the process was killed mid-write)
    }
  }
  return out;
}

function execError(err: unknown): { stdout: string; stderr: string; killed: boolean } {
  const e = err as { stdout?: string; stderr?: string; killed?: boolean; signal?: string; message?: string };
  return {
    stdout: e.stdout ?? '',
    stderr: e.stderr ?? e.message ?? '',
    killed: e.killed === true || e.signal != null,
  };
}

export async function compileAndRun(problem: LeetCodeProblem, code: string): Promise<RunResult> {
  const at = new Date().toISOString();
  const jdk = await detectJdk();
  if (!jdk) {
    const status = await javaStatus();
    return empty(at, status.message);
  }

  const plan = planHarness(problem, code);
  const solutionFile = solutionFileName(code);
  const dir = await mkdtemp(join(tmpdir(), 'dsa-run-'));

  try {
    const sources = [solutionFile];
    await writeFile(join(dir, solutionFile), code, 'utf8');
    const casesPath = join(dir, 'cases.json');
    if (plan.supported) {
      await copyFile(J_JAVA, join(dir, 'J.java'));
      sources.push('J.java');
      for (const f of plan.files) {
        await writeFile(join(dir, f.name), f.content, 'utf8');
        sources.push(f.name);
      }
      await writeFile(casesPath, JSON.stringify(plan.cases), 'utf8');
    }

    const outDir = join(dir, 'out');
    const compileStart = Date.now();
    let compiled = true;
    let compilerOutput = '';
    try {
      const r = await exec(jdk.javac, ['-nowarn', '-encoding', 'UTF-8', '-d', outDir, ...sources], {
        cwd: dir,
        timeout: COMPILE_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT,
      });
      compilerOutput = `${r.stdout}${r.stderr}`.trim();
    } catch (err) {
      const e = execError(err);
      compiled = false;
      compilerOutput = `${e.stdout}${e.stderr}`.trim();
      if (e.killed) compilerOutput = `The compiler took longer than ${COMPILE_TIMEOUT_MS / 1000}s and was stopped.`;
    }
    const compileMs = Date.now() - compileStart;
    const compileErrors = parseCompileErrors(compilerOutput, solutionFile);

    const notes: string[] = [];
    if (plan.reason) notes.push(plan.reason);
    if (compiled && plan.supported && plan.needsSolutionClass && !/\bclass\s+Solution\b/.test(code)) {
      notes.push('The harness calls `new Solution()`, so keep your method inside a class named Solution.');
    }

    if (!compiled || !plan.supported) {
      return {
        compiled,
        compileMs,
        compileErrors,
        compilerOutput,
        tests: [],
        passed: 0,
        checked: 0,
        total: plan.supported ? plan.cases.length : 0,
        runMs: 0,
        note: notes.join(' ') || null,
        at,
      };
    }

    const runStart = Date.now();
    let stdout = '';
    let runtimeError = '';
    let timedOut = false;
    try {
      const r = await exec(jdk.java, ['-Xmx256m', '-Dfile.encoding=UTF-8', '-cp', outDir, 'Main', casesPath], {
        cwd: dir,
        timeout: RUN_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT,
      });
      stdout = r.stdout;
      runtimeError = r.stderr.trim();
    } catch (err) {
      const e = execError(err);
      stdout = e.stdout;
      timedOut = e.killed;
      runtimeError = timedOut ? '' : e.stderr.trim();
    }
    const runMs = Date.now() - runStart;

    const emitted = new Map(parseEmitted(stdout).map((e) => [e.i, e]));
    const tests: TestResult[] = plan.cases.map((raw, index) => {
      const input = raw.join(', ');
      const expected = plan.expected[index] ?? null;
      const got = emitted.get(index);
      if (!got) {
        const verdict: TestVerdict = timedOut && index === Math.min(...missingIndexes(plan.cases.length, emitted)) ? 'timeout' : 'not-run';
        return {
          index,
          input,
          expected,
          actual: null,
          verdict,
          ms: null,
          stdout: '',
          error: verdict === 'timeout' ? `Stopped after ${RUN_TIMEOUT_MS / 1000}s: possible infinite loop.` : runtimeError || null,
        };
      }
      let verdict: TestVerdict;
      if (got.err) verdict = 'error';
      else if (plan.nonDeterministic || expected == null || got.out == null) verdict = 'unchecked';
      else verdict = compareOutputs(expected, got.out);
      return { index, input, expected, actual: got.out, verdict, ms: got.ms, stdout: got.log, error: got.err };
    });

    const checked = tests.filter((t) => t.verdict === 'pass' || t.verdict === 'pass-unordered' || t.verdict === 'fail').length;
    const passed = tests.filter((t) => t.verdict === 'pass' || t.verdict === 'pass-unordered').length;
    if (plan.nonDeterministic) notes.push('This problem returns random results, so outputs are shown but not checked.');
    else {
      const missing = tests.filter((t) => t.expected == null).length;
      if (missing > 0) notes.push(`Couldn't read the expected output for ${missing} example${missing > 1 ? 's' : ''} from the statement; those show your output only.`);
    }
    if (timedOut) notes.push(`Execution stopped after ${RUN_TIMEOUT_MS / 1000}s.`);
    if (runtimeError) notes.push(runtimeError.split('\n')[0]!);

    return {
      compiled: true,
      compileMs,
      compileErrors,
      compilerOutput,
      tests,
      passed,
      checked,
      total: tests.length,
      runMs,
      note: notes.join(' ') || null,
      at,
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function missingIndexes(total: number, emitted: Map<number, unknown>): number[] {
  const missing = [...Array(total).keys()].filter((i) => !emitted.has(i));
  return missing.length ? missing : [Number.POSITIVE_INFINITY];
}

function empty(at: string, note: string | null): RunResult {
  return {
    compiled: false,
    compileMs: 0,
    compileErrors: [],
    compilerOutput: '',
    tests: [],
    passed: 0,
    checked: 0,
    total: 0,
    runMs: 0,
    note,
    at,
  };
}
