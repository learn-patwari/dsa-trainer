import type { CuratedProblem } from '../types.ts';

export const prefixSumProblems: CuratedProblem[] = [
  {
    slug: 'find-pivot-index', id: 724, title: 'Find Pivot Index', difficulty: 'Easy', pattern: 'prefix-sum',
    brute: { text: 'For each index, add up the values on each side separately.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'How do you check each index as the pivot in O(1)?',
      options: [
        'Compute the total once; i is a pivot when left == total − left − nums[i]',
        'For each index, add up its left side and its right side separately',
        'Move two pointers inward from both ends, advancing whichever side has the smaller sum',
        'Binary-search for the index where the prefix sum is exactly half of the total',
      ],
      why: 'With the total known, the right-hand sum at i is total − leftSum − nums[i], so each index costs O(1) while leftSum accumulates. Two pointers and binary search both break when values can be negative.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Pivot at index 0 (the left sum is 0)', 'Pivot at the last index', 'No pivot (return −1)', 'Negative numbers'],
    approach:
      'total = sum(nums). Walk i from 0 with leftSum = 0: if leftSum == total − leftSum − nums[i], return i (the leftmost pivot); then leftSum += nums[i]. Return −1 if no index qualifies.',
  },
  {
    slug: 'range-sum-query-immutable', id: 303, title: 'Range Sum Query - Immutable', difficulty: 'Easy', pattern: 'prefix-sum',
    brute: { text: 'Add up the requested range on every query.', time: ['O(n) per query', 'O(1) per query', 'O(log n) per query', 'O(n²) per query'] },
    insight: {
      q: 'Many sumRange queries will be asked. What should the constructor do?',
      options: [
        'Precompute prefix sums; a query is prefix[right + 1] − prefix[left]',
        'Nothing: sum the requested range inside each query, since the array never changes',
        'Precompute and store the answer for every possible (left, right) pair',
        'Sort the array so each range can be located quickly with binary search',
      ],
      why: 'One O(n) pass makes every query O(1). Summing per query is O(n) each, too slow for many queries, and precomputing all pairs needs O(n²) memory. Sorting destroys the ranges.',
    },
    vars: 'n = length of nums, q = number of queries',
    time: ['O(n + q)', 'O(n · q)', 'O(n² + q)', 'O(q log n)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(q)'],
    edgeCases: ['left == right (a single element)', 'A range covering the whole array', 'Negative numbers'],
    approach:
      'Build prefix of length n + 1 with prefix[0] = 0 and prefix[i + 1] = prefix[i] + nums[i]. sumRange(l, r) returns prefix[r + 1] − prefix[l]; the leading zero removes the l = 0 special case.',
  },
  {
    slug: 'product-of-array-except-self', id: 238, title: 'Product of Array Except Self', difficulty: 'Medium', pattern: 'prefix-sum',
    brute: { text: 'For each index, multiply the other n − 1 values.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'How do you compute every product without division in O(n)?',
      options: [
        'A left-to-right prefix-product pass, then a right-to-left suffix pass',
        'Multiply everything together once, then divide the total by nums[i] for each i',
        'For each i, multiply all the other elements together in an inner loop',
        'Sort the array, then multiply each value by its neighbors to build the answer',
      ],
      why: 'Prefix products from the left and suffix products from the right together cover everything except i. Writing the prefix pass into the output array and folding in the suffix with one running variable makes the extra space O(1). Division is forbidden and breaks on zeros.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Exactly one zero', 'Two or more zeros (every product is 0)', 'Negative numbers'],
    approach:
      'First pass: answer[i] = product of nums[0..i−1] (answer[0] = 1). Second pass from the right with suffix = 1: answer[i] *= suffix, then suffix *= nums[i]. No division, and zeros need no special handling.',
  },
  {
    slug: 'subarray-sum-equals-k', id: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', pattern: 'prefix-sum',
    alsoAccept: ['hashing'],
    brute: { text: 'Extend every start position, keeping the running sum.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'Values can be negative. How do you count the subarrays summing to k in one pass?',
      options: [
        'Count prefix sums in a map; at each step add the count of (sum − k)',
        'A sliding window that shrinks from the left whenever its sum grows past k',
        'Sort the array and move two pointers to find ranges that add up to k',
        'Keep only the latest prefix sum and count the times it equals k exactly',
      ],
      why: 'A subarray (j, i] sums to k exactly when prefix[i] − prefix[j] = k, i.e. when an earlier prefix equals sum − k. Counting earlier prefixes in a map answers that in O(1). Seed the map with {0: 1}. Sliding windows require non-negative values.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['k = 0', 'Negative numbers', 'The whole array sums to k', 'Overlapping answers ([1, 1, 1], k = 2)'],
    approach:
      'sum = 0 and a HashMap seen with seen[0] = 1. For each x: sum += x; count += seen.getOrDefault(sum − k, 0); then seen.merge(sum, 1, Integer::sum). Query before inserting so the empty subarray is never counted.',
  },
  {
    slug: 'contiguous-array', id: 525, title: 'Contiguous Array', difficulty: 'Medium', pattern: 'prefix-sum',
    alsoAccept: ['hashing'],
    brute: { text: 'Count zeros and ones in every subarray.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'How do you find the longest subarray with equal numbers of 0s and 1s?',
      options: [
        'Treat each 0 as −1 and store the first index where each running sum appears',
        'A sliding window that shrinks whenever its counts of 0s and 1s differ',
        'Return 2 × min(number of 0s, number of 1s), since every pair can be balanced',
        'Sort the array so the 0s come first, then take the balanced middle section',
      ],
      why: 'With 0 → −1, equal counts means a zero-sum subarray, which happens exactly when the same prefix sum appears twice. Keeping only the first index of each sum maximizes the length. Seed the map with {0: −1}.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['No balanced subarray (answer 0)', 'The whole array is balanced', 'A balanced subarray that starts at index 0'],
    approach:
      'Walk with sum (+1 for a 1, −1 for a 0) and firstIndex seeded with {0: −1}. If sum was seen, best = max(best, i − firstIndex[sum]); otherwise store firstIndex[sum] = i. Never overwrite an earlier index.',
  },
  {
    slug: 'range-sum-query-2d-immutable', id: 304, title: 'Range Sum Query 2D - Immutable', difficulty: 'Medium', pattern: 'prefix-sum',
    brute: { text: 'Add the rectangle up cell by cell on every query.', time: ['O(m · n) per query', 'O(1) per query', 'O(m + n) per query', 'O(log(m · n)) per query'] },
    insight: {
      q: 'How do you answer every rectangle-sum query in O(1)?',
      options: [
        'A 2-D prefix-sum table, answering each query with four-corner inclusion-exclusion',
        'A 1-D prefix array per row, adding up one row sum per row of the rectangle',
        'Precompute and store the sum of every possible rectangle in a hash map',
        'Sum the rectangle cell by cell, since each query touches few cells anyway',
      ],
      why: 'Inclusion-exclusion: take the rectangle from the origin, subtract the strip above and the strip to the left, and add back the corner subtracted twice. Row prefixes also work but cost O(rows) per query.',
    },
    vars: 'm × n matrix, q = number of queries',
    time: ['O(m · n + q)', 'O(m · n · q)', 'O(m · n + q · m)', 'O(m² · n² + q)'],
    space: ['O(m · n)', 'O(1)', 'O(m² · n²)', 'O(m + n)'],
    edgeCases: ['A single-cell rectangle', 'A rectangle touching row 0 or column 0', 'Negative values'],
    approach:
      'Build P of size (m + 1) × (n + 1) with P[i+1][j+1] = matrix[i][j] + P[i][j+1] + P[i+1][j] − P[i][j]. Each query applies the four-corner formula; the zero row and column remove edge cases.',
  },
];

export const binarySearchProblems: CuratedProblem[] = [
  {
    slug: 'binary-search', id: 704, title: 'Binary Search', difficulty: 'Easy', pattern: 'binary-search',
    brute: { text: 'Scan the array from left to right until the target shows up.', time: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'] },
    insight: {
      q: 'Which loop keeps binary search correct?',
      options: [
        'Loop while lo <= hi; on a miss move past mid: lo = mid + 1 or hi = mid − 1',
        'while (lo < hi), setting lo = mid or hi = mid so the target is never skipped',
        'Compare with mid once, then scan left or right linearly toward the target',
        'while (lo <= hi), setting lo = mid on a miss so no candidate is ever lost',
      ],
      why: 'Each comparison discards half of the range. Moving past mid (mid ± 1) guarantees progress; lo = mid can loop forever. lo + (hi − lo) / 2 avoids integer overflow for large indices.',
    },
    time: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    space: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    edgeCases: ['A single element', 'Target smaller than every element', 'Target larger than every element', 'Target at index 0 or n − 1'],
    approach:
      'lo = 0, hi = n − 1. While lo <= hi: mid = lo + (hi − lo) / 2; if nums[mid] == target return mid; if nums[mid] < target, lo = mid + 1; else hi = mid − 1. Return −1.',
  },
  {
    slug: 'search-a-2d-matrix', id: 74, title: 'Search a 2D Matrix', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Look at every cell of the matrix.', time: ['O(m · n)', 'O(log(m · n))', 'O(m + n)', 'O(m log n)'] },
    insight: {
      q: 'Each row is sorted and starts after the previous row ends. How do you search in O(log(m·n))?',
      options: [
        'Treat it as one sorted array of m·n values: index k → matrix[k / n][k % n]',
        'Start at the top-right corner and step left or down depending on the comparison',
        'Binary-search each row in turn until the row containing the target is found',
        'Copy the matrix into one flat list first, then binary-search that list',
      ],
      why: 'Because each row continues where the previous one ended, the matrix is one sorted sequence; index arithmetic searches it in O(log(m·n)) without copying. The staircase walk is O(m + n) and is the right idea for Search a 2D Matrix II, where rows do not chain.',
    },
    vars: 'm rows, n columns',
    time: ['O(log(m · n))', 'O(m + n)', 'O(m log n)', 'O(m · n)'],
    space: ['O(1)', 'O(m · n)', 'O(m)', 'O(log(m · n))'],
    edgeCases: ['A single row or a single column', 'Target smaller than matrix[0][0]', 'Target larger than the last element'],
    approach:
      'Binary-search k in [0, m·n − 1]; the value at k is matrix[k / n][k % n]. Compare with the target exactly as in ordinary binary search.',
  },
  {
    slug: 'find-first-and-last-position-of-element-in-sorted-array', id: 34, title: 'Find First and Last Position of Element in Sorted Array', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Scan once from the left and once from the right.', time: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: "How do you find both ends of the target's range in O(log n)?",
      options: [
        'Two boundary searches: first index ≥ target and first index > target',
        'Binary-search any occurrence, then walk left and right until the value changes',
        'Binary-search once; the first match found is always the leftmost occurrence',
        'Scan inward from both ends of the array until each side reaches the target',
      ],
      why: 'lowerBound(target) gives the start; lowerBound(target + 1) − 1 gives the end. Expanding from a single match degrades to O(n) when the whole array equals the target.',
    },
    time: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    edgeCases: ['Target absent (return [−1, −1])', 'Every element equals the target', 'Empty array', 'Target occurs once'],
    approach:
      'lowerBound(x) = first index with nums[i] ≥ x. start = lowerBound(target); if start == n or nums[start] != target, return [−1, −1]. end = lowerBound(target + 1) − 1.',
  },
  {
    slug: 'koko-eating-bananas', id: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Try every speed from 1 upward until one finishes in time.', time: ['O(n · M)', 'O(n log M)', 'O(n)', 'O(M log n)'] },
    insight: {
      q: 'What do you binary-search over?',
      options: [
        'The speed k in [1, max pile], using "hours needed ≤ h" as the test',
        'The piles themselves, after sorting them by size, to find the last pile eaten',
        'The number of hours from 1 to h, checking how many piles fit in each',
        'Nothing to search: the answer is ceil(sum of piles / h), the average rate',
      ],
      why: 'hours(k) = Σ ceil(pile / k) never increases as k grows, so "finishes within h" flips from false to true exactly once: binary search on the answer finds the first true. The average ignores that every pile takes whole hours.',
    },
    vars: 'n = number of piles, M = largest pile',
    time: ['O(n log M)', 'O(n · M)', 'O(n log n)', 'O(M log n)'],
    space: ['O(1)', 'O(n)', 'O(M)', 'O(log M)'],
    edgeCases: ['h equals the number of piles (answer = largest pile)', 'Huge piles (sum hours in a long)', 'A single pile'],
    approach:
      'lo = 1, hi = max(piles). While lo < hi: mid = lo + (hi − lo) / 2; hours = Σ (p + mid − 1) / mid as a long; if hours ≤ h, hi = mid, else lo = mid + 1. Return lo.',
  },
  {
    slug: 'find-minimum-in-rotated-sorted-array', id: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Scan the whole array for the smallest value.', time: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'] },
    insight: {
      q: 'How do you tell which half contains the minimum?',
      options: [
        'nums[mid] > nums[hi] → minimum is right of mid; else at mid or left',
        'nums[mid] > nums[lo] → the minimum is left of mid, else it is right of mid',
        'The minimum always sits at index n / 2 once the array has been rotated',
        'Scan for the first element that is smaller than the one just before it',
      ],
      why: 'If nums[mid] > nums[hi], the drop (rotation point) lies between mid and hi. Otherwise mid..hi is sorted, so the minimum is at mid or before it. Comparing with hi avoids the ambiguity of comparing with lo on an unrotated array.',
    },
    time: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    space: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    edgeCases: ['Not rotated at all', 'Two elements', 'Rotated by n − 1 positions'],
    approach:
      'lo = 0, hi = n − 1. While lo < hi: mid = lo + (hi − lo) / 2; if nums[mid] > nums[hi], lo = mid + 1; else hi = mid. Return nums[lo].',
  },
  {
    slug: 'search-in-rotated-sorted-array', id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Scan every element looking for the target.', time: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'In a rotated sorted array, how do you decide which half to keep?',
      options: [
        'One half around mid is sorted; keep it if the target falls in its range',
        'Keep the left half whenever target < nums[mid], exactly as in plain binary search',
        'Find the maximum with a linear scan, then binary-search both sorted parts',
        'Rotation breaks the ordering binary search needs, so scan the array linearly',
      ],
      why: 'With distinct values, either nums[lo..mid] or nums[mid..hi] is sorted. Checking whether the target falls inside the sorted half\'s range tells you where to go. Finding the rotation point first, then searching one side, is also O(log n).',
    },
    time: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    edgeCases: ['Not rotated', 'Target absent', 'Two elements', 'Target at the rotation point'],
    approach:
      'While lo <= hi: if nums[mid] == target return mid. If nums[lo] <= nums[mid] (left half sorted): go left when nums[lo] <= target < nums[mid], else right. Otherwise (right half sorted): go right when nums[mid] < target <= nums[hi], else left.',
  },
  {
    slug: 'time-based-key-value-store', id: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium', pattern: 'binary-search',
    alsoAccept: ['hashing'],
    brute: { text: 'Scan the key\'s whole history for the latest timestamp at or before t.', time: ['O(n) per get', 'O(log n) per get', 'O(1) per get', 'O(n log n) per get'] },
    insight: {
      q: 'Timestamps for each key arrive in increasing order. How should get(key, t) work?',
      options: [
        'Per key, keep (timestamp, value) pairs; binary-search the last ≤ t',
        'Keep one value per key and overwrite it on every set(), since newer values win',
        'Scan the key\'s list from the start until a timestamp larger than t appears',
        'A HashMap keyed by (key, timestamp), looking up exactly (key, t)',
      ],
      why: 'Because set() timestamps strictly increase, each key\'s list is already sorted: appending is O(1), and an upper-bound search finds the latest value at or before t in O(log n). TreeMap.floorEntry(t) is an equivalent shortcut.',
    },
    vars: 'n = values stored for the key, N = total set() calls',
    time: ['O(log n) per get, O(1) per set', 'O(n) per get', 'O(1) per get and set', 'O(n log n) per get'],
    space: ['O(N)', 'O(1)', 'O(N²)', 'O(log N)'],
    edgeCases: ['t earlier than every timestamp for the key (return "")', 'An unknown key', 't exactly equal to a stored timestamp'],
    approach:
      'Map<String, List<(timestamp, value)>>. set appends. get binary-searches the key\'s list for the last timestamp ≤ t and returns its value, or "" if there is none.',
  },
  {
    slug: 'median-of-two-sorted-arrays', id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', pattern: 'binary-search',
    brute: { text: 'Merge both arrays into one and take the middle.', time: ['O(m + n)', 'O(log(m + n))', 'O(log(min(m, n)))', 'O((m + n) log(m + n))'] },
    insight: {
      q: 'How do you find the median in O(log(min(m, n)))?',
      options: [
        'Binary-search the split of the smaller array so left half ≤ right half',
        'Merge both arrays like merge sort and take the middle element(s)',
        'Average the two arrays\' individual medians, weighting each by its length',
        'Binary-search the median value directly inside the larger array',
      ],
      why: 'Take i elements from A and j = (m + n + 1) / 2 − i from B for the left half. The split is right when A[i−1] ≤ B[j] and B[j−1] ≤ A[i]; otherwise move i left or right. Searching the smaller array gives O(log(min(m, n))); merging is O(m + n).',
    },
    vars: 'm, n = lengths of the two arrays',
    time: ['O(log(min(m, n)))', 'O(m + n)', 'O((m + n) log(m + n))', 'O(log m · log n)'],
    space: ['O(1)', 'O(m + n)', 'O(log(m + n))', 'O(m · n)'],
    edgeCases: ['One array is empty', 'Even total length (average the two middle values)', 'Every element of one array is smaller', 'Duplicates across the arrays'],
    approach:
      'Let A be the shorter array. Binary-search i in [0, m], j = (m + n + 1) / 2 − i, treating out-of-range neighbors as ±∞. If A[i−1] > B[j] move left; if B[j−1] > A[i] move right. Otherwise the median is max(A[i−1], B[j−1]) for odd totals, or its average with min(A[i], B[j]) for even totals.',
  },
];
