import type { ComplexityWalkthrough } from '../types.ts';
import { EXTERNAL_COMPLEXITY } from './complexity-external.ts';

/**
 * How each problem's time and space complexity is actually counted, shown after an
 * attempt. Every derivation ends on the exact answer the approach check grades,
 * which tests/complexity.test.ts enforces, so the walkthrough and the quiz can
 * never disagree. Server-side only, like the rest of the answer key.
 */
const LEETCODE_COMPLEXITY: Record<string, ComplexityWalkthrough> = {
  // ------------------------------------------------------------ hashing
  "contains-duplicate": {
    time: { steps: [["One pass over the n values", "n iterations"], ["Each: one HashSet add, which also answers \"seen before?\"", "O(1) average"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The set can end up holding every value", "up to n entries"]], so: "O(n)" },
  },
  "valid-anagram": {
    time: { steps: [["One pass over both strings together", "n iterations"], ["Each: one increment and one decrement", "O(1)"], ["Then check the 26 counters", "O(26)"]], so: "O(n) + O(26) = O(n)" },
    space: { steps: [["A count array of 26, however long the strings are", "O(26)"]], so: "26 is a constant, so O(1)" },
  },
  "two-sum": {
    time: { steps: [["One pass over the n numbers", "n iterations"], ["Each: one map lookup for the complement, one insert", "O(1) average"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The map may store every number before the pair turns up", "up to n entries"]], so: "O(n)" },
  },
  "isomorphic-strings": {
    time: { steps: [["One pass over the two strings", "n iterations"], ["Each: two array reads and two writes", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two last-seen arrays sized to the character set, not to n", "O(256)"]], so: "fixed character set, so O(1)" },
  },
  "group-anagrams": {
    time: { steps: [["Visit each of the n words", "n iterations"], ["Sort the word's letters to build its key", "O(k log k)"], ["Hash the key and append the word to its group", "O(k)"]], so: "n × (O(k log k) + O(k)) = O(n · k log k)" },
    space: { steps: [["Every word is stored once in some group", "n words × k letters"], ["Plus one key of length k per group", "at most n · k"]], so: "O(n · k)" },
  },
  "valid-sudoku": {
    time: { steps: [["Visit every cell of the n × n board", "n² cells"], ["Each: three set inserts (row, column, box)", "O(1)"]], so: "n² × O(1) = O(n²)" },
    space: { steps: [["n row sets, n column sets and n box sets, each up to n digits", "3 · n · n"]], so: "O(n²)" },
  },
  "longest-consecutive-sequence": {
    time: { steps: [["Build the set", "O(n)"], ["Only a sequence start (x − 1 absent) walks upward", "each number walked at most once"], ["So all the inner walks add up to n steps overall — not n per element", "O(n) total"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["The set of all the numbers", "n entries"]], so: "O(n)" },
  },
  "insert-delete-getrandom-o1": {
    time: { steps: [["insert: map lookup, then list append", "O(1) average"], ["remove: map lookup, swap with the last slot, pop the end", "O(1) average"], ["getRandom: one random index into the list", "O(1)"]], so: "a fixed number of O(1) steps each time → O(1) average per operation" },
    space: { steps: [["The list and the map each hold one entry per value", "2n"]], so: "O(n)" },
  },
  "4sum-ii": {
    time: { steps: [["Every pair (a, b) from A × B goes into the map", "n² inserts at O(1)"], ["Every pair (c, d) from C × D looks up −(c + d)", "n² lookups at O(1)"]], so: "O(n²) + O(n²) = O(n²)" },
    space: { steps: [["The map can hold every distinct a + b", "up to n² keys"]], so: "O(n²)" },
  },
  // ------------------------------------------------------------ two-pointers
  "valid-palindrome": {
    time: { steps: [["i only moves right, j only moves left, and they stop when they meet", "at most n moves in total"], ["Each move: one character check and one comparison", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two indices, and no cleaned-up copy of the string", "O(1)"]], so: "O(1)" },
  },
  "move-zeroes": {
    time: { steps: [["read walks the array once", "n iterations"], ["Each: at most one swap", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two indices; the array changes in place", "O(1)"]], so: "O(1)" },
  },
  "squares-of-a-sorted-array": {
    time: { steps: [["Each step fills one output slot and moves one pointer inward", "n steps"], ["Each step: two squares and a comparison", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Three indices; the output array is the answer, so it doesn't count", "O(1)"]], so: "O(1)" },
  },
  "two-sum-ii-input-array-is-sorted": {
    time: { steps: [["Each step moves lo right or hi left, and they never cross", "at most n − 1 steps"], ["Each step: one sum and one comparison", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two indices", "O(1)"]], so: "O(1)" },
  },
  "3sum": {
    time: { steps: [["Sort", "O(n log n)"], ["Fix each i", "n iterations"], ["For each i, one two-pointer scan of the rest", "O(n)"]], so: "n² outgrows n log n, so O(n log n) + n × O(n) = O(n²)" },
    space: { steps: [["Pointers only; the sort is in place and the output doesn't count", "O(1)"]], so: "O(1)" },
  },
  "container-with-most-water": {
    time: { steps: [["Each step moves one pointer inward, so they meet after n − 1 steps", "n − 1 steps"], ["Each step: one area and one comparison", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two pointers and the best area", "O(1)"]], so: "O(1)" },
  },
  "sort-colors": {
    time: { steps: [["Each step advances mid or pulls high in, so [mid, high] shrinks by one", "at most n steps"], ["Each step: at most one swap", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Three indices; the swaps are in place", "O(1)"]], so: "O(1)" },
  },
  "boats-to-save-people": {
    time: { steps: [["Sort the weights", "O(n log n)"], ["Two pointers: every boat removes at least the heaviest person", "at most n steps"]], so: "O(n log n) + O(n) = O(n log n)" },
    space: { steps: [["Two pointers and a counter; the sort is in place", "O(1)"]], so: "O(1)" },
  },
  "trapping-rain-water": {
    time: { steps: [["Each step moves l right or r left", "n − 1 steps"], ["Each step: one max update and one addition", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Four variables: l, r, leftMax, rightMax", "O(1)"]], so: "O(1)" },
  },
  // ------------------------------------------------------------ sliding-window
  "maximum-average-subarray-i": {
    time: { steps: [["Sum the first k", "O(k)"], ["Slide over the other n − k positions: one add, one subtract", "O(n − k)"]], so: "O(k) + O(n − k) = O(n)" },
    space: { steps: [["The running sum and the best sum", "O(1)"]], so: "O(1)" },
  },
  "longest-substring-without-repeating-characters": {
    time: { steps: [["right visits each character once", "n moves"], ["left only jumps forward, never back", "at most n moves in total"], ["Each move: one lastIndex read and write", "O(1)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["lastIndex holds one entry per distinct character seen", "at most min(n, m) keys"]], so: "O(min(n, m))" },
  },
  "minimum-size-subarray-sum": {
    time: { steps: [["right moves n times", "n moves"], ["left only moves forward, at most n times across the whole run", "n moves in total"], ["Each move: one add or one subtract", "O(1)"]], so: "2n moves × O(1) = O(n)" },
    space: { steps: [["left, sum and best", "O(1)"]], so: "O(1)" },
  },
  "longest-repeating-character-replacement": {
    time: { steps: [["right visits each character once; left only moves forward", "at most 2n moves"], ["Each move: one count update and a comparison", "O(1)"]], so: "2n × O(1) = O(n)" },
    space: { steps: [["counts[26], whatever the length", "O(26)"]], so: "26 is fixed, so O(1)" },
  },
  "permutation-in-string": {
    time: { steps: [["Slide the window across s2", "n positions"], ["Each slide: one letter in, one letter out", "O(1)"], ["Compare the two 26-count arrays", "O(26)"]], so: "n × O(26) = O(n)" },
    space: { steps: [["need[26] and have[26]", "O(26)"]], so: "fixed alphabet, so O(1)" },
  },
  "max-consecutive-ones-iii": {
    time: { steps: [["right visits each index once; left only moves forward", "at most 2n moves"], ["Each move: one comparison and one increment", "O(1)"]], so: "2n × O(1) = O(n)" },
    space: { steps: [["left, zeros and the best length", "O(1)"]], so: "O(1)" },
  },
  "find-all-anagrams-in-a-string": {
    time: { steps: [["Count p", "O(m)"], ["Slide the window over s", "n positions"], ["Each slide: one in, one out, then compare 26 counts", "O(26)"]], so: "m ≤ n, so O(m) + n × O(26) = O(n)" },
    space: { steps: [["need[26] and have[26]; the output list doesn't count", "O(26)"]], so: "fixed alphabet, so O(1)" },
  },
  "minimum-window-substring": {
    time: { steps: [["Count t", "O(n)"], ["right crosses s once; left crosses it at most once too", "at most 2m moves"], ["Each move: one count update", "O(1)"]], so: "O(n) + 2m × O(1) = O(m + n)" },
    space: { steps: [["need and window counts, one entry per distinct character", "k entries"]], so: "O(k)" },
  },
  "sliding-window-maximum": {
    time: { steps: [["Visit each index once", "n iterations"], ["Every index enters the deque once and leaves at most once", "2n deque operations in total"], ["So the inner pops add up to n overall — amortised O(1) each", "O(1) amortised"]], so: "n × O(1) amortised = O(n)" },
    space: { steps: [["The deque only holds indices from the current window", "at most k"]], so: "O(k)" },
  },
  // ------------------------------------------------------------ prefix-sum
  "find-pivot-index": {
    time: { steps: [["One pass to get the total", "O(n)"], ["One pass comparing leftSum with the rest", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["total and leftSum", "O(1)"]], so: "O(1)" },
  },
  "range-sum-query-immutable": {
    time: { steps: [["Build the prefix array once", "O(n)"], ["Each query: one subtraction", "O(1)"], ["q queries", "q × O(1)"]], so: "O(n) + q × O(1) = O(n + q)" },
    space: { steps: [["The prefix array, length n + 1", "n + 1"]], so: "O(n)" },
  },
  "product-of-array-except-self": {
    time: { steps: [["Left-to-right pass filling prefix products", "O(n)"], ["Right-to-left pass multiplying in the suffix", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["One suffix variable; the answer array is the output, so it doesn't count", "O(1)"]], so: "O(1)" },
  },
  "subarray-sum-equals-k": {
    time: { steps: [["One pass over the n numbers", "n iterations"], ["Each: one lookup of sum − k, one merge", "O(1) average"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The map may hold every distinct prefix sum", "up to n + 1 keys"]], so: "O(n)" },
  },
  "contiguous-array": {
    time: { steps: [["One pass", "n iterations"], ["Each: one map lookup, maybe one insert", "O(1) average"]], so: "n × O(1) = O(n)" },
    space: { steps: [["One entry per distinct running sum, which ranges from −n to n", "up to 2n + 1 keys"]], so: "O(n)" },
  },
  "range-sum-query-2d-immutable": {
    time: { steps: [["Build P: one O(1) formula per cell", "m · n cells"], ["Each query: four lookups, three additions or subtractions", "O(1)"], ["q queries", "q × O(1)"]], so: "O(m · n) + q × O(1) = O(m · n + q)" },
    space: { steps: [["P is (m + 1) × (n + 1)", "(m + 1)(n + 1)"]], so: "O(m · n)" },
  },
  "continuous-subarray-sum": {
    time: { steps: [["One pass", "n iterations"], ["Each: a modulo and one map lookup", "O(1) average"]], so: "n × O(1) = O(n)" },
    space: { steps: [["One entry per distinct remainder: there are only k, and never more than n + 1 prefixes", "min(n, k)"]], so: "O(min(n, k))" },
  },
  "subarray-sums-divisible-by-k": {
    time: { steps: [["One pass", "n iterations"], ["Each: a modulo, one read and one increment", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["counts has one slot per remainder", "k slots"]], so: "O(k)" },
  },
  // ------------------------------------------------------------ binary-search
  "binary-search": {
    time: { steps: [["Each step halves the range [lo, hi]", "n → n/2 → n/4 → … → 1"], ["Halving n down to 1 takes log₂ n steps", "log₂ n steps"], ["Each step: one comparison", "O(1)"]], so: "log₂ n × O(1) = O(log n)" },
    space: { steps: [["lo, hi and mid", "O(1)"]], so: "O(1)" },
  },
  "search-insert-position": {
    time: { steps: [["Each step halves [lo, hi)", "log₂ n steps"], ["Each step: one comparison", "O(1)"]], so: "log₂ n × O(1) = O(log n)" },
    space: { steps: [["lo, hi and mid", "O(1)"]], so: "O(1)" },
  },
  "search-a-2d-matrix": {
    time: { steps: [["Read the matrix as one sorted list of m · n values", "m · n candidates"], ["Binary search halves them each step", "log₂(m · n) steps"], ["Each step: k / n and k % n, then one comparison", "O(1)"]], so: "log₂(m · n) × O(1) = O(log(m · n))" },
    space: { steps: [["lo, hi and mid", "O(1)"]], so: "O(1)" },
  },
  "find-first-and-last-position-of-element-in-sorted-array": {
    time: { steps: [["lowerBound(target)", "O(log n)"], ["lowerBound(target + 1)", "O(log n)"]], so: "O(log n) + O(log n) = O(log n)" },
    space: { steps: [["A few indices", "O(1)"]], so: "O(1)" },
  },
  "koko-eating-bananas": {
    time: { steps: [["Binary search the speed over [1, M]", "log₂ M steps"], ["Each step: add up the hours over all n piles", "O(n)"]], so: "log₂ M × O(n) = O(n log M)" },
    space: { steps: [["lo, hi, mid and a running total", "O(1)"]], so: "O(1)" },
  },
  "find-minimum-in-rotated-sorted-array": {
    time: { steps: [["Each step discards half the range by comparing nums[mid] with nums[hi]", "log₂ n steps"], ["Each step: one comparison", "O(1)"]], so: "log₂ n × O(1) = O(log n)" },
    space: { steps: [["lo, hi and mid", "O(1)"]], so: "O(1)" },
  },
  "search-in-rotated-sorted-array": {
    time: { steps: [["Each step works out which half is sorted and throws the other away", "log₂ n steps"], ["Each step: a few comparisons", "O(1)"]], so: "log₂ n × O(1) = O(log n)" },
    space: { steps: [["lo, hi and mid", "O(1)"]], so: "O(1)" },
  },
  "time-based-key-value-store": {
    time: { steps: [["set: append to the key's list — timestamps only increase, so it stays sorted", "O(1)"], ["get: binary-search that key's list of n entries", "O(log n)"]], so: "so O(log n) per get, O(1) per set" },
    space: { steps: [["Every set() keeps one (timestamp, value) pair", "N entries"]], so: "O(N)" },
  },
  "capacity-to-ship-packages-within-d-days": {
    time: { steps: [["Binary search the capacity over [max, S]", "log₂ S steps"], ["Each step: a greedy pass over the n packages", "O(n)"]], so: "log₂ S × O(n) = O(n log S)" },
    space: { steps: [["lo, hi, mid and the day counter", "O(1)"]], so: "O(1)" },
  },
  "median-of-two-sorted-arrays": {
    time: { steps: [["Binary search the cut in the SHORTER array", "log₂ min(m, n) steps"], ["Each step: four boundary values, two comparisons", "O(1)"]], so: "log₂ min(m, n) × O(1) = O(log(min(m, n)))" },
    space: { steps: [["A handful of indices and boundary values", "O(1)"]], so: "O(1)" },
  },
  // ------------------------------------------------------------ stack
  "valid-parentheses": {
    time: { steps: [["One pass over the n characters", "n iterations"], ["Each: one push or one pop and compare", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["All openers could be waiting at once — \"((((((\"", "up to n on the stack"]], so: "O(n)" },
  },
  "min-stack": {
    time: { steps: [["push, pop, top and getMin only ever touch the top pair", "O(1) each"], ["The min is precomputed in each pair, so nothing is searched", "no loop anywhere"]], so: "a fixed amount of work every call → O(1) per operation" },
    space: { steps: [["One (value, minSoFar) pair per element on the stack", "2n values"]], so: "O(n)" },
  },
  "evaluate-reverse-polish-notation": {
    time: { steps: [["One pass over the n tokens", "n iterations"], ["Each: a push, or two pops, an operation and a push", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Operands pile up until an operator arrives", "up to about n/2 on the stack"]], so: "O(n)" },
  },
  "decode-string": {
    time: { steps: [["Every character of the output has to be written", "n characters"], ["Each ']' copies the inner string into the outer one, so a character can be copied once per nesting level", "up to d copies each"]], so: "n characters × d copies = O(n · d)" },
    space: { steps: [["The stack holds one partial string per open bracket, all together no longer than the output", "O(n) characters"]], so: "O(n)" },
  },
  "asteroid-collision": {
    time: { steps: [["Visit each asteroid once", "n iterations"], ["The inner loop pops — but each asteroid is pushed once and popped at most once", "at most n pops in total"]], so: "n pushes + n pops = O(n)" },
    space: { steps: [["Survivors wait on the stack", "up to n"]], so: "O(n)" },
  },
  "simplify-path": {
    time: { steps: [["Split the path on '/'", "O(n)"], ["One push or pop per piece", "O(1) each, at most n pieces"], ["Join the stack back together", "O(n)"]], so: "O(n) + O(n) + O(n) = O(n)" },
    space: { steps: [["The pieces and the stack of directory names", "O(n) characters"]], so: "O(n)" },
  },
  "basic-calculator-ii": {
    time: { steps: [["One pass over the n characters", "n iterations"], ["Each operator: at most one pop and one push", "O(1)"], ["Sum what is left on the stack", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["One pushed term per + or −", "up to n/2 terms"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ monotonic-stack
  "next-greater-element-i": {
    time: { steps: [["Scan nums2 once", "n iterations"], ["Every value is pushed once and popped at most once", "2n stack operations in total"], ["Answer each of the m queries with one map lookup", "m × O(1)"]], so: "O(n) + O(m) = O(m + n)" },
    space: { steps: [["The next-greater map and the stack both cover nums2", "up to n each"]], so: "O(n)" },
  },
  "daily-temperatures": {
    time: { steps: [["Visit each day once", "n iterations"], ["Each index is pushed once and popped at most once", "2n stack operations in total"]], so: "n × O(1) amortised = O(n)" },
    space: { steps: [["A steadily falling run keeps every index waiting", "up to n on the stack"]], so: "O(n)" },
  },
  "online-stock-span": {
    time: { steps: [["One call can pop many entries…", "O(n) worst for a single call"], ["…but every price is pushed once and popped at most once, ever", "n pushes, ≤ n pops across all calls"]], so: "2n operations over n calls → O(1) amortized per call" },
    space: { steps: [["The (price, span) pairs still waiting", "up to n"]], so: "O(n)" },
  },
  "car-fleet": {
    time: { steps: [["Compute each car's arrival time", "O(n)"], ["Sort the cars by position", "O(n log n)"], ["One pass counting fleets", "O(n)"]], so: "the sort dominates: O(n) + O(n log n) + O(n) = O(n log n)" },
    space: { steps: [["An array of (position, time) pairs", "n pairs"]], so: "O(n)" },
  },
  "remove-k-digits": {
    time: { steps: [["Visit each of the n digits once", "n iterations"], ["Each digit is appended once and deleted at most once", "2n operations in total"], ["Trim the leading zeros", "O(n)"]], so: "n × O(1) amortised + O(n) = O(n)" },
    space: { steps: [["The StringBuilder used as a stack", "up to n digits"]], so: "O(n)" },
  },
  "sum-of-subarray-minimums": {
    time: { steps: [["One increasing-stack pass for prevSmaller", "O(n)"], ["One for nextSmaller", "O(n)"], ["One pass adding arr[i] × left × right", "O(n)"]], so: "three linear passes: O(n) + O(n) + O(n) = O(n)" },
    space: { steps: [["prev[], next[] and the stack", "3n"]], so: "O(n)" },
  },
  "next-greater-element-ii": {
    time: { steps: [["Walk the array twice to wrap around", "2n iterations"], ["Each index is pushed once and popped at most once", "at most 2n stack operations"]], so: "2n × O(1) = O(n)" },
    space: { steps: [["The stack of waiting indices", "up to n"]], so: "O(n)" },
  },
  "largest-rectangle-in-histogram": {
    time: { steps: [["Visit each bar once, plus the sentinel", "n + 1 iterations"], ["Each index is pushed once and popped once", "2n stack operations in total"], ["Each pop computes one rectangle", "O(1)"]], so: "(n + 1) + 2n = O(n)" },
    space: { steps: [["An increasing run keeps every index on the stack", "up to n"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ linked-list
  "reverse-linked-list": {
    time: { steps: [["Visit each node once", "n iterations"], ["Each: save next, flip one pointer, step", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Three pointers: prev, curr, next", "O(1)"]], so: "O(1)" },
  },
  "merge-two-sorted-lists": {
    time: { steps: [["Every step attaches one node to the result", "m + n steps"], ["Each step: one comparison and a pointer move", "O(1)"]], so: "(m + n) × O(1) = O(m + n)" },
    space: { steps: [["The existing nodes are relinked, not copied; one dummy and one tail", "O(1)"]], so: "O(1)" },
  },
  "remove-nth-node-from-end-of-list": {
    time: { steps: [["fast runs n steps ahead", "O(n)"], ["Then both walk until fast reaches the end", "at most one pass"]], so: "one pass in total = O(n)" },
    space: { steps: [["Two pointers and a dummy", "O(1)"]], so: "O(1)" },
  },
  "reorder-list": {
    time: { steps: [["Find the middle with slow and fast", "O(n)"], ["Reverse the second half", "O(n)"], ["Weave the two halves together", "O(n)"]], so: "three linear passes = O(n)" },
    space: { steps: [["A few pointers; all the rewiring is in place", "O(1)"]], so: "O(1)" },
  },
  "copy-list-with-random-pointer": {
    time: { steps: [["Pass 1: create one copy per node", "n × O(1)"], ["Pass 2: wire next and random through the map", "n × O(1)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["The map from each original node to its copy", "n entries"]], so: "O(n)" },
  },
  "lru-cache": {
    time: { steps: [["get: one map lookup, then unlink and relink the node at the front", "O(1)"], ["put: the same, plus possibly removing tail.prev from list and map", "O(1)"], ["The doubly linked list means no step ever searches", "no loop anywhere"]], so: "a fixed number of pointer and map steps → O(1) per operation" },
    space: { steps: [["At most c nodes, each in the map and in the list", "2c"]], so: "O(c)" },
  },
  "add-two-numbers": {
    time: { steps: [["One step per digit of the longer number, plus a final carry", "max(m, n) + 1 steps"], ["Each step: one addition, one new node", "O(1)"]], so: "max(m, n) + 1 ≤ m + n + 1, so O(m + n)" },
    space: { steps: [["carry and a few pointers; the new list is the answer, so it doesn't count", "O(1)"]], so: "O(1)" },
  },
  "swap-nodes-in-pairs": {
    time: { steps: [["Each loop swaps one pair and moves two nodes on", "n/2 iterations"], ["Each: three pointer assignments", "O(1)"]], so: "n/2 × O(1) = O(n)" },
    space: { steps: [["A dummy and three pointers", "O(1)"]], so: "O(1)" },
  },
  "reverse-nodes-in-k-group": {
    time: { steps: [["Finding the kth node walks k steps per group", "n steps across all groups"], ["Reversing a group walks the same k nodes again", "n steps in total"]], so: "each node is touched a constant number of times: 2n = O(n)" },
    space: { steps: [["A handful of pointers, iterative — no recursion", "O(1)"]], so: "O(1)" },
  },
  // ------------------------------------------------------------ fast-slow
  "linked-list-cycle": {
    time: { steps: [["No cycle: fast reaches the end in n/2 steps", "O(n)"], ["A cycle: once slow is inside, fast closes the gap by one node per step", "under one lap, at most n steps"]], so: "O(n) either way = O(n)" },
    space: { steps: [["Two pointers instead of a visited set", "O(1)"]], so: "O(1)" },
  },
  "middle-of-the-linked-list": {
    time: { steps: [["fast moves two per step, so it reaches the end after n/2 steps", "n/2 steps"], ["Each step: two pointer moves", "O(1)"]], so: "n/2 × O(1) = O(n)" },
    space: { steps: [["slow and fast", "O(1)"]], so: "O(1)" },
  },
  "happy-number": {
    time: { steps: [["next(x) costs one step per digit", "O(log n) for the first call"], ["Any number with 4+ digits gets smaller, and below 1000 values stay under 243", "a bounded number of further steps"], ["So after the first step, cycle detection costs a constant", "O(1)"]], so: "O(log n) + O(1) = O(log n)" },
    space: { steps: [["slow and fast, instead of a set of seen values", "O(1)"]], so: "O(1)" },
  },
  "palindrome-linked-list": {
    time: { steps: [["Find the middle", "O(n)"], ["Reverse the second half", "O(n)"], ["Compare the two halves", "O(n)"]], so: "three linear passes = O(n)" },
    space: { steps: [["Pointers only; the reversal is in place", "O(1)"]], so: "O(1)" },
  },
  "linked-list-cycle-ii": {
    time: { steps: [["Phase 1: slow and fast meet within one lap of slow entering the cycle", "O(n)"], ["Phase 2: two pointers walk to the entrance at the same speed", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["Three pointers", "O(1)"]], so: "O(1)" },
  },
  "find-the-duplicate-number": {
    time: { steps: [["Treat i → nums[i] as a linked list; phase 1 finds a meeting point", "O(n)"], ["Phase 2 walks two pointers to the cycle entrance, the duplicate", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["Two indices; the array isn't modified", "O(1)"]], so: "O(1)" },
  },
  "circular-array-loop": {
    time: { steps: [["Try each start index", "n starts"], ["A failed path is zeroed out, so no index is walked by more than one failed start", "each index visited O(1) times overall"]], so: "n starts, O(n) total walking = O(n)" },
    space: { steps: [["Two pointers; visited marks are written into the array itself", "O(1)"]], so: "O(1)" },
  },
  // ------------------------------------------------------------ tree-dfs
  "invert-binary-tree": {
    time: { steps: [["Visit every node once", "n calls"], ["Each: swap two child pointers", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The recursion is as deep as the tree", "h frames"]], so: "O(h)" },
  },
  "maximum-depth-of-binary-tree": {
    time: { steps: [["Visit every node once", "n calls"], ["Each: one max of the two children's answers", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The call stack holds one root-to-node path", "h frames"]], so: "O(h)" },
  },
  "diameter-of-binary-tree": {
    time: { steps: [["One post-order visit per node", "n calls"], ["Each: combine l + r into best, return 1 + max(l, r)", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The recursion stack", "h frames"]], so: "O(h)" },
  },
  "subtree-of-another-tree": {
    time: { steps: [["isSubtree tries every node of root as a match", "n candidates"], ["Each try runs sameTree, which can compare all m nodes of subRoot", "O(m)"]], so: "n candidates × O(m) = O(n · m)" },
    space: { steps: [["At depth d in root, sameTree goes at most h − d deeper, so the stack never exceeds root's height", "≤ h frames"]], so: "O(height of root)" },
  },
  "validate-binary-search-tree": {
    time: { steps: [["Visit every node once", "n calls"], ["Each: two comparisons against its (low, high) range", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The recursion stack", "h frames"]], so: "O(h)" },
  },
  "kth-smallest-element-in-a-bst": {
    time: { steps: [["Walk down the left spine to the smallest value", "O(h)"], ["Pop k nodes in order; the extra pushes along the way are bounded by those k steps", "O(k)"]], so: "O(h) + O(k) = O(h + k)" },
    space: { steps: [["The explicit stack holds one path", "h nodes"]], so: "O(h)" },
  },
  "lowest-common-ancestor-of-a-binary-search-tree": {
    time: { steps: [["Each step goes one level down: left, right, or stop", "at most h steps"], ["Each step: two comparisons", "O(1)"]], so: "h × O(1) = O(h)" },
    space: { steps: [["One pointer, iterative — no recursion", "O(1)"]], so: "O(1)" },
  },
  "construct-binary-tree-from-preorder-and-inorder-traversal": {
    time: { steps: [["Map every inorder value to its index", "O(n)"], ["Build one node per call; the map finds the split in O(1) instead of a scan", "n calls × O(1)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["The index map", "n entries"], ["The recursion stack, up to n on a skewed tree", "O(h) ≤ O(n)"]], so: "O(n)" },
  },
  "lowest-common-ancestor-of-a-binary-tree": {
    time: { steps: [["Worst case the search visits every node", "n calls"], ["Each: combine the two children's answers", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The recursion stack", "h frames"]], so: "O(h)" },
  },
  "path-sum-ii": {
    time: { steps: [["Visit every node once", "O(n)"], ["At a matching leaf, copy the current path into the result", "O(h) per copy"], ["There are at most n leaves to copy at", "≤ n copies"]], so: "O(n) + n copies × O(h) = O(n · h)" },
    space: { steps: [["The path and the call stack are both one root-to-leaf path; the output doesn't count", "h"]], so: "O(h)" },
  },
  "binary-tree-maximum-path-sum": {
    time: { steps: [["One post-order visit per node", "n calls"], ["Each: two max(0, …) and one update of best", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The recursion stack", "h frames"]], so: "O(h)" },
  },
  "serialize-and-deserialize-binary-tree": {
    time: { steps: [["serialize: one pre-order visit per node and per null child", "2n + 1 tokens"], ["deserialize: poll each token once", "2n + 1 tokens"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["The string and the token queue both hold 2n + 1 tokens", "O(n)"], ["The recursion stack, up to n on a skewed tree", "O(h) ≤ O(n)"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ tree-bfs
  "average-of-levels-in-binary-tree": {
    time: { steps: [["Every node enters and leaves the queue once", "n polls"], ["Each: add to the sum, offer two children", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue never holds more than one level plus the next", "O(w)"]], so: "O(w)" },
  },
  "minimum-depth-of-binary-tree": {
    time: { steps: [["Worst case BFS reaches the first leaf only at the bottom", "n polls"], ["Each: check for a leaf, offer children", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue holds at most one level", "w nodes"]], so: "O(w)" },
  },
  "binary-tree-level-order-traversal": {
    time: { steps: [["Every node is polled once", "n polls"], ["Each: add its value, offer its children", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue holds one level at a time; the result doesn't count", "w nodes"]], so: "O(w)" },
  },
  "binary-tree-right-side-view": {
    time: { steps: [["BFS polls every node once", "n polls"], ["Each: O(1), plus recording the last node of each level", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue, one level at a time", "w nodes"]], so: "O(w)" },
  },
  "binary-tree-zigzag-level-order-traversal": {
    time: { steps: [["Every node is polled once", "n polls"], ["addFirst or addLast on a LinkedList, both constant", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue holds one level", "w nodes"]], so: "O(w)" },
  },
  "maximum-width-of-binary-tree": {
    time: { steps: [["Every node is polled once with its position", "n polls"], ["Each: arithmetic on the position, offer children", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The queue of (node, position) pairs, one level at a time", "w pairs"]], so: "O(w)" },
  },
  "populating-next-right-pointers-in-each-node": {
    time: { steps: [["Walk each level once through the next pointers already set above it", "n nodes in total"], ["Each: set at most two next pointers", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["head and node — the next pointers replace the queue", "O(1)"]], so: "O(1)" },
  },
  // ------------------------------------------------------------ heap
  "kth-largest-element-in-a-stream": {
    time: { steps: [["add: offer into a heap that never grows past k + 1", "O(log k)"], ["If it overflows, one poll", "O(log k)"], ["peek the root", "O(1)"]], so: "O(log k) + O(log k) + O(1) → O(log k) per add" },
    space: { steps: [["The min-heap keeps only the k largest", "k"]], so: "O(k)" },
  },
  "last-stone-weight": {
    time: { steps: [["Build the max-heap", "O(n log n) with n offers"], ["Each smash: two polls and at most one offer", "O(log n)"], ["At most n − 1 smashes", "n × O(log n)"]], so: "O(n log n) + n × O(log n) = O(n log n)" },
    space: { steps: [["The heap of stones", "n"]], so: "O(n)" },
  },
  "k-closest-points-to-origin": {
    time: { steps: [["Offer each of the n points", "n offers"], ["The max-heap is capped at k + 1, so each offer or poll is", "O(log k)"]], so: "n × O(log k) = O(n log k)" },
    space: { steps: [["The heap of the k closest so far", "k"]], so: "O(k)" },
  },
  "kth-largest-element-in-an-array": {
    time: { steps: [["Offer each of the n numbers", "n offers"], ["The min-heap stays at k, so each operation is", "O(log k)"]], so: "n × O(log k) = O(n log k)" },
    space: { steps: [["The heap of the k largest so far", "k"]], so: "O(k)" },
  },
  "top-k-frequent-elements": {
    time: { steps: [["Count every value", "O(n)"], ["Offer each distinct value into a heap capped at k", "≤ n offers × O(log k)"]], so: "O(n) + O(n log k) = O(n log k)" },
    space: { steps: [["The count map can hold every distinct value", "up to n"], ["The heap", "k"]], so: "O(n)" },
  },
  "task-scheduler": {
    time: { steps: [["Count the T tasks into 26 counters", "O(T)"], ["Find maxCount and the ties among 26 counters", "O(26)"], ["One formula", "O(1)"]], so: "O(T) + O(26) = O(T)" },
    space: { steps: [["26 counters, however many tasks", "O(26)"]], so: "fixed alphabet, so O(1)" },
  },
  "reorganize-string": {
    time: { steps: [["Count the n letters", "O(n)"], ["Place each of the n letters: a poll and a push on a heap of at most 26", "n × O(log 26)"]], so: "log 26 is a constant, so O(n) + n × O(log 26) = O(n)" },
    space: { steps: [["The heap and the counts hold at most 26 letters; the output doesn't count", "O(26)"]], so: "26 is fixed, so O(1)" },
  },
  "merge-k-sorted-lists": {
    time: { steps: [["Every one of the N nodes is polled once and its next offered once", "2N heap operations"], ["The heap holds at most one head per list", "O(log k) each"]], so: "2N × O(log k) = O(N log k)" },
    space: { steps: [["One entry per list in the heap; nodes are relinked, not copied", "k"]], so: "O(k)" },
  },
  "find-median-from-data-stream": {
    time: { steps: [["add: three heap operations to keep the halves balanced", "O(log n)"], ["findMedian: peek one or both roots", "O(1)"]], so: "so O(log n) add, O(1) median" },
    space: { steps: [["The two heaps together hold every number added", "n"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ intervals
  "merge-intervals": {
    time: { steps: [["Sort by start", "O(n log n)"], ["One sweep, constant work per interval", "O(n)"]], so: "the sort dominates: O(n log n) + O(n) = O(n log n)" },
    space: { steps: [["The merged list can be as long as the input", "up to n intervals"]], so: "O(n)" },
  },
  "insert-interval": {
    time: { steps: [["Copy the intervals that end before the new one", "one pointer moving right"], ["Merge the overlapping ones into it", "the same pointer, still moving right"], ["Copy the rest", "the same pointer, to the end"]], so: "one pointer crosses the list once = O(n)" },
    space: { steps: [["The result list", "up to n + 1 intervals"]], so: "O(n)" },
  },
  "non-overlapping-intervals": {
    time: { steps: [["Sort by end", "O(n log n)"], ["One greedy pass keeping whatever doesn't clash", "O(n)"]], so: "O(n log n) + O(n) = O(n log n)" },
    space: { steps: [["prevEnd and a counter; the sort is in place", "O(1)"]], so: "O(1)" },
  },
  "interval-list-intersections": {
    time: { steps: [["Every step advances i or j", "at most m + n steps"], ["Each step: one max, one min, one comparison", "O(1)"]], so: "(m + n) × O(1) = O(m + n)" },
    space: { steps: [["Two indices; the output list doesn't count", "O(1)"]], so: "O(1)" },
  },
  "car-pooling": {
    time: { steps: [["Each of the n trips: two updates to the delta array", "n × O(1)"], ["Sweep the L locations adding up the load", "O(L)"]], so: "O(n) + O(L) = O(n + L)" },
    space: { steps: [["One delta slot per location", "L"]], so: "O(L)" },
  },
  "minimum-number-of-arrows-to-burst-balloons": {
    time: { steps: [["Sort by end", "O(n log n)"], ["One pass, one comparison per balloon", "O(n)"]], so: "O(n log n) + O(n) = O(n log n)" },
    space: { steps: [["The last arrow position and a counter", "O(1)"]], so: "O(1)" },
  },
  "my-calendar-i": {
    time: { steps: [["floorKey(start) in the TreeMap", "O(log n)"], ["ceilingKey(start)", "O(log n)"], ["put(start, end) if it fits", "O(log n)"]], so: "three O(log n) operations → O(log n) per booking" },
    space: { steps: [["Every accepted booking stays in the map", "n entries"]], so: "O(n)" },
  },
  "minimum-interval-to-include-each-query": {
    time: { steps: [["Sort the intervals", "O(n log n)"], ["Sort the query indices by value", "O(q log q)"], ["Each interval is pushed into the heap once and popped at most once", "O(n log n)"], ["Each query peeks the top", "O(1)"]], so: "O(n log n) + O(q log q) + O(n log n) = O(n log n + q log q)" },
    space: { steps: [["The heap of intervals", "up to n"], ["The sorted query indices and the answers", "2q"]], so: "O(n + q)" },
  },
  // ------------------------------------------------------------ greedy
  "best-time-to-buy-and-sell-stock": {
    time: { steps: [["One pass over the prices", "n iterations"], ["Each: one min and one max", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["minPrice and best", "O(1)"]], so: "O(1)" },
  },
  "assign-cookies": {
    time: { steps: [["Sort the children's greed", "O(n log n)"], ["Sort the cookies", "O(m log m)"], ["Two pointers, each only moving forward", "O(n + m)"]], so: "the sorts dominate: O(n log n + m log m)" },
    space: { steps: [["Two indices; both sorts are in place", "O(1)"]], so: "O(1)" },
  },
  "maximum-subarray": {
    time: { steps: [["One pass", "n iterations"], ["Each: extend the run or restart it, then update best", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["cur and best", "O(1)"]], so: "O(1)" },
  },
  "jump-game": {
    time: { steps: [["One pass, stopping early if an index is out of reach", "at most n iterations"], ["Each: one max", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["reach", "O(1)"]], so: "O(1)" },
  },
  "jump-game-ii": {
    time: { steps: [["One pass — a BFS over jump ranges in disguise", "n − 1 iterations"], ["Each: one max, maybe close off the current range", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["jumps, end and farthest", "O(1)"]], so: "O(1)" },
  },
  "gas-station": {
    time: { steps: [["One pass over the stations", "n iterations"], ["Each: two additions and maybe a reset", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["total, tank and start", "O(1)"]], so: "O(1)" },
  },
  "partition-labels": {
    time: { steps: [["Record each letter's last position", "O(n)"], ["Second pass stretching the current part", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["last[26]; the output list doesn't count", "O(26)"]], so: "fixed alphabet, so O(1)" },
  },
  "valid-parenthesis-string": {
    time: { steps: [["One pass", "n iterations"], ["Each: adjust lo and hi, the range of possible open counts", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["lo and hi", "O(1)"]], so: "O(1)" },
  },
  "hand-of-straights": {
    time: { steps: [["Count the n cards into a TreeMap", "n × O(log n)"], ["Every card is decremented exactly once while building groups", "n × O(log n)"]], so: "O(n log n) + O(n log n) = O(n log n)" },
    space: { steps: [["The TreeMap of card counts", "up to n keys"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ backtracking
  "subsets": {
    time: { steps: [["The recursion visits every subset once", "2ⁿ subsets"], ["Recording each one copies the path", "O(n) per copy"]], so: "2ⁿ × O(n) = O(n · 2ⁿ)" },
    space: { steps: [["The path and the call stack are at most n deep; the output doesn't count", "n"]], so: "O(n)" },
  },
  "permutations": {
    time: { steps: [["n choices, then n − 1, then n − 2 …", "n! complete orderings"], ["Recording each copies n elements", "O(n) per copy"]], so: "n! × O(n) = O(n · n!)" },
    space: { steps: [["path, used[] and the call stack, each n deep", "3n"]], so: "O(n)" },
  },
  "combination-sum": {
    time: { steps: [["The deepest path repeats the smallest candidate m, so depth is at most T / m", "T/m levels"], ["Each level can branch into up to n candidates", "n branches"]], so: "n branches per level, T/m levels = O(n^(T/m))" },
    space: { steps: [["The path and the call stack, at most T/m deep", "T/m"]], so: "O(T/m)" },
  },
  "subsets-ii": {
    time: { steps: [["Sort", "O(n log n)"], ["Skipping duplicates can only prune the 2ⁿ subsets", "≤ 2ⁿ recorded"], ["Each record copies the path", "O(n)"]], so: "O(n log n) + 2ⁿ × O(n) = O(n · 2ⁿ)" },
    space: { steps: [["The path and the call stack", "n"]], so: "O(n)" },
  },
  "generate-parentheses": {
    time: { steps: [["The valid strings are the nth Catalan number", "≈ 4ⁿ / (n^1.5 · √π)"], ["Building each one costs its length", "2n characters"]], so: "4ⁿ / n^1.5 strings × O(n) each = O(4ⁿ / √n)" },
    space: { steps: [["The builder and the call stack are 2n deep", "2n"]], so: "O(n)" },
  },
  "word-search": {
    time: { steps: [["Start a search from every cell", "m · n starts"], ["After the first step each cell has at most 3 unvisited directions left", "3 branches"], ["The search is L letters deep", "3^L paths per start"]], so: "m · n starts × 3^L paths = O(m · n · 3^L)" },
    space: { steps: [["The call stack is one path of the word", "L frames"]], so: "O(L)" },
  },
  "palindrome-partitioning": {
    time: { steps: [["Fill the isPal table once", "O(n²)"], ["There are 2ⁿ⁻¹ ways to place cuts between n letters", "≤ 2ⁿ partitions"], ["Copying each one costs O(n)", "O(n)"]], so: "O(n²) + 2ⁿ × O(n) = O(n · 2ⁿ)" },
    space: { steps: [["The isPal table", "n × n"], ["Plus a path and a call stack n deep", "O(n)"]], so: "O(n²)" },
  },
  "letter-combinations-of-a-phone-number": {
    time: { steps: [["Each digit offers at most 4 letters", "≤ 4 branches per level"], ["n digits deep", "≤ 4ⁿ combinations"], ["Building each string costs n", "O(n)"]], so: "4ⁿ × O(n) = O(4ⁿ · n)" },
    space: { steps: [["The builder and the call stack are n deep", "n"]], so: "O(n)" },
  },
  "combination-sum-ii": {
    time: { steps: [["Each candidate is either used once or not", "≤ 2ⁿ combinations"], ["Recording each copies the path", "O(n)"], ["The sort", "O(n log n)"]], so: "2ⁿ × O(n) + O(n log n) = O(n · 2ⁿ)" },
    space: { steps: [["The path and the call stack", "n"]], so: "O(n)" },
  },
  "n-queens": {
    time: { steps: [["Row 0 has n columns, row 1 at most n − 1, row 2 at most n − 2 …", "≤ n! placements"], ["Each check uses the cols / diag / anti arrays", "O(1)"]], so: "n! × O(1) = O(n!)" },
    space: { steps: [["Three boolean arrays, the queen columns and the call stack", "about 6n"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ graph-traversal
  "flood-fill": {
    time: { steps: [["Each cell is recoloured at most once", "≤ m · n cells"], ["Each recoloured cell tries four neighbours", "O(1)"]], so: "m · n × O(1) = O(m · n)" },
    space: { steps: [["The recursion can reach every cell of a snake-shaped region", "up to m · n frames"]], so: "O(m · n)" },
  },
  "number-of-islands": {
    time: { steps: [["The outer scan visits every cell", "m · n"], ["Each land cell is sunk exactly once, checking four neighbours", "O(1) each"]], so: "O(m · n) + O(m · n) = O(m · n)" },
    space: { steps: [["The DFS stack can hold every cell of one big island", "up to m · n"]], so: "O(m · n)" },
  },
  "max-area-of-island": {
    time: { steps: [["The outer scan visits every cell", "m · n"], ["Each land cell is counted once, then zeroed", "O(1) each"]], so: "O(m · n) + O(m · n) = O(m · n)" },
    space: { steps: [["The recursion, up to one frame per cell", "m · n"]], so: "O(m · n)" },
  },
  "clone-graph": {
    time: { steps: [["Each node is cloned once — the map stops a second visit", "V nodes"], ["Each adjacency entry is followed once", "E edges (each counted from both ends)"]], so: "O(V) + O(E) = O(V + E)" },
    space: { steps: [["The original-to-copy map", "V entries"], ["The recursion, up to V deep on a path graph", "O(V)"]], so: "O(V)" },
  },
  "rotting-oranges": {
    time: { steps: [["Scan the grid for rotten and fresh oranges", "O(m · n)"], ["BFS: each orange is enqueued at most once and checks four neighbours", "O(m · n)"]], so: "O(m · n) + O(m · n) = O(m · n)" },
    space: { steps: [["The queue can hold almost every cell", "up to m · n"]], so: "O(m · n)" },
  },
  "01-matrix": {
    time: { steps: [["Seed the queue with every 0", "O(m · n)"], ["Each cell gets its distance once, then checks four neighbours", "O(m · n)"]], so: "O(m · n) + O(m · n) = O(m · n)" },
    space: { steps: [["The queue of cells", "up to m · n"]], so: "O(m · n)" },
  },
  "pacific-atlantic-water-flow": {
    time: { steps: [["Flood uphill from the Pacific borders: each cell visited at most once", "O(m · n)"], ["The same from the Atlantic borders", "O(m · n)"], ["Collect cells marked by both", "O(m · n)"]], so: "three passes over the grid = O(m · n)" },
    space: { steps: [["Two visited grids and the search stack", "3 · m · n"]], so: "O(m · n)" },
  },
  "surrounded-regions": {
    time: { steps: [["Search inward from every border O, marking what it reaches", "O(m · n)"], ["One final sweep flipping cells", "O(m · n)"]], so: "O(m · n) + O(m · n) = O(m · n)" },
    space: { steps: [["The search can reach almost every cell", "up to m · n"]], so: "O(m · n)" },
  },
  "shortest-path-in-binary-matrix": {
    time: { steps: [["Each of the n² cells is enqueued at most once", "n² cells"], ["Each checks 8 neighbours", "O(8)"]], so: "n² × O(8) = O(n²)" },
    space: { steps: [["The queue and the visited marks", "up to n² cells"]], so: "O(n²)" },
  },
  "word-ladder": {
    time: { steps: [["BFS dequeues each word at most once", "N words"], ["For each word, try 26 letters at each of L positions", "26 · L candidates"], ["Building and hashing a candidate costs its length", "O(L)"]], so: "N × 26L × O(L) = O(N · L²)" },
    space: { steps: [["The word set and the queue hold up to N words of length L", "N · L characters"]], so: "O(N · L)" },
  },
  // ------------------------------------------------------------ topological-sort
  "course-schedule": {
    time: { steps: [["Build the graph and the in-degrees", "O(V + E)"], ["Kahn: each course is dequeued once, each edge decremented once", "O(V + E)"]], so: "O(V + E) + O(V + E) = O(V + E)" },
    space: { steps: [["Adjacency lists for E edges, plus in-degrees and the queue", "V + E"]], so: "O(V + E)" },
  },
  "course-schedule-ii": {
    time: { steps: [["Build the graph and the in-degrees", "O(V + E)"], ["Kahn's pass, appending each dequeued course", "O(V + E)"]], so: "O(V + E) + O(V + E) = O(V + E)" },
    space: { steps: [["Adjacency lists, in-degrees and the queue", "V + E"]], so: "O(V + E)" },
  },
  "find-eventual-safe-states": {
    time: { steps: [["Build the reversed graph", "O(V + E)"], ["Each node is queued once and each reversed edge processed once", "O(V + E)"], ["List the safe nodes in order", "O(V)"]], so: "O(V + E) + O(V + E) + O(V) = O(V + E)" },
    space: { steps: [["The reversed graph and the out-degrees", "V + E"]], so: "O(V + E)" },
  },
  "minimum-height-trees": {
    time: { steps: [["A tree has n − 1 edges; building adjacency is", "O(n)"], ["Peeling leaf layers removes each node and each edge once", "O(n)"]], so: "O(n) + O(n) = O(n)" },
    space: { steps: [["Adjacency lists (n − 1 edges), degrees and the queue", "about 3n"]], so: "O(n)" },
  },
  "course-schedule-iv": {
    time: { steps: [["Kahn's order", "O(V + E)"], ["For each edge u → v, OR u's reachable set into v's", "E × O(V)"], ["Each of the q queries is one table lookup", "q × O(1)"]], so: "O(V + E) + E × O(V) + q = O(V · E + q)" },
    space: { steps: [["The reachability table", "V × V booleans"]], so: "O(V²)" },
  },
  "find-all-possible-recipes-from-given-supplies": {
    time: { steps: [["Build in-degrees and the ingredient → recipe lists", "O(V + E)"], ["Each item is queued once and each link decremented once", "O(V + E)"]], so: "O(V + E) + O(V + E) = O(V + E)" },
    space: { steps: [["The dependency lists, the in-degrees and the queue", "V + E"]], so: "O(V + E)" },
  },
  "parallel-courses-iii": {
    time: { steps: [["Build adjacency and in-degrees", "O(n + E)"], ["Each course is dequeued once and each relation relaxed once", "O(n + E)"]], so: "O(n + E) + O(n + E) = O(n + E)" },
    space: { steps: [["Adjacency lists, in-degrees, start times and the queue", "n + E"]], so: "O(n + E)" },
  },
  // ------------------------------------------------------------ union-find
  "number-of-provinces": {
    time: { steps: [["Scan the n × n matrix", "n² cells"], ["Each 1 costs one union", "O(α(n))"]], so: "n² × O(α(n)) = O(n² · α(n))" },
    space: { steps: [["The parent and rank arrays", "2n"]], so: "O(n)" },
  },
  "redundant-connection": {
    time: { steps: [["One find/union per edge, and a tree plus one edge has n edges", "n operations"], ["Each is effectively constant with path compression and ranks", "O(α(n))"]], so: "n × O(α(n)) = O(n · α(n))" },
    space: { steps: [["parent and rank over n + 1 nodes", "2(n + 1)"]], so: "O(n)" },
  },
  "accounts-merge": {
    time: { steps: [["Give every email an id and union within each account", "N × O(α(N)) operations on length-L keys"], ["Group the emails by root", "O(N · L)"], ["Sort each group; comparing two emails costs up to L", "O(N log N) comparisons × O(L)"]], so: "the sort dominates: O(N log N · L)" },
    space: { steps: [["The id and owner maps hold every email", "N emails × L characters"]], so: "O(N · L)" },
  },
  "number-of-operations-to-make-network-connected": {
    time: { steps: [["Initialise the union-find", "O(n)"], ["One union per cable", "E × O(α(n))"], ["Count the components", "O(n)"]], so: "O(n) + E × O(α(n)) = O(n + E · α(n))" },
    space: { steps: [["parent and rank arrays", "2n"]], so: "O(n)" },
  },
  "min-cost-to-connect-all-points": {
    time: { steps: [["Build every pair of points", "n² edges"], ["Sort them — log(n²) is just 2 log n", "O(n² log n)"], ["Union-find over the sorted edges", "n² × O(α(n))"]], so: "the sort dominates: O(n² log n)" },
    space: { steps: [["The full edge list", "about n²/2 edges"]], so: "O(n²)" },
  },
  "satisfiability-of-equality-equations": {
    time: { steps: [["First pass: a union for each ==", "n × O(α(26))"], ["Second pass: a find for each !=", "n × O(α(26))"]], so: "2n × O(α(26)) = O(n · α(26))" },
    space: { steps: [["parent[26], however many equations there are", "O(26)"]], so: "26 variables, so O(1)" },
  },
  "most-stones-removed-with-same-row-or-column": {
    time: { steps: [["Two unions per stone: its row and its column", "2n × O(α(n))"], ["Count the distinct roots", "O(n)"]], so: "O(n · α(n)) + O(n) = O(n · α(n))" },
    space: { steps: [["A parent map over the rows and columns actually used", "at most 2n keys"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ shortest-path
  "network-delay-time": {
    time: { steps: [["Each edge can trigger at most one push", "≤ E pushes and pops"], ["Each heap operation", "O(log E), and log E ≤ 2 log V"]], so: "E × O(log V) = O(E log V)" },
    space: { steps: [["Adjacency lists", "V + E"], ["The heap, up to one entry per edge", "O(E)"]], so: "O(V + E)" },
  },
  "path-with-maximum-probability": {
    time: { steps: [["Each edge can push at most once", "≤ E heap entries"], ["Each push or pop", "O(log V)"]], so: "E × O(log V) = O(E log V)" },
    space: { steps: [["Adjacency lists, the prob array and the heap", "V + E"]], so: "O(V + E)" },
  },
  "path-with-minimum-effort": {
    time: { steps: [["The grid is a graph of m · n cells with about 4 edges each", "V = m · n, E ≈ 4 · m · n"], ["Dijkstra costs E log V", "O(m · n · log(m · n))"]], so: "4 · m · n × log(m · n) = O(m · n · log(m · n))" },
    space: { steps: [["The effort table and the heap", "m · n each"]], so: "O(m · n)" },
  },
  "cheapest-flights-within-k-stops": {
    time: { steps: [["k + 1 rounds of relaxation", "k + 1 rounds"], ["Each round relaxes every flight", "O(E)"]], so: "(k + 1) × O(E) = O(k · E)" },
    space: { steps: [["prices and its per-round copy", "2n"]], so: "O(n)" },
  },
  "number-of-ways-to-arrive-at-destination": {
    time: { steps: [["Dijkstra: each edge relaxed once, at most E heap operations", "O(E log V)"], ["Counting ways adds one addition per relaxation", "O(1) each"]], so: "O(E log V) + O(E) = O(E log V)" },
    space: { steps: [["Adjacency lists, dist, ways and the heap", "V + E"]], so: "O(V + E)" },
  },
  "swim-in-rising-water": {
    time: { steps: [["Each of the n² cells is pushed once", "n² pushes and pops"], ["Each heap operation — log(n²) is 2 log n", "O(log n)"]], so: "n² × O(log n) = O(n² log n)" },
    space: { steps: [["The heap and the visited grid", "n² each"]], so: "O(n²)" },
  },
  "minimum-cost-to-make-at-least-one-valid-path-in-a-grid": {
    time: { steps: [["Edges cost only 0 or 1, so a deque replaces the heap: 0-cost to the front, 1-cost to the back", "no log factor"], ["Each cell is settled once and checks 4 directions", "m · n × O(4)"]], so: "m · n × O(1) = O(m · n)" },
    space: { steps: [["The distance grid and the deque", "m · n each"]], so: "O(m · n)" },
  },
  // ------------------------------------------------------------ dp-1d
  "climbing-stairs": {
    time: { steps: [["One step of the recurrence per stair", "n − 1 iterations"], ["Each: one addition and a shift of two variables", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Only the last two answers are ever read, so keep two variables", "a and b"]], so: "O(1)" },
  },
  "min-cost-climbing-stairs": {
    time: { steps: [["One recurrence step per stair", "n iterations"], ["Each: one min of two sums", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Two rolling variables instead of a dp array", "2"]], so: "O(1)" },
  },
  "house-robber": {
    time: { steps: [["One pass over the houses", "n iterations"], ["Each: max(skip, rob)", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["dp[i] only reads dp[i − 1] and dp[i − 2]: two variables", "2"]], so: "O(1)" },
  },
  "house-robber-ii": {
    time: { steps: [["Rob houses 0..n − 2", "O(n)"], ["Rob houses 1..n − 1", "O(n)"]], so: "two linear passes: O(n) + O(n) = O(n)" },
    space: { steps: [["Two rolling variables per pass", "O(1)"]], so: "O(1)" },
  },
  "decode-ways": {
    time: { steps: [["One recurrence step per character", "n iterations"], ["Each: check a one-digit and a two-digit code", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Only the last two dp values are needed", "2"]], so: "O(1)" },
  },
  "coin-change": {
    time: { steps: [["Fill dp for every amount 1..A", "A cells"], ["Each cell tries every coin", "n coins"]], so: "A cells × n coins = O(n · A)" },
    space: { steps: [["The dp array, one slot per amount", "A + 1"]], so: "O(A)" },
  },
  "maximum-product-subarray": {
    time: { steps: [["One pass", "n iterations"], ["Each: new max and min from three candidates", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["curMax, curMin and best — the min is kept because a negative can flip it to the max", "3"]], so: "O(1)" },
  },
  "word-break": {
    time: { steps: [["Each end position i", "n"], ["Each start j within L of it", "L"], ["Each substring s[j..i) is built and hashed", "O(L)"]], so: "n × L × O(L) = O(n · L²)" },
    space: { steps: [["The dp array", "n + 1"], ["The word set", "W words × L letters"]], so: "O(n + W · L)" },
  },
  "longest-increasing-subsequence": {
    time: { steps: [["Visit each number once", "n iterations"], ["Binary-search tails for where it goes", "O(log n)"]], so: "n × O(log n) = O(n log n)" },
    space: { steps: [["tails can grow to the whole array", "up to n"]], so: "O(n)" },
  },
  "partition-equal-subset-sum": {
    time: { steps: [["For each of the n numbers", "n"], ["Update every reachable sum up to S / 2, walking downward", "S/2 targets"]], so: "n × S/2 = O(n · S)" },
    space: { steps: [["One boolean per possible sum up to S / 2", "S/2 + 1"]], so: "O(S)" },
  },
  "perfect-squares": {
    time: { steps: [["Fill dp for every value 1..n", "n cells"], ["Each tries every square up to it", "≤ √n squares"]], so: "n × √n = O(n √n)" },
    space: { steps: [["The dp array", "n + 1"]], so: "O(n)" },
  },
  // ------------------------------------------------------------ dp-2d
  "unique-paths": {
    time: { steps: [["Every cell of the m × n grid", "m · n cells"], ["Each: one addition (above + left)", "O(1)"]], so: "m · n × O(1) = O(m · n)" },
    space: { steps: [["Each row only reads the row above, so one rolling row", "n"]], so: "O(n)" },
  },
  "longest-common-subsequence": {
    time: { steps: [["Every cell of the (m + 1) × (n + 1) table", "(m + 1)(n + 1) cells"], ["Each: one comparison and a max or +1", "O(1)"]], so: "(m + 1)(n + 1) × O(1) = O(m · n)" },
    space: { steps: [["The full table", "(m + 1)(n + 1)"]], so: "O(m · n)" },
  },
  "longest-palindromic-substring": {
    time: { steps: [["2n − 1 centres: every character and every gap", "2n − 1"], ["Each expands outward at most n / 2 steps", "O(n)"]], so: "(2n − 1) × O(n) = O(n²)" },
    space: { steps: [["The best range found so far", "two indices"]], so: "O(1)" },
  },
  "palindromic-substrings": {
    time: { steps: [["2n − 1 centres", "2n − 1"], ["Each expands while the ends match, up to n / 2 steps", "O(n)"]], so: "(2n − 1) × O(n) = O(n²)" },
    space: { steps: [["A counter and two indices", "O(1)"]], so: "O(1)" },
  },
  "coin-change-ii": {
    time: { steps: [["For each of the n coins", "n"], ["Update every amount from c to A", "≤ A"]], so: "n × A = O(n · A)" },
    space: { steps: [["One way-count per amount", "A + 1"]], so: "O(A)" },
  },
  "target-sum": {
    time: { steps: [["Turn it into a subset-sum to (S + target) / 2", "O(n)"], ["For each number, update every sum up to that goal", "n × ≤ S"]], so: "O(n) + n × S = O(n · S)" },
    space: { steps: [["One count per sum up to the goal", "≤ S + 1"]], so: "O(S)" },
  },
  "best-time-to-buy-and-sell-stock-with-cooldown": {
    time: { steps: [["One pass over the days", "n iterations"], ["Each: three state updates (hold, sold, rest)", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["Three states, each only needing yesterday's value", "3"]], so: "O(1)" },
  },
  "edit-distance": {
    time: { steps: [["Every cell of the (m + 1) × (n + 1) table", "(m + 1)(n + 1) cells"], ["Each: a comparison and a min of three neighbours", "O(1)"]], so: "(m + 1)(n + 1) × O(1) = O(m · n)" },
    space: { steps: [["The full table", "(m + 1)(n + 1)"]], so: "O(m · n)" },
  },
  "minimum-path-sum": {
    time: { steps: [["Every cell once", "m · n cells"], ["Each: one min and one addition", "O(1)"]], so: "m · n × O(1) = O(m · n)" },
    space: { steps: [["A single rolling row", "n"]], so: "O(n)" },
  },
  "interleaving-string": {
    time: { steps: [["Every (i, j) pair of prefix lengths", "(m + 1)(n + 1)"], ["Each: two character checks", "O(1)"]], so: "(m + 1)(n + 1) × O(1) = O(m · n)" },
    space: { steps: [["One rolling row over s2", "n + 1"]], so: "O(n)" },
  },
  "longest-increasing-path-in-a-matrix": {
    time: { steps: [["Memoised: each cell's answer is computed once", "m · n cells"], ["Each computation checks four neighbours", "O(4)"]], so: "m · n × O(4) = O(m · n)" },
    space: { steps: [["The memo table", "m · n"], ["The recursion, up to one strictly increasing path through every cell", "O(m · n)"]], so: "O(m · n)" },
  },
  // ------------------------------------------------------------ trie
  "implement-trie-prefix-tree": {
    time: { steps: [["insert, search and startsWith each walk one node per character", "L steps"], ["Each step indexes children[c − 'a'] directly", "O(1)"]], so: "L × O(1) → O(L) per operation" },
    space: { steps: [["Worst case every inserted character makes a new node", "N nodes"], ["Each node carries a 26-slot child array", "26 slots"]], so: "O(26 · N)" },
  },
  "design-add-and-search-words-data-structure": {
    time: { steps: [["An ordinary letter follows one child", "1 branch"], ["A '.' tries every child", "up to 26 branches"], ["With d dots, and each path L long", "26^d paths × L steps"]], so: "so O(26^d · L) per search" },
    space: { steps: [["The trie: at most one node per inserted character", "N nodes"]], so: "O(N)" },
  },
  "replace-words": {
    time: { steps: [["Insert every root", "O(R)"], ["Each sentence word walks the trie at most its own length", "O(N) across the sentence"]], so: "O(R) + O(N) = O(N + R)" },
    space: { steps: [["The trie over the roots", "≤ R nodes"]], so: "O(R)" },
  },
  "longest-word-in-dictionary": {
    time: { steps: [["Insert every word", "O(N)"], ["DFS visits each trie node at most once", "O(N)"]], so: "O(N) + O(N) = O(N)" },
    space: { steps: [["At most one trie node per character", "N nodes"]], so: "O(N)" },
  },
  "map-sum-pairs": {
    time: { steps: [["insert: add the delta to each node on the key's path", "L steps"], ["sum: walk to the prefix node and read its total", "L steps"]], so: "so O(L) per insert and per sum" },
    space: { steps: [["Up to N keys, each adding up to L nodes", "N · L nodes"]], so: "O(N · L)" },
  },
  "word-search-ii": {
    time: { steps: [["Start a search from every cell", "m · n starts"], ["The trie searches every word at once; each path branches into at most 3 new cells", "3^L paths, L deep"], ["Pruning finished words only makes it faster", "≤ the bound"]], so: "m · n × 3^L = O(m · n · 3^L)" },
    space: { steps: [["The trie of all the words' letters", "K nodes"], ["The recursion, one word deep", "L ≤ K"]], so: "O(K)" },
  },
  // ------------------------------------------------------------ bit-manipulation
  "single-number": {
    time: { steps: [["One XOR per number", "n iterations"], ["Each XOR", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["One accumulator — pairs cancel, so nothing needs storing", "1"]], so: "O(1)" },
  },
  "number-of-1-bits": {
    time: { steps: [["n &= n − 1 clears the lowest set bit", "one bit per step"], ["So the loop runs once per set bit, not once per bit", "k iterations"]], so: "k × O(1) = O(k)" },
    space: { steps: [["A counter", "1"]], so: "O(1)" },
  },
  "counting-bits": {
    time: { steps: [["One formula per i from 1 to n", "n iterations"], ["bits[i >> 1] + (i & 1) reuses an answer already computed", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["The bits array is the answer, so it doesn't count", "no extra space"]], so: "O(1)" },
  },
  "missing-number": {
    time: { steps: [["One pass XOR-ing each index and each value", "n iterations"], ["Two XORs each", "O(1)"]], so: "n × O(1) = O(n)" },
    space: { steps: [["One accumulator", "1"]], so: "O(1)" },
  },
  "reverse-bits": {
    time: { steps: [["Exactly 32 iterations, one per bit, whatever the input", "32 steps"], ["Each: a shift, an OR and an unsigned shift", "O(1)"]], so: "32 is fixed, so O(1) (32 steps)" },
    space: { steps: [["The result and the input", "2 ints"]], so: "O(1)" },
  },
  "sum-of-two-integers": {
    time: { steps: [["Each loop moves the carry one bit to the left", "carry << 1"], ["A 32-bit int runs out of bits after 32 shifts", "≤ 32 iterations"]], so: "bounded by the word size, so O(1) (at most 32 iterations)" },
    space: { steps: [["a, b and carry", "3 ints"]], so: "O(1)" },
  },
  "single-number-ii": {
    time: { steps: [["For each of the 32 bit positions", "32"], ["Count how many of the n numbers set it", "O(n)"]], so: "32 × O(n) = O(n)" },
    space: { steps: [["A counter and the answer — or just ones and twos with the bit trick", "O(1)"]], so: "O(1)" },
  },
};

export const COMPLEXITY: Record<string, ComplexityWalkthrough> = { ...LEETCODE_COMPLEXITY, ...EXTERNAL_COMPLEXITY };
