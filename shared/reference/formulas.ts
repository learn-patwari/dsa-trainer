import type { FormulaGroup } from './types.ts';

/** The arithmetic that turns up inside complexity arguments and counting problems. */
export const FORMULAS: FormulaGroup[] = [
  {
    group: 'Series and sums',
    blurb: 'Where the n² in a nested loop actually comes from.',
    formulas: [
      { name: 'First n integers', expression: '1 + 2 + … + n = n(n + 1) / 2 = Θ(n²)', useFor: 'A loop whose inner bound depends on the outer index — the classic "why is this O(n²)".' },
      { name: 'First n squares', expression: '1² + 2² + … + n² = n(n + 1)(2n + 1) / 6 = Θ(n³)', useFor: 'Triple-nested bounds; total work over all subarrays.' },
      { name: 'Arithmetic series', expression: 'n terms, first a, last l → n(a + l) / 2', useFor: 'Any evenly spaced total.' },
      { name: 'Geometric series', expression: '1 + 2 + 4 + … + 2^k = 2^(k+1) − 1 ≈ 2ⁿ', useFor: 'Why doubling an ArrayList is O(1) amortised: the copies sum to less than 2n.' },
      { name: 'Geometric, ratio < 1', expression: '1 + r + r² + … = 1 / (1 − r) for |r| < 1', useFor: 'Halving recursions: n + n/2 + n/4 + … = 2n, so the total is Θ(n), not Θ(n log n).' },
      { name: 'Harmonic series', expression: '1 + 1/2 + 1/3 + … + 1/n ≈ ln n', useFor: 'Sieve of Eratosthenes: Θ(n log log n). Also why "for each i, step by i" is Θ(n log n).' },
      { name: 'Number of subarrays', expression: 'n(n + 1) / 2', useFor: 'Brute force over every contiguous range is Θ(n²) ranges — Θ(n³) if you re-sum each one.' },
    ],
  },
  {
    group: 'Counting',
    blurb: 'How big the search space is — which tells you whether backtracking will survive.',
    formulas: [
      { name: 'Subsets', expression: '2ⁿ', useFor: 'Every subset of n items. n ≤ 20 or so for a brute force.' },
      { name: 'Permutations', expression: 'n! ', useFor: 'Every ordering. n ≤ 10 in practice; 10! is 3.6 million, 12! is 479 million.' },
      { name: 'Combinations', expression: 'C(n, k) = n! / (k!(n − k)!)', useFor: 'Choosing k of n, order irrelevant. Also the grid-paths answer: C(m + n − 2, m − 1).' },
      { name: "Pascal's rule", expression: 'C(n, k) = C(n − 1, k − 1) + C(n − 1, k)', useFor: 'The recurrence behind Pascal\'s triangle, and the dp transition for counting paths.' },
      { name: 'k-ary strings', expression: 'kⁿ', useFor: 'Phone-keypad letter combinations: 4ⁿ worst case. Board search: 4 directions to depth L.' },
      { name: 'Catalan number', expression: 'C(n) = (2n choose n) / (n + 1)', useFor: 'Valid bracket sequences, distinct BSTs of n nodes, ways to triangulate. Grows ~4ⁿ / n^1.5.' },
      { name: 'Pigeonhole', expression: 'n + 1 items in n boxes → some box has 2', useFor: 'Proving a duplicate must exist — find-the-duplicate-number, and cycle arguments.' },
    ],
  },
  {
    group: 'Logs and powers',
    blurb: 'Why "halve it every step" is log n, and how to size an input.',
    formulas: [
      { name: 'Halving', expression: 'n → n/2 → n/4 → … → 1 takes log₂ n steps', useFor: 'Binary search, balanced tree height, heap sift.' },
      { name: 'Log identities', expression: 'log(ab) = log a + log b; log(aᵏ) = k log a; log_b n = log n / log b', useFor: 'Why the base does not matter in Big-O: it is a constant factor.' },
      { name: 'Powers of two', expression: '2¹⁰ ≈ 10³, 2²⁰ ≈ 10⁶, 2³⁰ ≈ 10⁹', useFor: 'log₂(10⁶) ≈ 20, log₂(10⁹) ≈ 30. Binary search over a billion is 30 steps.' },
      { name: 'int and long range', expression: 'int ≈ ±2.1 × 10⁹ (2³¹), long ≈ ±9.2 × 10¹⁸ (2⁶³)', useFor: 'If a product can exceed 2 × 10⁹, you need long.' },
      { name: 'Tree height', expression: 'balanced: ⌊log₂ n⌋; degenerate: n − 1', useFor: 'Why BST operations are "O(h), which is O(log n) only if balanced".' },
      { name: 'Nodes in a full tree', expression: 'height h holds 2^(h+1) − 1 nodes; level h holds 2^h', useFor: 'Sizing a heap array and level-order buffers.' },
    ],
  },
  {
    group: 'Modular and number theory',
    blurb: 'For the "answer may be large, return it modulo 10⁹ + 7" problems.',
    formulas: [
      { name: 'Mod distributes', expression: '(a + b) % m = ((a % m) + (b % m)) % m — same for ×', useFor: 'Take the modulus at every step so nothing overflows.' },
      { name: 'Mod does NOT distribute over division', expression: 'use the modular inverse: a / b mod m = a × b^(m−2) mod m for prime m', useFor: 'Combinatorics under 10⁹ + 7, which is prime.' },
      { name: 'Non-negative modulus', expression: '((x % m) + m) % m, or Math.floorMod(x, m)', useFor: 'Circular arrays and hashing with negative values.' },
      { name: 'GCD (Euclid)', expression: 'gcd(a, b) = gcd(b, a % b), gcd(a, 0) = a — O(log min(a, b))', useFor: 'Fractions, line-slope keys, "can these be evenly grouped".' },
      { name: 'LCM', expression: 'lcm(a, b) = a / gcd(a, b) × b', useFor: 'Divide before multiplying, or you overflow.' },
      { name: 'Primes up to n', expression: 'Sieve of Eratosthenes — Θ(n log log n) time, Θ(n) space', useFor: 'Count-primes, and anything needing many primality tests.' },
      { name: 'Trial division', expression: 'test divisors up to √n only', useFor: 'One-off primality or factor enumeration: O(√n).' },
    ],
  },
  {
    group: 'Sizing the input',
    blurb: 'Constraints tell you the intended complexity. Read them before you design.',
    formulas: [
      { name: 'n ≤ 10', expression: 'O(n!) or O(2ⁿ · n) is fine', useFor: 'Permutations, full backtracking.' },
      { name: 'n ≤ 20–25', expression: 'O(2ⁿ)', useFor: 'Subset enumeration, bitmask DP.' },
      { name: 'n ≤ 500', expression: 'O(n³)', useFor: 'Floyd–Warshall, interval DP.' },
      { name: 'n ≤ 5,000', expression: 'O(n²)', useFor: 'Nested loops, edit-distance-style DP.' },
      { name: 'n ≤ 10⁶', expression: 'O(n log n)', useFor: 'Sorting, heaps, binary search over the answer.' },
      { name: 'n ≥ 10⁷', expression: 'O(n) or O(log n)', useFor: 'One pass, two pointers, maths.' },
      { name: 'Rule of thumb', expression: '≈ 10⁸ simple operations per second', useFor: 'Multiply your complexity by the constraint. If it clears 10⁸, expect a timeout.' },
    ],
  },
];
