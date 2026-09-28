import type { RoutineGroup } from './types.ts';

/**
 * Building blocks you are allowed to reuse and cite by name. Knowing that a sort
 * is n log n and a heap push is log n is how you add up a total complexity
 * without deriving anything from scratch.
 */
export const TOOLBOX: RoutineGroup[] = [
  {
    group: 'Sorting and searching',
    blurb: 'Reach for the library. Name the algorithm only if asked to implement it.',
    routines: [
      {
        name: 'Arrays.sort(int[])',
        time: 'O(n log n) average, O(n²) worst',
        space: 'O(log n)',
        call: 'Arrays.sort(nums);',
        note: 'Dual-pivot quicksort on primitives. The quadratic worst case is real but needs adversarial input.',
      },
      {
        name: 'Arrays.sort(T[]) / Collections.sort',
        time: 'O(n log n) guaranteed',
        space: 'O(n)',
        call: 'list.sort(Comparator.comparingInt(a -> a[0]));',
        note: 'TimSort: stable, and nearly O(n) on partly sorted input. Stability matters when you sort by two keys in two passes.',
      },
      { name: 'Counting sort', time: 'O(n + k)', space: 'O(k)', note: 'Beats n log n when values are small and bounded (k = value range) — ages, letters, colours.' },
      { name: 'Binary search', time: 'O(log n)', space: 'O(1)', call: 'Arrays.binarySearch(a, key);', note: 'Needs sorted input. The negative return is −(insertion point) − 1, which gives you lower-bound free.' },
      { name: 'Binary search on the answer', time: 'O(n log range)', space: 'O(1)', note: 'When the answer is monotonic — "minimum capacity such that it fits" — search the value range, not the array.' },
      { name: 'Quickselect', time: 'O(n) average, O(n²) worst', space: 'O(1)', note: 'Kth largest without a full sort. Say "average O(n)" and mention the heap alternative at O(n log k).' },
    ],
  },
  {
    group: 'Graphs',
    blurb: 'V vertices, E edges. Almost everything here is O(V + E).',
    routines: [
      { name: 'BFS', time: 'O(V + E)', space: 'O(V)', note: 'Shortest path when every edge costs the same. A queue, and a visited set marked at enqueue time, not dequeue.' },
      { name: 'DFS', time: 'O(V + E)', space: 'O(V)', note: 'Reachability, components, cycle detection. Recursion depth is O(V) — mention the stack.' },
      { name: 'Topological sort (Kahn)', time: 'O(V + E)', space: 'O(V)', note: 'Indegree queue. If fewer than V nodes come out, there is a cycle — that is course-schedule.' },
      { name: 'Dijkstra', time: 'O(E log V)', space: 'O(V)', note: 'Non-negative weights only. Min-heap of (dist, node), skip stale entries.' },
      { name: 'Bellman–Ford', time: 'O(V · E)', space: 'O(V)', note: 'Handles negative edges and detects negative cycles. Also the k-stops variant of cheapest-flights.' },
      { name: 'Floyd–Warshall', time: 'O(V³)', space: 'O(V²)', note: 'All pairs. Only viable up to V ≈ 500, which the constraints will tell you.' },
      { name: 'Union-Find', time: 'O(α(n)) per op', space: 'O(n)', note: 'Components and cycles in an undirected graph as edges arrive. Effectively constant.' },
      { name: "Kruskal's MST", time: 'O(E log E)', space: 'O(V)', note: 'Sort edges, union-find to skip cycles. The sort dominates.' },
    ],
  },
  {
    group: 'Structures',
    blurb: 'Per-operation costs, so you can multiply by the loop around them.',
    routines: [
      { name: 'HashMap get/put', time: 'O(1) average', space: 'O(n)', note: 'Worst case O(n) on collisions, O(log n) since Java 8. Say "O(1) average" and move on.' },
      { name: 'TreeMap get/floor/ceiling', time: 'O(log n)', space: 'O(n)', note: 'The price of sorted order and nearest-key queries.' },
      { name: 'Heap push/pop', time: 'O(log n)', space: 'O(n)', note: 'peek is O(1). Building from a collection is O(n), not O(n log n).' },
      { name: 'Heapify a collection', time: 'O(n)', space: 'O(1) extra', note: 'new PriorityQueue<>(list). Worth citing when you are asked to optimise.' },
      { name: 'Trie insert/search', time: 'O(L)', space: 'O(total chars)', note: 'Independent of how many words are stored — that is the whole point.' },
      { name: 'Monotonic stack pass', time: 'O(n)', space: 'O(n)', note: 'Each element is pushed and popped at most once. Say that sentence — it is the amortised argument.' },
      { name: 'Sliding window pass', time: 'O(n)', space: 'O(k)', note: 'Both pointers only move forward, so it is 2n moves, not n².' },
    ],
  },
  {
    group: 'Dynamic programming',
    blurb: 'States × work per state. That product is the complexity — say it that way.',
    routines: [
      { name: '1-D DP', time: 'O(n · transitions)', space: 'O(n), often O(1)', note: 'House robber, climbing stairs. If dp[i] only reads dp[i−1] and dp[i−2], keep two variables.' },
      { name: '2-D DP', time: 'O(m · n)', space: 'O(m · n) → O(n)', note: 'Edit distance, LCS, grid paths. You can usually roll to one row.' },
      { name: 'Knapsack (0/1)', time: 'O(n · W)', space: 'O(W)', note: 'Pseudo-polynomial: W is the capacity, not the input length. Iterate capacity downward for 0/1, upward for unbounded.' },
      { name: 'Interval DP', time: 'O(n³)', space: 'O(n²)', note: 'dp[i][j] over substrings with a split point k. Burst balloons, matrix chain.' },
      { name: 'Bitmask DP', time: 'O(2ⁿ · n)', space: 'O(2ⁿ)', note: 'n ≤ 20. The mask is the set of items already used.' },
      { name: 'Memoised recursion', time: 'same as the table', space: '+O(depth) stack', note: 'Top-down is easier to derive from the brute force; mention you could convert it to bottom-up.' },
    ],
  },
  {
    group: 'Adding it up',
    blurb: 'Turning code into a Big-O out loud.',
    routines: [
      { name: 'Sequential blocks', time: 'O(a) then O(b) → O(a + b)', space: '—', note: 'Keep the larger one. Sorting then one pass is O(n log n + n) = O(n log n).' },
      { name: 'Nested loops', time: 'multiply', space: '—', note: 'Multiply only when the inner bound is independent. If the inner loop is bounded by i, use the sum formula: Θ(n²).' },
      { name: 'Loop calling a log operation', time: 'O(n log n)', space: '—', note: 'n heap pushes, n TreeMap puts, n binary searches — all n log n.' },
      { name: 'Divide and conquer', time: 'T(n) = 2T(n/2) + O(n) → O(n log n)', space: 'O(log n)', note: 'Merge sort. With O(1) merge work instead: T(n) = 2T(n/2) + O(1) → O(n).' },
      { name: 'Halving recursion', time: 'T(n) = T(n/2) + O(1) → O(log n)', space: 'O(log n)', note: 'Binary search written recursively.' },
      { name: 'Output-sensitive', time: 'O(answers × cost each)', space: '—', note: 'Backtracking is bounded by how many results exist: subsets is O(n · 2ⁿ) because you copy each of 2ⁿ paths.' },
      { name: 'Amortised', time: 'total / operations', space: '—', note: 'ArrayList add and monotonic-stack pops are O(1) amortised: expensive steps are rare enough to average out.' },
    ],
  },
];
