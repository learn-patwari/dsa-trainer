import { EXTERNAL_ID_BASE, type CuratedProblem } from '../types.ts';

// Problems that are not on LeetCode (batch B: dynamic programming, greedy, intervals, heaps, bits, tries).
// The first option of every question is the correct one.

const CSES = (id: number) => ({ name: 'CSES', url: `https://cses.fi/problemset/task/${id}` });
const GFG = (path: string) => ({ name: 'GeeksforGeeks', url: `https://www.geeksforgeeks.org/${path}/` });

export const externalDpGreedy: CuratedProblem[] = [
  {
    slug: 'maximum-sum-increasing-subsequence', id: EXTERNAL_ID_BASE + 21, title: 'Maximum Sum Increasing Subsequence', difficulty: 'Medium', pattern: 'dp-1d',
    brute: { text: 'Enumerate every subsequence, keep the strictly increasing ones and take the largest sum.', time: ['O(2ⁿ·n)', 'O(n²)', 'O(n)', 'O(n log n)'] },
    insight: {
      q: 'What does dp[i] hold so that the answer is built from smaller subproblems?',
      options: [
        'dp[i] = a[i] plus the largest dp[j] over earlier j with a[j] < a[i]; the answer is the largest dp[i]',
        'dp[i] = the sum of the first i elements, so the answer is simply the total of the whole array in the end',
        'dp[i] = the length of the longest increasing subsequence ending at i, multiplied by the value of a[i] there',
        'dp[i] = the largest element seen up to index i, and the answer is the sum of all of the dp values',
      ],
      why: 'This is the longest increasing subsequence recurrence with sums in place of lengths. Whatever precedes a[i] in an increasing subsequence must be smaller and end earlier, and its best sum is already in dp. The answer is the maximum over all dp[i].',
    },
    vars: 'n = length of a (the standard DP, not the Fenwick-tree optimisation)',
    time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A strictly decreasing array: the answer is its maximum single element', 'Equal values are not "increasing"', 'Negative numbers: a single element can beat extending'],
    approach: 'Initialise dp[i] = a[i]. For each i, for every j < i with a[j] < a[i], set dp[i] = max(dp[i], dp[j] + a[i]). Return the maximum dp value. O(n²) time, O(n) space.',
    external: {
      source: GFG('maximum-sum-increasing-subsequence-dp-14'),
      statement: '<p>Given an integer array <code>a</code>, find the largest sum of a <em>strictly increasing</em> subsequence (elements keep their original order but need not be adjacent).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 1000</code>, <code>1 &lt;= a[i] &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'maxSumIncreasing', params: [{ name: 'a', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[1,101,2,3,100]'], output: '106', explain: '1 + 2 + 3 + 100.' },
        { input: ['[3,4,5,10]'], output: '22' },
        { input: ['[10,5,4,3]'], output: '10' },
      ],
      askedAt: ['Amazon', 'Google', 'Morgan Stanley'],
      reference: `class Solution {
    public int maxSumIncreasing(int[] a) {
        int n = a.length, best = 0;
        int[] dp = a.clone();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + a[i]);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'longest-bitonic-subsequence', id: EXTERNAL_ID_BASE + 22, title: 'Longest Bitonic Subsequence', difficulty: 'Medium', pattern: 'dp-1d',
    brute: { text: 'Enumerate every subsequence and test whether it rises and then falls.', time: ['O(2ⁿ·n)', 'O(n²)', 'O(n)', 'O(n log n)'] },
    insight: {
      q: 'A bitonic subsequence rises then falls. How do you assemble the best one from two simpler DPs?',
      options: [
        'Add, for each peak i, the longest increasing run ending at i and the longest decreasing run starting at i, minus one',
        'Find the longest increasing subsequence and the longest decreasing one separately and simply add their two lengths',
        'Sort the array, then take the first half in ascending order and the second half in descending order as the answer',
        'Take the longest block of consecutive increasing elements and extend it by one element on the right if possible',
      ],
      why: 'Every bitonic subsequence has a peak. Rising to the peak is an LIS ending at it, falling from the peak is an LDS starting at it, and they share the peak element, hence −1. The two arrays are each one O(n²) pass.',
    },
    vars: 'n = length of a',
    time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A purely increasing or purely decreasing array counts (the peak is at an end)', 'Equal neighbours are not strictly rising or falling', 'A single element'],
    approach: 'inc[i] = 1 + max inc[j] for j < i with a[j] < a[i]. dec[i] = 1 + max dec[j] for j > i with a[j] < a[i] (computed right to left). Answer = max over i of inc[i] + dec[i] − 1.',
    external: {
      source: GFG('longest-bitonic-subsequence-dp-15'),
      statement: '<p>A subsequence is <em>bitonic</em> if its elements first strictly increase and then strictly decrease (either part may be empty). Return the length of the longest bitonic subsequence of <code>a</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 1000</code></li></ul>',
      signature: { name: 'longestBitonic', params: [{ name: 'a', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[1,11,2,10,4,5,2,1]'], output: '6', explain: '1, 2, 10, 4, 2, 1.' },
        { input: ['[12,11,40,5,3,1]'], output: '5' },
        { input: ['[80,60,30,40,20,10]'], output: '5' },
      ],
      reference: `class Solution {
    public int longestBitonic(int[] a) {
        int n = a.length;
        int[] inc = new int[n], dec = new int[n];
        Arrays.fill(inc, 1);
        Arrays.fill(dec, 1);
        for (int i = 0; i < n; i++) for (int j = 0; j < i; j++) if (a[j] < a[i]) inc[i] = Math.max(inc[i], inc[j] + 1);
        for (int i = n - 1; i >= 0; i--) for (int j = n - 1; j > i; j--) if (a[j] < a[i]) dec[i] = Math.max(dec[i], dec[j] + 1);
        int best = 0;
        for (int i = 0; i < n; i++) best = Math.max(best, inc[i] + dec[i] - 1);
        return best;
    }
}`,
    },
  },
  {
    slug: 'rod-cutting', id: EXTERNAL_ID_BASE + 23, title: 'Rod Cutting', difficulty: 'Medium', pattern: 'dp-1d',
    brute: { text: 'Try every way of cutting the rod recursively, with no memo.', time: ['O(2ⁿ)', 'O(n²)', 'O(n)', 'O(n log n)'] },
    insight: {
      q: 'You can cut the rod into any pieces and sell each. What is the subproblem?',
      options: [
        'best[len] = the maximum over first-piece lengths j of price[j] + best[len − j], so shorter rods feed longer ones',
        'Always cut off the piece with the highest price per unit of length first and repeat that on the rest of the rod',
        'Sell the whole rod uncut, since every cut loses some value and the largest piece is always the most expensive',
        'Cut the rod into two equal halves and recurse on each half separately, adding the two best results together',
      ],
      why: 'Whatever the first piece is, the rest of the rod is a smaller identical problem, so best[len] = max over j of price[j] + best[len − j]. A greedy by price per unit fails because the leftover length may not be sellable well, and the problem has overlapping subproblems that a table solves once.',
    },
    vars: 'n = rod length = number of prices',
    time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Selling the whole rod may be best', 'Many 1-unit pieces may be best (price[1] large)', 'A single unit'],
    approach: 'Let best[0] = 0. For len from 1 to n: best[len] = max over j in 1..len of prices[j − 1] + best[len − j]. Return best[n]. It is an unbounded knapsack. O(n²) time, O(n) space.',
    external: {
      source: GFG('cutting-a-rod-dp-13'),
      statement: '<p><code>prices[i]</code> is the price you get for a piece of rod of length <code>i + 1</code>. A rod of length <code>n = prices.length</code> can be cut into any number of integer-length pieces, and every piece is sold.</p><p>Return the maximum total price.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 1000</code>, <code>0 &lt;= prices[i] &lt;= 10<sup>4</sup></code></li></ul>',
      signature: { name: 'cutRod', params: [{ name: 'prices', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[1,5,8,9,10,17,17,20]'], output: '22', explain: 'Cut into 2 and 6: 5 + 17.' },
        { input: ['[3,5,8,9,10,17,17,20]'], output: '24', explain: 'Eight pieces of length 1.' },
        { input: ['[1,5,8,9]'], output: '10', explain: 'Two pieces of length 2.' },
      ],
      reference: `class Solution {
    public int cutRod(int[] prices) {
        int n = prices.length;
        int[] best = new int[n + 1];
        for (int len = 1; len <= n; len++)
            for (int j = 1; j <= len; j++) best[len] = Math.max(best[len], prices[j - 1] + best[len - j]);
        return best[n];
    }
}`,
    },
  },
  {
    slug: 'dice-combinations', id: EXTERNAL_ID_BASE + 24, title: 'Dice Combinations', difficulty: 'Easy', pattern: 'dp-1d',
    brute: { text: 'Recursively try every roll 1-6 until the sum reaches n.', time: ['O(6ⁿ)', 'O(n)', 'O(n²)', 'O(n log n)'] },
    insight: {
      q: 'Count the ordered sequences of rolls (1-6) that sum to n. What is the recurrence?',
      options: [
        'ways[s] = ways[s−1] + ways[s−2] + … + ways[s−6], with ways[0] = 1',
        'ways[s] = 6 · ways[s − 1], because each extra roll multiplies the number of sequences by the six faces',
        'ways[s] = ways[s − 1] + ways[s − 2], exactly as in the Fibonacci numbers, since the last roll is 1 or 2',
        'ways[s] = the number of partitions of s into at most six parts, ignoring the order in which they were rolled',
      ],
      why: 'The last roll is some d in 1..6, and what precedes it is a sequence summing to s − d. Different last rolls give different sequences, so the counts add. This is climbing stairs with six step sizes.',
    },
    vars: 'n = the target sum',
    time: ['O(n)', 'O(6ⁿ)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(6ⁿ)'],
    edgeCases: ['n = 1 has exactly one way', 'The answer overflows int, so take it modulo 1,000,000,007 at every addition', 'n smaller than 6: only dice up to n are usable'],
    approach: 'ways[0] = 1. For s from 1 to n: ways[s] = sum of ways[s − d] for d in 1..min(6, s), modulo 10⁹ + 7. Return ways[n]. O(6n) time, which is O(n).',
    external: {
      source: CSES(1633),
      statement: '<p>You roll a standard six-sided die repeatedly until the total of all rolls is exactly <code>n</code>. Count the different <em>ordered</em> sequences of rolls that make a total of <code>n</code>.</p><p>Return the count modulo <code>1,000,000,007</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>6</sup></code></li></ul>',
      signature: { name: 'diceCombinations', params: [{ name: 'n', type: 'integer' }], returns: 'integer' },
      examples: [
        { input: ['3'], output: '4', explain: '1+1+1, 1+2, 2+1 and 3.' },
        { input: ['1'], output: '1' },
        { input: ['7'], output: '63' },
      ],
      reference: `class Solution {
    public int diceCombinations(int n) {
        final int MOD = 1_000_000_007;
        int[] ways = new int[n + 1];
        ways[0] = 1;
        for (int s = 1; s <= n; s++)
            for (int d = 1; d <= 6 && d <= s; d++) ways[s] = (ways[s] + ways[s - d]) % MOD;
        return ways[n];
    }
}`,
    },
  },
  {
    slug: 'money-sums', id: EXTERNAL_ID_BASE + 25, title: 'Money Sums', difficulty: 'Medium', pattern: 'dp-1d', alsoAccept: ['dp-2d'],
    brute: { text: 'Generate all 2ⁿ subsets, add each one up and collect the distinct totals.', time: ['O(2ⁿ·n)', 'O(n·S)', 'O(n log n)', 'O(n)'] },
    insight: {
      q: 'Which totals can be made from some subset of the coins? What do you track?',
      options: [
        'Keep a boolean table reachable[s]; for each coin, update the sums from high to low so each coin is used once',
        'Sort the coins and report every prefix sum of the sorted list, since larger coins build on smaller ones',
        'Only sums of consecutive coins in the given order need checking, because other subsets repeat those totals',
        'Every integer from the smallest coin up to the sum of all coins can be made, so just list that whole range',
      ],
      why: 'This is the 0/1 knapsack reachability table. Looping the sums downward for each coin stops the coin being reused within the same pass. Prefix sums miss most combinations, and not every value in between is reachable.',
    },
    vars: 'n = number of coins, S = sum of all coins',
    time: ['O(n·S)', 'O(2ⁿ)', 'O(n log n)', 'O(S)'],
    space: ['O(S)', 'O(1)', 'O(n·S)', 'O(2ⁿ)'],
    edgeCases: ['Duplicate coins', 'A single coin', 'Sum 0 is not reported'],
    approach: 'reachable[0] = true. For each coin c, for s from S down to c: reachable[s] |= reachable[s − c]. Collect every s ≥ 1 with reachable[s] true, in increasing order. O(n·S) time, O(S) space.',
    external: {
      source: CSES(1745),
      statement: '<p>Given the values of <code>n</code> coins, return, in increasing order, every positive total that can be made by choosing some subset of the coins (each coin at most once).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 100</code>, <code>1 &lt;= coins[i] &lt;= 1000</code></li></ul>',
      signature: { name: 'moneySums', params: [{ name: 'coins', type: 'integer[]' }], returns: 'integer[]' },
      examples: [
        { input: ['[4,2,5,2]'], output: '[2,4,5,6,7,8,9,11,13]' },
        { input: ['[1,1]'], output: '[1,2]' },
        { input: ['[3]'], output: '[3]' },
      ],
      reference: `class Solution {
    public int[] moneySums(int[] coins) {
        int total = 0;
        for (int c : coins) total += c;
        boolean[] ok = new boolean[total + 1];
        ok[0] = true;
        for (int c : coins) for (int s = total; s >= c; s--) if (ok[s - c]) ok[s] = true;
        List<Integer> out = new ArrayList<>();
        for (int s = 1; s <= total; s++) if (ok[s]) out.add(s);
        int[] res = new int[out.size()];
        for (int i = 0; i < res.length; i++) res[i] = out.get(i);
        return res;
    }
}`,
    },
  },
  {
    slug: 'zero-one-knapsack', id: EXTERNAL_ID_BASE + 26, title: '0/1 Knapsack', difficulty: 'Medium', pattern: 'dp-2d', alsoAccept: ['dp-1d'],
    brute: { text: 'Try taking or skipping every item recursively.', time: ['O(2ⁿ)', 'O(n·W)', 'O(n log n)', 'O(n)'] },
    insight: {
      q: 'Each item is taken or left. What state lets you build the best value from smaller cases?',
      options: [
        'best[i][w]: skip item i, or take it and add best[i−1][w − weight]; the answer is best[n][capacity] at the end',
        'Sort the items by value and take them one after another until the bag has no room left for the next one',
        'Sort the items by value per unit of weight and take them greedily, as in the fractional version of the problem',
        'best[w] = best[w − 1] + 1, since every extra unit of capacity lets exactly one more item be carried along',
      ],
      why: 'The choice for item i splits into skip (same capacity, one fewer item) and take (less capacity, plus the value), and both sub-states repeat across the search, so a table solves each once. Greedy by value or ratio fails for indivisible items.',
    },
    vars: 'n = number of items, W = capacity',
    time: ['O(n·W)', 'O(2ⁿ)', 'O(n log n)', 'O(n + W)'],
    space: ['O(n·W)', 'O(1)', 'O(n)', 'O(2ⁿ)'],
    edgeCases: ['An item heavier than the whole capacity', 'Capacity 0', 'A single item that fits'],
    approach: 'Let best[i][w] be the best value with the first i items and capacity w. best[0][*] = 0. For item i: best[i][w] = best[i−1][w], and if weight[i] ≤ w also max with best[i−1][w − weight[i]] + value[i]. Return best[n][W]. (Iterating w downward lets one 1-D row replace the table.)',
    external: {
      source: GFG('0-1-knapsack-problem-dp-10'),
      statement: '<p>You have a bag with weight <code>capacity</code> and <code>n</code> items, item <code>i</code> having weight <code>weights[i]</code> and value <code>values[i]</code>. Each item can be taken <em>whole</em> or left behind.</p><p>Return the largest total value that fits in the bag.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 1000</code>, <code>0 &lt;= capacity &lt;= 10<sup>4</sup></code></li></ul>',
      signature: { name: 'knapsack', params: [{ name: 'capacity', type: 'integer' }, { name: 'weights', type: 'integer[]' }, { name: 'values', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['4', '[1,2,3]', '[10,15,40]'], output: '50', explain: 'Take the items of weight 1 and 3.' },
        { input: ['50', '[10,20,30]', '[60,100,120]'], output: '220' },
        { input: ['3', '[4,5,1]', '[1,2,3]'], output: '3' },
      ],
      reference: `class Solution {
    public int knapsack(int capacity, int[] weights, int[] values) {
        int n = weights.length;
        int[][] best = new int[n + 1][capacity + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                best[i][w] = best[i - 1][w];
                if (weights[i - 1] <= w) best[i][w] = Math.max(best[i][w], best[i - 1][w - weights[i - 1]] + values[i - 1]);
            }
        }
        return best[n][capacity];
    }
}`,
    },
  },
  {
    slug: 'longest-common-substring', id: EXTERNAL_ID_BASE + 27, title: 'Longest Common Substring', difficulty: 'Medium', pattern: 'dp-2d',
    brute: { text: 'Take every substring of a and check whether it occurs in b.', time: ['O(n·m·min(n, m))', 'O(n·m)', 'O(n + m)', 'O(n log n)'] },
    insight: {
      q: 'Unlike a subsequence, a common substring must be contiguous. How does the table change?',
      options: [
        'dp[i][j] = dp[i−1][j−1] + 1 if a[i−1] = b[j−1], otherwise 0; the answer is the largest cell in the table',
        'dp[i][j] = max(dp[i−1][j], dp[i][j−1]) when the characters differ, as in the longest common subsequence',
        'dp[i][j] = the number of equal characters shared by the prefixes a[0..i) and b[0..j), whatever their order',
        'dp[i][j] = the edit distance between the two prefixes, and the answer is the length minus that distance',
      ],
      why: 'A matching pair extends a common substring only if the previous characters also matched, so a mismatch resets the run to 0 (a subsequence DP would carry the value over). The answer is the maximum anywhere in the table, not the last cell.',
    },
    vars: 'n = a.length, m = b.length',
    time: ['O(n·m)', 'O(n + m)', 'O(n·m·min(n, m))', 'O(n log n)'],
    space: ['O(n·m)', 'O(1)', 'O(n + m)', 'O(n²·m)'],
    edgeCases: ['No common characters, so 0', 'One string is contained in the other', 'Repeated letters that give several equally long matches'],
    approach: 'Fill dp over prefixes: if a[i−1] == b[j−1] then dp[i][j] = dp[i−1][j−1] + 1 else 0, tracking the maximum value seen. Return that maximum. O(n·m) time and space (O(min(n, m)) with two rows).',
    external: {
      source: GFG('longest-common-substring-dp-29'),
      statement: '<p>Given two strings <code>a</code> and <code>b</code>, return the length of their longest <em>common substring</em>: the longest run of consecutive characters that appears in both.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length, b.length &lt;= 1000</code></li></ul>',
      signature: { name: 'longestCommonSubstring', params: [{ name: 'a', type: 'string' }, { name: 'b', type: 'string' }], returns: 'integer' },
      examples: [
        { input: ['"abcdxyz"', '"xyzabcd"'], output: '4', explain: '"abcd".' },
        { input: ['"zxabcdezy"', '"yzabcdezx"'], output: '6', explain: '"abcdez".' },
        { input: ['"abc"', '"def"'], output: '0' },
      ],
      reference: `class Solution {
    public int longestCommonSubstring(String a, String b) {
        int n = a.length(), m = b.length(), best = 0;
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    best = Math.max(best, dp[i][j]);
                }
            }
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'rectangle-cutting', id: EXTERNAL_ID_BASE + 28, title: 'Rectangle Cutting', difficulty: 'Medium', pattern: 'dp-2d',
    brute: { text: 'Recursively try every horizontal and vertical cut with no memo.', time: ['O(2^(a·b))', 'O(a·b·(a + b))', 'O(a·b)', 'O(a + b)'] },
    insight: {
      q: 'Cut an a×b rectangle into squares using the fewest cuts. What is the subproblem?',
      options: [
        'cuts[i][j] = 0 if i = j, else 1 + the best split of cuts[part1] + cuts[part2] over every cut position',
        'Repeatedly cut the largest possible square from one corner, exactly as the Euclidean algorithm would do it',
        'cuts[i][j] = cuts[i − 1][j − 1] + 1, since cutting one unit off each side reduces the problem by one cut',
        'cuts[i][j] = (i + j) / 2, because each cut can at best halve the sum of the two side lengths of the piece',
      ],
      why: 'The first cut splits the rectangle into two independent smaller rectangles, so the answer is one cut plus their best answers, minimised over every split position. Cutting off the largest square greedily is not always optimal (for 13×11 it is worse than the DP).',
    },
    vars: 'a, b = the rectangle dimensions',
    time: ['O(a·b·(a + b))', 'O(a·b)', 'O(a + b)', 'O(2^(a·b))'],
    space: ['O(a·b)', 'O(1)', 'O(a + b)', 'O(a²·b²)'],
    edgeCases: ['Already a square: 0 cuts', 'A 1×n strip needs n − 1 cuts', 'The greedy "largest square first" answer can be too high'],
    approach: 'dp[i][j] for i×j rectangles: 0 when i = j; otherwise the minimum of 1 + dp[i][k] + dp[i][j − k] over k in 1..j−1 and 1 + dp[k][j] + dp[i − k][j] over k in 1..i−1. Return dp[a][b].',
    external: {
      source: CSES(1744),
      statement: '<p>An <code>a × b</code> rectangle is to be cut into squares. Each cut is a straight line parallel to a side that splits one rectangle into two. Squares may have different sizes.</p><p>Return the minimum number of cuts needed.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a, b &lt;= 500</code></li></ul>',
      signature: { name: 'minCuts', params: [{ name: 'a', type: 'integer' }, { name: 'b', type: 'integer' }], returns: 'integer' },
      examples: [
        { input: ['3', '5'], output: '3' },
        { input: ['1', '1'], output: '0' },
        { input: ['2', '4'], output: '1' },
      ],
      reference: `class Solution {
    public int minCuts(int a, int b) {
        int[][] dp = new int[a + 1][b + 1];
        for (int i = 1; i <= a; i++) {
            for (int j = 1; j <= b; j++) {
                if (i == j) continue;
                int best = Integer.MAX_VALUE;
                for (int k = 1; k < j; k++) best = Math.min(best, 1 + dp[i][k] + dp[i][j - k]);
                for (int k = 1; k < i; k++) best = Math.min(best, 1 + dp[k][j] + dp[i - k][j]);
                dp[i][j] = best;
            }
        }
        return dp[a][b];
    }
}`,
    },
  },
  {
    slug: 'matrix-chain-multiplication', id: EXTERNAL_ID_BASE + 29, title: 'Matrix Chain Multiplication', difficulty: 'Hard', pattern: 'dp-2d',
    brute: { text: 'Try every way of parenthesising the product recursively.', time: ['O(Catalan(n)) ≈ O(4ⁿ)', 'O(n³)', 'O(n²)', 'O(n log n)'] },
    insight: {
      q: 'The product order changes the cost, not the result. What is the recurrence?',
      options: [
        'cost[i][j] = min over split k of cost[i][k] + cost[k+1][j] + dims[i−1]·dims[k]·dims[j]',
        'Always multiply the two adjacent matrices with the smallest product cost first, then repeat on the shorter chain',
        'Multiply the matrices strictly from left to right, since that order is always as cheap as any other order',
        'cost[i][j] = cost[i][j − 1] + dims[j], extending the chain by one matrix at the cost of one dimension',
      ],
      why: 'The last multiplication splits the chain at some k, and the two halves are independent subchains. The cost of that final multiply depends only on the outer dimensions. Taking the minimum over all k, with chains built from short to long, is the interval-DP pattern.',
    },
    vars: 'n = number of matrices (dims has n + 1 entries)',
    time: ['O(n³)', 'O(n²)', 'O(4ⁿ)', 'O(n log n)'],
    space: ['O(n²)', 'O(n)', 'O(1)', 'O(n³)'],
    edgeCases: ['A single matrix costs 0', 'Two matrices have exactly one way', 'Greedy "cheapest pair first" gives wrong answers'],
    approach: 'Matrix i has size dims[i−1] × dims[i]. For chain length 2..n, for each start i, with j = i + len − 1: dp[i][j] = min over k in i..j−1 of dp[i][k] + dp[k+1][j] + dims[i−1]·dims[k]·dims[j]. Return dp[1][n]. O(n³).',
    external: {
      source: GFG('matrix-chain-multiplication-dp-8'),
      statement: '<p>You must multiply a chain of <code>n</code> matrices. Matrix <code>i</code> (1-indexed) has <code>dims[i-1]</code> rows and <code>dims[i]</code> columns, so <code>dims</code> has <code>n + 1</code> entries. Multiplying a <code>p×q</code> matrix by a <code>q×r</code> one costs <code>p·q·r</code> scalar multiplications.</p><p>The order of multiplication (the parenthesisation) is up to you. Return the minimum total number of scalar multiplications.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= dims.length &lt;= 100</code>, <code>1 &lt;= dims[i] &lt;= 500</code></li></ul>',
      signature: { name: 'matrixChain', params: [{ name: 'dims', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[40,20,30,10,30]'], output: '26000' },
        { input: ['[10,20,30,40,30]'], output: '30000' },
        { input: ['[10,20,30]'], output: '6000' },
      ],
      reference: `class Solution {
    public int matrixChain(int[] dims) {
        int n = dims.length - 1;
        int[][] dp = new int[n + 1][n + 1];
        for (int len = 2; len <= n; len++) {
            for (int i = 1; i + len - 1 <= n; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++)
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]);
            }
        }
        return dp[1][n];
    }
}`,
    },
  },
  {
    slug: 'gold-mine', id: EXTERNAL_ID_BASE + 30, title: 'Gold Mine', difficulty: 'Medium', pattern: 'dp-2d',
    brute: { text: 'From every cell in the first column, try all three moves recursively.', time: ['O(r·3ᶜ)', 'O(r·c)', 'O(r + c)', 'O(r·c²)'] },
    insight: {
      q: 'A miner enters at any row of the first column and moves right, up-right or down-right. What state do you need?',
      options: [
        'best[r][c] = gold[r][c] + the best of its three predecessors; the answer is the best in the last column',
        'Start at the richest cell of column 0 and always step to the richest of the three reachable neighbours',
        'Add up each row and take the row with the largest sum, because the miner can stay on one row to the end',
        'Add up each column and take the largest column total, since the miner must pass through every single column',
      ],
      why: 'Because every move goes one column right, each cell has exactly three predecessors in the previous column, so a left-to-right table gives the best total ending anywhere. Greedy "richest neighbour" can walk into a poor region later.',
    },
    vars: 'r = rows, c = columns',
    time: ['O(r·c)', 'O(r·3ᶜ)', 'O(r²·c)', 'O(r + c)'],
    space: ['O(r·c)', 'O(1)', 'O(r)', 'O(r·c²)'],
    edgeCases: ['A single row or a single column', 'The first and last rows have only two predecessors', 'All zeros'],
    approach: 'Fill columns left to right: dp[r][c] = grid[r][c] + max(dp[r−1][c−1], dp[r][c−1], dp[r+1][c−1]) over those that exist (column 0 is just the grid). The answer is the maximum of the last column.',
    external: {
      source: GFG('gold-mine-problem'),
      statement: '<p>A gold mine is an <code>r × c</code> grid, each cell holding some gold. A miner may start in <em>any</em> cell of the first column. From a cell they can move to the cell directly right, or to the right and one row up, or to the right and one row down.</p><p>Return the largest amount of gold the miner can collect (the miner collects from every cell they visit, finishing in the last column).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= r, c &lt;= 100</code>, <code>0 &lt;= gold &lt;= 100</code></li></ul>',
      signature: { name: 'maxGold', params: [{ name: 'grid', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['[[1,3,3],[2,1,4],[0,6,4]]'], output: '12', explain: '2 → 6 → 4.' },
        { input: ['[[1,3,1,5],[2,2,4,1],[5,0,2,3],[0,6,1,2]]'], output: '16' },
        { input: ['[[10]]'], output: '10' },
      ],
      reference: `class Solution {
    public int maxGold(int[][] grid) {
        int r = grid.length, c = grid[0].length;
        int[][] dp = new int[r][c];
        for (int i = 0; i < r; i++) dp[i][0] = grid[i][0];
        for (int j = 1; j < c; j++) {
            for (int i = 0; i < r; i++) {
                int best = dp[i][j - 1];
                if (i > 0) best = Math.max(best, dp[i - 1][j - 1]);
                if (i + 1 < r) best = Math.max(best, dp[i + 1][j - 1]);
                dp[i][j] = grid[i][j] + best;
            }
        }
        int ans = 0;
        for (int i = 0; i < r; i++) ans = Math.max(ans, dp[i][c - 1]);
        return ans;
    }
}`,
    },
  },
  {
    slug: 'minimum-number-of-platforms', id: EXTERNAL_ID_BASE + 31, title: 'Minimum Number of Platforms', difficulty: 'Medium', pattern: 'intervals', alsoAccept: ['greedy'],
    brute: { text: 'For each train, count how many other trains are at the station when it arrives.', time: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n³)'] },
    insight: {
      q: 'You want the largest number of trains at the station at the same moment. What is a clean way to compute it?',
      options: [
        'Sort arrivals and departures separately and sweep them together, +1 on an arrival and −1 on a departure',
        'Sort the trains by arrival time and give each train its own platform number as it arrives at the station',
        'Count the trains whose arrival time is earlier than the average departure time of all of the trains',
        'Take the longest single stay, because that one train blocks a platform for longer than any other train does',
      ],
      why: 'The peak overlap only changes at arrivals and departures. Sorting the two lists independently is fine because only the count matters, not which train is which. Equal times are resolved by freeing a platform before using it.',
    },
    vars: 'n = number of trains',
    time: ['O(n log n)', 'O(n²)', 'O(n)', 'O(n³)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A train arriving exactly when another departs can use its platform', 'Every train overlaps every other', 'A single train'],
    approach: 'Sort arr and dep. With pointers i (arrivals) and j (departures): if arr[i] < dep[j] a train arrives before the earliest departure, so platforms++ and i++; otherwise a train leaves, so platforms-- and j++. Track the maximum. O(n log n).',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/' },
      statement: '<p>Arrival and departure times (as integers such as <code>930</code> for 9:30) of <code>n</code> trains at a station are given in <code>arr</code> and <code>dep</code>; train <code>i</code> is at the station from <code>arr[i]</code> to <code>dep[i]</code>. All trains run on the same day.</p><p>A train arriving at the exact time another one departs may use its platform. Return the minimum number of platforms so that no train has to wait.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 50000</code>, <code>0 &lt;= arr[i] &lt;= dep[i] &lt;= 2359</code></li></ul>',
      signature: { name: 'minPlatforms', params: [{ name: 'arr', type: 'integer[]' }, { name: 'dep', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[900,940,950,1100,1500,1800]', '[910,1200,1120,1130,1900,2000]'], output: '3' },
        { input: ['[900,1100,1235]', '[1000,1200,1240]'], output: '1' },
        { input: ['[100,200]', '[200,300]'], output: '1', explain: 'The second train arrives as the first one leaves.' },
        { input: ['[100,100,100]', '[200,200,200]'], output: '3' },
      ],
      askedAt: ['Amazon', 'Microsoft'],
      reference: `class Solution {
    public int minPlatforms(int[] arr, int[] dep) {
        int[] a = arr.clone(), d = dep.clone();
        Arrays.sort(a);
        Arrays.sort(d);
        int i = 0, j = 0, cur = 0, best = 0;
        while (i < a.length) {
            if (a[i] < d[j]) { cur++; i++; best = Math.max(best, cur); }
            else { cur--; j++; }
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'movie-festival', id: EXTERNAL_ID_BASE + 32, title: 'Movie Festival', difficulty: 'Easy', pattern: 'greedy', alsoAccept: ['intervals'],
    brute: { text: 'Try every subset of movies and keep the largest one with no overlaps.', time: ['O(2ⁿ·n)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'Which movie do you commit to first so that the most movies still fit afterwards?',
      options: [
        'The one that ends earliest; then repeat with the movies that start at or after that end time',
        'The one that starts earliest, since beginning sooner always leaves the most time for movies afterwards',
        'The shortest movie, since a short movie takes the least time and so must leave the largest remaining gap',
        'The movie that overlaps the fewest other movies, since it blocks the smallest number of later choices',
      ],
      why: 'Finishing earliest leaves the largest remaining window, and an exchange argument shows any optimal schedule can swap its first movie for the earliest-ending one without losing a movie. Earliest start, shortest, or fewest overlaps each have counterexamples.',
    },
    vars: 'n = number of movies',
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A movie may start exactly when the previous one ends', 'All movies overlap, so the answer is 1', 'Movies with the same end time'],
    approach: 'Sort by end time. Keep the end of the last chosen movie (start with −∞). For each movie in order, if its start ≥ that end, take it and update the end. Return the count. O(n log n).',
    external: {
      source: CSES(1629),
      statement: '<p>There are <code>n</code> movies, the <code>i</code>-th running from <code>movies[i][0]</code> to <code>movies[i][1]</code>. You can watch a whole movie only; you can start one at the moment the previous one ends but never watch two at once.</p><p>Return the maximum number of movies you can watch.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 2·10<sup>5</sup></code>, <code>1 &lt;= start &lt; end &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'maxMovies', params: [{ name: 'movies', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['[[3,5],[4,9],[5,8]]'], output: '2', explain: '(3,5) then (5,8).' },
        { input: ['[[1,2],[2,3],[3,4]]'], output: '3' },
        { input: ['[[1,10],[2,3],[4,5]]'], output: '2' },
      ],
      reference: `class Solution {
    public int maxMovies(int[][] movies) {
        int[][] m = movies.clone();
        Arrays.sort(m, (x, y) -> Integer.compare(x[1], y[1]));
        long end = Long.MIN_VALUE;
        int count = 0;
        for (int[] mv : m) if (mv[0] >= end) { count++; end = mv[1]; }
        return count;
    }
}`,
    },
  },
  {
    slug: 'job-sequencing-with-deadlines', id: EXTERNAL_ID_BASE + 33, title: 'Job Sequencing With Deadlines', difficulty: 'Medium', pattern: 'greedy', alsoAccept: ['heap', 'union-find'],
    brute: { text: 'Try every subset of jobs in every order and check the deadlines.', time: ['O(n!·n)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'Every job takes one unit of time and pays only if finished by its deadline. How do you pick the jobs?',
      options: [
        'Take jobs by profit, highest first, and put each in the latest free slot at or before its deadline',
        'Do the jobs with the earliest deadlines first, whatever they happen to pay, since late jobs earn nothing',
        'Do the jobs in the order they are given and simply drop any job that would miss its own deadline',
        'Take every job whose deadline is at least the number of jobs, since those can always be fitted in later',
      ],
      why: 'Placing a high-profit job as late as its deadline allows keeps earlier slots open for jobs with tighter deadlines. If no free slot remains the job is dropped, and it can never displace a better one because better ones were placed earlier. A matroid exchange argument proves this greedy optimal.',
    },
    vars: 'n = number of jobs',
    time: ['O(n log n)', 'O(n²)', 'O(n)', 'O(n!)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Deadlines larger than the number of jobs', 'Many jobs sharing deadline 1: only one can run', 'Equal profits'],
    approach: 'Sort job indices by profit descending. For each, find the latest unused slot s ≤ min(deadline, n); if one exists mark it used and add the profit. Using a union-find "next free slot to the left" gives O(n log n); a simple backward scan is O(n²). Return [jobs done, total profit].',
    external: {
      source: GFG('job-sequencing-problem'),
      statement: '<p>There are <code>n</code> jobs. Job <code>i</code> takes exactly one unit of time, must be <em>finished</em> by time <code>deadline[i]</code> (so it can run in slot 1, 2, … up to its deadline), and earns <code>profit[i]</code>. Only one job runs at a time.</p><p>Return <code>[numberOfJobsDone, maximumTotalProfit]</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>5</sup></code>, <code>1 &lt;= deadline[i] &lt;= n</code>, <code>1 &lt;= profit[i] &lt;= 500</code></li></ul>',
      signature: { name: 'jobSequencing', params: [{ name: 'deadline', type: 'integer[]' }, { name: 'profit', type: 'integer[]' }], returns: 'integer[]' },
      examples: [
        { input: ['[4,1,1,1]', '[20,10,40,30]'], output: '[2,60]', explain: 'Jobs 3 (profit 40) and 1 (profit 20).' },
        { input: ['[2,1,2,1,3]', '[100,19,27,25,15]'], output: '[3,142]' },
      ],
      askedAt: ['Microsoft', 'Ola', 'Morgan Stanley', 'Google'],
      reference: `class Solution {
    public int[] jobSequencing(int[] deadline, int[] profit) {
        int n = deadline.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Integer.compare(profit[y], profit[x]));
        boolean[] used = new boolean[n + 1];
        int jobs = 0, total = 0;
        for (int idx : order) {
            for (int s = Math.min(deadline[idx], n); s >= 1; s--) {
                if (!used[s]) { used[s] = true; jobs++; total += profit[idx]; break; }
            }
        }
        return new int[] {jobs, total};
    }
}`,
    },
  },
  {
    slug: 'missing-coin-sum', id: EXTERNAL_ID_BASE + 34, title: 'Missing Coin Sum', difficulty: 'Medium', pattern: 'greedy',
    brute: { text: 'Compute every subset sum and find the smallest positive integer that is absent.', time: ['O(2ⁿ)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'You want the smallest positive total that no subset of the coins makes. What invariant lets you find it in one pass?',
      options: [
        'Sort the coins and track reach, the largest R with every total 1..R makeable; a coin > reach + 1 leaves a gap',
        'Add up all of the coins and subtract one from that grand total to get the smallest total that is missing',
        'The answer is the smallest coin value that occurs an odd number of times in the list of coins given',
        'Use a bitmask over every subset of coins and read off the position of the first zero bit in the sums',
      ],
      why: 'If every total in 1..reach is possible and the next sorted coin c ≤ reach + 1, adding c makes 1..reach + c possible. If c > reach + 1 then reach + 1 cannot be made by this or any larger coin, so it is the answer.',
    },
    vars: 'n = number of coins',
    time: ['O(n log n)', 'O(n)', 'O(2ⁿ)', 'O(n²)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(2ⁿ)'],
    edgeCases: ['No coin of value 1: the answer is 1', 'The sum overflows int, so use long', 'Repeated coins'],
    approach: 'Sort the coins. Let reach = 0. For each coin c in order: if c > reach + 1 stop; otherwise reach += c. The answer is reach + 1. O(n log n).',
    external: {
      source: CSES(2183),
      statement: '<p>You have <code>n</code> coins with the given positive values. Using any subset of the coins, some totals can be paid exactly and some cannot.</p><p>Return the smallest positive total that cannot be made.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 2·10<sup>5</sup></code>, <code>1 &lt;= coins[i] &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'smallestUnformable', params: [{ name: 'coins', type: 'integer[]' }], returns: 'long' },
      examples: [
        { input: ['[2,9,1,2,7]'], output: '6' },
        { input: ['[1,1,1,1]'], output: '5' },
        { input: ['[2,3]'], output: '1' },
      ],
      reference: `class Solution {
    public long smallestUnformable(int[] coins) {
        int[] c = coins.clone();
        Arrays.sort(c);
        long reach = 0;
        for (int v : c) {
            if (v > reach + 1) break;
            reach += v;
        }
        return reach + 1;
    }
}`,
    },
  },
  {
    slug: 'tasks-and-deadlines', id: EXTERNAL_ID_BASE + 35, title: 'Tasks and Deadlines', difficulty: 'Easy', pattern: 'greedy',
    brute: { text: 'Try every order of the tasks and total the rewards.', time: ['O(n!·n)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'Each task earns deadline − finish time (possibly negative). In what order do you do them?',
      options: [
        'Shortest duration first: the deadlines sum is fixed, and this order minimises the total of the finish times',
        'Earliest deadline first, since finishing the tight tasks sooner always protects their reward the most',
        'Longest duration first, so that the big tasks are out of the way before time starts to run out',
        'Largest deadline first, because those tasks have the most slack and can safely be done at the very end',
      ],
      why: 'The total reward is (sum of deadlines) minus (sum of finish times). Only the second term depends on the order, and putting short tasks first makes every later finish time as small as possible (an exchange argument on adjacent tasks).',
    },
    vars: 'n = number of tasks',
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n!)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['The reward can be negative overall', 'The sum exceeds int, so use long', 'Tasks with equal duration may go in any order'],
    approach: 'Sort the tasks by duration ascending. Keep a running time t. For each task: t += duration; reward += deadline − t. Return the total (as a long). O(n log n).',
    external: {
      source: CSES(1630),
      statement: '<p>You have <code>n</code> tasks, each with a <code>duration</code> and a <code>deadline</code>, to do one after another starting at time 0. For each task you earn <code>deadline − finishTime</code> points (this may be negative if you finish late).</p><p>Choose the order of the tasks to maximise the total, and return it.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 2·10<sup>5</sup></code>, <code>1 &lt;= duration, deadline &lt;= 10<sup>6</sup></code></li></ul><p>Each task is given as <code>[duration, deadline]</code>.</p>',
      signature: { name: 'maxReward', params: [{ name: 'tasks', type: 'integer[][]' }], returns: 'long' },
      examples: [
        { input: ['[[6,10],[8,15],[5,12]]'], output: '2', explain: 'Order 5, 6, 8: 7 + (−1) + (−4).' },
        { input: ['[[1,1]]'], output: '0' },
        { input: ['[[2,5],[2,5]]'], output: '4' },
      ],
      reference: `class Solution {
    public long maxReward(int[][] tasks) {
        int[][] t = tasks.clone();
        Arrays.sort(t, (a, b) -> Integer.compare(a[0], b[0]));
        long time = 0, reward = 0;
        for (int[] task : t) {
            time += task[0];
            reward += task[1] - time;
        }
        return reward;
    }
}`,
    },
  },
  {
    slug: 'connect-ropes-minimum-cost', id: EXTERNAL_ID_BASE + 36, title: 'Connect Ropes With Minimum Cost', difficulty: 'Easy', pattern: 'heap', alsoAccept: ['greedy'],
    brute: { text: 'Try every possible order of joining pairs of ropes.', time: ['O(n!)', 'O(n log n)', 'O(n²)', 'O(n)'] },
    insight: {
      q: 'Joining two ropes costs the sum of their lengths. Which two do you join each time?',
      options: [
        'Join the two shortest ropes, push the result back, and repeat, using a min-heap',
        'Join the two longest ropes first, so that the big ropes are only counted in the cost a single time',
        'Join two adjacent ropes in the order given, since the total cost does not depend on which are chosen',
        'Join any two ropes at all, because the cost is the same whatever order the joins are done in',
      ],
      why: 'A rope joined early is counted again in every later join it takes part in, so the shortest ropes should be joined first (this is the same exchange argument as Huffman coding). A min-heap gives the two smallest in O(log n) each.',
    },
    vars: 'n = number of ropes',
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n!)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['A single rope costs 0', 'Two ropes cost their sum', 'The total can exceed int, so use long'],
    approach: 'Put all lengths in a min-heap. While more than one remains: pop the two smallest a and b, add a + b to the cost, and push a + b back. Return the cost. O(n log n).',
    external: {
      source: GFG('connect-n-ropes-minimum-cost'),
      statement: '<p>You have <code>n</code> ropes with the given lengths. Connecting two ropes costs the sum of their lengths and produces one rope of that length.</p><p>Return the minimum total cost to connect all the ropes into one.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>5</sup></code>, <code>1 &lt;= ropes[i] &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'minCostOfRopes', params: [{ name: 'ropes', type: 'integer[]' }], returns: 'long' },
      examples: [
        { input: ['[4,3,2,6]'], output: '29', explain: '2+3=5, 4+5=9, 6+9=15.' },
        { input: ['[4,2,7,6,9]'], output: '62' },
        { input: ['[5]'], output: '0' },
      ],
      askedAt: ['Amazon', 'Microsoft', 'PayPal', 'Goldman Sachs', 'OYO'],
      reference: `class Solution {
    public long minCostOfRopes(int[] ropes) {
        PriorityQueue<Long> pq = new PriorityQueue<>();
        for (int r : ropes) pq.add((long) r);
        long cost = 0;
        while (pq.size() > 1) {
            long s = pq.poll() + pq.poll();
            cost += s;
            pq.add(s);
        }
        return cost;
    }
}`,
    },
  },
  {
    slug: 'sort-a-k-sorted-array', id: EXTERNAL_ID_BASE + 37, title: 'Sort a K-Sorted Array', difficulty: 'Medium', pattern: 'heap',
    brute: { text: 'Sort the whole array and ignore the fact that it is nearly sorted.', time: ['O(n log n)', 'O(n log k)', 'O(n)', 'O(n·k)'] },
    insight: {
      q: 'Every element is at most k places from its sorted position. How do you exploit that?',
      options: [
        'Keep a min-heap of the next k + 1 elements; the smallest in it is always the next value to be written out',
        'Run selection sort over the array, which does fewer comparisons the closer the input is to sorted order',
        'Use counting sort on the values, since the nearly sorted order tells you the range of values present',
        'Reverse the array and then sort each half separately, because each half is displaced by at most k places',
      ],
      why: 'The element that belongs at position i must be among a[i..i + k], so the minimum of a window of k + 1 elements is correct. A heap of size k + 1 makes each step O(log k), giving O(n log k), better than a full sort when k is small.',
    },
    vars: 'n = length of a, k = the displacement bound',
    time: ['O(n log k)', 'O(n log n)', 'O(n)', 'O(n·k)'],
    space: ['O(k)', 'O(1)', 'O(n)', 'O(log n)'],
    edgeCases: ['k = 0, so the array is already sorted', 'k ≥ n − 1, equivalent to a full sort', 'Duplicate values'],
    approach: 'Push the first min(k + 1, n) elements into a min-heap. For each remaining element: poll the smallest into the output, then push the new element. When the input ends, drain the heap into the output. O(n log k).',
    external: {
      source: GFG('nearly-sorted-algorithm'),
      statement: '<p>In an array <code>a</code> every element is at most <code>k</code> positions away from where it would be in the sorted array. Return the array sorted in ascending order.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 10<sup>5</sup></code>, <code>0 &lt;= k &lt; a.length</code></li></ul>',
      signature: { name: 'sortKSorted', params: [{ name: 'a', type: 'integer[]' }, { name: 'k', type: 'integer' }], returns: 'integer[]' },
      examples: [
        { input: ['[6,5,3,2,8,10,9]', '3'], output: '[2,3,5,6,8,9,10]' },
        { input: ['[1,4,5,2,3,7,8,6,10,9]', '2'], output: '[1,2,3,4,5,6,7,8,9,10]' },
      ],
      reference: `class Solution {
    public int[] sortKSorted(int[] a, int k) {
        int n = a.length, idx = 0;
        int[] out = new int[n];
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int i = 0; i < n; i++) {
            pq.add(a[i]);
            if (pq.size() > k) out[idx++] = pq.poll();
        }
        while (!pq.isEmpty()) out[idx++] = pq.poll();
        return out;
    }
}`,
    },
  },
  {
    slug: 'count-set-bits-up-to-n', id: EXTERNAL_ID_BASE + 38, title: 'Count Set Bits From 1 to N', difficulty: 'Medium', pattern: 'bit-manipulation',
    brute: { text: 'Count the 1-bits of every number from 1 to n.', time: ['O(n log n)', 'O(log n)', 'O(n)', 'O(log² n)'] },
    insight: {
      q: 'You need the total number of 1-bits over every number 1..n. How do you avoid visiting each number?',
      options: [
        'Count per bit position: bit b cycles 2^b zeros then 2^b ones, so add full blocks plus the leftover',
        'Multiply n by the number of bits in n, since each number has about the same count of set bits in it',
        'The total equals the number of set bits of n itself, because the smaller numbers cancel out in pairs',
        'Add n / 2 for every power of two below n, as each power contributes half of the numbers up to n',
      ],
      why: 'For bit b, the pattern of that bit over 0, 1, 2, … repeats every 2^(b+1) numbers with 2^b ones. So the count of ones among 1..n for that bit is (n+1) / 2^(b+1) full blocks times 2^b, plus the ones in the leftover partial block. Summing over the ~log n positions gives O(log n).',
    },
    vars: 'n = the upper bound',
    time: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(log n)', 'O(n)', 'O(log² n)'],
    edgeCases: ['n = 1', 'n just below or at a power of two', 'The total exceeds int for large n, so use long'],
    approach: 'For each bit b while 2^b ≤ n: let block = 2^(b+1). total += ((n + 1) / block) × 2^b + max(0, (n + 1) % block − 2^b). Return the total as a long. O(log n).',
    external: {
      source: GFG('count-total-set-bits-in-all-numbers-from-1-to-n'),
      statement: '<p>Return the total number of <code>1</code> bits in the binary representations of all integers from <code>1</code> to <code>n</code> inclusive.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'countSetBits', params: [{ name: 'n', type: 'integer' }], returns: 'long' },
      examples: [
        { input: ['4'], output: '5', explain: '1, 10, 11, 100 have 1 + 1 + 2 + 1 bits.' },
        { input: ['17'], output: '35' },
        { input: ['1'], output: '1' },
      ],
      reference: `class Solution {
    public long countSetBits(int n) {
        long total = 0, up = (long) n + 1;
        for (int b = 0; (1L << b) <= n; b++) {
            long ones = 1L << b, block = ones << 1;
            total += (up / block) * ones + Math.max(0, up % block - ones);
        }
        return total;
    }
}`,
    },
  },
  {
    slug: 'prefix-counts-with-a-trie', id: EXTERNAL_ID_BASE + 39, title: 'Count Words With a Given Prefix', difficulty: 'Easy', pattern: 'trie',
    brute: { text: 'For each query, test every word with startsWith.', time: ['O(q·n·L)', 'O(n·L + q·L)', 'O(q·L)', 'O(n·q)'] },
    insight: {
      q: 'Many prefix queries are asked about the same list of words. What structure answers them quickly?',
      options: [
        'Build a trie with a pass-through counter on each node; a query walks its prefix and reads the final counter',
        'Use a HashMap from each full word to its count, then add up the entries whose key is long enough to match',
        'Keep a sorted array of the words and scan it linearly from the start for each of the queries given to it',
        'Push the words onto a stack in reverse order and pop them off for each query until one matches the prefix',
      ],
      why: 'Every word that starts with a prefix passes through the trie node that spells the prefix, so a per-node pass-through counter is exactly the answer. Building costs O(total characters) and each query costs O(length of the prefix), independent of the number of words.',
    },
    vars: 'n = number of words, q = number of queries, L = the longest string length',
    time: ['O(n·L + q·L)', 'O(q·n·L)', 'O(n·q)', 'O(n log n)'],
    space: ['O(n·L)', 'O(1)', 'O(q)', 'O(26ⁿ)'],
    edgeCases: ['A prefix equal to a whole word', 'A prefix that does not occur, so 0', 'Duplicate words count separately'],
    approach: 'Insert each word into a trie, incrementing a counter at every node it passes. For each query walk the nodes; if a character is missing the answer is 0, otherwise the answer is the counter at the last node. O(total characters).',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/count-the-number-of-words-with-given-prefix-using-trie/' },
      statement: '<p>Given a list of lowercase <code>words</code> and a list of lowercase <code>queries</code>, return for each query how many of the words <em>start with</em> that query string (counting duplicate words separately).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= words.length, queries.length &lt;= 10<sup>5</sup></code></li><li>The total length of all strings is at most <code>10<sup>6</sup></code></li></ul>',
      signature: { name: 'prefixCounts', params: [{ name: 'words', type: 'string[]' }, { name: 'queries', type: 'string[]' }], returns: 'integer[]' },
      examples: [
        { input: ['["apple","app","apply","bat","ball"]', '["app","ba","c","apple"]'], output: '[3,2,0,1]' },
        { input: ['["a","a"]', '["a"]'], output: '[2]' },
      ],
      reference: `class Solution {
    public int[] prefixCounts(String[] words, String[] queries) {
        int total = 1;
        for (String w : words) total += w.length();
        int[][] next = new int[total][26];
        int[] pass = new int[total];
        int nodes = 1;
        for (String w : words) {
            int cur = 0;
            for (int i = 0; i < w.length(); i++) {
                int c = w.charAt(i) - 'a';
                if (next[cur][c] == 0) next[cur][c] = nodes++;
                cur = next[cur][c];
                pass[cur]++;
            }
        }
        int[] out = new int[queries.length];
        for (int k = 0; k < queries.length; k++) {
            int cur = 0;
            boolean ok = true;
            for (int i = 0; i < queries[k].length() && ok; i++) {
                int c = queries[k].charAt(i) - 'a';
                if (next[cur][c] == 0) ok = false; else cur = next[cur][c];
            }
            out[k] = ok ? pass[cur] : 0;
        }
        return out;
    }
}`,
    },
  },
];
