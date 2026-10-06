import type { ComplexityWalkthrough } from '../types.ts';

/** Complexity walkthroughs for the third pass of classics (extra-c.ts). Same rule as complexity.ts. */
export const MORE_COMPLEXITY: Record<string, ComplexityWalkthrough> = {
  'longest-common-prefix': {
    time: { steps: [['Walk columns of the first string, at most m of them', 'm columns'], ['Each column compares one character in every one of the n strings', 'n comparisons']], so: 'm × n = O(n·m)' },
    space: { steps: [['Only an index and the current character', 'O(1)']], so: 'O(1)' },
  },
  'palindrome-number': {
    time: { steps: [['Each loop step removes one digit from x and adds it to rev', 'one digit per step'], ['Only half the digits are processed before the halves meet', 'about log₁₀ n / 2 steps']], so: 'O(log n)' },
    space: { steps: [['Two integers, x and rev', 'O(1)']], so: 'O(1)' },
  },
  'spiral-matrix': {
    time: { steps: [['Every cell is read exactly once, never twice', 'm × n cells'], ['Each read and boundary update', 'O(1)']], so: 'm × n × O(1) = O(m·n)' },
    space: { steps: [['Four boundary integers and the loop variables (the output list is the answer, not extra space)', 'O(1)']], so: 'O(1)' },
  },
  'merge-sorted-array': {
    time: { steps: [['Each step writes one position of nums1 from the back', 'm + n writes'], ['Each step compares two values and moves one pointer', 'O(1)']], so: '(m + n) × O(1) = O(m + n)' },
    space: { steps: [['Three index variables; the merge happens inside nums1', 'O(1)']], so: 'O(1)' },
  },
  'string-compression': {
    time: { steps: [['The read pointer visits each character once', 'n steps'], ['Writing a count adds at most a few digits per run', 'never more than the run it replaces']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['Read, write and run-end indexes; the result overwrites the input', 'O(1)']], so: 'O(1)' },
  },
  'majority-element': {
    time: { steps: [['One pass over the n values', 'n iterations'], ['Each: one map lookup and update', 'O(1) average']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The count map may hold every distinct value', 'up to n entries']], so: 'O(n)' },
  },
  'rotate-image': {
    time: { steps: [['The transpose touches each cell once', 'about n²/2 swaps'], ['Reversing every row touches each cell once', 'about n²/2 swaps']], so: 'O(n²) + O(n²) = O(n²)' },
    space: { steps: [['Every swap happens inside the matrix', 'O(1)']], so: 'O(1)' },
  },
  'integer-to-roman': {
    time: { steps: [['A fixed table of 13 value-symbol pairs', '13 entries'], ['Each can be used only a bounded number of times, since num ≤ 3999', 'at most 3 + a few appends in total']], so: 'a bounded number of steps → O(1)' },
    space: { steps: [['The two 13-entry tables and the output of at most 15 symbols', 'fixed size']], so: 'O(1)' },
  },
  'roman-to-integer': {
    time: { steps: [['One pass over the n symbols', 'n iterations'], ['Each: one lookup in a 7-entry table and an add or subtract', 'O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['The fixed 7-entry symbol table', 'constant size']], so: 'O(1)' },
  },
  'remove-duplicates-from-sorted-array': {
    time: { steps: [['The read pointer visits each element once', 'n steps'], ['Each: one comparison and at most one write', 'O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['A read index and a write index', 'O(1)']], so: 'O(1)' },
  },
  'next-permutation': {
    time: { steps: [['Scan from the right for the pivot', 'up to n steps'], ['Scan from the right for the swap partner', 'up to n steps'], ['Reverse the suffix', 'up to n/2 swaps']], so: 'O(n) + O(n) + O(n) = O(n)' },
    space: { steps: [['A few indexes; the reversal is in place', 'O(1)']], so: 'O(1)' },
  },
  'minimum-absolute-difference': {
    time: { steps: [['Sort the array', 'O(n log n)'], ['One pass over the adjacent gaps', 'O(n)']], so: 'O(n log n) + O(n) = O(n log n)' },
    space: { steps: [['The result list can hold up to n − 1 pairs', 'up to n entries']], so: 'O(n)' },
  },
  'first-unique-character-in-a-string': {
    time: { steps: [['One pass to count the characters', 'n steps'], ['One pass to find the first with count 1', 'at most n steps']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['A count array of 26 letters, however long s is', 'O(26)']], so: 'a fixed alphabet, so O(1)' },
  },
  'first-missing-positive': {
    time: { steps: [['Each swap puts one value in its final slot for good', 'at most n swaps in total'], ['The outer loop visits every index', 'n steps'], ['The final scan for the first mismatch', 'n steps']], so: 'O(n) + O(n) + O(n) = O(n)' },
    space: { steps: [['The array itself is used as the table', 'O(1) extra']], so: 'O(1)' },
  },
  'rotate-array': {
    time: { steps: [['Reverse the whole array', 'n/2 swaps'], ['Reverse the first k', 'k/2 swaps'], ['Reverse the rest', '(n − k)/2 swaps']], so: 'O(n) + O(k) + O(n − k) = O(n)' },
    space: { steps: [['Only index variables; every swap is in place', 'O(1)']], so: 'O(1)' },
  },
  'reverse-words-in-a-string': {
    time: { steps: [['Reverse the whole string', 'n/2 swaps'], ['Reverse each word and compact the spaces', 'each character moved a constant number of times']], so: 'O(n) + O(n) = O(n)' },
    space: { steps: [['Java strings are immutable, so one char array of the whole text', 'n characters']], so: 'O(n)' },
  },
  'valid-palindrome-ii': {
    time: { steps: [['The main two-pointer walk', 'at most n/2 steps'], ['At the first mismatch, two helper checks of the remaining substring', 'at most n steps each, run once']], so: 'O(n) + 2 × O(n) = O(n)' },
    space: { steps: [['Only pointers', 'O(1)']], so: 'O(1)' },
  },
  'lfu-cache': {
    time: { steps: [['get: map lookup, then move the node to the next frequency list', 'O(1)'], ['put: the same, plus possibly evicting the oldest key of the minimum-frequency list', 'O(1)'], ['Every list is doubly linked, so no step searches', 'no loops']], so: 'a fixed number of map and pointer steps → O(1) per operation' },
    space: { steps: [['At most c keys, each in the key map and in one frequency list', '2c entries']], so: 'O(c)' },
  },
  'powx-n': {
    time: { steps: [['The exponent is halved every iteration', 'log₂ n iterations'], ['Each: one or two multiplications', 'O(1)']], so: 'log n × O(1) = O(log n)' },
    space: { steps: [['An iterative loop with the base, the result and the exponent', 'O(1)']], so: 'O(1)' },
  },
  'making-a-large-island': {
    time: { steps: [['Flood-fill labels every cell once', 'n² cells'], ['Then each 0 cell looks at its four neighbours', 'n² cells × O(1)']], so: 'O(n²) + O(n²) = O(n²)' },
    space: { steps: [['The id grid or size table, plus the flood-fill stack', 'up to n² entries']], so: 'O(n²)' },
  },
  'maximum-profit-in-job-scheduling': {
    time: { steps: [['Sort the n jobs by end time', 'O(n log n)'], ['For each job, binary-search the last compatible job', 'n × O(log n)']], so: 'O(n log n) + O(n log n) = O(n log n)' },
    space: { steps: [['The dp array and the sorted order', 'n entries each']], so: 'O(n)' },
  },
  'restore-ip-addresses': {
    time: { steps: [['Four parts, each with at most three lengths to try', 'at most 3⁴ = 81 combinations'], ['Each checks at most three digits', 'O(1)']], so: 'a bounded search tree → O(1)' },
    space: { steps: [['The recursion is four levels deep and the current path holds four parts', 'fixed size']], so: 'O(1)' },
  },
  'maximal-square': {
    time: { steps: [['One dp cell for every grid cell', 'm × n cells'], ['Each is a min of three neighbours plus one', 'O(1)']], so: 'm × n × O(1) = O(m·n)' },
    space: { steps: [['The full dp table the size of the grid', 'm × n cells']], so: 'O(m·n)' },
  },
  'text-justification': {
    time: { steps: [['Each word is placed on exactly one line', 'n words'], ['Building each line writes W characters, and there are at most n lines', 'up to n × W characters']], so: 'O(n·W)' },
    space: { steps: [['The output lines, each W characters, up to one per word', 'up to n × W characters']], so: 'O(n·W)' },
  },
  'burst-balloons': {
    time: { steps: [['Every interval (i, j)', 'about n²/2 intervals'], ['Each tries every last balloon k inside it', 'up to n choices']], so: 'n² × n = O(n³)' },
    space: { steps: [['The dp table over intervals', 'n × n cells']], so: 'O(n²)' },
  },
  'search-suggestions-system': {
    time: { steps: [['Sort the n products (each comparison may read m characters)', 'O(n·m·log n)'], ['For each of the L prefixes, binary-search the start (log n comparisons of up to m characters)', 'L × O(m·log n)']], so: 'O(n·m·log n) + O(L·m·log n) = O(n·m·log n + L·m·log n)' },
    space: { steps: [['The sorted products', 'n strings of up to m characters']], so: 'O(n·m)' },
  },
  'wildcard-matching': {
    time: { steps: [['One dp cell for every pair of prefixes', '(n + 1) × (m + 1) cells'], ['Each depends on at most three cells', 'O(1)']], so: 'n × m × O(1) = O(n·m)' },
    space: { steps: [['The full dp table', '(n + 1) × (m + 1) cells']], so: 'O(n·m)' },
  },
  'bus-routes': {
    time: { steps: [['Build the stop → routes map by reading every listed stop once', 'S steps'], ['BFS visits each route once and, through it, each stop once', 'at most S + R steps']], so: 'O(S) + O(S + R) = O(S)' },
    space: { steps: [['The stop → routes map', 'S entries'], ['Plus the visited sets and queue', 'at most S + R entries']], so: 'O(S)' },
  },
  'find-k-closest-elements': {
    time: { steps: [['Binary search over the possible window starts', 'log(n − k) steps'], ['Copy out the k chosen elements', 'k steps']], so: 'O(log(n − k)) + O(k) = O(log(n − k) + k)' },
    space: { steps: [['The returned list of k elements', 'k entries']], so: 'O(k)' },
  },
  'best-time-to-buy-and-sell-stock-ii': {
    time: { steps: [['One pass over the prices', 'n − 1 iterations'], ['Each: one comparison and maybe one add', 'O(1)']], so: 'n × O(1) = O(n)' },
    space: { steps: [['A running profit', 'O(1)']], so: 'O(1)' },
  },
  'delete-and-earn': {
    time: { steps: [['Count the points for each of the n values', 'n steps'], ['Run the take/skip recurrence over every value up to M', 'M steps']], so: 'O(n) + O(M) = O(n + M)' },
    space: { steps: [['The points array indexed by value', 'M + 1 entries']], so: 'O(M)' },
  },
};
