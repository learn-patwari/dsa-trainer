/**
 * What the letters in a Big-O cost at real input sizes. Computed, not typed, and
 * worked in log₁₀ space so 2ⁿ and n! don't overflow to Infinity: that keeps the
 * table honest right out to n = 10⁶.
 */

export const GROWTH_SIZES = [10, 100, 1_000, 10_000, 100_000, 1_000_000] as const;

/** Roughly what a judge runs per second — the same rule the Maths tab uses. */
export const OPS_PER_SECOND = 1e8;

const LOG10_2 = Math.log10(2);

/** log₁₀(n!) by Stirling, exact enough for display and cheap at n = 10⁶. */
function log10Factorial(n: number): number {
  if (n < 2) return 0;
  if (n <= 20) {
    let f = 1;
    for (let k = 2; k <= n; k++) f *= k;
    return Math.log10(f);
  }
  return (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n)) / Math.LN10;
}

export interface GrowthFn {
  label: string;
  /** Base-10 logarithm of the operation count at n. */
  log10: (n: number) => number;
  example: string;
}

export const GROWTH_FNS: GrowthFn[] = [
  { label: 'O(1)', log10: () => 0, example: 'a hash lookup' },
  { label: 'O(log n)', log10: (n) => Math.log10(Math.log2(n)), example: 'binary search' },
  { label: 'O(√n)', log10: (n) => Math.log10(n) / 2, example: 'trial division' },
  { label: 'O(n)', log10: (n) => Math.log10(n), example: 'one pass' },
  { label: 'O(n log n)', log10: (n) => Math.log10(n * Math.log2(n)), example: 'a sort' },
  { label: 'O(n²)', log10: (n) => 2 * Math.log10(n), example: 'all pairs' },
  { label: 'O(n³)', log10: (n) => 3 * Math.log10(n), example: 'all triples' },
  { label: 'O(2ⁿ)', log10: (n) => n * LOG10_2, example: 'all subsets' },
  { label: 'O(n!)', log10: log10Factorial, example: 'all orderings' },
];

/** 1234 → "1.2 k", 3.4e9 → "3.4 B", and scientific once it stops being readable. */
export function formatCount(log10: number): string {
  if (log10 < 3) {
    const v = 10 ** log10;
    return v < 10 ? v.toFixed(1).replace(/\.0$/, '') : String(Math.round(v));
  }
  const units: [number, string][] = [
    [12, 'T'],
    [9, 'B'],
    [6, 'M'],
    [3, 'k'],
  ];
  if (log10 < 15) {
    for (const [p, u] of units) {
      if (log10 >= p) return `${(10 ** (log10 - p)).toFixed(1).replace(/\.0$/, '')} ${u}`;
    }
  }
  return `10^${Math.floor(log10)}`;
}

/** How long that many operations takes at OPS_PER_SECOND, in words. */
export function formatDuration(log10: number): string {
  const seconds = 10 ** (log10 - Math.log10(OPS_PER_SECOND));
  if (!Number.isFinite(seconds) || seconds > 4.35e17) return 'longer than the universe';
  if (seconds < 1e-3) return 'instant';
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h`;
  if (seconds < 3.15e7) return `${Math.round(seconds / 86400)} days`;
  return `${formatCount(Math.log10(seconds / 3.15e7))} years`;
}

/** Which side of a typical 1–2 second time limit a cell falls. */
export function verdict(log10: number): 'fast' | 'tight' | 'slow' {
  const seconds = 10 ** (log10 - Math.log10(OPS_PER_SECOND));
  if (seconds <= 1) return 'fast';
  if (seconds <= 10) return 'tight';
  return 'slow';
}
