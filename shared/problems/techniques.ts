import type { CuratedProblem } from '../types.ts';

export const intervalProblems: CuratedProblem[] = [
  {
    slug: 'merge-intervals', id: 56, title: 'Merge Intervals', difficulty: 'Medium', pattern: 'intervals',
    insight: {
      q: 'After sorting by start, when do two intervals merge?',
      options: [
        'When next start ≤ current end; extend end to the max of both ends',
        'When the next start is smaller than the current start',
        'Only when one interval completely contains the other one',
        'When the next end ≤ the current end; otherwise a new interval starts',
      ],
      why: 'Sorted by start, the next interval can only overlap the interval being built, and it does exactly when it starts at or before the current end. Taking the max end handles intervals nested inside the current one.',
    },
    vars: 'n = number of intervals; count the merged list you build as extra space',
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Touching intervals ([1,4] and [4,5] merge)', 'An interval nested inside another', 'A single interval'],
    approach:
      'Sort by start. For each interval: if the result is empty or its last end < start, append a copy; otherwise set last end = max(last end, end). Return the result.',
  },
  {
    slug: 'insert-interval', id: 57, title: 'Insert Interval', difficulty: 'Medium', pattern: 'intervals',
    insight: {
      q: 'The intervals are sorted and disjoint. How do you insert newInterval in one pass?',
      options: [
        'Copy those ending before it, absorb overlapping ones, copy the rest',
        'Append it, sort everything again, then run a full merge',
        'Binary-search its position and insert it there without merging',
        'Replace the first interval that overlaps it with the new interval',
      ],
      why: 'Three phases: intervals entirely to the left (end < new.start) are copied; overlapping ones (start ≤ new.end) are absorbed with min start / max end; the rest are copied. The input is already sorted, so no re-sort is needed: O(n).',
    },
    vars: 'n = number of intervals; count the result list you build as extra space',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Empty interval list', 'newInterval before or after every interval', 'newInterval overlapping all intervals', 'Touching endpoints merge ([1,2] and [2,3])'],
    approach:
      'i = 0. While intervals[i].end < new.start, add intervals[i++]. While i < n and intervals[i].start <= new.end, widen new to [min starts, max ends] and i++. Add new, then the remaining intervals.',
  },
  {
    slug: 'non-overlapping-intervals', id: 435, title: 'Non-overlapping Intervals', difficulty: 'Medium', pattern: 'intervals',
    alsoAccept: ['greedy'],
    insight: {
      q: 'Which intervals should you keep to remove as few as possible?',
      options: [
        'Sort by END; keep each interval starting at or after the last kept end',
        'Sort by start and keep each interval that starts after the last kept start',
        'Remove the longest intervals first, since they overlap the most others',
        'Remove every interval that overlaps any other interval',
      ],
      why: 'Keeping the interval that ends earliest leaves the most room for the rest; an exchange argument shows it never hurts. The answer is n minus the number kept. Removing the longest first fails when a short interval overlaps two others.',
    },
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ["Touching intervals ([1,2] and [2,3]) don't overlap", 'All intervals identical', 'Already non-overlapping (answer 0)'],
    approach: 'Sort by end. prevEnd = −∞, kept = 0. For each interval, if start >= prevEnd, keep it (kept++, prevEnd = end). Return n − kept.',
  },
  {
    slug: 'interval-list-intersections', id: 986, title: 'Interval List Intersections', difficulty: 'Medium', pattern: 'intervals',
    alsoAccept: ['two-pointers'],
    insight: {
      q: 'Both lists are sorted and disjoint. How do you find all intersections?',
      options: [
        'Two pointers: intersect as [max start, min end], advance the earlier end',
        'Compare every interval in A with every interval in B',
        'Concatenate the two lists and run Merge Intervals on the result',
        'Two pointers, advancing whichever current interval starts first',
      ],
      why: 'Two intervals overlap when max(starts) ≤ min(ends), and that range is the intersection. The interval that ends first cannot meet anything further in the other list, so advancing it is safe, and every step advances a pointer: O(m + n). Merging produces the union, not the intersection.',
    },
    vars: 'm, n = lengths of the two lists',
    time: ['O(m + n)', 'O(m · n)', 'O((m + n) log(m + n))', 'O(min(m, n))'],
    space: ['O(1)', 'O(m + n)', 'O(m · n)', 'O(log(m + n))'],
    edgeCases: ['One list empty', 'Single-point intersections ([1,2] and [2,3] → [2,2])', 'One interval covering several in the other list'],
    approach:
      'i = j = 0. While both remain: lo = max(A[i][0], B[j][0]), hi = min(A[i][1], B[j][1]); if lo <= hi add [lo, hi]. Advance i if A[i][1] < B[j][1], else advance j.',
  },
  {
    slug: 'car-pooling', id: 1094, title: 'Car Pooling', difficulty: 'Medium', pattern: 'intervals',
    alsoAccept: ['prefix-sum', 'heap'],
    insight: {
      q: 'How do you check that the capacity is never exceeded?',
      options: [
        '+passengers at pickup, −passengers at drop-off, then sweep in order',
        'Add up all the passengers and compare the total with the capacity',
        'Sort the trips by passenger count and check the largest trips first',
        'Check every pair of trips for overlap and add their passengers',
      ],
      why: 'The load only changes at pickups and drop-offs. A difference array over the (at most 1001) locations, or sorted events, captures every change, and the running sum is the load. Pairwise checks miss three trips overlapping at once. The range is [from, to), so drop-offs at a location happen before pickups there.',
    },
    vars: 'n = number of trips, L = number of locations (≤ 1001)',
    time: ['O(n + L)', 'O(n²)', 'O(n · L)', 'O(L²)'],
    space: ['O(L)', 'O(1)', 'O(n · L)', 'O(n²)'],
    edgeCases: ['A drop-off and a pickup at the same location', 'One trip exceeding the capacity alone', 'Trips that never overlap'],
    approach:
      'delta = new int[1001]. For each trip [p, from, to]: delta[from] += p; delta[to] −= p. Sweep the locations accumulating the load; return false if it ever exceeds the capacity.',
  },
  {
    slug: 'minimum-interval-to-include-each-query', id: 1851, title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', pattern: 'intervals',
    alsoAccept: ['heap'],
    insight: {
      q: 'How do you answer every query efficiently?',
      options: [
        'Sort both; per query, heap in intervals starting ≤ q, pop those ending before q',
        'For each query, scan every interval and keep the smallest that contains it',
        'Sort the intervals by size and binary-search each query among them',
        'Merge overlapping intervals first, then answer each query from the merged list',
      ],
      why: 'Handling queries offline in increasing order means intervals only ever enter the heap (once start ≤ q) and leave it (once end < q). The heap top is then the smallest interval covering q. Write each answer back to its query\'s original index. Merging would lose the individual sizes.',
    },
    vars: 'n = number of intervals, q = number of queries',
    time: ['O(n log n + q log q)', 'O(n · q)', 'O(n² + q)', 'O(q · n log n)'],
    space: ['O(n + q)', 'O(1)', 'O(n · q)', 'O(n²)'],
    edgeCases: ['A query covered by no interval (−1)', 'Duplicate query values', 'Intervals of equal size'],
    approach:
      "Sort intervals by start and query indices by value. For each query q in order: push each interval with start ≤ q as (size, end); pop while the top's end < q; the answer is the top's size or −1, stored at the query's original index.",
  },
];

