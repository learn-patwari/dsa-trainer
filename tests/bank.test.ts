import { describe, expect, it } from 'vitest';
import { PATTERNS } from '../shared/patterns/index.ts';
import { PROBLEMS } from '../shared/problems/index.ts';
import { PATTERN_IDS } from '../shared/types.ts';
import meta from './fixtures/leetcode-meta.json';

describe('curated problem bank', () => {
  it('has ~200 unique problems', () => {
    expect(PROBLEMS.length).toBe(197);
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(PROBLEMS.length);
    expect(new Set(PROBLEMS.map((p) => p.id)).size).toBe(PROBLEMS.length);
  });

  it('matches metadata verified against LeetCode (slug, id, title, difficulty, free)', () => {
    const bySlug = new Map(meta.map((m) => [m.slug, m]));
    for (const p of PROBLEMS) {
      const m = bySlug.get(p.slug);
      expect(m, `${p.slug} missing from the verified fixture`).toBeDefined();
      expect({ slug: p.slug, id: p.id, title: p.title, difficulty: p.difficulty, pattern: p.pattern }).toEqual({
        slug: m!.slug,
        id: m!.id,
        title: m!.title,
        difficulty: m!.difficulty,
        pattern: m!.pattern,
      });
      expect(m!.paidOnly, `${p.slug} is premium-only`).toBe(false);
    }
  });

  it('covers every pattern with a lesson and at least 4 problems', () => {
    expect(PATTERNS.map((p) => p.id)).toEqual([...PATTERN_IDS]);
    for (const id of PATTERN_IDS) {
      expect(PROBLEMS.filter((p) => p.pattern === id).length, id).toBeGreaterThanOrEqual(6);
    }
  });

  it('orders each pattern Easy → Medium → Hard', () => {
    const rank = { Easy: 0, Medium: 1, Hard: 2 };
    for (const id of PATTERN_IDS) {
      const ranks = PROBLEMS.filter((p) => p.pattern === id).map((p) => rank[p.difficulty]);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it.each(PROBLEMS.map((p) => [p.slug, p] as const))('%s has a well-formed quiz', (_slug, p) => {
    const distinct = (xs: readonly string[]) => new Set(xs.map((x) => x.trim())).size === xs.length;
    expect(p.insight.q.trim()).not.toBe('');
    expect(p.insight.why.trim()).not.toBe('');
    expect(p.approach.trim()).not.toBe('');
    for (const opts of [p.insight.options, p.time, p.space]) {
      expect(opts).toHaveLength(4);
      expect(opts.every((o) => o.trim().length > 0)).toBe(true);
      expect(distinct(opts)).toBe(true);
    }
    expect(p.edgeCases.length).toBeGreaterThanOrEqual(2);
    expect(p.edgeCases.length).toBeLessThanOrEqual(4);
    for (const alt of p.alsoAccept ?? []) {
      expect(PATTERN_IDS).toContain(alt);
      expect(alt).not.toBe(p.pattern);
    }
    expect(new Set(p.alsoAccept ?? []).size).toBe((p.alsoAccept ?? []).length);
  });

  it.each(PROBLEMS.map((p) => [p.slug, p] as const))('%s names a brute force to improve on', (_slug, p) => {
    expect(p.brute, `${p.slug} has no brute-force step`).toBeDefined();
    expect(p.brute!.text.trim().length).toBeGreaterThan(15);
    expect(p.brute!.time).toHaveLength(4);
    expect(p.brute!.time.every((o) => o.trim().length > 0)).toBe(true);
    expect(new Set(p.brute!.time.map((o) => o.trim())).size).toBe(4);
  });

  it("doesn't let 'pick the longest (or shortest) option' game the multiple-choice questions", () => {
    const rate = (options: (p: (typeof PROBLEMS)[number]) => readonly string[], pick: (lens: number[]) => number) =>
      PROBLEMS.filter((p) => {
        const lens = options(p).map((o) => o.length);
        return lens[0] === pick(lens);
      }).length / PROBLEMS.length;
    // Unbiased options would sit near 25%; keep both heuristics far from reliable.
    for (const options of [(p: (typeof PROBLEMS)[number]) => p.insight.options, (p: (typeof PROBLEMS)[number]) => p.brute!.time]) {
      expect(rate(options, (l) => Math.max(...l))).toBeLessThan(0.4);
      expect(rate(options, (l) => Math.min(...l))).toBeLessThan(0.4);
    }
  });
});
