import type { Pattern } from '../types.ts';

export const dpPatterns: Pattern[] = [
  {
    id: 'dp-1d',
    name: 'Dynamic Programming (1-D)',
    group: 'Dynamic Programming',
    summary: 'Define dp[i] from a few earlier states so each subproblem is solved once.',
    signals: [
      'Count the ways / minimum cost / maximum value to reach step i',
      'Each position has a choice that depends on earlier choices (rob or skip)',
      'Can a string or amount be built from pieces? (word break, coin change)',
      'Brute-force recursion recomputes the same subproblems',
    ],
    idea:
      "Express the answer at position i in terms of a few smaller positions (the recurrence). Then memoize the recursion (top-down) or fill an array from the base cases upward (bottom-up). If dp[i] only uses the last one or two values, keep just those variables for O(1) space. The hard part is the state: \"best answer for the first i items\" and \"best answer ending exactly at i\" lead to different recurrences.",
    steps: [
      'Define the state in words: "dp[i] = …".',
      'Write the recurrence by considering the last choice made.',
      'Set the base cases and iterate from smaller i to larger i.',
      'Read the answer (dp[n], or the max over dp) and compress space if possible.',
    ],
    template: {
      title: 'Rolling variables and a bottom-up table',
      code: `// House Robber: dp[i] = best total using the first i houses.
int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;                        // dp[i-2], dp[i-1]
    for (int x : nums) {
        int current = Math.max(prev1, prev2 + x);    // skip this house, or rob it
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}

// Coin Change: dp[a] = fewest coins summing to a (-1 if impossible).
int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] != Integer.MAX_VALUE) {
                dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
        }
    }
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
    },
    complexity: 'O(n · choices) time; O(n) space, often reducible to O(1).',
    pitfalls: [
      'A vague state: write "dp[i] means …" before coding.',
      'Using Integer.MAX_VALUE as infinity and then adding 1 to it (overflow).',
      'Assuming greedy works: coin change is not greedy for arbitrary coin sets.',
    ],
    leetcodeTags: ['dynamic-programming'],
  },
  {
    id: 'dp-2d',
    name: 'Dynamic Programming (2-D)',
    group: 'Dynamic Programming',
    summary: 'The state needs two indices: two strings, a grid, (item, capacity), or a substring [i..j].',
    signals: [
      'Compare two strings: LCS, edit distance, interleaving',
      'Count or optimize paths through a grid',
      'Knapsack: choose items to reach a target sum, or count combinations',
      'Substring problems where dp[i][j] describes s[i..j]',
    ],
    idea:
      "When a subproblem needs two parameters, dp[i][j] stores its answer. For two strings, dp[i][j] is about the prefixes a[0..i) and b[0..j): if the last characters match, move diagonally; otherwise take the best of dropping one. For knapsack, dp[i][c] means \"using the first i items with capacity c\", and iterating capacity in the right direction compresses it to one row. For palindromes, dp[i][j] depends on dp[i+1][j-1], so iterate by increasing length.",
    steps: [
      'Define dp[i][j] in words, including exactly what i and j index.',
      'Write the transition from neighboring cells (left, up, diagonal).',
      'Initialize the first row and column (the empty prefix) carefully.',
      'Iterate so dependencies are computed first; compress to 1-D if only the previous row is used.',
    ],
    template: {
      title: 'Two-string table and a 1-D knapsack row',
      code: `// Longest common subsequence: dp[i][j] = LCS of a[0..i) and b[0..j).
int lcs(String a, String b) {
    int[][] dp = new int[a.length() + 1][b.length() + 1];
    for (int i = 1; i <= a.length(); i++) {
        for (int j = 1; j <= b.length(); j++) {
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                ? dp[i - 1][j - 1] + 1                    // last characters match
                : Math.max(dp[i - 1][j], dp[i][j - 1]);   // drop one of them
        }
    }
    return dp[a.length()][b.length()];
}

// Unbounded knapsack in one row: number of coin COMBINATIONS that make amount.
int countCombinations(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    dp[0] = 1;
    for (int c : coins)                  // coins in the outer loop: combinations, not orderings
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}`,
    },
    complexity: 'O(m · n) time; O(m · n) space, or O(n) with a rolling row.',
    pitfalls: [
      'Off-by-one between string indices and dp indices (dp has an extra empty-prefix row/column).',
      'Loop order changes the meaning: coins outside counts combinations, amount outside counts orderings.',
      '0/1 knapsack in one row must iterate capacity DOWNWARD so each item is used once.',
    ],
    leetcodeTags: ['dynamic-programming'],
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    group: 'Specialized',
    summary: 'A prefix tree: each path from the root spells a prefix shared by every word below it.',
    signals: [
      'Prefix queries: startsWith, autocomplete, shortest root word',
      'Search for many words at once in a grid or a text',
      'Wildcard matching against a dictionary ("." matches any letter)',
      'Many strings share prefixes that you would otherwise re-scan',
    ],
    idea:
      "Store words character by character in a tree whose nodes have up to 26 children. Inserting or looking up a word of length L costs O(L), no matter how many words are stored. Because shared prefixes share nodes, a search can stop the moment a prefix is missing, which is what makes searching a grid for many words at once fast.",
    steps: [
      'Node = children[26] plus an end-of-word flag (or the word itself).',
      'Insert: walk or create a child per character; mark the last node.',
      'Search / startsWith: walk; fail on a missing child; check the flag for whole words.',
      'For wildcards or grids, DFS through the children and prune missing branches.',
    ],
    template: {
      title: 'Array-backed trie',
      code: `class Trie {
    private final Trie[] next = new Trie[26];
    private boolean isWord;

    void insert(String word) {
        Trie node = this;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.next[i] == null) node.next[i] = new Trie();
            node = node.next[i];
        }
        node.isWord = true;
    }

    boolean search(String word) {
        Trie node = walk(word);
        return node != null && node.isWord;
    }

    boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Trie walk(String s) {
        Trie node = this;
        for (char c : s.toCharArray()) {
            node = node.next[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}`,
    },
    complexity: 'O(L) per insert or lookup; O(total characters × alphabet) space.',
    pitfalls: [
      'Forgetting the end-of-word flag: "app" looks present after inserting "apple".',
      'A HashMap per node is slower than a fixed 26-slot array for lowercase words.',
      'In Word Search II, not removing found words causes duplicates and wasted work.',
    ],
    leetcodeTags: ['trie'],
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    group: 'Specialized',
    summary: 'Use binary representations and XOR / AND / shift tricks for O(1)-space answers.',
    signals: [
      'Every element appears twice except one (XOR cancels pairs)',
      'Count set bits, reverse bits, detect powers of two',
      'Add numbers without using + or -',
      'Find the missing number in 0..n with O(1) extra space',
    ],
    idea:
      "XOR is its own inverse (a ^ a = 0 and a ^ 0 = a), so XOR-ing everything cancels pairs and leaves the odd one out. x & (x − 1) clears the lowest set bit, useful for counting bits or checking powers of two, and x & -x isolates it. In Java, use >>> for unsigned right shifts. dp[i] = dp[i >> 1] + (i & 1) builds bit counts incrementally.",
    steps: [
      'Write small examples in binary to spot the invariant.',
      'Pick the operator: XOR to cancel, AND to mask or test, shifts to move bits.',
      "Mind Java's signed 32-bit ints: use >>> for unsigned shifts.",
      'Test edge values: 0, negative numbers, Integer.MIN_VALUE.',
    ],
    template: {
      title: 'XOR cancellation, clearing the lowest bit, carry-based addition',
      code: `// Single number: pairs cancel under XOR.
int singleNumber(int[] nums) {
    int x = 0;
    for (int n : nums) x ^= n;
    return x;
}

// Count set bits: n & (n - 1) clears the lowest set bit (works for negatives too).
int bitCount(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;
        count++;
    }
    return count;
}

// Add without '+': XOR is the sum without carries; (AND << 1) is the carry.
int add(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;
        a ^= b;
        b = carry;
    }
    return a;
}`,
    },
    complexity: 'O(1) per operation on fixed-width ints; O(n) to scan an array.',
    pitfalls: [
      'Using >> instead of >>> on negative numbers: sign extension can loop forever.',
      'Precedence: == binds tighter than &, so write (x & 1) == 1.',
      'Java ints are 32-bit two\'s complement, not unbounded.',
    ],
    leetcodeTags: ['bit-manipulation'],
  },
];
