import { heapPos } from './trees.ts';
import type { ArrayLayer, Frame, GraphLayer, Layer, MapLayer, SortAnimation, SortId, Span, Tone, VarsLayer } from './types.ts';

/**
 * The classic sorts, animated by running them. Every comparison, swap and shift
 * is recorded from the real algorithm, so the pictures show exactly the work the
 * complexity counts — and tests check each run really ends sorted.
 */

const INPUT = [5, 2, 8, 1, 9, 3];

function view(a: readonly number[], tone: (i: number) => Tone | undefined, extra: Partial<ArrayLayer> = {}): ArrayLayer {
  return { kind: 'array', label: 'array', indices: true, cells: a.map((v, i) => ({ v, tone: tone(i) })), ...extra };
}

function vars(items: Record<string, string | number>, hot: string[] = []): VarsLayer {
  return { kind: 'vars', items: Object.entries(items).map(([k, v]) => ({ k, v: String(v), tone: hot.includes(k) ? 'active' : undefined })) };
}

function finish(sort: SortId, title: string, input: number[], a: number[], frames: Frame[], takeaway: string, setup?: string): SortAnimation {
  return { sort, title, setup: setup ?? `sort [${input.join(', ')}]`, input, frames, result: a.join(','), takeaway };
}

// ---------------------------------------------------------------- bubble

function bubble(): SortAnimation {
  const a = [...INPUT];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;
  let settled = n; // a[settled..] is final

  frames.push({ caption: 'Compare each pair of neighbours and swap them if they are out of order. One pass carries the largest remaining value to the end.', layers: [view(a, () => undefined), vars({ comparisons })] });

  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      comparisons++;
      const out = a[i]! > a[i + 1]!;
      if (out) {
        [a[i], a[i + 1]] = [a[i + 1]!, a[i]!];
        swapped = true;
      }
      frames.push({
        caption: out ? `${a[i + 1]} > ${a[i]}: out of order — swap.` : `${a[i]} ≤ ${a[i + 1]}: already in order.`,
        layers: [view(a, (k) => (k === i || k === i + 1 ? (out ? 'bad' : 'active') : k >= settled ? 'done' : undefined)), vars({ comparisons }, ['comparisons'])],
      });
    }
    settled = end;
    frames.push({
      caption: swapped
        ? `End of the pass: ${a[end]} has bubbled to its final place. The next pass can stop one earlier.`
        : 'A whole pass without a single swap: the array is sorted, so stop early. That is why an already-sorted input costs only O(n).',
      layers: [view(a, (k) => (k >= settled ? 'done' : undefined)), vars({ comparisons })],
    });
    if (!swapped) break;
  }

  frames.push({ caption: `Sorted after ${comparisons} comparisons. On n elements that is up to n(n − 1)/2 — O(n²).`, layers: [view(a, () => 'match'), vars({ comparisons }, ['comparisons'])] });
  return finish('bubble', 'Bubble sort', INPUT, a, frames, 'Each pass fixes one more value at the end, so there are up to n passes of up to n comparisons: O(n²). Stop early when a pass swaps nothing.');
}

// ---------------------------------------------------------------- selection

function selection(): SortAnimation {
  const a = [...INPUT];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0;

  frames.push({ caption: 'Find the smallest value in the unsorted part and swap it to the front of that part. Repeat on what is left.', layers: [view(a, () => undefined), vars({ comparisons })] });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const smaller = a[j]! < a[min]!;
      if (smaller) min = j;
      frames.push({
        caption: smaller ? `${a[j]} is smaller than anything seen in this scan — it is the new minimum.` : `${a[j]} is not smaller than ${a[min]}.`,
        layers: [
          view(a, (k) => (k < i ? 'done' : k === min ? 'match' : k === j ? 'active' : undefined), {
            markers: [
              { at: j, label: 'j' },
              { at: min, label: 'min', tone: 'match' },
            ],
          }),
          vars({ comparisons }, ['comparisons']),
        ],
      });
    }
    const moved = min !== i;
    [a[i], a[min]] = [a[min]!, a[i]!];
    frames.push({
      caption: moved ? `The scan is over: swap the minimum, ${a[i]}, into position ${i}.` : `The minimum, ${a[i]}, is already at position ${i}. The scan still had to look at everything to know that.`,
      layers: [view(a, (k) => (k <= i ? 'done' : undefined)), vars({ comparisons })],
    });
  }

  frames.push({ caption: `Sorted, with ${comparisons} comparisons whatever the input looked like, but at most n − 1 swaps.`, layers: [view(a, () => 'match'), vars({ comparisons }, ['comparisons'])] });
  return finish('selection', 'Selection sort', INPUT, a, frames, 'Every scan looks at the whole unsorted part, even when the array is already sorted: always n(n − 1)/2 comparisons, O(n²). Its one strength is doing the fewest swaps.');
}

