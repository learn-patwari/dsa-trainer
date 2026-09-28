import { describe, expect, it } from 'vitest';
import { isPatternId } from '../shared/patterns/index.ts';
import { FORMULAS, FUNDAMENTALS, STRUCTURES, TOOLBOX } from '../shared/reference/index.ts';

describe('the reference content', () => {
  it('covers the structures an interview actually asks about', () => {
    const ids = STRUCTURES.map((s) => s.id);
    for (const must of ['array', 'arraylist', 'arraydeque', 'hashmap', 'hashset', 'treemap', 'priorityqueue', 'trie', 'unionfind', 'string']) {
      expect(ids, `${must} is missing`).toContain(must);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(STRUCTURES.map((s) => [s.id, s] as const))('%s is complete', (_id, s) => {
    expect(s.name.trim()).not.toBe('');
    expect(s.summary.trim()).not.toBe('');
    expect(s.useWhen.length).toBeGreaterThan(0);
    expect(s.costs.length).toBeGreaterThanOrEqual(2);
    expect(s.methods.length).toBeGreaterThanOrEqual(2);
    expect(s.gotchas.length).toBeGreaterThan(0);
    for (const c of s.costs) expect(c.cost, `${s.id}: ${c.operation}`).toMatch(/O\(|amortis|—/);
    for (const m of s.methods) expect(m.what.trim()).not.toBe('');
  });

  it('only links patterns that exist, so the cards never dead-end', () => {
    for (const s of STRUCTURES) {
      for (const p of s.patterns ?? []) expect(isPatternId(p), `${s.id} links unknown pattern ${p}`).toBe(true);
    }
  });

  it.each(FUNDAMENTALS.map((f) => [f.id, f] as const))('fundamental %s explains itself', (_id, f) => {
    expect(f.title.trim()).not.toBe('');
    expect(f.rule.trim()).not.toBe('');
    expect(f.matters.trim()).not.toBe('');
    expect(new Set(FUNDAMENTALS.map((x) => x.id)).size).toBe(FUNDAMENTALS.length);
  });

  it('gives every formula something to use it for', () => {
    const all = FORMULAS.flatMap((g) => g.formulas);
    expect(all.length).toBeGreaterThan(25);
    for (const f of all) {
      expect(f.expression.trim(), f.name).not.toBe('');
      expect(f.useFor.trim(), f.name).not.toBe('');
    }
    expect(new Set(all.map((f) => f.name)).size).toBe(all.length);
  });

  it('states time and space for every routine in the toolbox', () => {
    const all = TOOLBOX.flatMap((g) => g.routines);
    expect(all.length).toBeGreaterThan(25);
    for (const r of all) {
      expect(r.time.trim(), r.name).not.toBe('');
      expect(r.space.trim(), r.name).not.toBe('');
      expect(r.note.trim(), r.name).not.toBe('');
    }
  });

  it('keeps the well-known costs right, since the whole point is trusting them', () => {
    const byName = new Map(TOOLBOX.flatMap((g) => g.routines).map((r) => [r.name, r]));
    expect(byName.get('BFS')!.time).toBe('O(V + E)');
    expect(byName.get('Dijkstra')!.time).toBe('O(E log V)');
    expect(byName.get('Floyd–Warshall')!.time).toBe('O(V³)');
    expect(byName.get('Heap push/pop')!.time).toBe('O(log n)');
    expect(byName.get('Binary search')!.time).toBe('O(log n)');
    expect(byName.get('Arrays.sort(T[]) / Collections.sort')!.time).toContain('n log n');
  });
});
