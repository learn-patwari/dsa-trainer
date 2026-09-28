import type { Fundamental } from './types.ts';

/**
 * The Java you need before the algorithm matters — the traps that turn a correct
 * approach into a wrong answer, and the idioms interviewers expect to see.
 */
export const FUNDAMENTALS: Fundamental[] = [
  // ---------------------------------------------------------------- numbers
  {
    id: 'overflow',
    title: 'int overflows silently at 2.1 billion',
    group: 'Numbers',
    rule: 'int is 32-bit: −2,147,483,648 to 2,147,483,647. Passing the top wraps to the bottom with no error.',
    code: `int mid = (lo + hi) / 2;          // overflows when lo + hi > 2^31 - 1
int mid = lo + (hi - lo) / 2;     // the fix, and the one they look for

int a = Integer.MAX_VALUE;
a + 1 == Integer.MIN_VALUE;       // true, silently

long total = (long) a * b;        // cast BEFORE multiplying, not after`,
    matters: 'Binary search mid and any running sum or product are the usual victims. Writing lo + (hi - lo) / 2 unprompted reads as experience.',
  },
  {
    id: 'division',
    title: 'Integer division truncates toward zero',
    group: 'Numbers',
    rule: '7 / 2 is 3, and −7 / 2 is −3 (not −4). % keeps the sign of the dividend.',
    code: `7 / 2   == 3
-7 / 2  == -3          // toward zero, not floor
-7 % 3  == -1          // not 2

// True floor division and a non-negative modulus:
int floorDiv = Math.floorDiv(-7, 2);   // -4
int mod = Math.floorMod(-7, 3);        // 2
int mod = ((x % n) + n) % n;           // the manual form`,
    matters: 'Circular-array indexing and hashing break on negative inputs. Math.floorMod is the one-line fix.',
  },
  {
    id: 'boxing',
    title: '== on boxed Integers compares references',
    group: 'Numbers',
    rule: 'Java caches Integer objects from −128 to 127. Above that, == between two Integers is false even when the values match.',
    code: `Integer a = 127, b = 127;
a == b;              // true  — both come from the cache

Integer c = 128, d = 128;
c == d;              // false — two different objects
c.equals(d);         // true  — always use equals

map.get(key) == someInt   // unboxes, so this one is fine
map.get(missing) + 1      // NullPointerException — null cannot unbox`,
    matters: 'It passes every small test case and fails the big one. Use equals for boxed types, and getOrDefault to avoid unboxing null.',
  },
  {
    id: 'chars',
    title: 'char is a number you can do arithmetic on',
    group: 'Numbers',
    rule: "c - 'a' maps 'a'..'z' to 0..25. That is how you index a count array without a map.",
    code: `int[] count = new int[26];
for (char c : s.toCharArray()) count[c - 'a']++;

char back = (char) ('a' + i);        // index back to a letter
int digit = c - '0';                 // '7' -> 7
Character.getNumericValue(c);        // same, for any digit`,
    matters: 'int[26] is faster than a HashMap and signals you know the constraint says "lowercase English letters".',
  },
  // ---------------------------------------------------------------- semantics
  {
    id: 'references',
    title: 'Java passes references by value',
    group: 'Semantics',
    rule: 'Reassigning a parameter inside a method does nothing outside it. Mutating the object it points at is visible everywhere.',
    code: `void f(int[] a) { a[0] = 9; }      // caller sees 9
void g(int[] a) { a = new int[3]; }  // caller sees nothing

// Backtracking: store a COPY, or you store a reference you then empty
result.add(new ArrayList<>(path));   // right
result.add(path);                    // wrong — ends up as empty lists`,
    matters: 'The single most common backtracking bug: every result row comes back identical or empty.',
  },
  {
    id: 'equality',
    title: 'equals and hashCode travel together',
    group: 'Semantics',
    rule: 'A type used as a HashMap key or in a HashSet must implement both consistently. Arrays implement neither usefully.',
    code: `int[] k1 = {1, 2}, k2 = {1, 2};
set.add(k1); set.contains(k2);       // false — identity equality

// Keys that work:
String key = r + "," + c;            // simple, allocates
long key = r * 1000L + c;            // encode into a primitive
record Cell(int r, int c) {}         // record gives you both for free
List.of(1, 2)                        // List has value equality`,
    matters: 'A "my visited set is not working" bug almost always traces to an array key.',
  },
  {
    id: 'mutation',
    title: 'You cannot modify a collection while a for-each walks it',
    group: 'Semantics',
    rule: 'Removing inside a for-each throws ConcurrentModificationException. Use an Iterator, removeIf, or iterate a copy.',
    code: `for (String s : list) if (bad(s)) list.remove(s);    // throws

list.removeIf(this::bad);                               // best
Iterator<String> it = list.iterator();
while (it.hasNext()) if (bad(it.next())) it.remove();   // when you need more control`,
    matters: 'It throws at runtime on the second removal, so a one-element test passes and the real input crashes.',
  },
  // ---------------------------------------------------------------- idioms
  {
    id: 'comparators',
    title: 'Comparators: compare, never subtract',
    group: 'Idioms',
    rule: 'Return negative, zero, positive. a - b is a subtraction that can overflow; Integer.compare cannot.',
    code: `Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));

// Several keys, then reversed:
list.sort(Comparator.comparingInt(Task::end).thenComparing(Task::name));
pq = new PriorityQueue<>(Comparator.comparingInt((int[] a) -> a[1]).reversed());

// Sorting a primitive array by a comparator is impossible — box it first:
Integer[] boxed = Arrays.stream(a).boxed().toArray(Integer[]::new);`,
    matters: 'Interval, greedy and top-K problems all begin with a sort. Getting the comparator right is half the solution.',
  },
  {
    id: 'twodim',
    title: '2-D arrays, grids and directions',
    group: 'Idioms',
    rule: 'grid[row][col]. grid.length is the number of rows; grid[0].length is the number of columns.',
    code: `int m = grid.length, n = grid[0].length;
int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};      // 4-directional

for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;   // bounds FIRST
    ...
}

int[][] dp = new int[m][n];
for (int[] row : dp) Arrays.fill(row, -1);       // fill a 2-D array`,
    matters: 'Checking bounds before reading the cell is the difference between a clean solution and an ArrayIndexOutOfBoundsException on the edge case.',
  },
  {
    id: 'recursion',
    title: 'Recursion costs stack space, and Java\'s stack is small',
    group: 'Idioms',
    rule: 'Roughly 10⁴ frames before StackOverflowError. Depth is O(h) for trees, O(n) for a skewed tree or a linked list.',
    code: `// Say the space cost out loud:
// "O(h) stack space, O(n) worst case on a skewed tree."

// Convert to iteration when n can be 10^5:
Deque<TreeNode> stack = new ArrayDeque<>();
stack.push(root);
while (!stack.isEmpty()) { ... }`,
    matters: 'Interviewers ask "what is the space complexity?" and the recursion stack is the answer people forget.',
  },
  {
    id: 'nulls',
    title: 'Null checks belong first, and in the right order',
    group: 'Idioms',
    rule: 'Check for null before dereferencing, and check bounds before indexing. && short-circuits, so order matters.',
    code: `if (node != null && node.val == target)      // safe
if (node.val == target && node != null)      // NullPointerException

if (i < n && s.charAt(i) == c)               // safe
// Empty input is a case, not an edge case — handle it in line 1.
if (nums == null || nums.length == 0) return 0;`,
    matters: 'Most "edge case" failures in this app\'s self-check are one of these two.',
  },
  {
    id: 'bits',
    title: 'Bit operations',
    group: 'Idioms',
    rule: 'Use >>> for unsigned shift; >> keeps the sign bit and loops forever on negatives.',
    code: `x & 1            // lowest bit: 1 if odd
x >> 1           // divide by 2 (sign-preserving)
x >>> 1          // divide by 2, zero-filled — use this when scanning bits
x & (x - 1)      // clears the lowest set bit (Brian Kernighan's count)
x & -x           // isolates the lowest set bit
x ^ y            // differing bits; a ^ a == 0, a ^ 0 == a
1 << k           // 2^k     (use 1L << k when k >= 31)
mask |= 1 << i   // set bit i
(mask >> i) & 1  // read bit i

Integer.bitCount(x), Integer.toBinaryString(x), Integer.highestOneBit(x)`,
    matters: 'Precedence catches people: == binds tighter than &, so write (x & 1) == 1 with the brackets.',
  },
  {
    id: 'io',
    title: 'The shapes LeetCode hands you',
    group: 'Idioms',
    rule: 'You implement a method on class Solution. No reading stdin, no printing the answer — return it.',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) { ... }
}

// Returning a List<List<Integer>> is normal; returning int[][] from a list:
res.toArray(new int[0][]);

// Printing is for debugging only, and it slows you down on large inputs.`,
    matters: 'Compile & run here uses the same signature LeetCode does, so code you write in this app pastes straight across.',
  },
];

export const FUNDAMENTAL_GROUPS = [...new Set(FUNDAMENTALS.map((f) => f.group))];
