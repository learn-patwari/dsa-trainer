import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../server/store.ts';
import { problemView } from '../server/trainer.ts';
import { COMPLEXITY } from '../shared/problems/complexity.ts';
import { PROBLEMS } from '../shared/problems/index.ts';

describe('complexity walkthroughs', () => {
  it('exist for every problem in the bank, and only those', () => {
    const slugs = new Set(PROBLEMS.map((p) => p.slug));
    expect(Object.keys(COMPLEXITY).filter((s) => !slugs.has(s))).toEqual([]);
    expect(PROBLEMS.filter((p) => !COMPLEXITY[p.slug]).map((p) => p.slug)).toEqual([]);
  });

  it.each(PROBLEMS.map((p) => [p.slug, p] as const))('%s ends on the answer the quiz grades', (slug, p) => {
    const w = COMPLEXITY[slug]!;
    // The walkthrough and the approach check must never disagree about the answer.
    expect(w.time.so.endsWith(p.time[0]), `${slug} time: "${w.time.so}" should end with "${p.time[0]}"`).toBe(true);
    expect(w.space.so.endsWith(p.space[0]), `${slug} space: "${w.space.so}" should end with "${p.space[0]}"`).toBe(true);
    for (const d of [w.time, w.space]) {
      expect(d.steps.length).toBeGreaterThan(0);
      for (const [what, cost] of d.steps) {
        expect(what.trim(), `${slug}: a step with no description`).not.toBe('');
        expect(cost.trim(), `${slug}: "${what}" has no cost`).not.toBe('');
      }
    }
  });

  it('stays with the answer key: nothing in the web bundle imports it', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = join(dir, name);
        if (statSync(file).isDirectory()) walk(file);
        else if (/\.(ts|tsx)$/.test(name) && /shared\/problems/.test(readFileSync(file, 'utf8'))) offenders.push(file);
      }
    };
    walk(new URL('../web/src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
    expect(offenders).toEqual([]);
  });

  it('is only revealed once you have attempted the problem', () => {
    const p = emptyProgress();
    expect(problemView(p, 'two-sum', 'pattern').complexity).toBeNull();

    p.problems['two-sum'] = { attempts: 1, bestPercent: 80, lastPercent: 80, lastAt: new Date().toISOString() };
    const w = problemView(p, 'two-sum', 'pattern').complexity;
    expect(w).not.toBeNull();
    expect(w!.time.so).toMatch(/O\(n\)$/);
    expect(w!.space.so).toMatch(/O\(n\)$/);
  });

  it('is not revealed by saved code alone', () => {
    const p = emptyProgress();
    p.problems['two-sum'] = { attempts: 0, bestPercent: 0, lastPercent: 0, lastAt: '', code: 'class Solution {}' };
    expect(problemView(p, 'two-sum', 'blind').complexity).toBeNull();
  });
});
