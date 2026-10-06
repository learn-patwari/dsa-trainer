import { describe, expect, it } from 'vitest';
import { COMPANY_NAMES, PROBLEM_ASKS } from '../shared/companies.ts';
import { COMPANY_TOP } from '../shared/company-top.ts';
import { PROBLEMS } from '../shared/problems/index.ts';

describe('company data', () => {
  it('has an entry for every problem in the bank', () => {
    const missing = PROBLEMS.filter((p) => !p.external && !PROBLEM_ASKS[p.slug]).map((p) => p.slug);
    expect(missing).toEqual([]);
  });

  it('only lists known companies, once each, with frequencies in range', () => {
    const known = new Set(COMPANY_NAMES);
    for (const [slug, { asks }] of Object.entries(PROBLEM_ASKS)) {
      const names = asks.map(([c]) => c);
      expect(new Set(names).size, slug).toBe(names.length);
      for (const [c, f] of asks) {
        expect(known.has(c), `${slug}: ${c}`).toBe(true);
        expect(f).toBeGreaterThanOrEqual(0);
        expect(f).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ranks each company top list by frequency without duplicates', () => {
    expect(Object.keys(COMPANY_TOP).sort()).toEqual([...COMPANY_NAMES].sort());
    for (const [company, { questions }] of Object.entries(COMPANY_TOP)) {
      const slugs = questions.map((q) => q[0]);
      expect(new Set(slugs).size, company).toBe(slugs.length);
      const freqs = questions.map((q) => q[3]);
      expect(freqs, company).toEqual([...freqs].sort((a, b) => b - a));
    }
  });

  it('puts the classics where candidates say they are asked', () => {
    const topOf = (c: string) => COMPANY_TOP[c]!.questions.map((q) => q[0]);
    expect(topOf('Google')).toContain('two-sum');
    expect(PROBLEM_ASKS['lru-cache']!.asks.map(([c]) => c)).toContain('Amazon');
  });
});