export const greedyProblems: CuratedProblem[] = [
  {
    slug: 'best-time-to-buy-and-sell-stock', id: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', pattern: 'greedy',
    alsoAccept: ['sliding-window', 'dp-1d'],
    insight: {
      q: 'Which single pass finds the best profit?',
      options: [
        'Track the lowest price so far; profit = price − lowest; keep the best',
        'Buy at the global minimum and sell at the global maximum',
        'Add up every positive day-to-day price difference',
        'Sort the prices and subtract the smallest from the largest',
      ],
      why: "The best sale on day i pairs it with the cheapest earlier day, so remembering the minimum so far makes each day O(1). The global minimum may come after the global maximum, and summing every rise answers a different problem (unlimited transactions).",
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Prices only fall (profit 0)', 'A single day', 'The minimum comes after the maximum'],
    approach: 'minPrice = +∞, best = 0. For each price: minPrice = min(minPrice, price); best = max(best, price − minPrice). Return best.',
  },
  {
    slug: 'maximum-subarray', id: 53, title: 'Maximum Subarray', difficulty: 'Medium', pattern: 'greedy',
    alsoAccept: ['dp-1d'],
    insight: {
      q: "What does Kadane's algorithm decide at each element x?",
      options: [
        'Extend the previous run or start fresh: cur = max(x, cur + x)',
        'Include x only when it is positive, since negatives always lower the sum',
        'Restart the running sum every time it decreases compared to the last step',
        'Keep x only if it is larger than the largest value seen so far',
      ],
      why: 'If the best sum ending at the previous element is negative, it can only hurt, so start again at x. The maximum over these "ending here" sums is the answer, in O(n). Skipping negatives breaks contiguity; restarting on any decrease throws away useful sums.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['All negative numbers (answer = largest element)', 'A single element', 'A zero-sum prefix'],
    approach: 'cur = 0, best = nums[0]. For each x: cur = max(x, cur + x); best = max(best, cur). Return best. (Divide and conquer is the O(n log n) follow-up.)',
  },
  {
    slug: 'jump-game', id: 55, title: 'Jump Game', difficulty: 'Medium', pattern: 'greedy',
    alsoAccept: ['dp-1d'],
    insight: {
      q: 'How do you decide whether the last index is reachable?',
      options: [
        'Track the farthest reachable index; standing beyond it means stuck',
        'Always take the longest jump available from the current position',
        'Try every possible sequence of jumps with plain recursion',
        'Check that the array contains no zeros, since zeros are dead ends',
      ],
      why: 'Every index up to the farthest reach is reachable, so one variable summarizes all paths. Greedily taking the longest jump can land on a zero ([2, 3, 1, 0, 4]), and zeros can often be jumped over.',
    },
    time: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A single element (already at the end)', 'A zero you can jump over', 'A zero that blocks everything ([3, 2, 1, 0, 4])'],
    approach: 'reach = 0. For each i: if i > reach return false; reach = max(reach, i + nums[i]). Return true.',
  },
  {
    slug: 'jump-game-ii', id: 45, title: 'Jump Game II', difficulty: 'Medium', pattern: 'greedy',
    alsoAccept: ['dp-1d', 'graph-traversal'],
    insight: {
      q: 'How do you find the minimum number of jumps in one pass?',
      options: [
        'BFS-style levels: track the next range; crossing a range end costs a jump',
        'Always jump to the farthest index you can reach from where you stand',
        'Count the non-zero elements, since each one is a place to jump from',
        'DFS over every jump choice, keeping the smallest count found',
      ],
      why: 'The indices reachable with j jumps form a contiguous range, and the next range extends to the farthest i + nums[i] within it. Jumping to the farthest INDEX can waste a jump: in [2, 3, 1, 1, 4] it lands on a 1 instead of the 3.',
    },
    time: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A single element (0 jumps)', 'The first jump reaches the end', 'Many small steps ([1, 1, 1, 1])'],
    approach: 'jumps = 0, end = 0, farthest = 0. For i from 0 to n − 2: farthest = max(farthest, i + nums[i]); if i == end, jumps++ and end = farthest. Return jumps.',
  },
  {
    slug: 'gas-station', id: 134, title: 'Gas Station', difficulty: 'Medium', pattern: 'greedy',
    insight: {
      q: 'How do you find the valid starting station in one pass?',
      options: [
        'If total gas ≥ total cost, restart after every point the tank goes negative',
        'Start at the station with the most gas, since it gives the biggest head start',
        'Try every start and simulate the whole loop from it',
        'Start at the station with the smallest cost to leave',
      ],
      why: "If the tank goes negative between start and i, no station between them can be a valid start either: it would reach i with even less fuel. So restart at i + 1. When the total is non-negative, the last restart point works. Simulating every start is O(n²).",
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Total gas < total cost (return −1)', 'A single station', 'The answer is the last station'],
    approach:
      'total = tank = start = 0. For each i: diff = gas[i] − cost[i]; total += diff; tank += diff; if tank < 0, start = i + 1 and tank = 0. Return total >= 0 ? start : −1.',
  },
  {
    slug: 'partition-labels', id: 763, title: 'Partition Labels', difficulty: 'Medium', pattern: 'greedy',
    alsoAccept: ['intervals', 'hashing'],
    insight: {
      q: 'Where can a part end?',
      options: [
        'When i reaches the farthest last occurrence of the part\'s letters',
        'Wherever a character repeats, since a repeat must start a new part',
        'After every distinct character, to make as many parts as possible',
        'At the last occurrence of the part\'s first character',
      ],
      why: 'Every character in a part must have its last occurrence inside that part. Extending end = max(end, last[c]) while scanning guarantees it, and closing as soon as i == end keeps each part as small as possible. The first character alone is not enough: others may reach further.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(26 · n²)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['All characters distinct (every part has length 1)', 'A single repeated character', 'One part covering the whole string'],
    approach: 'Record last[c] for every character. Scan with start = end = 0: end = max(end, last[s[i]]); when i == end, record end − start + 1 and set start = i + 1.',
  },
  {
    slug: 'valid-parenthesis-string', id: 678, title: 'Valid Parenthesis String', difficulty: 'Medium', pattern: 'greedy',
    alsoAccept: ['stack', 'dp-2d'],
    insight: {
      q: "How do you handle '*' (which may be '(', ')' or empty) in O(n)?",
      options: [
        'Track the range [lo, hi] of possible open counts; \'*\' widens it',
        'Treat every \'*\' as \'(\' and check the result with a normal counter',
        'Try all 3^k ways to assign the stars and test each result',
        'Compare the count of \'(\' plus \'*\' with the count of \')\'',
      ],
      why: "lo is the fewest possible open brackets and hi the most. ')' lowers both, '(' raises both, '*' lowers lo and raises hi. hi < 0 means too many ')'. Clamping lo at 0 drops impossible states; lo == 0 at the end means some assignment balances. Counting ignores order (\"*(\" is invalid).",
    },
    time: ['O(n)', 'O(n²)', 'O(3ⁿ)', 'O(n³)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(3ⁿ)'],
    edgeCases: ['Only stars ("***" is valid)', 'A star before "(" can\'t close it ("*(" is invalid)', 'Empty string'],
    approach: "lo = hi = 0. For each c: '(' → lo++, hi++; ')' → lo--, hi--; '*' → lo--, hi++. If hi < 0 return false; lo = max(lo, 0). Return lo == 0.",
  },
];

export const backtrackingProblems: CuratedProblem[] = [
  {
    slug: 'subsets', id: 78, title: 'Subsets', difficulty: 'Medium', pattern: 'backtracking',
    alsoAccept: ['bit-manipulation'],
    insight: {
      q: 'How do you generate every subset exactly once?',
      options: [
        'Loop from start, recurse with i + 1, record the path at every node',
        'Generate every permutation and remove the duplicates with a set',
        'Loop from start and recurse with i, so each element can appear again',
        'Loop from start and record the path only when its length reaches n',
      ],
      why: 'Each element is either in or out, giving 2ⁿ subsets. Starting the loop at i + 1 keeps elements in index order, so each subset appears once. Recursing with i would reuse elements; recording only full-length paths gives just the whole set. Bitmasks 0 … 2ⁿ − 1 are an iterative alternative.',
    },
    time: ['O(n · 2ⁿ)', 'O(2ⁿ)', 'O(n!)', 'O(n²)'],
    space: ['O(n)', 'O(2ⁿ)', 'O(n · 2ⁿ)', 'O(1)'],
    edgeCases: ['The empty subset must be included', 'n = 1', 'Negative numbers'],
    approach: 'backtrack(start, path): add a copy of path; for i from start to n − 1: path.add(nums[i]); backtrack(i + 1, path); remove the last element.',
  },
  {
    slug: 'permutations', id: 46, title: 'Permutations', difficulty: 'Medium', pattern: 'backtracking',
    insight: {
      q: 'How do you build each permutation without repeating elements?',
      options: [
        'Try every unused element at each position, then un-mark it',
        'Loop from start and recurse with i + 1, exactly as for subsets',
        'Swap each pair of adjacent elements once to produce the next permutation',
        'Sort the array; sorted order already covers every needed arrangement',
      ],
      why: 'A permutation uses every element once in any order, so each level may pick any element not yet used. Recursing with i + 1 only produces increasing sequences (combinations). Swapping nums[start] with each later element is an in-place alternative.',
    },
    time: ['O(n · n!)', 'O(2ⁿ)', 'O(n²)', 'O(n³)'],
    space: ['O(n)', 'O(n!)', 'O(n · n!)', 'O(1)'],
    edgeCases: ['A single element', 'Negative numbers', 'Forgetting to copy the path when recording it'],
    approach:
      'backtrack(path, used): if path.size() == n, add a copy. Otherwise for each i not used: mark used[i], add nums[i], recurse, then remove the last element and unmark used[i].',
  },
  {
    slug: 'combination-sum', id: 39, title: 'Combination Sum', difficulty: 'Medium', pattern: 'backtracking',
    insight: {
      q: 'Candidates may be reused. How do you avoid duplicates such as [2,3] and [3,2]?',
      options: [
        'Recurse with the same i (allows reuse), never going back to earlier indices',
        'Recurse with i + 1, so each candidate is used at most once',
        'Generate all orderings, then deduplicate them with a set of sorted lists',
        'Restart the loop from index 0 at every level of the recursion',
      ],
      why: 'Only choosing candidates at or after the current index yields each combination in one canonical order, so it appears once, while staying at i allows reuse. Sorting lets you break as soon as a candidate exceeds the remaining target.',
    },
    vars: 'n = number of candidates, T = target, m = smallest candidate',
    time: ['O(n^(T/m))', 'O(n · T)', 'O(2ⁿ)', 'O(T²)'],
    space: ['O(T/m)', 'O(n · T)', 'O(1)', 'O(2ⁿ)'],
    edgeCases: ['No combination (return [])', 'Target smaller than every candidate', 'A candidate equal to the target'],
    approach:
      'Sort candidates. backtrack(start, remaining, path): if remaining == 0, add a copy. For i from start: if candidates[i] > remaining break; add it, recurse with (i, remaining − candidates[i]), remove it.',
  },
  {
    slug: 'subsets-ii', id: 90, title: 'Subsets II', difficulty: 'Medium', pattern: 'backtracking',
    insight: {
      q: 'The input has duplicates. How do you avoid duplicate subsets?',
      options: [
        'Sort; skip nums[i] when i > start and it equals nums[i − 1]',
        'Skip nums[i] whenever it equals nums[i − 1], at every depth of the recursion',
        'Remove duplicate values from the input first, then run plain Subsets',
        'Track used elements with a boolean array, as in Permutations',
      ],
      why: 'After sorting, equal values are neighbors. Choosing the same value twice at the SAME level creates identical branches, so only the first is explored; a deeper level may still take the next copy, which is how [2, 2] appears. Removing duplicates, or skipping at every depth, loses [2, 2].',
    },
    time: ['O(n · 2ⁿ)', 'O(2ⁿ)', 'O(n!)', 'O(n²)'],
    space: ['O(n)', 'O(2ⁿ)', 'O(n · 2ⁿ)', 'O(1)'],
    edgeCases: ['All elements equal ([2, 2, 2])', 'No duplicates (same as Subsets)', 'The empty subset'],
    approach: 'Sort nums. backtrack(start, path): add a copy; for i from start: if i > start && nums[i] == nums[i − 1] continue; choose nums[i], recurse with i + 1, un-choose.',
  },
  {
    slug: 'generate-parentheses', id: 22, title: 'Generate Parentheses', difficulty: 'Medium', pattern: 'backtracking',
    insight: {
      q: 'Which rule keeps every partial string valid?',
      options: [
        'Add \'(\' while open < n; add \')\' only while close < open',
        'Add \'(\' and \')\' freely, then filter out the invalid strings at the end',
        'Add \'(\' while open < n and \')\' whenever close < n',
        'Alternate \'(\' and \')\', starting with \'(\', until the string is full',
      ],
      why: 'A prefix can be completed to a valid string exactly when it never has more ")" than "(" and has at most n "(". Enforcing both while building prunes every invalid branch, so only the (Catalan-many) valid strings are generated.',
    },
    vars: 'n = number of pairs',
    time: ['O(4ⁿ / √n)', 'O(2²ⁿ · n)', 'O(n!)', 'O(n²)'],
    space: ['O(n)', 'O(4ⁿ)', 'O(1)', 'O(n²)'],
    edgeCases: ['n = 1 ("()")', 'Copy / toString the builder when recording', 'n = 8 (1430 strings)'],
    approach: "backtrack(sb, open, close): if length == 2n record it. If open < n: append '(', recurse, delete it. If close < open: append ')', recurse, delete it.",
  },
  {
    slug: 'word-search', id: 79, title: 'Word Search', difficulty: 'Medium', pattern: 'backtracking',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'How do you avoid reusing a cell within one path?',
      options: [
        'Mark the cell (e.g. \'#\') before exploring; restore it when backtracking',
        'Keep one global visited set for the whole search and never clear it',
        'Only move right and down, so a path can never return to a cell',
        'Run a BFS from each cell, marking cells visited when they are enqueued',
      ],
      why: 'A cell may be reused by a different path, just not by the current one. Temporarily marking it during the DFS and restoring it afterwards gives per-path visited state with no extra memory. A global visited set wrongly blocks other paths, and BFS cannot track per-path usage.',
    },
    vars: 'm × n board, L = length of the word',
    time: ['O(m · n · 3^L)', 'O(m · n · L)', 'O((m · n)²)', 'O(4^(m·n))'],
    space: ['O(L)', 'O(m · n)', 'O(1)', 'O(3^L)'],
    edgeCases: ['A word longer than the number of cells', 'Many repeated letters', 'A path that would need to revisit a cell'],
    approach:
      "dfs(r, c, i): if i == word.length() return true; if out of bounds or board[r][c] != word.charAt(i) return false. Save the char, set '#', try the four neighbors with i + 1, restore the char, and return whether any succeeded. Start from every cell.",
  },
  {
    slug: 'palindrome-partitioning', id: 131, title: 'Palindrome Partitioning', difficulty: 'Medium', pattern: 'backtracking',
    alsoAccept: ['dp-2d'],
    insight: {
      q: 'How do you enumerate all palindrome partitions?',
      options: [
        'From start, try each end where s[start..end] is a palindrome; recurse',
        'Find the longest palindrome first and split the string around it',
        'Split the string into single characters, which are always palindromes',
        'Use two pointers from both ends to find one valid partition',
      ],
      why: 'Each recursion level chooses the next palindromic piece that starts at start, so every partition is built exactly once. Precomputing isPal[i][j] with DP makes each palindrome check O(1).',
    },
    vars: 'n = length of s; with a precomputed palindrome table',
    time: ['O(n · 2ⁿ)', 'O(n²)', 'O(n!)', 'O(n³)'],
    space: ['O(n²)', 'O(1)', 'O(2ⁿ)', 'O(n!)'],
    edgeCases: ['A single character', 'All characters equal ("aaa")', 'No palindrome longer than one letter ("abc")'],
    approach:
      'Precompute isPal[i][j] = s[i] == s[j] && (j − i < 2 || isPal[i+1][j−1]). backtrack(start, path): if start == n record a copy; for end from start: if isPal[start][end], add the substring, recurse from end + 1, remove it.',
  },
  {
    slug: 'n-queens', id: 51, title: 'N-Queens', difficulty: 'Hard', pattern: 'backtracking',
    insight: {
      q: 'How do you check attacks in O(1) as queens are placed row by row?',
      options: [
        'Sets of used columns, diagonals (r − c) and anti-diagonals (r + c)',
        'Scan the whole board for attacking queens before each placement',
        'Only check whether the column is free, since rows never repeat',
        'Place each queen in the first free column of its row, never undoing it',
      ],
      why: 'Every square on a diagonal shares r − c, and on an anti-diagonal shares r + c, so three lookups tell you whether a square is attacked. Placing one queen per row means rows never conflict. Greedy placement without backtracking gets stuck.',
    },
    vars: "n = board size; queen positions kept in an int[n], not a full board",
    time: ['O(n!)', 'O(n²)', 'O(2ⁿ)', 'O(n³)'],
    space: ['O(n)', 'O(n²)', 'O(1)', 'O(n!)'],
    edgeCases: ['n = 1 (one solution)', 'n = 2 and n = 3 (no solutions)', 'Building the output strings from queen columns'],
    approach:
      'Place one queen per row. For row r try each column c not in cols, diag (r − c + n) or anti (r + c): mark all three, recurse to r + 1, then unmark. When r == n, turn the queen columns into strings.',
  },
];