// ---------------------------------------------------------------- insertion

function insertion(): SortAnimation {
  const a = [...INPUT];
  const n = a.length;
  const frames: Frame[] = [];
  let shifts = 0;

  frames.push({ caption: 'Grow a sorted prefix one element at a time: take the next value and slide it left past everything bigger.', layers: [view(a, (k) => (k === 0 ? 'done' : undefined)), vars({ shifts })] });

  for (let i = 1; i < n; i++) {
    const key = a[i]!;
    let j = i - 1;
    while (j >= 0 && a[j]! > key) {
      a[j + 1] = a[j]!;
      shifts++;
      frames.push({
        caption: `${a[j]} > ${key}, so ${a[j]} shifts one place right to make room.`,
        layers: [view(a, (k) => (k === j ? 'window' : k === j + 1 ? 'bad' : k <= i ? 'done' : undefined)), vars({ key, shifts }, ['key', 'shifts'])],
      });
      j--;
    }
    a[j + 1] = key;
    frames.push({
      caption: j + 1 === i ? `${key} is already bigger than everything before it — no shifting needed.` : `Drop ${key} into the gap at position ${j + 1}. The first ${i + 1} values are now sorted.`,
      layers: [view(a, (k) => (k === j + 1 ? 'match' : k <= i ? 'done' : undefined)), vars({ key, shifts }, ['key'])],
    });
  }

  frames.push({ caption: `Sorted with ${shifts} shifts. The work is exactly the number of out-of-order pairs: 0 for sorted input, n(n − 1)/2 for reversed.`, layers: [view(a, () => 'match'), vars({ shifts }, ['shifts'])] });
  return finish('insertion', 'Insertion sort', INPUT, a, frames, 'Nearly sorted input means few shifts, so insertion sort is O(n) there and O(n²) at worst. That is why TimSort uses it on small runs.');
}

// ---------------------------------------------------------------- merge

function merge(): SortAnimation {
  const a = [...INPUT];
  const frames: Frame[] = [];
  let level = 0;

  frames.push({ caption: 'Split the array in half, sort each half, then merge the two sorted halves. A run of one element is already sorted.', layers: [view(a, () => undefined)] });

  const span = (from: number, to: number, tone: Tone, label: string): Span => ({ from, to, tone, label });
  const sortRange = (lo: number, hi: number, depth: number) => {
    if (lo >= hi) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    sortRange(lo, mid, depth + 1);
    sortRange(mid + 1, hi, depth + 1);
    level = Math.max(level, depth + 1);
    frames.push({
      caption: `Merge the sorted runs [${a.slice(lo, mid + 1).join(', ')}] and [${a.slice(mid + 1, hi + 1).join(', ')}]: repeatedly take the smaller front element.`,
      layers: [view(a, (k) => (k >= lo && k <= hi ? 'window' : undefined), { spans: [span(lo, mid, 'window', 'left'), span(mid + 1, hi, 'active', 'right')] })],
    });
    const merged: number[] = [];
    let i = lo;
    let j = mid + 1;
    while (i <= mid && j <= hi) merged.push(a[i]! <= a[j]! ? a[i++]! : a[j++]!); // <= keeps equal values in order: stable
    while (i <= mid) merged.push(a[i++]!);
    while (j <= hi) merged.push(a[j++]!);
    merged.forEach((v, k) => (a[lo + k] = v));
    frames.push({
      caption: `Merged into [${merged.join(', ')}] — ${hi - lo + 1} elements, each moved once.`,
      layers: [view(a, (k) => (k >= lo && k <= hi ? 'match' : undefined), { spans: [span(lo, hi, 'match', 'merged')] })],
    });
  };
  sortRange(0, a.length - 1, 0);

  frames.push({
    caption: `Sorted. There were about log₂ n = ${level} levels of merging, and each level moved all n elements once: n × log n.`,
    layers: [view(a, () => 'match')],
  });
  return finish('merge', 'Merge sort', INPUT, a, frames, 'Halving gives log n levels; merging every level costs n. That is O(n log n) for every input — at the price of an O(n) buffer.');
}

// ---------------------------------------------------------------- quick

