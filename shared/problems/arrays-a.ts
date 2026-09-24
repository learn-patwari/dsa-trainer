import type { CuratedProblem } from '../types.ts';

// Convention for every quiz: the FIRST option is the correct one (the server shuffles).

export const hashingProblems: CuratedProblem[] = [
  {
    slug: 'contains-duplicate', id: 217, title: 'Contains Duplicate', difficulty: 'Easy', pattern: 'hashing',
    brute: { text: 'Compare every pair of elements with two nested loops.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'] },
    insight: {
      q: 'What is the fastest way to find out whether any value repeats?',
      options: [
        'Add each value to a HashSet; the first add() that returns false is a duplicate',
        'Compare every pair with two nested loops, since any two positions could hold equal values',
        'XOR all values together; equal values cancel, so a non-zero result means a duplicate',
        'Compare the array sum with n·(n+1)/2, since a repeat changes the expected total',
      ],
      why: 'A set gives O(1) membership checks, so one pass finds a repeat. Sorting and comparing neighbors also works in O(n log n) time with O(1) extra space, a trade-off worth mentioning.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['A single element', 'The duplicate pair is the first and last element', 'Negative numbers and zero'],
    approach:
      'Scan once, adding each value to a HashSet. If add() returns false the value was already present, so return true. If the scan finishes, every value was distinct. Alternative: sort, then compare adjacent elements (O(n log n) time, O(1) extra space).',
  },
  {
    slug: 'valid-anagram', id: 242, title: 'Valid Anagram', difficulty: 'Easy', pattern: 'hashing',
    brute: { text: 'For each letter of s, scan t for an unused match and cross it off.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n!)'] },
    insight: {
      q: 'How do you check that two strings are anagrams in linear time?',
      options: [
        'Count letters, +1 for s and −1 for t; every one of the counters must end at 0',
        'Check that the lengths match and both strings start and end with the same letters',
        'Compare the sums of the character codes, since anagrams contain the same characters',
        'Check that every character of s also appears somewhere in t, and vice versa',
      ],
      why: 'Anagrams have identical letter frequencies. A 26-slot counter compares them in one pass. Equal code sums or plain membership are fooled by cases like "ad" vs "bc" or "aab" vs "abb".',
    },
    vars: 'n = length of the strings; the alphabet is 26 lowercase letters',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['Different lengths (return false immediately)', 'Same letters, different counts ("aab" vs "abb")', 'Unicode input (follow-up: use a HashMap)'],
    approach:
      "If the lengths differ, return false. Otherwise, for each index i do count[s[i]-'a']++ and count[t[i]-'a']--. The strings are anagrams exactly when every counter ends at zero. Sorting both strings and comparing also works, in O(n log n).",
  },
  {
    slug: 'two-sum', id: 1, title: 'Two Sum', difficulty: 'Easy', pattern: 'hashing',
    brute: { text: 'Try every pair of indices and test their sum.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'What lets you find the pair in a single pass?',
      options: [
        'Before storing x, look up target − x in a map of seen value → index',
        'Sort the array, then move two pointers inward and return the positions they stop at',
        'Binary-search for target − x for each x, keeping the whole scan at O(n log n)',
        'Load every value into a set first, then return any x whose complement is in the set',
      ],
      why: 'Checking the map BEFORE inserting x means an element is never paired with itself, and the map stores indices, which the answer needs. Sorting would lose the original indices; a set built up front pairs 3 with itself for target 6.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['The two numbers are equal ([3, 3], target 6)', 'Negative numbers and zero', 'The pair includes the last element'],
    approach:
      'Walk the array once with a HashMap<value, index>. For each nums[i], compute need = target − nums[i]; if need is in the map, return [map.get(need), i]. Otherwise put nums[i] → i. Checking before inserting prevents using the same element twice.',
  },
  {
    slug: 'group-anagrams', id: 49, title: 'Group Anagrams', difficulty: 'Medium', pattern: 'hashing',
    brute: { text: 'Compare each word with every other word to test whether they are anagrams.', time: ['O(n² · k)', 'O(n · k)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'Which key groups anagrams together?',
      options: [
        'Key each word by its letters in sorted order (or by its 26 letter counts)',
        'Key each word by the sum of its character codes, since anagrams share the same letters',
        'Key each word by its length and first letter, since anagrams always share both',
        'Key each word by the set of distinct letters it contains, ignoring their order',
      ],
      why: 'Anagrams share exactly the same multiset of letters, so their sorted letters (or count signatures) are identical, and different for non-anagrams. Sums collide ("ad"/"bc"), and letter sets ignore counts ("aab"/"ab").',
    },
    vars: 'n = number of words, k = maximum word length',
    time: ['O(n · k log k)', 'O(n² · k)', 'O(n log n)', 'O(n · k²)'],
    space: ['O(n · k)', 'O(1)', 'O(k)', 'O(n²)'],
    edgeCases: ['Empty strings (they form one group)', 'A single word', 'Repeated letters ("aab" vs "abb")'],
    approach:
      'Map each word to a canonical key (its sorted letters) and add it to groups.computeIfAbsent(key, …). The map values are the answer. Sorting each word costs O(k log k); a 26-count signature key such as "1#0#2#…" brings it down to O(n · k).',
  },
  {
    slug: 'valid-sudoku', id: 36, title: 'Valid Sudoku', difficulty: 'Medium', pattern: 'hashing',
    brute: { text: 'For each filled cell, scan its row, its column and its box for a repeat.', time: ['O(n³)', 'O(n²)', 'O(n⁴)', 'O(n)'] },
    insight: {
      q: 'How do you validate the filled cells in one pass?',
      options: [
        'Keep one set per row, per column and per 3×3 box, with box = (r / 3) * 3 + c / 3',
        'Solve the board with backtracking; it is valid exactly when a full solution exists',
        'Check that every row and every column adds up to 45, the sum of the digits 1 to 9',
        'Sort every row and column and look for equal neighbors; boxes follow automatically',
      ],
      why: 'Validity only concerns the filled cells: no digit may repeat in a row, a column or a box. Three families of sets (or bitmasks) catch a repeat as soon as it appears. Solvability is NOT required, and sums ignore empty cells.',
    },
    vars: 'n = side length of the board (9 here)',
    time: ['O(n²)', 'O(n³)', 'O(n⁴)', 'O(n!)'],
    space: ['O(n²)', 'O(1)', 'O(n)', 'O(n³)'],
    edgeCases: ['Empty "." cells must be skipped', 'A repeat inside a 3×3 box but in no row or column', 'A valid but unsolvable board is still valid'],
    approach:
      "Scan every cell once. For a digit at (r, c), add it to rows[r], cols[c] and boxes[(r / 3) * 3 + c / 3]; if any add fails, return false. Skip '.' cells. Only filled cells matter, so an unsolvable board can still be valid.",
  },
  {
    slug: 'longest-consecutive-sequence', id: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', pattern: 'hashing',
    alsoAccept: ['union-find'],
    brute: { text: 'Sort the values, then walk through counting consecutive runs.', time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n³)'] },
    insight: {
      q: 'How can you find the longest run in O(n) without sorting?',
      options: [
        'Put every value in a set, and only start counting a run at x when x − 1 is absent',
        'Use a set and, from every x, count x + 1, x + 2, … to find the run it belongs to',
        'Push every value into a min-heap and pop in order, counting how long each run lasts',
        'Walk the array once, tracking how many neighbors in input order differ by exactly 1',
      ],
      why: "Only a sequence's first element (no x − 1 present) starts a walk, so every number is visited by exactly one walk: O(n) in total. Walking from every element revisits runs and degrades to O(n²).",
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Empty array (answer 0)', 'Duplicates such as [1, 2, 2, 3]', 'Negative numbers'],
    approach:
      'Insert every number into a HashSet. For each x in the SET, if x − 1 is absent, x starts a sequence: count upward while x + len is present and track the maximum. Iterating the set (not the array) avoids repeat walks for duplicates.',
  },
  {
    slug: 'insert-delete-getrandom-o1', id: 380, title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', pattern: 'hashing',
    brute: { text: 'Keep a plain list and scan it on every insert and remove.', time: ['O(n) per operation', 'O(1) per operation', 'O(log n) per operation', 'O(n²) per operation'] },
    insight: {
      q: 'How do you make remove() O(1) while getRandom() stays uniform?',
      options: [
        'ArrayList + map value → index; remove by moving the last value into the hole',
        'A HashSet alone, picking a random element by iterating to a random position in it',
        'A LinkedList with a map value → node, so removal just unlinks the node in O(1)',
        'Mark removed slots as deleted and have getRandom retry until it hits a live slot',
      ],
      why: 'The array gives O(1) uniform random access, and the map finds any value\'s slot in O(1). Moving the last element into the removed slot keeps the array dense, so removal stays O(1) and getRandom stays uniform.',
    },
    time: ['O(1) average per operation', 'O(log n) per operation', 'O(n) per operation', 'O(1) insert, O(n) remove'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Removing the value that is already last', 'Inserting a value that exists (return false)', 'Removing a value that is absent (return false)'],
    approach:
      'Keep an ArrayList of values and a HashMap<value, index>. insert: if absent, append and record the index. remove: find index i, copy the last value into slot i and update its map entry, then remove the last slot and the removed value\'s entry. getRandom: list.get(random.nextInt(size)).',
  },
];

export const twoPointerProblems: CuratedProblem[] = [
  {
    slug: 'valid-palindrome', id: 125, title: 'Valid Palindrome', difficulty: 'Easy', pattern: 'two-pointers',
    brute: { text: 'Copy the alphanumerics into a new string, reverse it and compare.', time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'] },
    insight: {
      q: 'How do you check it without building a cleaned copy of the string?',
      options: [
        'Two pointers moving inward, skipping non-alphanumerics, comparing lowercased',
        'Reverse the raw string with a StringBuilder and compare it with the original',
        'Count each character; the string is a palindrome if at most one count is odd',
        'Compare the first half with the second half, reading both halves left to right',
      ],
      why: 'Mirrored positions must match after ignoring punctuation and case. Two pointers do the skipping and comparing in place, with O(1) extra space. Counting odd characters answers a different question (can it be REARRANGED into a palindrome).',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['No alphanumeric characters at all (" " is a palindrome)', 'Mixed case such as "Aa"', 'Digits next to letters ("0P" is not a palindrome)'],
    approach:
      'Set i = 0 and j = n − 1. Advance i past non-alphanumeric characters and move j back likewise. Compare Character.toLowerCase of both; on a mismatch return false. Step both inward until i >= j.',
  },
  {
    slug: 'move-zeroes', id: 283, title: 'Move Zeroes', difficulty: 'Easy', pattern: 'two-pointers',
    brute: { text: 'Find a zero, shift everything after it one place left, repeat.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'How do you move the zeroes to the end in place while keeping the other elements in order?',
      options: [
        'A write pointer: swap each non-zero into the write position and advance it',
        'Sort the array in descending order so the zeroes naturally sink to the end',
        'Whenever a zero is found, shift every later element one place to the left',
        'Swap each zero with the last element, then shrink the end of the array by one',
      ],
      why: 'The write pointer marks where the next non-zero belongs. Swapping nums[read] with nums[write] keeps non-zeros in their original order and leaves the zeroes behind them, in one O(n) pass. Shifting is O(n²); swapping with the end breaks the order.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['No zeroes', 'All zeroes', 'Zeroes already at the end'],
    approach:
      'write = 0. For each read index, if nums[read] != 0, swap nums[read] with nums[write] and increment write. Non-zeroes keep their relative order and every zero ends up after them.',
  },
  {
    slug: 'two-sum-ii-input-array-is-sorted', id: 167, title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', pattern: 'two-pointers',
    brute: { text: 'Try every pair of indices, ignoring the fact that it is sorted.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'] },
    insight: {
      q: 'The array is sorted. How do you find the pair with O(1) extra space?',
      options: [
        'Pointers at both ends: too small → move left up; too big → move right down',
        'A hash map of value → index exactly as in Two Sum, since sortedness adds nothing',
        'Binary-search for target / 2 and expand outward from that position',
        'Start both pointers at index 0 and advance whichever one points at the smaller value',
      ],
      why: 'Because the input is sorted, a sum that is too small can only grow by moving left rightward, and one that is too large only shrinks by moving right leftward; each step rules out one element for good. A hash map works too, but uses the O(n) space the problem forbids.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Negative numbers', 'The answer uses the first and last elements', 'Duplicates ([1, 1, 3], target 2)', 'Return 1-indexed positions'],
    approach:
      'lo = 0, hi = n − 1. While lo < hi: if numbers[lo] + numbers[hi] == target return [lo + 1, hi + 1] (1-indexed); if the sum is smaller, lo++; otherwise hi--.',
  },
  {
    slug: '3sum', id: 15, title: '3Sum', difficulty: 'Medium', pattern: 'two-pointers',
    brute: { text: 'Three nested loops, then filter out the duplicate triplets.', time: ['O(n³)', 'O(n²)', 'O(n log n)', 'O(n⁴)'] },
    insight: {
      q: 'How do you find all unique triplets efficiently?',
      options: [
        'Sort, fix each nums[i], run two pointers on the rest, and skip over equal values',
        'Try all triplets with three nested loops and remove duplicate triplets with a set',
        'Store every pair sum in a hash map, then look up −nums[i] for each index i',
        'Sort, then binary-search the third value for each pair; sorting rules out duplicates',
      ],
      why: 'Sorting enables an O(n) two-pointer scan per fixed element, O(n²) overall. Duplicates are avoided by skipping equal values for the fixed element and for both pointers after a match. Sorting alone does NOT prevent duplicate triplets.',
    },
    time: ['O(n²)', 'O(n³)', 'O(n log n)', 'O(n)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(n³)'],
    edgeCases: ['All zeroes ([0, 0, 0, 0] gives one triplet)', 'No triplet sums to zero', 'Many duplicates ([-2, 0, 0, 2, 2])'],
    approach:
      'Sort nums. For each i (skipping nums[i] == nums[i − 1]), search (i, n) for pairs summing to −nums[i] with lo = i + 1, hi = n − 1. On a match, record it and move both pointers past equal values. Stop early once nums[i] > 0.',
  },
  {
    slug: 'container-with-most-water', id: 11, title: 'Container With Most Water', difficulty: 'Medium', pattern: 'two-pointers',
    brute: { text: 'Compute the area for every pair of lines.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'With pointers at both ends, which pointer should move?',
      options: [
        'Move the pointer at the shorter line: it caps the area, so it can never do better',
        'The taller line, because a taller line elsewhere is the only way to raise the area',
        'Both pointers at once, since the width shrinks either way and this halves the steps',
        'Alternate between the two pointers so both sides of the array are explored evenly',
      ],
      why: 'Area = min(h[l], h[r]) × width. Moving the taller line shrinks the width without raising the minimum, so it can never help. Moving the shorter line is the only move that might.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Only two lines', 'Equal heights at both pointers (moving either is fine)', 'Lines of height 0'],
    approach:
      'Start with l = 0, r = n − 1 and track the best min(h[l], h[r]) × (r − l). Move the pointer at the shorter line inward and repeat until they meet. Every pair skipped this way uses the shorter line with less width, so it cannot beat the current area.',
  },
  {
    slug: 'sort-colors', id: 75, title: 'Sort Colors', difficulty: 'Medium', pattern: 'two-pointers',
    brute: { text: 'Hand the array to a general-purpose sort.', time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'] },
    insight: {
      q: 'How do you sort the 0s, 1s and 2s in a single pass, in place?',
      options: [
        'Dutch flag: low/mid/high; after swapping a 2 to high, don\'t advance mid',
        'Call Arrays.sort: with only three distinct values it runs in linear time',
        'Swap every 2 with the last unsorted element and step past it right away',
        'Count the 0s, 1s and 2s, then overwrite the array; one pass is not possible',
      ],
      why: 'Invariant: [0, low) are 0s, [low, mid) are 1s, (high, n) are 2s. The element swapped in from high has not been examined yet, so mid must stay put. Counting works too, but takes two passes.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Only one color present', 'Already sorted, or reverse sorted', 'A single element'],
    approach:
      'low = mid = 0, high = n − 1. While mid <= high: a 0 is swapped with nums[low] and both low and mid advance; a 1 just advances mid; a 2 is swapped with nums[high] and high decreases, with mid unchanged.',
  },
  {
    slug: 'trapping-rain-water', id: 42, title: 'Trapping Rain Water', difficulty: 'Hard', pattern: 'two-pointers',
    alsoAccept: ['monotonic-stack', 'prefix-sum'],
    brute: { text: 'For each bar, scan left and right for the tallest wall on each side.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'What decides how much water sits above bar i?',
      options: [
        'min(max height to its left, max height to its right) − height[i]',
        'The difference between height[i] and the shorter of its two immediate neighbors',
        'The tallest bar in the whole array minus height[i], if that difference is positive',
        'The distance from i to the next taller bar on its right, times height[i]',
      ],
      why: 'Water at i is bounded by the lower of the two surrounding walls. With two pointers, if leftMax < rightMax then some wall on the right is at least leftMax, so the left bar\'s water is exactly leftMax − height[l]. That gives O(n) time and O(1) space.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Fewer than three bars (no water)', 'Strictly increasing or decreasing heights', 'Flat plateaus of equal height'],
    approach:
      'Keep l, r, leftMax, rightMax. While l < r: if height[l] < height[r], update leftMax, add leftMax − height[l], l++; otherwise do the mirror on the right. Prefix/suffix max arrays or a monotonic stack also work, with O(n) space.',
  },
];

export const slidingWindowProblems: CuratedProblem[] = [
  {
    slug: 'maximum-average-subarray-i', id: 643, title: 'Maximum Average Subarray I', difficulty: 'Easy', pattern: 'sliding-window',
    brute: { text: 'Add up each window of length k from scratch.', time: ['O(n · k)', 'O(n)', 'O(n log n)', 'O(n²· k)'] },
    insight: {
      q: 'How do you get every window sum of length k efficiently?',
      options: [
        'Keep a running sum: add the entering element, subtract the leaving one',
        'Recompute each window sum from scratch, since every window holds a different set',
        'Sort the array and average the k largest values, which gives the maximum average',
        'Find the maximum element and average the k elements centered around it',
      ],
      why: 'Neighboring windows share k − 1 elements, so the next sum is the previous one plus the new element minus the one that left: O(1) per step. Sorting ignores the "contiguous" requirement.',
    },
    time: ['O(n)', 'O(n · k)', 'O(n log n)', 'O(k)'],
    space: ['O(1)', 'O(k)', 'O(n)', 'O(n · k)'],
    edgeCases: ['k equals n (one window)', 'All negative numbers', 'Return a double: avoid integer division'],
    approach:
      'Sum the first k elements. For i from k to n − 1, add nums[i] and subtract nums[i − k], tracking the maximum sum. Return maxSum / (double) k; comparing sums avoids dividing every step.',
  },
  {
    slug: 'longest-substring-without-repeating-characters', id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', pattern: 'sliding-window',
    brute: { text: 'Check every substring for repeated characters.', time: ['O(n³)', 'O(n²)', 'O(n)', 'O(n log n)'] },
    insight: {
      q: 'When the character at right is already in the window, what should happen?',
      options: [
        'Jump left past that character\'s last index (never moving left backwards)',
        'Restart the window at right, because everything before the repeat is now invalid',
        'Move left forward by exactly one position and re-check the window from there',
        'Skip the character at right and keep the current window exactly as it is',
      ],
      why: 'Storing each character\'s last index lets left jump straight past the previous occurrence. Taking max(left, last[c] + 1) stops left from moving backwards when that occurrence is already outside the window, as in "abba". Restarting at right throws away valid characters.',
    },
    vars: 'n = length of s, m = size of the character set',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(min(n, m))', 'O(n²)', 'O(n · m)', 'O(log n)'],
    edgeCases: ['Empty string', 'All characters identical ("bbbb")', 'A repeat outside the current window ("abba")', 'Spaces and symbols count as characters'],
    approach:
      'Keep lastIndex per character and a left boundary. For each right: if s[right] was seen at an index ≥ left, set left = lastIndex[s[right]] + 1. Then record lastIndex[s[right]] = right and best = max(best, right − left + 1).',
  },
  {
    slug: 'minimum-size-subarray-sum', id: 209, title: 'Minimum Size Subarray Sum', difficulty: 'Medium', pattern: 'sliding-window',
    brute: { text: 'Grow every start position, tracking the running sum.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'All values are positive. How do you find the shortest subarray with sum ≥ target?',
      options: [
        'Expand right; while sum ≥ target, record the length and shrink from the left',
        'Sort the array and add the largest values until the running sum reaches target',
        'Shrink from the left whenever the sum is below target, then expand again',
        'Use a fixed window whose size is target divided by the average element value',
      ],
      why: 'With positive numbers, adding only increases the sum and removing only decreases it, so a valid window can be shrunk greedily. Each index enters and leaves once: O(n).',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['No subarray reaches the target (return 0)', 'A single element ≥ target', 'The whole array is needed'],
    approach:
      'left = 0, sum = 0. For each right, add nums[right]; while sum ≥ target, set best = min(best, right − left + 1) and subtract nums[left++]. Return 0 if best was never updated. (The O(n log n) follow-up uses prefix sums plus binary search.)',
  },
  {
    slug: 'longest-repeating-character-replacement', id: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', pattern: 'sliding-window',
    brute: { text: 'For every substring keep letter counts and test the k limit.', time: ['O(n²)', 'O(n)', 'O(n³)', 'O(2ⁿ)'] },
    insight: {
      q: 'You may replace at most k characters. When is a window valid?',
      options: [
        'Valid when window length − (count of its most frequent letter) is at most k',
        'It contains at most k distinct letters, since each extra letter needs a replacement',
        'The number of distinct letters minus one is ≤ k, as one letter can stay unchanged',
        'Its length is at most k, because every letter in it might need to be replaced',
      ],
      why: "The cheapest way to make a window uniform is to keep its most frequent letter and replace the rest, which costs length − maxCount. maxCount never has to decrease, because only a larger maxCount can produce a longer valid window.",
    },
    vars: 'n = length of s; letters are uppercase English',
    time: ['O(n)', 'O(n²)', 'O(n² · k)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(k)', 'O(n²)'],
    edgeCases: ['k = 0', 'k ≥ length of s (answer is n)', 'All characters identical'],
    approach:
      'Slide a window with counts[26] and maxCount. For each right, increment its count and update maxCount. If (right − left + 1) − maxCount > k, decrement counts[s[left]] and advance left. The largest window seen is the answer.',
  },
  {
    slug: 'permutation-in-string', id: 567, title: 'Permutation in String', difficulty: 'Medium', pattern: 'sliding-window',
    brute: { text: 'Sort each window of length |s1| and compare it with sorted s1.', time: ['O(n · m log m)', 'O(n · m)', 'O(n)', 'O(m!)'] },
    insight: {
      q: 'How do you test whether some window of s2 is a permutation of s1?',
      options: [
        'Slide a |s1|-length window over s2, comparing letter counts',
        'Generate every permutation of s1 and check whether each one occurs in s2',
        'Check whether every letter of s1 appears somewhere in s2, in any position',
        'Sort s2 once, then binary-search it for each letter of s1 in turn',
      ],
      why: 'A permutation has exactly the same letter counts and must be a contiguous block of length |s1|. A fixed-size window changes by one letter in and one out per step, so maintaining counts (and how many of the 26 match) keeps each step O(1).',
    },
    vars: 'n = length of s2 (s1 is no longer than s2)',
    time: ['O(n)', 'O(n!)', 'O(n²)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    edgeCases: ['s1 longer than s2 (return false)', 'Repeated letters in s1 ("aab")', 'The match is at the very end of s2'],
    approach:
      "Count s1's letters in need[26]. Slide a window of length |s1| over s2, adding the entering letter to have[26] and removing the leaving one. Return true when the arrays match (or track a counter of matching letters). If |s1| > |s2|, return false.",
  },
  {
    slug: 'minimum-window-substring', id: 76, title: 'Minimum Window Substring', difficulty: 'Hard', pattern: 'sliding-window',
    brute: { text: 'Expand every start position and test each window against t.', time: ['O(m²)', 'O(m)', 'O(m log m)', 'O(m³)'] },
    insight: {
      q: 'How does the window know it contains all of t, including duplicates?',
      options: [
        'Need-counts plus a "satisfied" counter; once valid, shrink from the left',
        'Sort each window and compare it with sorted t whenever the window grows',
        'Expand until the window has as many distinct letters as t, then record it',
        'Stop at the first valid window, since later valid windows can only be longer',
      ],
      why: 'The "formed" counter rises when a character\'s window count reaches its required count, so validity is an O(1) check. Once valid, shrinking finds the smallest window ending at right; when it breaks, expand again.',
    },
    vars: 'm = length of s, n = length of t, k = size of the character set',
    time: ['O(m + n)', 'O(m · n)', 'O(m²)', 'O(m log m)'],
    space: ['O(k)', 'O(m · n)', 'O(m²)', 'O(m · k)'],
    edgeCases: ['t longer than s (return "")', 't has duplicate letters ("aa")', 'No valid window exists', 's equals t'],
    approach:
      "Count t in need; required = number of distinct characters in t. Expand right, updating window counts; when a count reaches need[c], formed++. While formed == required: record the window if it's the smallest, remove s[left] (formed-- if it drops below need), left++. Return the smallest window or \"\".",
  },
  {
    slug: 'sliding-window-maximum', id: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', pattern: 'sliding-window',
    alsoAccept: ['monotonic-stack', 'heap'],
    brute: { text: 'Scan each window of k elements for its maximum.', time: ['O(n · k)', 'O(n)', 'O(n log k)', 'O(n² · k)'] },
    insight: {
      q: "How do you get each window's maximum in O(1) amortized time?",
      options: [
        'A deque of indices with decreasing values; drop the front when it leaves',
        'A max-heap of the window, removing the leaving value with heap.remove(value)',
        'A single running maximum, replaced whenever a bigger value enters the window',
        'Sort a copy of each window and take its last element as the maximum',
      ],
      why: 'A value smaller than a newer value can never be a window maximum again, so it is discarded. The deque front is always the current maximum, and each index is pushed and popped once: O(n) overall. A single running max fails when the max leaves the window; PriorityQueue.remove(value) is O(k).',
    },
    vars: 'n = length of nums, k = window size',
    time: ['O(n)', 'O(n log n)', 'O(n · k)', 'O(n · k log k)'],
    space: ['O(k)', 'O(1)', 'O(n log n)', 'O(n · k)'],
    edgeCases: ['k = 1 (every element is its own max)', 'k equals n', 'Strictly decreasing input', 'Runs of equal values'],
    approach:
      'Maintain a deque of indices with decreasing values. For each i: pop from the back while nums[back] ≤ nums[i]; push i; pop the front if it is ≤ i − k. Once i ≥ k − 1, nums[front] is the maximum of the window ending at i.',
  },
];
