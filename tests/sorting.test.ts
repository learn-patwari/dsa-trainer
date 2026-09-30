import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sortAnimationFor, SORT_IDS } from '../shared/animations/index.ts';
import { COMPLEXITY_CLASSES, NLOGN, SORTS } from '../shared/reference/index.ts';
import { javaStatus } from '../server/java-run.ts';

const jdk = await javaStatus();
const bin = (tool: string) => (process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', tool) : tool);
const className = (code: string) => /public class (\w+)/.exec(code)![1]!;

describe('the sorting material', () => {
  it('covers the eight classic sorts, each with an animation', () => {
    expect(SORTS.map((s) => s.id).sort()).toEqual([...SORT_IDS].sort());
    expect(SORTS.map((s) => s.id)).toEqual(['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'counting', 'radix']);
  });

  it.each(SORTS.map((s) => [s.id, s] as const))('%s explains itself and exposes sort(int[])', (_id, s) => {
    expect(s.name.trim()).not.toBe('');
    expect(s.idea.trim()).not.toBe('');
    expect(s.why.trim()).not.toBe('');
    expect(s.steps.length).toBeGreaterThanOrEqual(3);
    for (const t of [s.time.best, s.time.average, s.time.worst, s.space]) expect(t).toMatch(/^O\(.+\)$/);
    expect(s.code).toMatch(/public class \w+/);
    expect(s.code).toContain('public static void sort(int[] a)');
  });

  it('gets the textbook complexities right', () => {
    const by = Object.fromEntries(SORTS.map((s) => [s.id, s]));
    expect(by.merge!.time).toEqual({ best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' });
    expect(by.heap!.time.worst).toBe('O(n log n)');
    expect(by.quick!.time).toMatchObject({ average: 'O(n log n)', worst: 'O(n²)' });
    expect(by.insertion!.time).toMatchObject({ best: 'O(n)', worst: 'O(n²)' });
    expect(by.selection!.time.best).toBe('O(n²)'); // it scans everything even when sorted
    expect(by.merge!.stable && by.insertion!.stable && by.bubble!.stable).toBe(true);
    expect(by.quick!.stable || by.heap!.stable || by.selection!.stable).toBe(false);
    expect(by.merge!.inPlace).toBe(false);
  });

  it('maps every complexity class to named algorithms, and names the n log n ones', () => {
    expect(COMPLEXITY_CLASSES.map((c) => c.bigO)).toEqual(['O(1)', 'O(log n)', 'O(√n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)']);
    for (const c of COMPLEXITY_CLASSES) expect(c.examples.length, c.bigO).toBeGreaterThan(1);
    const nlogn = COMPLEXITY_CLASSES.find((c) => c.bigO === 'O(n log n)')!.examples.join(' ');
    for (const name of ['merge sort', 'heap sort', 'quick sort']) expect(nlogn).toContain(name);
    expect(NLOGN.sources).toHaveLength(2);
    expect(NLOGN.lowerBound).toContain('log₂(n!)');
  });
});

describe('the sorting animations', () => {
  it.each(SORT_IDS.map((id) => [id] as const))('%s really ends sorted', (id) => {
    const a = sortAnimationFor(id);
    const sorted = [...a.input].sort((x, y) => x - y);
    expect(a.result).toBe(sorted.join(','));
    // The last frame must show the sorted array, not just claim it.
    const last = a.frames[a.frames.length - 1]!.layers.find((l) => l.kind === 'array');
    expect(last && last.kind === 'array' ? last.cells.map((c) => Number(c.v)) : null).toEqual(sorted);
    expect(a.frames.length).toBeGreaterThanOrEqual(6);
    expect(a.frames.length).toBeLessThanOrEqual(40);
    for (const f of a.frames) expect(f.caption).not.toMatch(/undefined|NaN/);
  });
});

describe.skipIf(!jdk.available)('the Java for every sort (needs a JDK)', () => {
  it('compiles and agrees with Arrays.sort on every input we can think of', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsa-sorts-'));
    try {
      const names = SORTS.map((s) => className(s.code));
      for (const s of SORTS) writeFileSync(join(dir, `${className(s.code)}.java`), s.code);
      const safeForExtremes = SORTS.filter((s) => s.id !== 'counting').map((s) => className(s.code)); // its k would be 2³²
      writeFileSync(
        join(dir, 'Main.java'),
        `import java.util.*;
public class Main {
    interface Sorter { void sort(int[] a); }
    public static void main(String[] args) {
        Map<String, Sorter> sorts = new LinkedHashMap<>();
${names.map((n) => `        sorts.put("${n}", ${n}::sort);`).join('\n')}
        Set<String> extremes = new HashSet<>(Arrays.asList(${safeForExtremes.map((n) => `"${n}"`).join(', ')}));
        List<int[]> cases = new ArrayList<>();
        cases.add(new int[0]);
        cases.add(new int[] { 7 });
        cases.add(new int[] { 2, 1 });
        cases.add(new int[] { 3, 3, 3, 3 });
        cases.add(new int[] { -5, 0, 5, -5, 0 });
        Random rnd = new Random(42);
        for (int t = 0; t < 400; t++) {
            int n = rnd.nextInt(80);
            int range = t % 3 == 0 ? 3 : 1 + rnd.nextInt(2000);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(2 * range + 1) - range;
            cases.add(a);
        }
        int[] up = new int[2000], down = new int[2000], same = new int[1500];
        for (int i = 0; i < 2000; i++) { up[i] = i; down[i] = 2000 - i; }
        Arrays.fill(same, 4);
        cases.add(up); cases.add(down); cases.add(same);
        int[] edge = { Integer.MAX_VALUE, Integer.MIN_VALUE, 0, -1, 1, Integer.MAX_VALUE };
        int failures = 0;
        for (Map.Entry<String, Sorter> e : sorts.entrySet()) {
            List<int[]> mine = new ArrayList<>(cases);
            if (extremes.contains(e.getKey())) mine.add(edge);
            for (int[] c : mine) {
                int[] want = c.clone(); Arrays.sort(want);
                int[] got = c.clone(); e.getValue().sort(got);
                if (!Arrays.equals(want, got)) {
                    System.out.println("FAIL " + e.getKey() + " on " + (c.length > 20 ? c.length + " elements" : Arrays.toString(c)) + " gave " + (got.length > 20 ? "wrong" : Arrays.toString(got)));
                    failures++;
                    break;
                }
            }
        }
        System.out.println(failures == 0 ? "ALL " + sorts.size() + " SORTS OK" : failures + " FAILED");
    }
}
`,
      );
      execFileSync(bin('javac'), ['-encoding', 'UTF-8', '-d', dir, ...names.map((n) => join(dir, `${n}.java`)), join(dir, 'Main.java')], { stdio: 'pipe' });
      const out = execFileSync(bin('java'), ['-Xss8m', '-cp', dir, 'Main'], { encoding: 'utf8', timeout: 60_000 });
      expect(out.trim()).toBe(`ALL ${SORTS.length} SORTS OK`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