function quick(): SortAnimation {
  const a = [...INPUT];
  const frames: Frame[] = [];
  const placed = new Set<number>();

  frames.push({
    caption: 'Pick a pivot and partition: everything smaller goes to its left, the rest to its right. The pivot is then in its final place. Recurse on both sides.',
    layers: [view(a, () => undefined)],
  });

  const tone = (lo: number, hi: number, pivotAt: number, extra: Record<number, Tone> = {}) => (k: number): Tone | undefined =>
    extra[k] ?? (placed.has(k) ? 'done' : k === pivotAt ? 'match' : k < lo || k > hi ? 'dim' : undefined);

  const sortRange = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      placed.add(lo);
      return;
    }
    const pivot = a[hi]!;
    let store = lo;
    frames.push({
      caption: `Partition positions ${lo}–${hi} around the pivot ${pivot}. (The Java code picks a random pivot; the last element is used here so the animation always plays the same way.)`,
      layers: [view(a, tone(lo, hi, hi), { markers: [{ at: hi, label: 'pivot', tone: 'match' }] })],
    });
    for (let i = lo; i < hi; i++) {
      const smaller = a[i]! < pivot;
      if (smaller) {
        [a[i], a[store]] = [a[store]!, a[i]!];
        store++;
      }
      frames.push({
        caption: smaller ? `${a[store - 1]} < ${pivot}: move it into the "smaller" region.` : `${a[i]} ≥ ${pivot}: it stays on the right side.`,
        layers: [
          view(a, tone(lo, hi, hi, { [i]: smaller ? 'active' : 'window' }), {
            markers: [
              { at: i, label: 'i' },
              { at: Math.min(store, hi), label: 'store', tone: 'window' },
              { at: hi, label: 'pivot', tone: 'match' },
            ],
          }),
        ],
      });
    }
    [a[store], a[hi]] = [a[hi]!, a[store]!];
    placed.add(store);
    frames.push({ caption: `Swap the pivot ${pivot} into position ${store}. It never moves again.`, layers: [view(a, tone(lo, hi, -1, { [store]: 'match' }))] });
    sortRange(lo, store - 1);
    sortRange(store + 1, hi);
  };
  sortRange(0, a.length - 1);

  frames.push({ caption: 'Sorted. Good pivots halve the range, giving log n levels of n work: O(n log n). A pivot that is always the smallest gives n levels: O(n²).', layers: [view(a, () => 'match')] });
  return finish('quick', 'Quick sort', INPUT, a, frames, 'Partitioning is O(n) per level. Halving splits give log n levels — O(n log n) on average — but a bad pivot every time degrades it to O(n²), which is why real ones randomise.');
}

// ---------------------------------------------------------------- heap

function heapSort(): SortAnimation {
  const a = [...INPUT];
  const n = a.length;
  const frames: Frame[] = [];

  const tree = (size: number, hot: number[] = []): GraphLayer => {
    const depth = Math.max(1, Math.floor(Math.log2(Math.max(1, size))));
    return {
      kind: 'graph',
      label: `max-heap in a[0..${size - 1}]`,
      nodes: a.slice(0, size).map((v, i) => ({ id: `v${v}`, v, ...heapPos(i, depth), tone: hot.includes(i) ? 'active' : i === 0 ? 'match' : undefined })),
      edges: a.slice(1, size).map((v, k) => ({ from: `v${a[Math.floor(k / 2)]}`, to: `v${v}` })),
      height: 130,
    };
  };
  const layers = (size: number, hot: number[] = [], bad: number[] = []): Layer[] => [
    view(a, (k) => (bad.includes(k) ? 'bad' : hot.includes(k) ? 'active' : k >= size ? 'done' : undefined)),
    ...(size > 0 ? [tree(size, hot)] : []),
  ];

  const siftDown = (start: number, size: number) => {
    let i = start;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let largest = i;
      if (l < size && a[l]! > a[largest]!) largest = l;
      if (r < size && a[r]! > a[largest]!) largest = r;
      if (largest === i) return;
      [a[i], a[largest]] = [a[largest]!, a[i]!];
      frames.push({ caption: `${a[largest]} is smaller than its child ${a[i]}: swap them and keep sifting down.`, layers: layers(size, [i, largest]) });
      i = largest;
    }
  };

  frames.push({ caption: 'Treat the array as a binary tree: the children of index i are 2i + 1 and 2i + 2. First make it a max-heap, where every parent beats its children.', layers: layers(n) });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  frames.push({ caption: `A max-heap: the largest value, ${a[0]}, is at the root. Building it took O(n) — most nodes sit near the bottom and barely move.`, layers: layers(n, [0]) });

  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end]!, a[0]!];
    frames.push({ caption: `Swap the root ${a[end]} to position ${end}, its final place. The heap shrinks by one.`, layers: layers(end, [0], [end]) });
    siftDown(0, end);
  }

  frames.push({ caption: 'Sorted in place. n removals, each a sift-down along a height of log n: O(n log n), with no extra array.', layers: [view(a, () => 'match')] });
  return finish('heap', 'Heap sort', INPUT, a, frames, 'Build a max-heap in O(n), then move the root to the end n times, each costing a log n sift: O(n log n) always, in place.');
}

