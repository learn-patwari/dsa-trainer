import type { SortId } from '../animations/types.ts';

/**
 * Where each complexity comes from, and the classic sorts as learning material.
 * The Java for every sort is compiled and run against Arrays.sort by
 * tests/sorting.test.ts, so what's shown here is code that actually works.
 */

// ---------------------------------------------------------------- complexity classes

export interface ComplexityClass {
  bigO: string;
  /** The shape of code that produces it. */
  shape: string;
  /** Why that shape costs this much. */
  why: string;
  /** Named algorithms and operations with this cost. */
  examples: string[];
}

export const COMPLEXITY_CLASSES: ComplexityClass[] = [
  {
    bigO: 'O(1)',
    shape: 'A fixed number of steps, whatever n is.',
    why: 'Nothing loops over the input.',
    examples: ['a[i] — array index', 'HashMap get / put (average)', 'stack push / pop', 'heap peek', 'arithmetic, bit tricks'],
  },
  {
    bigO: 'O(log n)',
    shape: 'Throw away half (or any fixed fraction) of what is left, each step.',
    why: 'n → n/2 → n/4 → … → 1 takes log₂ n steps. A billion items is only about 30 halvings.',
    examples: ['binary search', 'TreeMap / TreeSet get, put, floor, ceiling', 'heap push / pop (a sift along the height)', 'fast exponentiation', "Euclid's GCD"],
  },
  {
    bigO: 'O(√n)',
    shape: 'Loop while i · i ≤ n.',
    why: 'Divisors come in pairs (d, n / d), so one of each pair is at most √n.',
    examples: ['primality by trial division', 'listing all divisors'],
  },
  {
    bigO: 'O(n)',
    shape: 'Touch each element a constant number of times.',
    why: 'Even two pointers or a window that shrinks is at most 2n moves — the constant does not count.',
    examples: ['one linear scan', 'two pointers', 'sliding window', 'prefix sums', "Kadane's algorithm", 'heapify (build a heap)', 'BFS / DFS: O(V + E)', 'counting sort: O(n + k)', 'quickselect (average)'],
  },
  {
    bigO: 'O(n log n)',
    shape: 'log n levels × n work per level — or n operations × log n each.',
    why: 'Halving gives log n levels; if every level touches all n elements, that is n log n. Or: do an O(log n) operation once per element.',
    examples: ['merge sort', 'heap sort', 'quick sort (average)', "TimSort — Java's Collections.sort", 'sort, then scan', 'n heap pushes', 'n TreeMap inserts', 'n binary searches'],
  },
  {
    bigO: 'O(n²)',
    shape: 'A loop inside a loop, both over the input.',
    why: 'n(n − 1)/2 pairs. Halving the constant does not change the class.',
    examples: ['bubble, selection and insertion sort', 'checking every pair', 'expand-around-centre palindromes', 'a DP table over n × n'],
  },
  {
    bigO: 'O(n³)',
    shape: 'Three nested loops.',
    why: 'n · n · n. Only viable up to n ≈ 500.',
    examples: ['Floyd–Warshall all-pairs shortest paths', 'interval DP with a split point', 'naive matrix multiplication'],
  },
  {
    bigO: 'O(2ⁿ)',
    shape: 'Each element is either in or out.',
    why: 'Two choices, n times: 2 · 2 · … · 2. Doubles with every extra element.',
    examples: ['all subsets', 'recursion that branches twice with no memo (naive Fibonacci)'],
  },
  {
    bigO: 'O(n!)',
    shape: 'Each position picks from whatever is left.',
    why: 'n choices, then n − 1, then n − 2 … 10! is already 3.6 million.',
    examples: ['all permutations', 'brute-force travelling salesman'],
  },
];

// ---------------------------------------------------------------- n log n

