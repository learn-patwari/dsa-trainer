import type { Pattern } from '../types.ts';

export const arrayPatterns: Pattern[] = [
  {
    id: 'hashing',
    name: 'Hash Map / Set',
    group: 'Arrays & Strings',
    summary: "Trade memory for speed: remember what you've seen so each lookup is O(1).",
    signals: [
      'Find a pair or complement that matches a target',
      'Detect duplicates or count frequencies',
      'Group items that share a canonical key (anagrams, same shape)',
      'A nested loop only exists to ask "have I seen X before?"',
    ],
    idea:
      "Most brute-force solutions compare every element with every other one, which is O(n²). A hash map remembers what you've already seen, so asking \"have I seen the complement / this key before?\" costs O(1). The design work is choosing the key (the value itself, its complement, or a canonical signature such as sorted letters) and the value (an index, a count, or a list of members).",
    steps: [
      'Choose the key: the raw value, its complement, or a canonical signature.',
      'Choose the value: an index, a count, or the list of matching items.',
      'Scan once; for each element, query the map before inserting it.',
      'Return as soon as a query succeeds, or post-process the map (e.g. return its values).',
    ],
    template: {
      title: 'Complement lookup and grouping by canonical key',
      code: `// One pass: before inserting x, ask whether its complement was already seen.
int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> indexOf = new HashMap<>(); // value -> index
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (indexOf.containsKey(need)) {
            return new int[] {indexOf.get(need), i};
        }
        indexOf.put(nums[i], i);
    }
    return new int[0]; // no pair
}

// Group items by a canonical key (here: the word's sorted letters).
List<List<String>> groupByKey(String[] words) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String w : words) {
        char[] c = w.toCharArray();
        Arrays.sort(c);
        groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(w);
    }
    return new ArrayList<>(groups.values());
}`,
    },
    complexity: 'O(n) time on average, O(n) extra space.',
    pitfalls: [
      'Inserting before checking can pair an element with itself (x + x = target).',
      'Arrays as keys hash by identity: convert int[]/char[] to a String or List first.',
      'map.get(x) + 1 throws on a missing key: use getOrDefault or merge.',
    ],
    leetcodeTags: ['hash-table'],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    group: 'Arrays & Strings',
    summary: 'Move two indices through a sequence (often sorted) instead of using a nested loop.',
    signals: [
      "Input is sorted, or sorting doesn't change the answer",
      'Find a pair or triplet with a target sum',
      'Compare from both ends (palindromes, reversing)',
      'Rearrange or partition an array in place',
    ],
    idea:
      'With pointers at both ends of a sorted array, every comparison discards a whole row of candidate pairs: if the sum is too small, the left element cannot pair with anything, so move it right. A second flavor uses a slow "write" pointer and a fast "read" pointer to compact or partition an array in place with O(1) extra space.',
    steps: [
      "Sort if needed (and if the answer doesn't depend on original indices).",
      'Place the pointers: both ends, or read/write pointers at the start.',
      'Compare, then move the pointer whose move can improve the answer.',
      'Stop when the pointers cross; skip duplicates if results must be unique.',
    ],
    template: {
      title: 'Opposite ends, and read/write pointers',
      code: `// Opposite ends on a sorted array: find a pair summing to target.
int[] pairWithSum(int[] sorted, int target) {
    int lo = 0, hi = sorted.length - 1;
    while (lo < hi) {
        int sum = sorted[lo] + sorted[hi];
        if (sum == target) return new int[] {lo, hi};
        if (sum < target) lo++;   // need a bigger sum
        else hi--;                // need a smaller sum
    }
    return new int[0];
}

// Read/write pointers: keep wanted elements, in order, in place.
int removeValue(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) nums[write++] = nums[read];
    }
    return write; // new logical length
}`,
    },
    complexity: 'O(n) per scan (plus O(n log n) if you sort first), O(1) extra space.',
    pitfalls: [
      'Sorting loses original indices; carry (value, index) pairs if the answer needs them.',
      'Not skipping duplicates produces repeated triplets in 3Sum-style problems.',
      'Moving the wrong pointer: always move the one that can improve the answer.',
    ],
    leetcodeTags: ['two-pointers'],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    group: 'Arrays & Strings',
    summary: 'Keep a contiguous window and update its state incrementally as it slides.',
    signals: [
      'Longest / shortest / best contiguous subarray or substring',
      '"At most k", "contains all characters of", "without repeating"',
      'A fixed window of k consecutive elements',
      'Brute force recomputes overlapping ranges again and again',
    ],
    idea:
      'Instead of re-scanning every subarray, extend the window on the right one element at a time and shrink it from the left only when it becomes invalid. Each index enters and leaves the window at most once, so the scan is O(n). Keep just enough state (a sum, character counts, a deque of candidates) to test validity in O(1).',
    steps: [
      'Define what makes a window valid (no repeats, sum ≥ target, ≤ k distinct…).',
      'Expand: add the element at right to the window state.',
      'Shrink: while the window is invalid (or, for "minimum length", still valid), remove the element at left.',
      'Record the answer at the moment the window is known to be valid.',
    ],
    template: {
      title: 'Variable-size and fixed-size windows',
      code: `// Variable window: longest substring with at most k distinct characters.
int longestWithAtMostKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int best = 0;
    for (int left = 0, right = 0; right < s.length(); right++) {
        count.merge(s.charAt(right), 1, Integer::sum);        // expand
        while (count.size() > k) {                             // shrink until valid
            char out = s.charAt(left++);
            if (count.merge(out, -1, Integer::sum) == 0) count.remove(out);
        }
        best = Math.max(best, right - left + 1);              // window is valid here
    }
    return best;
}

// Fixed window of size k: maximum window sum.
long maxWindowSum(int[] nums, int k) {
    long sum = 0, best = Long.MIN_VALUE;
    for (int i = 0; i < nums.length; i++) {
        sum += nums[i];
        if (i >= k) sum -= nums[i - k];                        // drop the element that left
        if (i >= k - 1) best = Math.max(best, sum);
    }
    return best;
}`,
    },
    complexity: 'O(n) time; O(k) or O(alphabet) space for the window state.',
    pitfalls: [
      "Shrinking only works if validity is monotonic; with negative numbers, sums aren't, so use prefix sums.",
      'Recording the answer before the window is valid again.',
      'Off-by-one on the window length: it is right - left + 1.',
    ],
    leetcodeTags: ['sliding-window'],
  },
  {
    id: 'prefix-sum',
    name: 'Prefix Sum',
    group: 'Arrays & Strings',
    summary: 'Precompute running totals so any range sum is a single subtraction.',
    signals: [
      'Many queries for the sum of a range [i, j]',
      'Count subarrays whose sum equals, or is divisible by, k (negatives allowed)',
      'Balance problems: equal 0s and 1s, pivot index',
      'Product or sum of everything except the current element',
    ],
    idea:
      'prefix[i] is the total of the first i elements, so sum(i..j) = prefix[j+1] − prefix[i]. To count subarrays with sum k in one pass, remember how many times each prefix value has occurred: a subarray ending here sums to k exactly when an earlier prefix equals current − k. Unlike a sliding window, this works with negative numbers.',
    steps: [
      'Build prefix with a leading 0 (prefix[0] = 0) to avoid special cases.',
      'Answer range queries as prefix[r + 1] − prefix[l].',
      'For "count subarrays with property", walk once with a map prefix → count (or first index), seeded with {0: 1}.',
      'Transform the input if needed: 0 → −1 for balance, sum mod k for divisibility.',
    ],
    template: {
      title: 'Range sums and counting subarrays by prefix',
      code: `// Range sums in O(1) after O(n) preprocessing.
long[] buildPrefix(int[] nums) {
    long[] prefix = new long[nums.length + 1];
    for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    return prefix;
}

long rangeSum(long[] prefix, int left, int right) { // inclusive bounds
    return prefix[right + 1] - prefix[left];
}

// Count subarrays summing to k (negative numbers allowed).
int countSubarraysWithSum(int[] nums, int k) {
    Map<Long, Integer> seen = new HashMap<>();
    seen.put(0L, 1);                      // the empty prefix
    long sum = 0;
    int count = 0;
    for (int x : nums) {
        sum += x;
        count += seen.getOrDefault(sum - k, 0);
        seen.merge(sum, 1, Integer::sum);
    }
    return count;
}`,
    },
    complexity: 'O(n) preprocessing, O(1) per range query, O(n) space.',
    pitfalls: [
      'Forgetting to seed the map with prefix 0 misses subarrays that start at index 0.',
      'Overflow on long inputs: keep running sums in a long.',
      'Inserting the current prefix before querying counts empty subarrays when k = 0.',
    ],
    leetcodeTags: ['prefix-sum'],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    group: 'Arrays & Strings',
    summary: 'Halve the search space every step: on a sorted array, or on the answer itself.',
    signals: [
      'Sorted (or rotated sorted) input and a target or boundary to find',
      '"Minimum speed / capacity / time such that…": a monotonic yes/no condition',
      'O(log n) is required, or the value range is huge',
      'First or last position, insertion point, smallest valid value',
    ],
    idea:
      "Binary search works whenever a predicate flips from false to true exactly once across the search space. Look for the first index (or value) where it becomes true. On arrays the predicate is usually nums[mid] >= target; for \"search on the answer\" it's \"can we finish with capacity mid?\", checked with a greedy O(n) simulation.",
    steps: [
      'Identify the search space: indices [0, n) or a value range [lo, hi].',
      'Write a monotonic predicate ok(mid): false … false true … true.',
      'While lo < hi: if ok(mid) then hi = mid, else lo = mid + 1.',
      'lo is now the first value where ok is true; check that it exists if needed.',
    ],
    template: {
      title: 'Lower bound, and binary search on the answer',
      code: `// First index i with nums[i] >= target (nums.length if none): the lower bound.
int lowerBound(int[] nums, int target) {
    int lo = 0, hi = nums.length;               // search space [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;           // avoids int overflow
        if (nums[mid] >= target) hi = mid;      // true: answer is mid or to its left
        else lo = mid + 1;
    }
    return lo;
}

// Search on the answer: smallest eating speed that finishes all piles within h hours.
int minSpeed(int[] piles, int h) {
    int lo = 1, hi = Arrays.stream(piles).max().orElse(1);
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;
        for (int p : piles) hours += (p + (long) mid - 1) / mid;   // ceil(p / mid)
        if (hours <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
    },
    complexity: 'O(log n) comparisons; O(n log range) when each check is an O(n) simulation.',
    pitfalls: [
      'Infinite loops: pair lo = mid + 1 with hi = mid (mid rounds down).',
      '(lo + hi) / 2 can overflow; use lo + (hi - lo) / 2.',
      "A predicate that isn't monotonic makes binary search return garbage silently.",
    ],
    leetcodeTags: ['binary-search'],
  },
];
