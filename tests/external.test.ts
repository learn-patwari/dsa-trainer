import { describe, expect, it } from 'vitest';
import { buildExternalProblem } from '../server/external.ts';
import { compileAndRun, javaStatus } from '../server/java-run.ts';
import { PROBLEMS } from '../shared/problems/index.ts';
import { EXTERNAL_ID_BASE } from '../shared/types.ts';

const external = PROBLEMS.filter((p) => p.external);
const jdk = await javaStatus();

describe('problems from outside LeetCode', () => {
  it('has some, with ids that cannot collide with LeetCode and a source for each', () => {
    expect(external.length).toBeGreaterThan(0);
    for (const p of external) {
      expect(p.id, p.slug).toBeGreaterThanOrEqual(EXTERNAL_ID_BASE);
      expect(p.external!.source.url, p.slug).toMatch(/^https:\/\//);
      expect(p.external!.examples.length, p.slug).toBeGreaterThan(0);
    }
    for (const p of PROBLEMS.filter((q) => !q.external)) expect(p.id).toBeLessThan(EXTERNAL_ID_BASE);
  });

  it('has four distinct options for every question', () => {
    for (const p of external) {
      for (const [name, opts] of [['insight', p.insight.options], ['time', p.time], ['space', p.space]] as const) {
        expect(new Set(opts).size, `${p.slug} ${name}`).toBe(4);
      }
      if (p.brute) expect(new Set(p.brute.time).size, `${p.slug} brute`).toBe(4);
    }
  });

  it('describes each example for every parameter and renders the statement', () => {
    for (const p of external) {
      const lc = buildExternalProblem(p)!;
      expect(lc.contentHtml, p.slug).toContain('Example 1:');
      for (const ex of p.external!.examples) expect(ex.input.length, p.slug).toBe(p.external!.signature.params.length);
      expect(lc.javaSnippet, p.slug).toContain(p.external!.signature.name);
    }
  });

  // The reference solution is the answer key: if it fails an example, either it or the example is wrong.
  it.skipIf(!jdk.available).each(external.map((p) => [p.slug, p] as const))(
    '%s: the reference solution passes every example in the Java harness',
    async (_slug, p) => {
      const lc = buildExternalProblem(p)!;
      const run = await compileAndRun(lc, p.external!.reference);
      expect(run.compileErrors, run.compilerOutput).toEqual([]);
      expect(run.compiled).toBe(true);
      const failed = run.tests.filter((t) => t.verdict !== 'pass' && t.verdict !== 'pass-unordered');
      expect(failed.map((t) => `${t.input} → ${t.actual ?? t.error} (expected ${t.expected})`)).toEqual([]);
      expect(run.checked).toBe(p.external!.examples.length);
    },
    60_000,
  );
});
