import { describe, expect, it } from 'vitest';
import {
  ASCII_ANCHORS,
  ASCII_BLOCKS,
  CHAR_TRICKS,
  formatCount,
  formatDuration,
  FORMULAS,
  GROWTH_FNS,
  GROWTH_SIZES,
  verdict,
} from '../shared/reference/index.ts';

const code = (s: string) => s.charCodeAt(0);
const ch = (n: number) => String.fromCharCode(n);

describe('the ASCII tables', () => {
  it('show real codes: every printable cell is the character its code says', () => {
    for (const b of ASCII_BLOCKS) {
      for (const c of b.cells) {
        if (!c.name) expect(c.char, `${b.title}: code ${c.code}`).toBe(ch(c.code));
      }
    }
  });

  it('cover the three runs people index into', () => {
    const codes = new Set(ASCII_BLOCKS.flatMap((b) => b.cells.map((c) => c.code)));
    for (const [from, to] of [
      [48, 57],
      [65, 90],
      [97, 122],
    ]) {
      for (let k = from!; k <= to!; k++) expect(codes.has(k), `missing ${k}`).toBe(true);
    }
  });

  it('list no code twice', () => {
    const all = ASCII_BLOCKS.flatMap((b) => b.cells.map((c) => c.code));
    expect(new Set(all).size).toBe(all.length);
  });

  it('get the anchors right', () => {
    for (const a of ASCII_ANCHORS) expect(code(a.char.replace(/'/g, '') || ' '), a.char).toBe(a.code);
  });
});

describe('the char tricks', () => {
  // The claims in CHAR_TRICKS, checked against real char codes.
  it('do what they say', () => {
    expect(code('7') - code('0')).toBe(7);
    expect(ch(code('0') + 7)).toBe('7');
    expect(code('c') - code('a')).toBe(2);
    expect(ch(code('a') + 2)).toBe('c');
    expect(code('a') - code('A')).toBe(32);
    expect(ch(code('a') ^ 32)).toBe('A');
    expect(ch(code('A') ^ 32)).toBe('a');
    expect(ch(code('A') | 32)).toBe('a');
    expect(ch(code('a') | 32)).toBe('a');
    expect(ch(code('a') & ~32)).toBe('A');
    expect(ch(code('{') & ~32)).toBe('[');
    expect(code('1') & ~32).toBe(17); // an invisible control character
    expect(ch(code('z') + 1)).toBe('{');
    expect(ch(code('a') + ((code('z') - code('a') + 1) % 26))).toBe('a');
    expect(code('Z') < code('a')).toBe(true);
  });

  it('warn about every trick that only works on letters', () => {
    for (const t of CHAR_TRICKS.filter((x) => /\^ 32|\| 32|& ~32/.test(x.expr))) {
      expect(t.caution, `${t.expr} needs a caution`).toMatch(/letters only/i);
    }
  });
});

describe('the growth table', () => {
  const at = (label: string, n: number) => GROWTH_FNS.find((f) => f.label === label)!.log10(n);

  it('computes the counts it shows', () => {
    expect(formatCount(at('O(n log n)', 1_000_000))).toBe('19.9 M');
    expect(formatCount(at('O(n²)', 100_000))).toBe('10 B');
    expect(formatCount(at('O(n!)', 10))).toBe('3.6 M');
    expect(formatCount(at('O(1)', 1_000_000))).toBe('1');
    expect(formatCount(at('O(2ⁿ)', 100))).toBe('10^30');
  });

  it('puts each cell on the right side of a one-second limit', () => {
    expect(verdict(at('O(n log n)', 1_000_000))).toBe('fast'); // 2 × 10⁷
    expect(verdict(at('O(n²)', 10_000))).toBe('fast'); // 10⁸ is right at the edge
    expect(verdict(at('O(n³)', 1_000))).toBe('tight'); // 10⁹ ≈ 10 s
    expect(verdict(at('O(n²)', 100_000))).toBe('slow'); // 10¹⁰
    expect(verdict(at('O(2ⁿ)', 100))).toBe('slow');
  });

  it('never shows a broken value, even for n! at a million', () => {
    for (const f of GROWTH_FNS) {
      for (const n of GROWTH_SIZES) {
        const l = f.log10(n);
        expect(Number.isFinite(l), `${f.label} at ${n}`).toBe(true);
        expect(formatCount(l)).not.toMatch(/NaN|Infinity|undefined/);
        expect(formatDuration(l)).not.toMatch(/NaN|Infinity|undefined/);
      }
    }
    expect(formatDuration(at('O(2ⁿ)', 1_000_000))).toBe('longer than the universe');
  });

  it('turns counts into times you can feel', () => {
    expect(formatDuration(at('O(n log n)', 1_000_000))).toBe('199 ms');
    expect(formatDuration(at('O(n²)', 100_000))).toBe('2 min');
  });
});

describe('the new formula groups', () => {
  it('are present, and every name is still unique', () => {
    const groups = FORMULAS.map((g) => g.group);
    for (const g of ['Number theory, further', 'Bases and bits', 'Geometry', 'Randomness']) expect(groups).toContain(g);
    const names = FORMULAS.flatMap((g) => g.formulas.map((f) => f.name));
    expect(new Set(names).size).toBe(names.length);
  });
});
