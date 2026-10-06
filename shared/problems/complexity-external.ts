import type { ComplexityWalkthrough } from '../types.ts';

/**
 * Complexity walkthroughs for the problems that are not on LeetCode. Same rule as complexity.ts:
 * every derivation ends on the exact answer the approach check grades (tests/complexity.test.ts).
 */
export const EXTERNAL_COMPLEXITY: Record<string, ComplexityWalkthrough> = {
  'count-geometric-triplets': {
    time: { steps: [['One pass over the n values', 'n iterations'], ['Each: two map lookups, one decrement, one insert', 'O(1) average']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The left and right count maps hold each distinct value', 'up to n entries']], so: 'O(n)' },
  },
  'anagrammatic-substring-pairs': {
    time: { steps: [['Every start and end position gives a substring', 'n(n + 1)/2 substrings'], ['Each: bump one of 26 counters and build the 26-slot key', 'O(26) = O(1)']], so: 'n² × O(1) = O(n²)' },
    space: { steps: [['One map entry per distinct substring signature', 'up to n² keys']], so: 'O(n²)' },
  },
  'array-subset-check': {
    time: { steps: [['Count every element of a', 'n steps'], ['Look up and decrement for every element of b', 'm steps'], ['Each map operation', 'O(1) average']], so: 'O(n) + O(m) = O(n + m)' },
    space: { steps: [['The count map of a', 'up to n entries']], so: 'O(n)' },
  },
  'array-manipulation-range-add': {
    time: { steps: [['Each of the q queries changes two cells of the difference array', 'q × O(1)'], ['One running-sum pass over the n cells', 'n steps']], so: 'O(q) + O(n) = O(n + q)' },
    space: { steps: [['The difference array of n + 2 longs', 'n + 2 cells']], so: 'O(n)' },
  },
  'items-in-containers': {
    time: { steps: [['Build the star prefix and the two nearest-bar arrays', 'three passes over n'], ['Each of the q queries is a few array reads', 'q × O(1)']], so: 'O(n) + O(q) = O(n + q)' },
    space: { steps: [['Three arrays of length about n', '3n cells']], so: 'O(n)' },
  },
  'subarrays-with-given-xor': {
    time: { steps: [['One pass over the n numbers', 'n iterations'], ['Each: update the prefix XOR, one map lookup, one map update', 'O(1) average']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The map of prefix XORs seen so far', 'up to n + 1 entries']], so: 'O(n)' },
  },
  'distinct-elements-in-every-window': {
    time: { steps: [['Count the first window', 'k steps'], ['Slide one step at a time', 'n − k steps'], ['Each slide: one add and one remove on the map', 'O(1) average']], so: 'O(k) + (n − k) × O(1) = O(n)' },
    space: { steps: [['The map holds only the current window', 'at most k keys']], so: 'O(k)' },
  },
  'smallest-window-with-all-distinct-characters': {
    time: { steps: [['The right pointer visits each index once', 'n steps'], ['The left pointer also only moves forward', 'at most n steps in total'], ['Each move updates one counter', 'O(1)']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['Count and presence arrays over the fixed 256-character set', 'O(256)']], so: 'a fixed alphabet, so O(1)' },
  },
  'apartments': {
    time: { steps: [['Sort the applicants', 'O(n log n)'], ['Sort the apartments', 'O(m log m)'], ['One merge-style pass with two pointers', 'O(n + m)']], so: 'O(n log n) + O(m log m) + O(n + m) = O(n log n + m log m)' },
    space: { steps: [['Only a few index variables once the sorted copies are in place', 'O(1) extra']], so: 'O(1)' },
  },
  'closest-sum-pair-in-two-sorted-arrays': {
    time: { steps: [['Each step moves either the a pointer forward or the b pointer back', '1 move per step'], ['Together they can move at most n + m times', 'n + m steps']], so: 'O(n + m)' },
    space: { steps: [['Two pointers and the best pair', 'O(1)']], so: 'O(1)' },
  },
  'aggressive-cows': {
    time: { steps: [['Sort the stalls', 'O(n log n)'], ['Binary-search the gap over a range of size D', 'log D rounds'], ['Each round places cows greedily in one pass', 'O(n)']], so: 'O(n log n) + O(n log D) = O(n log n + n log D)' },
    space: { steps: [['Only counters once the sorted copy exists', 'O(1) extra']], so: 'O(1)' },
  },
  'median-of-row-wise-sorted-matrix': {
    time: { steps: [['Binary-search the answer over the value range V', 'log V rounds'], ['Each round: a binary search in every one of the r rows', 'r × log c']], so: 'log V × r × log c = O(r · log c · log V)' },
    space: { steps: [['Only the bounds and a counter', 'O(1)']], so: 'O(1)' },
  },
  'equal-stacks': {
    time: { steps: [['Sum the three stacks', 'n steps'], ['Each loop iteration pops one cylinder, and none is popped twice', 'at most n iterations']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['Three indexes and three sums', 'O(1)']], so: 'O(1)' },
  },
  'nearest-smaller-values': {
    time: { steps: [['Each index is pushed onto the stack once', 'n pushes'], ['And popped at most once', 'at most n pops']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['The stack can hold every index', 'up to n entries'], ['Plus the answer array', 'n cells']], so: 'O(n)' },
  },
  'max-of-minimums-for-every-window-size': {
    time: { steps: [['Left-smaller pass with a stack', 'O(n)'], ['Right-smaller pass with a stack', 'O(n)'], ['Fill ans by window length, then back-fill downwards', 'O(n)']], so: 'O(n) + O(n) + O(n) = O(n)' },
    space: { steps: [['The left, right and answer arrays plus the stack', 'about 4n cells']], so: 'O(n)' },
  },
  'maximum-sum-increasing-subsequence': {
    time: { steps: [['For each of the n positions i', 'n iterations'], ['Look at every earlier j < i', 'up to n each']], so: 'n × n = O(n²)' },
    space: { steps: [['One dp value per position', 'n cells']], so: 'O(n)' },
  },
  'longest-bitonic-subsequence': {
    time: { steps: [['Increasing table: every i against every earlier j', 'O(n²)'], ['Decreasing table: every i against every later j', 'O(n²)'], ['Combine the two at each peak', 'O(n)']], so: 'O(n²) + O(n²) + O(n) = O(n²)' },
    space: { steps: [['Two tables, inc and dec', '2n cells']], so: 'O(n)' },
  },
  'rod-cutting': {
    time: { steps: [['For each rod length from 1 to n', 'n iterations'], ['Try every first-piece length up to it', 'up to n each']], so: 'n × n = O(n²)' },
    space: { steps: [['One best value per length', 'n + 1 cells']], so: 'O(n)' },
  },
  'dice-combinations': {
    time: { steps: [['One entry per sum from 1 to n', 'n iterations'], ['Each adds up to six earlier entries', '6 = O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The ways table', 'n + 1 cells']], so: 'O(n)' },
  },
  'money-sums': {
    time: { steps: [['For each of the n coins', 'n iterations'], ['Update every possible sum up to S', 'S steps each']], so: 'n × S = O(n·S)' },
    space: { steps: [['A boolean table over the sums 0..S', 'S + 1 cells']], so: 'O(S)' },
  },
  'zero-one-knapsack': {
    time: { steps: [['One row per item', 'n rows'], ['One cell per capacity 0..W in each row', 'W + 1 cells'], ['Each cell is a max of two values', 'O(1)']], so: 'n × W × O(1) = O(n·W)' },
    space: { steps: [['The full table, one cell per (item, capacity) pair', '(n + 1) × (W + 1)']], so: 'O(n·W)' },
  },
  'longest-common-substring': {
    time: { steps: [['One cell for every pair of positions', 'n × m cells'], ['Each is one comparison and one add', 'O(1)']], so: 'n × m × O(1) = O(n·m)' },
    space: { steps: [['The (n + 1) × (m + 1) table', 'n × m cells']], so: 'O(n·m)' },
  },
  'rectangle-cutting': {
    time: { steps: [['One cell for every size i × j up to a × b', 'a × b cells'], ['Each tries every vertical and horizontal split', 'about a + b splits']], so: 'a × b × (a + b) = O(a·b·(a + b))' },
    space: { steps: [['The dp table over all sizes', 'a × b cells']], so: 'O(a·b)' },
  },
  'matrix-chain-multiplication': {
    time: { steps: [['Every sub-chain (i, j)', 'about n²/2 sub-chains'], ['Each tries every split point k', 'up to n splits']], so: 'n² × n = O(n³)' },
    space: { steps: [['The dp table over sub-chains', 'n × n cells']], so: 'O(n²)' },
  },
  'gold-mine': {
    time: { steps: [['One cell per (row, column)', 'r × c cells'], ['Each is a max over three predecessors', 'O(1)']], so: 'r × c × O(1) = O(r·c)' },
    space: { steps: [['The dp table the size of the grid', 'r × c cells']], so: 'O(r·c)' },
  },
  'minimum-number-of-platforms': {
    time: { steps: [['Sort the arrivals', 'O(n log n)'], ['Sort the departures', 'O(n log n)'], ['One merge pass over both', 'O(n)']], so: 'O(n log n) + O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['Two pointers and a counter once the copies are sorted in place', 'O(1) extra']], so: 'O(1)' },
  },
  'movie-festival': {
    time: { steps: [['Sort the movies by end time', 'O(n log n)'], ['One pass choosing compatible movies', 'O(n)']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['A last-end value and a counter', 'O(1) extra']], so: 'O(1)' },
  },
  'job-sequencing-with-deadlines': {
    time: { steps: [['Sort the jobs by profit', 'O(n log n)'], ['Place each job in the latest free slot (union-find on slots)', 'about O(1) each, n jobs']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['The sorted order and the slot table', 'n cells each']], so: 'O(n)' },
  },
  'missing-coin-sum': {
    time: { steps: [['Sort the coins', 'O(n log n)'], ['One pass extending reach', 'O(n)']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['One running total once the copy is sorted', 'O(1) extra']], so: 'O(1)' },
  },
  'tasks-and-deadlines': {
    time: { steps: [['Sort the tasks by duration', 'O(n log n)'], ['One pass accumulating time and reward', 'O(n)']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['Two running totals', 'O(1) extra']], so: 'O(1)' },
  },
  'connect-ropes-minimum-cost': {
    time: { steps: [['Build the heap of n ropes', 'O(n)'], ['n − 1 merges', 'n − 1 rounds'], ['Each: two polls and one add on the heap', 'O(log n)']], so: 'O(n) + n × O(log n) = O(n log n)' },
    space: { steps: [['The heap holds every rope', 'up to n entries']], so: 'O(n)' },
  },
  'sort-a-k-sorted-array': {
    time: { steps: [['Each of the n elements is added to and removed from the heap once', 'n elements'], ['The heap never holds more than k + 1 items, so each operation costs', 'O(log k)']], so: 'n × O(log k) = O(n log k)' },
    space: { steps: [['The heap holds at most k + 1 elements (the output array is the result)', 'k + 1 entries']], so: 'O(k)' },
  },
  'count-set-bits-up-to-n': {
    time: { steps: [['One step per bit position up to the highest set bit of n', 'about log n positions'], ['Each: a couple of divisions and a multiplication', 'O(1)']], so: 'log n × O(1) = O(log n)' },
    space: { steps: [['A running total and the loop variable', 'O(1)']], so: 'O(1)' },
  },
  'prefix-counts-with-a-trie': {
    time: { steps: [['Insert every word: one node step per character', 'n × L steps'], ['Answer every query: one node step per character of the prefix', 'q × L steps']], so: 'O(n·L) + O(q·L) = O(n·L + q·L)' },
    space: { steps: [['At most one trie node per character of all the words', 'n × L nodes']], so: 'O(n·L)' },
  },
  'minimum-swaps-to-sort': {
    time: { steps: [['Sort a copy to find each value\'s target position', 'O(n log n)'], ['Walk the cycles, visiting every index once', 'O(n)']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['The sorted copy, the position map and the visited flags', 'about 3n cells']], so: 'O(n)' },
  },
  'message-route': {
    time: { steps: [['BFS visits every computer once', 'n visits'], ['And looks at every connection from both ends', '2m edge checks']], so: 'O(n) + O(m) = O(n + m)' },
    space: { steps: [['The adjacency lists', 'n + 2m entries'], ['Plus the distance array and queue', 'about 2n cells']], so: 'O(n + m)' },
  },
  'building-roads': {
    time: { steps: [['Start n singleton sets', 'O(n)'], ['Union the endpoints of each of m roads', 'm × O(α(n))']], so: 'O(n) + m × O(α(n)) = O(n + m·α(n))' },
    space: { steps: [['The parent array', 'n + 1 cells']], so: 'O(n)' },
  },
  'roads-and-libraries': {
    time: { steps: [['Start n singleton sets', 'O(n)'], ['Union the endpoints of each of m roads', 'm × O(α(n))'], ['One pass summing component costs', 'O(n)']], so: 'O(n) + m × O(α(n)) = O(n + m·α(n))' },
    space: { steps: [['The parent and size arrays', '2n cells']], so: 'O(n)' },
  },
  'game-routes': {
    time: { steps: [['Count in-degrees', 'O(n + m)'], ['Kahn\'s algorithm pops each level once', 'n pops'], ['And relaxes each teleporter once', 'm relaxations']], so: 'O(n + m) + O(n) + O(m) = O(n + m)' },
    space: { steps: [['The adjacency lists', 'n + m entries'], ['Plus the in-degree, paths and queue arrays', 'about 3n cells']], so: 'O(n + m)' },
  },
  'floyd-warshall-all-pairs': {
    time: { steps: [['Three nested loops over k, i and j', 'V × V × V'], ['Each: one comparison and one add', 'O(1)']], so: 'V³ × O(1) = O(V³)' },
    space: { steps: [['A copy of the V × V distance matrix', 'V² cells']], so: 'O(V²)' },
  },
  'detect-negative-cycle': {
    time: { steps: [['Up to V rounds of relaxation', 'V rounds'], ['Each round looks at all E edges', 'E edges']], so: 'V × E = O(V·E)' },
    space: { steps: [['One distance per vertex', 'V cells']], so: 'O(V)' },
  },
  'flight-discount': {
    time: { steps: [['Two states per city, so Dijkstra runs on 2n nodes', '2n states'], ['Each flight is relaxed at most twice per state', 'about 2m relaxations'], ['Each heap operation', 'O(log n)']], so: '(2n + 2m) × O(log n) = O((n + m) log n)' },
    space: { steps: [['The adjacency lists', 'n + m entries'], ['The distance table and heap', 'about 2n + 2m entries']], so: 'O(n + m)' },
  },
  'top-view-of-a-binary-tree': {
    time: { steps: [['BFS visits every node once', 'n visits'], ['Each: one map check and up to two queue pushes', 'O(1) average']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The queue can hold a whole level', 'up to n/2 nodes'], ['Plus the column map', 'up to n entries']], so: 'O(n)' },
  },
  'sum-of-the-longest-root-to-leaf-path': {
    time: { steps: [['Each node is visited once by the DFS', 'n visits'], ['Each combines two child results', 'O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The recursion stack is as deep as the tree is tall', 'h frames']], so: 'O(h)' },
  },
  'children-sum-property': {
    time: { steps: [['Each node is visited once', 'n visits'], ['Each check reads two children', 'O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The recursion stack follows one root-to-leaf path', 'h frames']], so: 'O(h)' },
  },
  'add-one-to-a-linked-list-number': {
    time: { steps: [['One pass to find the last non-9 node', 'n steps'], ['One pass zeroing the nodes after it', 'at most n steps']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['A couple of pointers, plus at most one new head node', 'O(1)']], so: 'O(1)' },
  },
  'rat-in-a-maze': {
    time: { steps: [['Each step has up to 4 directions, and one path can be as long as the number of cells', 'path length up to n²'], ['The search tree can therefore branch about 4 ways at each of n² steps', '4 × 4 × … (n² times)']], so: 'O(4^(n²)) in the worst case' },
    space: { steps: [['The visited grid', 'n × n cells'], ['Plus the recursion depth and the current path', 'up to n² frames']], so: 'O(n²)' },
  },
  'm-coloring-problem': {
    time: { steps: [['Each of the n vertices tries up to m colours', 'm choices per vertex'], ['Conflicting choices are pruned, but in the worst case nearly all are explored', 'm × m × … (n times)']], so: 'O(mⁿ) worst case, pruned in practice' },
    space: { steps: [['The colour array', 'n cells'], ['Plus the recursion stack', 'n frames']], so: 'O(n)' },
  },
};