// ---------------------------------------------------------------- counting

function counting(): SortAnimation {
  const a = [...INPUT];
  const min = Math.min(...a);
  const max = Math.max(...a);
  const count = Array<number>(max - min + 1).fill(0);
  const frames: Frame[] = [];
  const countLayer = (hot?: number): ArrayLayer => ({
    kind: 'array',
    label: `count[v − ${min}]`,
    cells: count.map((c, k) => ({ v: c, sub: String(k + min), tone: k === hot ? 'active' : c > 0 ? 'window' : 'dim' })),
  });

  frames.push({ caption: `No comparisons at all. The values run from ${min} to ${max}, so make one counter per possible value — k = ${count.length} of them.`, layers: [view(a, () => undefined), countLayer()] });

  a.forEach((v, i) => {
    count[v - min]!++;
    frames.push({ caption: `Count ${v}.`, layers: [view(a, (k) => (k === i ? 'active' : k < i ? 'done' : undefined)), countLayer(v - min)] });
  });

  let w = 0;
  for (let k = 0; k < count.length; k++) {
    while (count[k]! > 0) {
      a[w] = k + min;
      count[k]!--;
      frames.push({ caption: `Read the counts in order: write ${k + min} at position ${w}.`, layers: [view(a, (x) => (x === w ? 'match' : x < w ? 'done' : 'dim')), countLayer(k)] });
      w++;
    }
  }

  frames.push({ caption: `Sorted: n to count, k to walk the counters, n to write — O(n + k). It beats n log n by never comparing, and only pays off when k is small.`, layers: [view(a, () => 'match')] });
  return finish('counting', 'Counting sort', INPUT, a, frames, 'Count each value, then read the counters in order: O(n + k). Unbeatable when the range k is small — useless when it is 10⁹.');
}

// ---------------------------------------------------------------- radix

function radix(): SortAnimation {
  const input = [170, 45, 75, 90, 802, 24, 2, 66];
  let a = [...input];
  const frames: Frame[] = [];
  const max = Math.max(...a);

  frames.push({
    caption: 'Sort by the ones digit, then the tens, then the hundreds — each pass a STABLE counting sort on one digit, so earlier passes are never undone.',
    layers: [{ ...view(a, () => undefined), label: 'array' }],
  });

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const place = exp === 1 ? 'ones' : exp === 10 ? 'tens' : 'hundreds';
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const v of a) buckets[Math.floor(v / exp) % 10]!.push(v); // in order: stable
    const bucketLayer: MapLayer = {
      kind: 'map',
      label: `buckets by the ${place} digit`,
      entries: buckets.flatMap((b, d) => (b.length ? [{ k: String(d), v: b.join(', ') }] : [])),
    };
    frames.push({
      caption: `Drop each number into the bucket for its ${place} digit, keeping their current order.`,
      layers: [view(a, () => 'window', { cells: a.map((v) => ({ v, sub: `…${Math.floor(v / exp) % 10}`, tone: 'window' as Tone })) }), bucketLayer],
    });
    a = buckets.flat();
    frames.push({ caption: `Read the buckets 0 to 9 back into the array. The numbers are now sorted by their last ${exp === 1 ? 'digit' : `${Math.log10(exp) + 1} digits`}.`, layers: [view(a, () => 'done'), bucketLayer] });
  }

  frames.push({ caption: `Sorted in ${Math.floor(Math.log10(max)) + 1} passes of n + 10: O(d · (n + b)). For fixed-width keys, that is linear.`, layers: [view(a, () => 'match')] });
  return finish('radix', 'Radix sort (LSD)', input, a, frames, 'd digit passes, each a stable counting sort over b buckets: O(d · (n + b)). It relies on stability — an unstable digit sort would scramble the earlier passes.', `sort [${input.join(', ')}]`);
}

const BUILDERS: Record<SortId, () => SortAnimation> = { bubble, selection, insertion, merge, quick, heap: heapSort, counting, radix };
const cache = new Map<SortId, SortAnimation>();

export function sortAnimationFor(id: SortId): SortAnimation {
  let a = cache.get(id);
  if (!a) {
    a = BUILDERS[id]();
    cache.set(id, a);
  }
  return a;
}

export const SORT_IDS = Object.keys(BUILDERS) as SortId[];
