import { EXTERNAL_ID_BASE, type CuratedProblem } from '../types.ts';

// Problems that are not on LeetCode. Statements, examples and Java solutions are written for this app;
// each problem links to where it was published. The first option of every question is the correct one.

const HR = (path: string) => ({ name: 'HackerRank', url: `https://www.hackerrank.com/challenges/${path}/problem` });
const CSES = (id: number) => ({ name: 'CSES', url: `https://cses.fi/problemset/task/${id}` });

export const externalArraysA: CuratedProblem[] = [
  {
    slug: 'count-geometric-triplets', id: EXTERNAL_ID_BASE + 1, title: 'Count Geometric Triplets', difficulty: 'Medium', pattern: 'hashing',
    brute: { text: 'Try every i < j < k and test whether arr[j] = arr[i]·r and arr[k] = arr[j]·r.', time: ['O(n³)', 'O(n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'How do you count the triplets without trying every combination?',
      options: [
        'Take each element as the middle; add (count of v/r to its left) × (count of v·r to its right) using two maps',
        'Sort the array, then binary-search for v/r and v·r around every element, since sorting makes the lookups cheap',
        'Count the pairs with ratio r in one pass, then run a second pass that extends each pair by one more element',
        'Use two pointers on the sorted array, moving whichever pointer is further from the required ratio each time',
      ],
      why: 'A triplet is decided by its middle value: its first and last elements are v/r and v·r, so you only need how many of each lie on either side of it. Sorting destroys the index order i < j < k that the problem requires.',
    },
    vars: 'n = length of arr',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['r = 1, where every equal-valued triple counts (C(n, 3) of them)', 'A value not divisible by r can never be a middle element', 'The count needs a long, and v·r can overflow an int'],
    approach: 'Keep a map of how many times each value appears to the right of the current index (initially everything) and a map for the left (initially empty). For each index j: remove arr[j] from the right map, then if arr[j] is divisible by r add left[arr[j]/r] × right[arr[j]·r] to the answer, then add arr[j] to the left map. One pass, O(n).',
    external: {
      source: HR('count-triplets-1'),
      statement: '<p>Given an integer array <code>arr</code> and an integer <code>r</code>, count the triplets of indices <code>i &lt; j &lt; k</code> for which <code>arr[j] = arr[i] · r</code> and <code>arr[k] = arr[j] · r</code>.</p><p>Return the count as a <code>long</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= arr.length &lt;= 100000</code></li><li><code>1 &lt;= r</code> and <code>1 &lt;= arr[i] &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'countTriplets', params: [{ name: 'arr', type: 'integer[]' }, { name: 'r', type: 'integer' }], returns: 'long' },
      examples: [
        { input: ['[1,4,16,64]', '4'], output: '2', explain: 'Indices (0,1,2) and (1,2,3).' },
        { input: ['[1,1,1,1]', '1'], output: '4', explain: 'Any three of the four equal values: C(4,3) = 4.' },
        { input: ['[1,3,9,9,27,81]', '3'], output: '6' },
      ],
      hints: ['Fix the middle element. What do you need to know about the elements on either side of it?'],
      reference: `class Solution {
    public long countTriplets(int[] arr, int r) {
        Map<Long, Long> left = new HashMap<>(), right = new HashMap<>();
        for (int v : arr) right.merge((long) v, 1L, Long::sum);
        long total = 0;
        for (int v : arr) {
            right.merge((long) v, -1L, Long::sum);
            if (v % r == 0) total += left.getOrDefault((long) v / r, 0L) * right.getOrDefault((long) v * r, 0L);
            left.merge((long) v, 1L, Long::sum);
        }
        return total;
    }
}`,
    },
  },
  {
    slug: 'anagrammatic-substring-pairs', id: EXTERNAL_ID_BASE + 2, title: 'Anagrammatic Substring Pairs', difficulty: 'Medium', pattern: 'hashing',
    brute: { text: 'Compare every pair of substrings by sorting their letters.', time: ['O(n⁴ log n)', 'O(n²)', 'O(n³)', 'O(n log n)'] },
    insight: {
      q: 'How do you count pairs of substrings that are anagrams of each other?',
      options: [
        'Key each substring by its 26 letter counts, tally keys in a map, and add C(c, 2) for each key seen c times',
        'Sort the whole string once and count the pairs of equal adjacent characters in the sorted result of that sort',
        'Compare only substrings of equal length that start at the same index, since anagrams must line up exactly',
        'Slide a window of every size and count the windows whose first letters are equal to each other in the string',
      ],
      why: 'Two substrings are anagrams exactly when their letter counts match, so equal signatures mean anagram pairs. A group of c identical signatures contributes c·(c−1)/2 pairs.',
    },
    vars: 'n = length of s (the alphabet is 26 letters)',
    time: ['O(n²)', 'O(n log n)', 'O(n³)', 'O(n)'],
    space: ['O(n²)', 'O(n)', 'O(1)', 'O(n³)'],
    edgeCases: ['No repeated letters, so the answer is 0', 'All letters equal: every pair of equal-length substrings counts', 'A pair may overlap; only the positions need to differ'],
    approach: 'For every start index extend the end one character at a time, updating a 26-slot count array incrementally. Turn the counts into a key string and increment its entry in a HashMap. At the end sum c·(c−1)/2 over all keys. O(n²) substrings, each key built in O(26).',
    external: {
      source: HR('sherlock-and-anagrams'),
      statement: '<p>Two substrings of a string <code>s</code> are <em>anagrammatic</em> if their letters can be rearranged into each other. Count the unordered pairs of substrings, at different positions, that are anagrams of each other.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= s.length &lt;= 100</code></li><li><code>s</code> uses lowercase English letters</li></ul>',
      signature: { name: 'countAnagramPairs', params: [{ name: 's', type: 'string' }], returns: 'integer' },
      examples: [
        { input: ['"abba"'], output: '4', explain: 'a/a, b/b, ab/ba and abb/bba.' },
        { input: ['"abcd"'], output: '0' },
        { input: ['"ifailuhkqq"'], output: '3' },
      ],
      reference: `class Solution {
    public int countAnagramPairs(String s) {
        Map<String, Integer> seen = new HashMap<>();
        int n = s.length();
        for (int i = 0; i < n; i++) {
            int[] cnt = new int[26];
            for (int j = i; j < n; j++) {
                cnt[s.charAt(j) - 'a']++;
                seen.merge(Arrays.toString(cnt), 1, Integer::sum);
            }
        }
        int pairs = 0;
        for (int c : seen.values()) pairs += c * (c - 1) / 2;
        return pairs;
    }
}`,
    },
  },
  {
    slug: 'array-subset-check', id: EXTERNAL_ID_BASE + 3, title: 'Is One Array a Subset of Another', difficulty: 'Easy', pattern: 'hashing',
    brute: { text: 'For each element of b, scan a for an unused match.', time: ['O(n·m)', 'O(n + m)', 'O(n log n)', 'O(m)'] },
    insight: {
      q: 'How do you check that every element of b appears in a, counting repeats?',
      options: [
        'Count a\'s elements in a HashMap, then decrement for each element of b; fail if a count would go below zero',
        'Sort both arrays and compare the first m elements of the sorted a with the sorted b, which is enough to decide',
        'Compare the sum of b with the sum of the matching positions of a, since equal values give equal sums every time',
        'Check only that max(b) ≤ max(a) and min(b) ≥ min(a), because every value in between must then exist in a',
      ],
      why: 'A frequency map answers "is there still an unused copy of this value?" in O(1). Ranges and sums say nothing about which values are present.',
    },
    vars: 'n = length of a, m = length of b',
    time: ['O(n + m)', 'O(n·m)', 'O(n log n)', 'O(m²)'],
    space: ['O(n)', 'O(1)', 'O(m)', 'O(n + m)'],
    edgeCases: ['b is empty, which is always a subset', 'b has more copies of a value than a does', 'b is longer than a'],
    approach: 'Build a count map from a. For each value in b, look it up; if it is missing or its count is already 0 return false, otherwise decrement it. If every element of b was matched, return true. O(n + m) time, O(n) space.',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/find-whether-an-array-is-subset-of-another-array-set-1/' },
      statement: '<p>Given two integer arrays <code>a</code> and <code>b</code>, return <code>true</code> if every element of <code>b</code> can be matched with a different element of <code>a</code> that has the same value (so repeated values must be repeated in <code>a</code> too).</p><p><strong>Constraints:</strong></p><ul><li><code>0 &lt;= b.length, a.length &lt;= 100000</code></li></ul>',
      signature: { name: 'isSubset', params: [{ name: 'a', type: 'integer[]' }, { name: 'b', type: 'integer[]' }], returns: 'boolean' },
      examples: [
        { input: ['[11,1,13,21,3,7]', '[11,3,7,1]'], output: 'true' },
        { input: ['[10,5,2,23,19]', '[19,5,3]'], output: 'false', explain: '3 is not in a.' },
        { input: ['[1,2,2]', '[2,2,2]'], output: 'false', explain: 'a has only two 2s.' },
      ],
      reference: `class Solution {
    public boolean isSubset(int[] a, int[] b) {
        Map<Integer, Integer> cnt = new HashMap<>();
        for (int v : a) cnt.merge(v, 1, Integer::sum);
        for (int v : b) {
            int c = cnt.getOrDefault(v, 0);
            if (c == 0) return false;
            cnt.put(v, c - 1);
        }
        return true;
    }
}`,
    },
  },
  {
    slug: 'array-manipulation-range-add', id: EXTERNAL_ID_BASE + 4, title: 'Array Manipulation (Range Adds)', difficulty: 'Medium', pattern: 'prefix-sum',
    brute: { text: 'Apply every query by looping over its whole range, then take the maximum.', time: ['O(n·q)', 'O(n + q)', 'O(q log q)', 'O(n)'] },
    insight: {
      q: 'Each query adds k to a range. How do you apply them all cheaply?',
      options: [
        'Use a difference array: add k at the range start, subtract k just past the end, then take one running sum over it',
        'Sort the queries by start index and merge the overlapping ranges, adding their k values together as they merge',
        'Keep a HashMap from index to value and update only the indexes that appear in some query, since the rest stay 0',
        'Binary-search the answer and check whether some index can reach that value by counting the ranges covering it',
      ],
      why: 'Writing +k at the start and −k after the end makes each query O(1). A single prefix-sum pass then rebuilds every cell, and the maximum is read off during that pass.',
    },
    vars: 'n = array length, q = number of queries',
    time: ['O(n + q)', 'O(n·q)', 'O(q log q)', 'O(n log n)'],
    space: ['O(n)', 'O(1)', 'O(q)', 'O(n + q)'],
    edgeCases: ['Values overflow int, so use long', 'A range that ends at n, so the "subtract" index is n + 1', 'Queries that do not overlap'],
    approach: 'Allocate a long array d of size n + 2. For each query (a, b, k): d[a] += k and d[b + 1] -= k. Sweep i from 1 to n keeping a running sum; the largest running sum is the answer. O(n + q).',
    external: {
      source: HR('crush'),
      statement: '<p>Start with an array of <code>n</code> zeros, indexed from 1. Each query is <code>[a, b, k]</code> and adds <code>k</code> to every element from index <code>a</code> to <code>b</code> inclusive.</p><p>After all queries, return the largest value in the array (as a <code>long</code>).</p><p><strong>Constraints:</strong></p><ul><li><code>3 &lt;= n &lt;= 10<sup>7</sup></code></li><li><code>1 &lt;= queries.length &lt;= 2·10<sup>5</sup></code></li><li><code>1 &lt;= a &lt;= b &lt;= n</code>, <code>0 &lt;= k &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'arrayManipulation', params: [{ name: 'n', type: 'integer' }, { name: 'queries', type: 'integer[][]' }], returns: 'long' },
      examples: [
        { input: ['5', '[[1,2,100],[2,5,100],[3,4,100]]'], output: '200', explain: 'Index 2 and 3 end up with 200.' },
        { input: ['10', '[[1,5,3],[4,8,7],[6,9,1]]'], output: '10', explain: 'Indexes 4 and 5 get 3 + 7.' },
      ],
      reference: `class Solution {
    public long arrayManipulation(int n, int[][] queries) {
        long[] d = new long[n + 2];
        for (int[] q : queries) {
            d[q[0]] += q[2];
            d[q[1] + 1] -= q[2];
        }
        long best = 0, run = 0;
        for (int i = 1; i <= n; i++) {
            run += d[i];
            best = Math.max(best, run);
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'items-in-containers', id: EXTERNAL_ID_BASE + 5, title: 'Items in Containers', difficulty: 'Medium', pattern: 'prefix-sum',
    brute: { text: 'For each query, scan the substring to find its first and last bar and count the stars between them.', time: ['O(n·q)', 'O(n + q)', 'O(q log n)', 'O(n)'] },
    insight: {
      q: 'There are many queries on the same string. What do you precompute?',
      options: [
        'Precompute a prefix count of stars plus, for every index, the nearest bar to its right and to its left',
        'Sort the queries by start index and answer them all with one sweep over the string, resetting the count at each bar',
        'Build a segment tree over the characters and rebuild the relevant nodes again for every single query that arrives',
        'Store every substring of s in a set so that each query becomes a lookup of its range in that set of substrings',
      ],
      why: 'For query [l, r], the first usable bar is the nearest bar at or after l, and the last is the nearest at or before r. If the first comes before the last, the stars between them are a difference of two prefix counts.',
    },
    vars: 'n = length of s, q = number of queries',
    time: ['O(n + q)', 'O(n·q)', 'O(q log n)', 'O(n²)'],
    space: ['O(n)', 'O(1)', 'O(q)', 'O(n²)'],
    edgeCases: ['Fewer than two bars inside the range', 'A range with bars at its very ends', 'A range with no stars between its bars'],
    approach: 'Build starsBefore[i] (stars in s[0..i)), nextBar[i] (index of the first bar at or after i) and prevBar[i] (last bar at or before i). For a 1-indexed query [l, r] use 0-indexed l−1 and r−1: lo = nextBar[l−1], hi = prevBar[r−1]; if lo < hi the answer is starsBefore[hi] − starsBefore[lo], else 0.',
    external: {
      source: { name: 'LeetCode Discuss', url: 'https://leetcode.com/discuss/interview-question?currentPage=1&orderBy=hot&query=items%20in%20containers' },
      statement: '<p>A string <code>s</code> consists of <code>|</code> (a container wall) and <code>*</code> (an item). An item is <em>inside a container</em> when it lies between two walls.</p><p>Each query <code>[l, r]</code> (1-indexed, inclusive) looks only at the substring <code>s[l..r]</code>. For each query, return how many items in that substring lie between the first wall and the last wall <em>of the substring</em>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= s.length &lt;= 10<sup>5</sup></code>, <code>1 &lt;= queries.length &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'itemsInContainers', params: [{ name: 's', type: 'string' }, { name: 'queries', type: 'integer[][]' }], returns: 'integer[]' },
      examples: [
        { input: ['"*|*|"', '[[1,1],[1,4]]'], output: '[0,1]' },
        { input: ['"|**|*|*"', '[[1,5],[1,3]]'], output: '[2,0]', explain: 'The first substring is "|**|*" with walls at 1 and 4. The second, "|**", has only one wall.' },
        { input: ['"*|*|*|"', '[[1,6]]'], output: '[2]' },
      ],
      reference: `class Solution {
    public int[] itemsInContainers(String s, int[][] queries) {
        int n = s.length();
        int[] stars = new int[n + 1];
        int[] next = new int[n + 1];
        int[] prev = new int[n];
        for (int i = 0; i < n; i++) stars[i + 1] = stars[i] + (s.charAt(i) == '*' ? 1 : 0);
        next[n] = n;
        for (int i = n - 1; i >= 0; i--) next[i] = s.charAt(i) == '|' ? i : next[i + 1];
        int last = -1;
        for (int i = 0; i < n; i++) {
            if (s.charAt(i) == '|') last = i;
            prev[i] = last;
        }
        int[] out = new int[queries.length];
        for (int k = 0; k < queries.length; k++) {
            int lo = next[queries[k][0] - 1], hi = prev[queries[k][1] - 1];
            out[k] = (lo < n && hi >= 0 && lo < hi) ? stars[hi] - stars[lo] : 0;
        }
        return out;
    }
}`,
    },
  },
  {
    slug: 'subarrays-with-given-xor', id: EXTERNAL_ID_BASE + 6, title: 'Subarrays With Given XOR', difficulty: 'Medium', pattern: 'prefix-sum', alsoAccept: ['hashing'],
    brute: { text: 'XOR every subarray, extending the end one element at a time, and count the matches.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'How do you count subarrays whose XOR equals b without checking each one?',
      options: [
        'Keep a running prefix XOR and a map of how often each prefix has occurred; add map[prefix ^ b] at every step',
        'Sort the array and use two pointers, since the XOR of a sorted window only grows as the window gets longer',
        'Track the running sum instead of the XOR, then compare that sum with b at every index in a single pass',
        'Use a sliding window and shrink it from the left whenever the XOR of the window rises above the value b',
      ],
      why: 'The XOR of a[i..j] is prefix[j] ^ prefix[i−1], so it equals b exactly when prefix[i−1] = prefix[j] ^ b. A frequency map of earlier prefixes counts those i in O(1). Neither sorting nor a sliding window works, because XOR is not monotonic.',
    },
    vars: 'n = length of a',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n·32)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['The empty prefix: seed the map with {0: 1} so subarrays starting at index 0 count', 'b = 0', 'All elements equal'],
    approach: 'Seed a map with {0: 1}. Walk the array maintaining px, the XOR of everything so far. Before recording px add map[px ^ b] to the answer, then increment map[px]. O(n).',
    external: {
      source: { name: 'InterviewBit', url: 'https://www.interviewbit.com/problems/subarray-with-given-xor/' },
      statement: '<p>Given an integer array <code>a</code> and an integer <code>b</code>, return the number of subarrays of <code>a</code> whose elements XOR together to <code>b</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 10<sup>5</sup></code></li><li><code>0 &lt;= a[i], b &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'countSubarraysWithXor', params: [{ name: 'a', type: 'integer[]' }, { name: 'b', type: 'integer' }], returns: 'integer' },
      examples: [
        { input: ['[4,2,2,6,4]', '6'], output: '4', explain: '[4,2], [4,2,2,6,4], [2,2,6] and [6].' },
        { input: ['[5,6,7,8,9]', '5'], output: '2', explain: '[5] and the whole array.' },
      ],
      reference: `class Solution {
    public int countSubarraysWithXor(int[] a, int b) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int px = 0, total = 0;
        for (int v : a) {
            px ^= v;
            total += seen.getOrDefault(px ^ b, 0);
            seen.merge(px, 1, Integer::sum);
        }
        return total;
    }
}`,
    },
  },
  {
    slug: 'distinct-elements-in-every-window', id: EXTERNAL_ID_BASE + 7, title: 'Distinct Elements in Every Window', difficulty: 'Medium', pattern: 'sliding-window', alsoAccept: ['hashing'],
    brute: { text: 'For every window of size k, put its elements in a set and read its size.', time: ['O(n·k)', 'O(n)', 'O(n log k)', 'O(k)'] },
    insight: {
      q: 'Consecutive windows share k−1 elements. How do you reuse that?',
      options: [
        'Keep a frequency map of the window: add the entering value, remove the leaving one, drop keys that hit 0',
        'Rebuild a HashSet from scratch for each window, then read off its size, since that is exactly the definition',
        'Sort each window and count the positions where a value differs from its neighbour, as in a duplicate check',
        'Keep a monotonic deque of the largest values in the window and report its size at every step along the way',
      ],
      why: 'Sliding changes only two elements, so updating counts is O(1) per step. The number of keys in the map is the distinct count. The deque is the tool for window maximum, not distinct counts.',
    },
    vars: 'n = length of nums, k = window size',
    time: ['O(n)', 'O(n·k)', 'O(n log k)', 'O(n²)'],
    space: ['O(k)', 'O(1)', 'O(n)', 'O(n·k)'],
    edgeCases: ['k = 1, so every window has exactly 1 distinct value', 'k = n, one window', 'Removing a value whose count is greater than 1 must not delete its key'],
    approach: 'Count the first k elements in a HashMap and record map.size(). Then for each i from k to n−1: increment nums[i], decrement nums[i−k] (removing the key at 0), and record map.size(). O(n) time, O(k) space.',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/count-distinct-elements-in-every-window-of-size-k/' },
      statement: '<p>Given an integer array <code>nums</code> and a window size <code>k</code>, return an array whose <code>i</code>-th entry is the number of <em>distinct</em> values in the window <code>nums[i..i+k-1]</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= k &lt;= nums.length &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'distinctInWindows', params: [{ name: 'nums', type: 'integer[]' }, { name: 'k', type: 'integer' }], returns: 'integer[]' },
      examples: [
        { input: ['[1,2,1,3,4,2,3]', '4'], output: '[3,4,4,3]' },
        { input: ['[4,1,1]', '2'], output: '[2,1]' },
        { input: ['[7,7,7]', '3'], output: '[1]' },
      ],
      reference: `class Solution {
    public int[] distinctInWindows(int[] nums, int k) {
        int n = nums.length;
        int[] out = new int[n - k + 1];
        Map<Integer, Integer> cnt = new HashMap<>();
        for (int i = 0; i < k; i++) cnt.merge(nums[i], 1, Integer::sum);
        out[0] = cnt.size();
        for (int i = k; i < n; i++) {
            cnt.merge(nums[i], 1, Integer::sum);
            int gone = nums[i - k];
            if (cnt.merge(gone, -1, Integer::sum) == 0) cnt.remove(gone);
            out[i - k + 1] = cnt.size();
        }
        return out;
    }
}`,
    },
  },
  {
    slug: 'smallest-window-with-all-distinct-characters', id: EXTERNAL_ID_BASE + 8, title: 'Smallest Window With All Distinct Characters', difficulty: 'Medium', pattern: 'sliding-window',
    brute: { text: 'Check every substring and keep the shortest one that contains every distinct character.', time: ['O(n³)', 'O(n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'You need the shortest substring containing every distinct letter of s. What is the standard technique?',
      options: [
        'Grow the right end until the window holds every distinct letter, then shrink the left end while it still does',
        'Sort the characters and take the distinct ones in order as the window, which gives the shortest span directly',
        'Binary-search the window length and test just one window of that length, since feasibility is monotonic here',
        'Take the substring between the first and the last occurrence of the rarest letter, which must contain the rest',
      ],
      why: 'Once a window is valid, any shorter valid window with the same right end must start further right, so shrink from the left. Each index enters and leaves once, so the whole scan is linear.',
    },
    vars: 'n = length of s; the alphabet is bounded (256 characters)',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['All characters equal, so the answer is 1', 'All characters distinct, so the answer is n', 'The shortest window sits at the very end'],
    approach: 'Count the distinct characters D in s. Sweep the right pointer, counting each character in a window array and tracking how many distinct characters are present. While that equals D, record the window length and move the left pointer, decrementing counts. Return the smallest length seen.',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/smallest-window-contains-characters-string/' },
      statement: '<p>Return the length of the shortest substring of <code>s</code> that contains <em>every distinct character</em> that appears in <code>s</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= s.length &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'smallestWindow', params: [{ name: 's', type: 'string' }], returns: 'integer' },
      examples: [
        { input: ['"aabcbcdbca"'], output: '4', explain: '"dbca" has a, b, c and d.' },
        { input: ['"aaab"'], output: '2' },
        { input: ['"abc"'], output: '3' },
      ],
      reference: `class Solution {
    public int smallestWindow(String s) {
        int n = s.length();
        boolean[] present = new boolean[256];
        int distinct = 0;
        for (int i = 0; i < n; i++) {
            if (!present[s.charAt(i)]) { present[s.charAt(i)] = true; distinct++; }
        }
        int[] cnt = new int[256];
        int have = 0, best = n, left = 0;
        for (int right = 0; right < n; right++) {
            if (cnt[s.charAt(right)]++ == 0) have++;
            while (have == distinct) {
                best = Math.min(best, right - left + 1);
                if (--cnt[s.charAt(left++)] == 0) have--;
            }
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'apartments', id: EXTERNAL_ID_BASE + 9, title: 'Apartments', difficulty: 'Medium', pattern: 'two-pointers', alsoAccept: ['greedy'],
    brute: { text: 'Try every way of assigning apartments to applicants and keep the largest valid matching.', time: ['O(n!)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'Each applicant accepts any apartment within k of their wish. How do you match as many as possible?',
      options: [
        'Sort both lists and walk two pointers: match when the sizes are within k, otherwise advance the smaller one',
        'Give each applicant the apartment closest to their wish, processing the applicants in the order they are given',
        'Match the largest applicant with the largest apartment first, whatever the gap between their sizes happens to be',
        'Build every compatible pair and then remove pairs at random until no applicant or apartment is used twice',
      ],
      why: 'After sorting, if the apartment is too small for the current applicant it is too small for every later applicant too, so it can be discarded; if it is too large, the applicant can never be satisfied by it or a larger one. Every step discards one item, so greedy two pointers is optimal.',
    },
    vars: 'n = applicants, m = apartments',
    time: ['O(n log n + m log m)', 'O(n·m)', 'O(n + m)', 'O(n!)'],
    space: ['O(1)', 'O(n + m)', 'O(n)', 'O(n·m)'],
    edgeCases: ['k = 0, so only exact sizes match', 'More applicants than apartments, and the reverse', 'Duplicate sizes'],
    approach: 'Sort desired and sizes. With pointers i (applicant) and j (apartment): if |desired[i] − sizes[j]| ≤ k, count a match and advance both; else if sizes[j] < desired[i] − k advance j (too small for anyone left); otherwise advance i (too big for this applicant). O(n log n + m log m).',
    external: {
      source: CSES(1084),
      statement: '<p>There are <code>n</code> applicants, each with a desired apartment size <code>desired[i]</code>, and <code>m</code> apartments with sizes <code>sizes[j]</code>. An applicant accepts an apartment whose size differs from their desired size by at most <code>k</code>.</p><p>Each apartment can go to at most one applicant. Return the largest number of applicants that can get an apartment.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n, m &lt;= 2·10<sup>5</sup></code>, <code>0 &lt;= k &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'maxApartments', params: [{ name: 'desired', type: 'integer[]' }, { name: 'sizes', type: 'integer[]' }, { name: 'k', type: 'integer' }], returns: 'integer' },
      examples: [
        { input: ['[60,45,80,60]', '[30,60,75]', '5'], output: '2', explain: '60 takes 60 and 80 takes 75.' },
        { input: ['[1,2,3]', '[1,2,3]', '0'], output: '3' },
        { input: ['[10]', '[20]', '5'], output: '0' },
      ],
      reference: `class Solution {
    public int maxApartments(int[] desired, int[] sizes, int k) {
        int[] a = desired.clone(), b = sizes.clone();
        Arrays.sort(a);
        Arrays.sort(b);
        int i = 0, j = 0, matched = 0;
        while (i < a.length && j < b.length) {
            if (Math.abs(a[i] - b[j]) <= k) { matched++; i++; j++; }
            else if (b[j] < a[i]) j++;
            else i++;
        }
        return matched;
    }
}`,
    },
  },
  {
    slug: 'closest-sum-pair-in-two-sorted-arrays', id: EXTERNAL_ID_BASE + 10, title: 'Closest Sum Pair From Two Sorted Arrays', difficulty: 'Medium', pattern: 'two-pointers',
    brute: { text: 'Try every pair (a[i], b[j]) and keep the one whose sum is closest to x.', time: ['O(n·m)', 'O(n + m)', 'O(n log m)', 'O(n)'] },
    insight: {
      q: 'Both arrays are sorted. How do you find the pair whose sum is nearest x in linear time?',
      options: [
        'Start at the smallest a and the largest b: if the sum is too big move the b pointer down, otherwise move a up',
        'Binary-search both arrays for x / 2, since the best pair must have both of its elements near half the target',
        'Merge the two arrays into one sorted array and pick the two middle elements as the closest pair to the target x',
        'Take the largest element of each array, because larger sums are always closer to the target than smaller ones',
      ],
      why: 'With the smallest a and largest b, a sum above x can only improve by shrinking b, and a sum below x only by growing a. Each step discards a whole row or column of candidate pairs, so the scan is O(n + m).',
    },
    vars: 'n = length of a, m = length of b',
    time: ['O(n + m)', 'O(n·m)', 'O(n log m)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(n + m)', 'O(log n)'],
    edgeCases: ['An exact sum of x exists', 'One array has a single element', 'Negative values'],
    approach: 'Set i = 0 and j = m − 1. At each step compute s = a[i] + b[j]; if |s − x| beats the best so far record the pair. If s > x do j−−, if s < x do i++, and if s == x return that pair immediately. O(n + m).',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/given-two-sorted-arrays-number-x-find-pair-whose-sum-closest-x/' },
      statement: '<p>Given two sorted integer arrays <code>a</code> and <code>b</code> and a target <code>x</code>, pick one element from each so that the sum is as close to <code>x</code> as possible. Return the pair as <code>[fromA, fromB]</code>.</p><p>It is guaranteed that exactly one pair is closest.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length, b.length &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'closestPair', params: [{ name: 'a', type: 'integer[]' }, { name: 'b', type: 'integer[]' }, { name: 'x', type: 'integer' }], returns: 'integer[]' },
      examples: [
        { input: ['[1,4,5,7]', '[10,20,30,40]', '32'], output: '[1,30]', explain: '1 + 30 = 31, which is off by 1.' },
        { input: ['[1,2,3]', '[4,5,6]', '9'], output: '[3,6]', explain: 'An exact match.' },
      ],
      reference: `class Solution {
    public int[] closestPair(int[] a, int[] b, int x) {
        int i = 0, j = b.length - 1;
        long bestDiff = Long.MAX_VALUE;
        int[] best = new int[2];
        while (i < a.length && j >= 0) {
            long s = (long) a[i] + b[j];
            long diff = Math.abs(s - x);
            if (diff < bestDiff) { bestDiff = diff; best[0] = a[i]; best[1] = b[j]; }
            if (s > x) j--;
            else if (s < x) i++;
            else break;
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'aggressive-cows', id: EXTERNAL_ID_BASE + 11, title: 'Aggressive Cows', difficulty: 'Medium', pattern: 'binary-search',
    brute: { text: 'Try every possible minimum distance from 1 upward and test whether the cows fit.', time: ['O(D·n)', 'O(n log D)', 'O(n log n)', 'O(n)'] },
    insight: {
      q: 'You want to maximise the smallest gap between cows. What makes this a binary-search problem?',
      options: [
        'Feasibility is monotonic in the gap d, so binary-search d and check each candidate with a greedy placement',
        'The stalls are sorted, so binary-search the stall index where each next cow should be placed in turn',
        'The answer is always the total span divided by the number of cows, rounded down to a whole stall gap',
        'Only dynamic programming over the stall index and the cows placed so far can give the exact optimum here',
      ],
      why: 'For a fixed gap d, placing each cow in the first stall at least d beyond the previous one is optimal and checks feasibility in O(n). Since feasibility only gets harder as d grows, binary search over d finds the largest feasible value.',
    },
    vars: 'n = number of stalls, D = largest stall position minus the smallest',
    time: ['O(n log n + n log D)', 'O(n·D)', 'O(n²)', 'O(n log n)'],
    space: ['O(1)', 'O(n)', 'O(D)', 'O(log n)'],
    edgeCases: ['Unsorted input: sort first', 'As many cows as stalls', 'Only two cows, so the answer is the full span'],
    approach: 'Sort the stalls. Binary-search d between 1 and (last − first). For a candidate d place the first cow in stall 0 and each next cow in the first stall at least d further on; if all c cows are placed d is feasible, so search higher, otherwise lower. Return the largest feasible d.',
    external: {
      source: { name: 'SPOJ', url: 'https://www.spoj.com/problems/AGGRCOW/' },
      statement: '<p>A farmer has <code>n</code> stalls at the given positions on a line, and <code>c</code> cows to place, at most one per stall. The cows dislike each other, so he wants to <strong>maximise the smallest distance</strong> between any two cows.</p><p>Return that largest possible smallest distance.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= c &lt;= n &lt;= 10<sup>5</sup></code></li><li><code>0 &lt;= stalls[i] &lt;= 10<sup>9</sup></code>, positions are distinct and may be unsorted</li></ul>',
      signature: { name: 'aggressiveCows', params: [{ name: 'stalls', type: 'integer[]' }, { name: 'c', type: 'integer' }], returns: 'integer' },
      examples: [
        { input: ['[1,2,4,8,9]', '3'], output: '3', explain: 'Cows at 1, 4 and 8 (or 9).' },
        { input: ['[10,1,2,7,5]', '3'], output: '4', explain: 'Cows at 1, 5 and 10.' },
        { input: ['[1,2]', '2'], output: '1' },
      ],
      reference: `class Solution {
    public int aggressiveCows(int[] stalls, int c) {
        int[] s = stalls.clone();
        Arrays.sort(s);
        int lo = 1, hi = s[s.length - 1] - s[0], best = 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int placed = 1, last = s[0];
            for (int i = 1; i < s.length && placed < c; i++) {
                if (s[i] - last >= mid) { placed++; last = s[i]; }
            }
            if (placed >= c) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        return best;
    }
}`,
    },
  },
  {
    slug: 'median-of-row-wise-sorted-matrix', id: EXTERNAL_ID_BASE + 12, title: 'Median of a Row-Wise Sorted Matrix', difficulty: 'Hard', pattern: 'binary-search',
    brute: { text: 'Copy every element into one array, sort it and take the middle.', time: ['O(r·c log(r·c))', 'O(r·c)', 'O(r log c · log V)', 'O(c)'] },
    insight: {
      q: 'Each row is sorted but the rows are not related. How do you find the median without sorting everything?',
      options: [
        'Binary-search the median value; for each mid, count the elements ≤ mid with a binary search inside every row',
        'Take the middle element of the middle row, since each row is sorted and the rows are about the same size',
        'Merge the first element of each row with a heap, popping one element at a time until the median is reached',
        'Flatten the matrix into one array and run quickselect on it, since the row ordering gives no useful help',
      ],
      why: 'The median is the smallest value v such that at least (r·c + 1)/2 elements are ≤ v. That count is monotonic in v, and each row contributes it by one binary search, so searching the value range costs O(r log c log V).',
    },
    vars: 'r = rows, c = columns, V = range of values',
    time: ['O(r · log c · log V)', 'O(r·c log(r·c))', 'O(r·c)', 'O(c log r)'],
    space: ['O(1)', 'O(r·c)', 'O(r)', 'O(log V)'],
    edgeCases: ['A single row or single column', 'All elements equal', 'r × c is odd, as guaranteed, so there is a unique middle'],
    approach: 'Let lo be the smallest first-column value and hi the largest last-column value. While lo < hi take mid; count, over all rows, the elements ≤ mid with upper-bound binary search. If the count is below (r·c + 1)/2 the median is larger (lo = mid + 1) otherwise hi = mid. Return lo.',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/find-median-row-wise-sorted-matrix/' },
      statement: '<p>You are given an <code>r × c</code> matrix whose rows are each sorted in non-decreasing order (rows are independent of one another). <code>r · c</code> is odd.</p><p>Return the median of all the elements.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= r, c &lt;= 400</code></li><li><code>1 &lt;= matrix[i][j] &lt;= 10<sup>6</sup></code></li></ul>',
      signature: { name: 'matrixMedian', params: [{ name: 'matrix', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['[[1,3,5],[2,6,9],[3,6,9]]'], output: '5', explain: 'Sorted: 1,2,3,3,5,6,6,9,9.' },
        { input: ['[[1],[2],[3]]'], output: '2' },
        { input: ['[[1,3,8],[2,3,4],[1,2,5]]'], output: '3' },
      ],
      reference: `class Solution {
    public int matrixMedian(int[][] m) {
        int r = m.length, c = m[0].length;
        int lo = Integer.MAX_VALUE, hi = Integer.MIN_VALUE;
        for (int[] row : m) { lo = Math.min(lo, row[0]); hi = Math.max(hi, row[c - 1]); }
        int need = (r * c + 1) / 2;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, count = 0;
            for (int[] row : m) {
                int l = 0, h = c;
                while (l < h) { int mm = (l + h) >>> 1; if (row[mm] <= mid) l = mm + 1; else h = mm; }
                count += l;
            }
            if (count < need) lo = mid + 1; else hi = mid;
        }
        return lo;
    }
}`,
    },
  },
  {
    slug: 'equal-stacks', id: EXTERNAL_ID_BASE + 13, title: 'Equal Stacks', difficulty: 'Easy', pattern: 'stack',
    brute: { text: 'Try removing every possible number of tops from each of the three stacks.', time: ['O(n³)', 'O(n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'You may only pop tops, and the stacks must end with equal total height that is as large as possible. What do you pop?',
      options: [
        'Pop from whichever stack is currently the tallest, until all three heights are equal (or one becomes empty)',
        'Always pop from the stack that holds the most cylinders, since it has the most material left to give up',
        'Pop one cylinder from each of the three stacks in turn, so that they all shrink at the same steady rate',
        'Pop from the shortest stack so that it is never the bottleneck, and stop as soon as its height is reached',
      ],
      why: 'Any common final height must be reached by removing cylinders from every taller stack, and removing from a stack that is not tallest can never help it reach the common height sooner. Greedily trimming the tallest stack finds the highest equal height, and each cylinder is popped at most once.',
    },
    vars: 'n = total number of cylinders',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['All three are already equal', 'The only common height is 0', 'An empty stack'],
    approach: 'Compute the three total heights. While they are not all equal, pop the top cylinder from whichever stack is tallest (keep an index into each array instead of mutating it). When the heights match return that height. If any stack empties the common height is 0.',
    external: {
      source: HR('equal-stacks'),
      statement: '<p>Three stacks of cylinders are given as arrays, <em>listed from top to bottom</em>. Each entry is a cylinder\'s height.</p><p>You may remove the top cylinder of any stack as many times as you like. Return the largest height at which all three stacks can be made equal (it may be 0).</p><p><strong>Constraints:</strong></p><ul><li>Each stack has between 0 and 10<sup>5</sup> cylinders, each of height 1 to 100</li></ul>',
      signature: { name: 'equalStacks', params: [{ name: 'h1', type: 'integer[]' }, { name: 'h2', type: 'integer[]' }, { name: 'h3', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[3,2,1,1,1]', '[4,3,2]', '[1,1,4,1]'], output: '5' },
        { input: ['[5]', '[5]', '[5]'], output: '5' },
        { input: ['[1]', '[2]', '[3]'], output: '0' },
      ],
      reference: `class Solution {
    public int equalStacks(int[] h1, int[] h2, int[] h3) {
        int[][] st = {h1, h2, h3};
        int[] idx = new int[3];
        int[] sum = new int[3];
        for (int k = 0; k < 3; k++) for (int v : st[k]) sum[k] += v;
        while (!(sum[0] == sum[1] && sum[1] == sum[2])) {
            int tall = 0;
            for (int k = 1; k < 3; k++) if (sum[k] > sum[tall]) tall = k;
            if (idx[tall] == st[tall].length) return 0;
            sum[tall] -= st[tall][idx[tall]++];
        }
        return sum[0];
    }
}`,
    },
  },
  {
    slug: 'nearest-smaller-values', id: EXTERNAL_ID_BASE + 14, title: 'Nearest Smaller Values', difficulty: 'Medium', pattern: 'monotonic-stack',
    brute: { text: 'For each element scan leftwards until a smaller one is found.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'] },
    insight: {
      q: 'For every element you need the nearest smaller element on its left. How do you do it in one pass?',
      options: [
        'Keep a stack of indices with increasing values; pop while the top is not smaller, and the top is the answer',
        'Sort the elements and take the neighbour in sorted order, which is always the nearest smaller value of all',
        'Keep a min-heap of everything seen so far and read its top, since that holds the smallest earlier element',
        'Binary-search the prefix to the left of each element, treating that prefix as if it were already sorted',
      ],
      why: 'An element that is not smaller than the current one can never be the nearest smaller for the current element or anything after it, so it can be popped for good. Each index is pushed and popped once.',
    },
    vars: 'n = length of a',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n·k)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Equal values: "smaller" is strict, so equal elements are popped', 'No smaller element exists, answer 0', 'A strictly increasing array'],
    approach: 'Walk left to right with a stack of 1-indexed positions. For each a[i], pop while a[stack.top] ≥ a[i]; the answer for i is the stack top (or 0 if the stack is empty). Then push i. Each element is pushed and popped at most once.',
    external: {
      source: CSES(1645),
      statement: '<p>For each position <code>i</code> of an integer array <code>a</code>, find the <strong>position</strong> (1-indexed) of the nearest element to its left that is <em>strictly smaller</em> than <code>a[i]</code>. If there is none, use 0.</p><p>Return one answer per position.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 2·10<sup>5</sup></code>, <code>1 &lt;= a[i] &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'nearestSmallerLeft', params: [{ name: 'a', type: 'integer[]' }], returns: 'integer[]' },
      examples: [
        { input: ['[2,5,1,4,8,3,2,5]'], output: '[0,1,0,3,4,3,3,7]' },
        { input: ['[1,1,1]'], output: '[0,0,0]', explain: 'Equal is not smaller.' },
      ],
      reference: `class Solution {
    public int[] nearestSmallerLeft(int[] a) {
        int n = a.length;
        int[] out = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[st.peek() - 1] >= a[i]) st.pop();
            out[i] = st.isEmpty() ? 0 : st.peek();
            st.push(i + 1);
        }
        return out;
    }
}`,
    },
  },
  {
    slug: 'max-of-minimums-for-every-window-size', id: EXTERNAL_ID_BASE + 15, title: 'Maximum of Minimums for Every Window Size', difficulty: 'Hard', pattern: 'monotonic-stack',
    brute: { text: 'For each size k, slide a window, take every window minimum and keep the largest.', time: ['O(n³)', 'O(n)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'You need, for every window size k, the best window minimum. What do you compute for each element?',
      options: [
        'Find each element\'s widest minimum window with a monotonic stack, then fill the sizes down from the widest',
        'Rank every element in the sorted array and report that rank for each window size from one up to n, in order',
        'Compute the distance from each element to its nearest equal element and use that distance as the window size',
        'Build a prefix sum of the elements, since the minimum of a window can be recovered from its sum alone',
      ],
      why: 'Element a[i] is the minimum of every window inside (prevSmaller, nextSmaller), the widest being length len. So ans[len] ≥ a[i]. A window of size k − 1 inside a window of size k has an equal or larger minimum, so sweeping sizes downward with ans[k] = max(ans[k], ans[k+1]) completes the table.',
    },
    vars: 'n = length of a',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['A strictly increasing or decreasing array', 'Equal values', 'A single element'],
    approach: 'With one monotonic-stack pass find, for each i, the first smaller element on the left (L) and right (R), so the widest window where a[i] is the minimum has length R − L − 1. Set ans[len] = max(ans[len], a[i]). Then for k from n − 1 down to 1, ans[k] = max(ans[k], ans[k + 1]). Output ans[1..n].',
    external: {
      source: { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/find-the-maximum-of-minimums-for-every-window-size-in-a-given-array/' },
      statement: '<p>For an integer array <code>a</code> of length <code>n</code>, and every window size <code>k</code> from 1 to <code>n</code>, take the <em>minimum</em> of each window of size <code>k</code>, then take the <em>maximum</em> of those minimums.</p><p>Return the <code>n</code> results, for <code>k = 1 … n</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>5</sup></code>, <code>1 &lt;= a[i] &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'maxOfMinimums', params: [{ name: 'a', type: 'integer[]' }], returns: 'integer[]' },
      examples: [
        { input: ['[10,20,30,50,10,70,30]'], output: '[70,30,20,10,10,10,10]' },
        { input: ['[10,20,30]'], output: '[30,20,10]' },
      ],
      reference: `class Solution {
    public int[] maxOfMinimums(int[] a) {
        int n = a.length;
        int[] left = new int[n], right = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[st.peek()] >= a[i]) st.pop();
            left[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        st.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.isEmpty() && a[st.peek()] >= a[i]) st.pop();
            right[i] = st.isEmpty() ? n : st.peek();
            st.push(i);
        }
        int[] ans = new int[n + 2];
        for (int i = 0; i < n; i++) {
            int len = right[i] - left[i] - 1;
            ans[len] = Math.max(ans[len], a[i]);
        }
        for (int k = n - 1; k >= 1; k--) ans[k] = Math.max(ans[k], ans[k + 1]);
        return Arrays.copyOfRange(ans, 1, n + 1);
    }
}`,
    },
  },
];
