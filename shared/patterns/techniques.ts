import type { Pattern } from '../types.ts';

export const techniquePatterns: Pattern[] = [
  {
    id: 'intervals',
    name: 'Intervals',
    group: 'Greedy & Backtracking',
    summary: 'Sort by start (or end), then sweep once, merging or counting overlaps.',
    signals: [
      'The input is a list of [start, end] ranges',
      'Merge overlapping ranges, insert a new one, intersect two lists',
      'Fewest removals to eliminate overlaps / most non-overlapping ranges',
      'How many ranges are active at once (rooms, passengers, capacity)',
    ],
    idea:
      "Once intervals are sorted by start, a new interval can only overlap the one you are currently building, so merging is a single sweep. To keep the most non-overlapping intervals, sort by END and greedily keep whichever finishes first. To count how many overlap at any moment, turn each interval into +1/−1 events and sweep them in order (or keep a min-heap of end times).",
    steps: [
      'Sort by start (merge/insert) or by end (maximum non-overlapping set).',
      'Keep a current interval; if the next one overlaps (next.start ≤ cur.end), extend cur.end.',
      'Otherwise emit the current interval and start a new one.',
      'For overlap counts, sweep sorted +1/−1 events and track the running total.',
    ],
    template: {
      title: 'Merge overlapping intervals, and a +1/−1 sweep',
      code: `// Merge overlapping intervals.
int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] in : intervals) {
        if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < in[0]) {
            merged.add(new int[] {in[0], in[1]});           // no overlap: start a new one
        } else {
            int[] last = merged.get(merged.size() - 1);
            last[1] = Math.max(last[1], in[1]);             // overlap: extend
        }
    }
    return merged.toArray(new int[0][]);
}

// Maximum number of simultaneously active intervals, each half-open [start, end).
int maxOverlap(int[][] intervals) {
    TreeMap<Integer, Integer> delta = new TreeMap<>();
    for (int[] in : intervals) {
        delta.merge(in[0], 1, Integer::sum);
        delta.merge(in[1], -1, Integer::sum);
    }
    int running = 0, best = 0;
    for (int d : delta.values()) {
        running += d;
        best = Math.max(best, running);
    }
    return best;
}`,
    },
    complexity: 'O(n log n) to sort, then O(n) to sweep.',
    pitfalls: [
      'Touching endpoints: check whether [1,2] and [2,3] count as overlapping.',
      'Sorting by start when the greedy needs sorting by end (non-overlapping intervals).',
      'Comparators like (a, b) -> a[0] - b[0] overflow on extreme values.',
    ],
    leetcodeTags: ['line-sweep'],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    group: 'Greedy & Backtracking',
    summary: 'Make the locally best choice at each step, when you can argue it never hurts.',
    signals: [
      'Optimize with a simple local rule: farthest reach, cheapest so far',
      '"Can you reach the end?", "minimum jumps", "can the trip complete?"',
      'Taking the earliest-ending / largest / smallest item first is safe',
      'A DP would work, but only the best state ever matters',
    ],
    idea:
      "A greedy algorithm commits to one choice per step and never revisits it. It is correct when an exchange argument holds: any optimal solution can be changed to include the greedy choice without getting worse. Typical shapes: track a best-so-far (min price, max reach), reset when a running quantity goes negative (Kadane, gas station), or process items in a sorted order.",
    steps: [
      'State the local rule (e.g. always extend the farthest reach).',
      'Check it with an exchange argument, or hunt for a small counterexample.',
      'Scan once, keeping only the few variables the rule needs.',
      'If a counterexample breaks the rule, switch to dynamic programming.',
    ],
    template: {
      title: "Kadane's algorithm and farthest reach",
      code: `// Kadane: the best sum ending here either extends the previous run or starts fresh.
int maxSubarray(int[] nums) {
    int best = nums[0], current = 0;
    for (int x : nums) {
        current = Math.max(x, current + x);
        best = Math.max(best, current);
    }
    return best;
}

// Farthest reach: can we jump from index 0 to the last index?
boolean canJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > reach) return false;              // index i is unreachable
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
}`,
    },
    complexity: 'Usually O(n) after an optional O(n log n) sort; O(1) extra space.',
    pitfalls: [
      'Greedy without proof: coins {1, 3, 4} for amount 6 break "largest coin first".',
      'Kadane on an all-negative array: start best at nums[0], not 0.',
      'Resetting at the wrong moment: reset when the running total goes negative.',
    ],
    leetcodeTags: ['greedy'],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    group: 'Greedy & Backtracking',
    summary: 'Build candidates one choice at a time; undo each choice and try the next.',
    signals: [
      'Generate all subsets, permutations, combinations or partitions',
      '"Return all possible…" with small n (up to about 15–20)',
      'Place items under constraints (N-Queens, Sudoku)',
      "Find a path in a grid that can't reuse cells (word search)",
    ],
    idea:
      'Backtracking is DFS over a decision tree. At each level, make one choice, recurse, then undo it so the next option starts from a clean state. Pruning (stopping as soon as a partial candidate cannot succeed) keeps it fast. Sorting and skipping equal neighbors at the same level prevents duplicate results.',
    steps: [
      'Define the state: the partial candidate and your position (index / start).',
      'If the candidate is complete, record a COPY of it.',
      'For each option: skip it if invalid or a duplicate; choose, recurse, un-choose.',
      'Prune as early as possible (sum exceeds target, square already attacked…).',
    ],
    template: {
      title: 'Choose, explore, un-choose (with duplicate skipping)',
      code: `// All subsets without duplicate results (the input may contain duplicates).
List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);                                   // equal values become neighbors
    List<List<Integer>> out = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), out);
    return out;
}

void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
    out.add(new ArrayList<>(path));                      // record a copy
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue;   // skip duplicate branches
        path.add(nums[i]);                               // choose
        backtrack(nums, i + 1, path, out);               // explore
        path.remove(path.size() - 1);                    // un-choose
    }
}`,
    },
    complexity: 'Exponential: O(n · 2ⁿ) for subsets, O(n · n!) for permutations; O(n) recursion depth.',
    pitfalls: [
      'Adding path itself instead of a copy: every result ends up as the same list.',
      'Forgetting to undo the choice (or to unmark a visited cell).',
      'List<Integer>.remove(x): remove(int index) and remove(Object) are different methods.',
    ],
    leetcodeTags: ['backtracking'],
  },
];