export const NLOGN = {
  title: 'Where n log n comes from',
  sources: [
    {
      name: 'Divide in half, do linear work to combine',
      detail: 'T(n) = 2 T(n/2) + O(n). There are log₂ n levels of halving, and each level does n work in total, so n × log n. Merge sort is the textbook case.',
    },
    {
      name: 'Do a log n operation once per element',
      detail: 'n heap pushes, n TreeMap inserts, n binary searches — each O(log n), done n times. Heap sort is this: n removals from a heap.',
    },
  ],
  lowerBound:
    'No sort that works by comparing elements can beat it. There are n! possible orderings, and each comparison at best rules out half of the ones still possible, so you need at least log₂(n!) ≈ n log₂ n comparisons. Merge sort and heap sort meet that bound; counting and radix sort get under it only by never comparing.',
};

// ---------------------------------------------------------------- the sorts

export interface SortAlgorithm {
  id: SortId;
  name: string;
  family: string;
  idea: string;
  steps: string[];
  time: { best: string; average: string; worst: string };
  space: string;
  stable: boolean;
  inPlace: boolean;
  useWhen: string;
  /** The counting argument behind the complexity. */
  why: string;
  /** A complete Java class with `public static void sort(int[] a)`. */
  code: string;
}

export const SORTS: SortAlgorithm[] = [
  {
    id: 'bubble',
    name: 'Bubble sort',
    family: 'Simple, O(n²)',
    idea: 'Swap neighbours that are out of order. Each pass carries the largest remaining value to the end.',
    steps: ['Walk the array comparing a[i] with a[i + 1]; swap if the left one is bigger.', 'After a pass, the last element is final, so the next pass can stop one earlier.', 'If a pass makes no swaps, stop — the array is sorted.'],
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: true,
    inPlace: true,
    useWhen: 'Teaching, and almost-sorted tiny arrays. Never in production — insertion sort does the same job better.',
    why: 'Pass i makes n − 1 − i comparisons: (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 = O(n²). With the early exit, a sorted input takes one pass: O(n).',
    code: `public class BubbleSort {
    public static void sort(int[] a) {
        for (int end = a.length - 1; end > 0; end--) {
            boolean swapped = false;
            for (int i = 0; i < end; i++) {
                if (a[i] > a[i + 1]) {
                    int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) return; // nothing moved: already sorted, O(n) best case
        }
    }
}`,
  },
  {
    id: 'selection',
    name: 'Selection sort',
    family: 'Simple, O(n²)',
    idea: 'Find the minimum of the unsorted part and swap it to the front of that part. Repeat.',
    steps: ['For i from 0: scan a[i..] for the smallest value.', 'Swap it into position i. The prefix a[0..i] is now final.', 'Move i on and repeat.'],
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: false,
    inPlace: true,
    useWhen: 'When writes are expensive: it does at most n − 1 swaps, fewer than any other sort here.',
    why: 'Scan i looks at n − 1 − i elements no matter what, so the comparisons are always n(n − 1)/2 = O(n²), even on sorted input.',
    code: `public class SelectionSort {
    public static void sort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[min]) min = j;
            }
            int t = a[i]; a[i] = a[min]; a[min] = t; // one swap per position
        }
    }
}`,
  },
  {
    id: 'insertion',
    name: 'Insertion sort',
    family: 'Simple, O(n²)',
    idea: 'Grow a sorted prefix: take the next value and slide it left past everything bigger, like sorting cards in your hand.',
    steps: ['Hold key = a[i].', 'Shift every larger value in a[0..i − 1] one place right.', 'Drop key into the gap.'],
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: true,
    inPlace: true,
    useWhen: 'Small or nearly sorted arrays. TimSort and Java\'s own sort switch to it below a few dozen elements.',
    why: 'The shifts equal the number of out-of-order pairs: 0 for sorted input (O(n) — one comparison each), n(n − 1)/2 for reversed (O(n²)).',
    code: `public class InsertionSort {
    public static void sort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) { // shift bigger values one place right
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
    }
}`,
  },
  {
    id: 'merge',
    name: 'Merge sort',
    family: 'Divide and conquer, O(n log n)',
    idea: 'Split in half, sort each half recursively, then merge the two sorted halves.',
    steps: ['Split a[lo..hi] at mid.', 'Sort a[lo..mid] and a[mid + 1..hi].', 'Merge: repeatedly take the smaller front element into a buffer, then copy back.'],
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    stable: true,
    inPlace: false,
    useWhen: 'When you need a guaranteed O(n log n) and stability — sorting objects by several keys, linked lists, external sorting.',
    why: 'Halving n to 1 takes log₂ n levels, and every level merges all n elements once: n × log n. T(n) = 2T(n/2) + O(n).',
    code: `public class MergeSort {
    public static void sort(int[] a) {
        if (a.length > 1) sort(a, new int[a.length], 0, a.length - 1);
    }

    private static void sort(int[] a, int[] tmp, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        sort(a, tmp, lo, mid);
        sort(a, tmp, mid + 1, hi);
        merge(a, tmp, lo, mid, hi);
    }

    private static void merge(int[] a, int[] tmp, int lo, int mid, int hi) {
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++]; // <= keeps it stable
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
    }
}`,
  },
  {
    id: 'quick',
    name: 'Quick sort',
    family: 'Divide and conquer, O(n log n) average',
    idea: 'Pick a pivot, partition so smaller values sit left of it and the rest right, then recurse on each side.',
    steps: ['Choose a pivot — randomly, so no input is reliably bad.', 'Partition: one pass moving everything smaller than the pivot to the left.', 'The pivot is now in its final place; sort the two sides.'],
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    stable: false,
    inPlace: true,
    useWhen: 'General-purpose in-place sorting of primitives — Arrays.sort(int[]) is a dual-pivot quicksort. Also the idea behind quickselect.',
    why: 'Partitioning a level costs O(n). Pivots near the middle halve the range: log n levels, O(n log n). A pivot that is always the extreme peels off one element: n levels, O(n²).',
    code: `import java.util.concurrent.ThreadLocalRandom;

public class QuickSort {
    public static void sort(int[] a) {
        sort(a, 0, a.length - 1);
    }

    private static void sort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1);
        sort(a, p + 1, hi);
    }

    // Lomuto partition around a random pivot. Returns the pivot's final index.
    private static int partition(int[] a, int lo, int hi) {
        swap(a, ThreadLocalRandom.current().nextInt(lo, hi + 1), hi);
        int pivot = a[hi], store = lo;
        for (int i = lo; i < hi; i++) {
            if (a[i] < pivot) swap(a, i, store++);
        }
        swap(a, store, hi);
        return store;
    }

    private static void swap(int[] a, int i, int j) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
}`,
  },
  {
    id: 'heap',
    name: 'Heap sort',
    family: 'Heap, O(n log n)',
    idea: 'Build a max-heap inside the array, then repeatedly swap the root (the maximum) to the end and restore the heap.',
    steps: ['Heapify: sift down every non-leaf, from the last one back to the root.', 'Swap a[0] with the last element of the heap; it is now final.', 'Sift the new root down in the smaller heap, and repeat.'],
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
    stable: false,
    inPlace: true,
    useWhen: 'When you need O(n log n) guaranteed AND O(1) extra memory. Also: the same heap is how PriorityQueue works.',
    why: 'Heapify is O(n) — most nodes are near the bottom and sift only a step or two. Then n removals, each a sift along the height, log₂ n: n × log n.',
    code: `public class HeapSort {
    public static void sort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n); // heapify: O(n)
        for (int end = n - 1; end > 0; end--) {
            int t = a[0]; a[0] = a[end]; a[end] = t;            // the max goes to its final place
            siftDown(a, 0, end);                                  // restore the heap on a[0..end)
        }
    }

    private static void siftDown(int[] a, int i, int n) {
        while (true) {
            int largest = i, l = 2 * i + 1, r = l + 1;
            if (l < n && a[l] > a[largest]) largest = l;
            if (r < n && a[r] > a[largest]) largest = r;
            if (largest == i) return;
            int t = a[i]; a[i] = a[largest]; a[largest] = t;
            i = largest;
        }
    }
}`,
  },
  {
    id: 'counting',
    name: 'Counting sort',
    family: 'Non-comparison, O(n + k)',
    idea: 'Count how many times each value appears, then write the values back in order. It never compares two elements.',
    steps: ['Find the smallest and largest value; k = max − min + 1.', 'count[x − min]++ for every x.', 'Walk the counts in order, writing each value out count times.'],
    time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
    space: 'O(k)',
    stable: true,
    inPlace: false,
    useWhen: 'Integers in a small known range — ages, grades, letters, colours (Sort Colors is counting sort with k = 3).',
    why: 'n to count, k to walk the counters, n to write back: O(n + k). It beats the n log n bound by not comparing — and becomes useless when k is huge.',
    code: `public class CountingSort {
    public static void sort(int[] a) {
        if (a.length < 2) return;
        int min = a[0], max = a[0];
        for (int x : a) { min = Math.min(min, x); max = Math.max(max, x); }
        int[] count = new int[max - min + 1];     // one counter per possible value: k of them
        for (int x : a) count[x - min]++;
        int k = 0;
        for (int v = 0; v < count.length; v++) {
            while (count[v]-- > 0) a[k++] = v + min;
        }
    }
}`,
  },
  {
    id: 'radix',
    name: 'Radix sort (LSD)',
    family: 'Non-comparison, O(d · (n + b))',
    idea: 'Sort by the last digit, then the one before it, and so on — each pass a stable counting sort on one digit.',
    steps: ['Shift the values so the smallest is 0.', 'For each digit position, from the ones up: stable counting sort on that digit.', 'After the most significant digit, the array is sorted.'],
    time: { best: 'O(d · (n + b))', average: 'O(d · (n + b))', worst: 'O(d · (n + b))' },
    space: 'O(n + b)',
    stable: true,
    inPlace: false,
    useWhen: 'Many fixed-width integers or strings — phone numbers, IDs, IP addresses. d is the number of digits, b the base.',
    why: 'd digit passes, each a counting sort over n values and b buckets: d × (n + b). For 32-bit ints in base 10, d ≤ 10, so it is linear in n.',
    code: `public class RadixSort {
    public static void sort(int[] a) {
        if (a.length < 2) return;
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        for (int x : a) { min = Math.min(min, x); max = Math.max(max, x); }
        long range = (long) max - min;              // shift so every value is >= 0
        int[] out = new int[a.length];
        for (long exp = 1; range / exp > 0; exp *= 10) {
            int[] count = new int[10];
            for (int x : a) count[(int) ((x - (long) min) / exp % 10)]++;
            for (int d = 1; d < 10; d++) count[d] += count[d - 1];   // where each digit's run ends
            for (int i = a.length - 1; i >= 0; i--) {                // backwards keeps it stable
                int d = (int) ((a[i] - (long) min) / exp % 10);
                out[--count[d]] = a[i];
            }
            System.arraycopy(out, 0, a, 0, a.length);
        }
    }
}`,
  },
];

/** What Java actually uses, so you can say it in an interview. */
export const JAVA_SORTS: { call: string; algorithm: string; note: string }[] = [
  { call: 'Arrays.sort(int[])', algorithm: 'Dual-pivot quicksort', note: 'O(n log n) average, O(n²) in theory. Not stable — which cannot matter for primitives.' },
  { call: 'Arrays.sort(Object[]) / list.sort / Collections.sort', algorithm: 'TimSort', note: 'Merge sort plus insertion sort on small runs. O(n log n) worst, O(n) on already-sorted data, and stable.' },
  { call: 'PriorityQueue', algorithm: 'Binary heap', note: 'The heap-sort heap. offer/poll O(log n), peek O(1); iterating it is NOT sorted order.' },
];
