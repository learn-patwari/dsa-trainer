import type { ArrayLayer, Cell, Frame, Layer, MapLayer, PatternAnimation, StackLayer, Tone, VarsLayer } from './types.ts';

/** Cells from values, toned by index. */
function cells(values: readonly (string | number)[], tone: (i: number) => Tone | undefined = () => undefined): Cell[] {
  return values.map((v, i) => ({ v, tone: tone(i) }));
}

function arr(values: readonly (string | number)[], opts: Omit<ArrayLayer, 'kind' | 'cells'> & { tone?: (i: number) => Tone | undefined } = {}): ArrayLayer {
  const { tone, ...rest } = opts;
  return { kind: 'array', indices: true, cells: cells(values, tone), ...rest };
}

function vars(items: Record<string, string | number>, hot: string[] = []): VarsLayer {
  return { kind: 'vars', items: Object.entries(items).map(([k, v]) => ({ k, v: String(v), tone: hot.includes(k) ? 'active' : undefined })) };
}

// ---------------------------------------------------------------- hashing

export function hashing(): PatternAnimation {
  const nums = [3, 8, 5, 2, 7];
  const target = 10;
  const seen = new Map<number, number>();
  const frames: Frame[] = [];
  const map = (hot?: number, fresh?: number): MapLayer => ({
    kind: 'map',
    label: 'seen: value → index',
    entries: [...seen].map(([k, v]) => ({ k: String(k), v: String(v), tone: k === hot ? 'match' : k === fresh ? 'active' : undefined })),
    empty: 'nothing yet',
  });

  frames.push({
    caption: `Walk the array once. For each x, ask the map one question: has ${target} − x already gone past?`,
    layers: [arr(nums), map()],
  });

  let result = 'no pair';
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]!;
    const need = target - x;
    const j = seen.get(need);
    if (j !== undefined) {
      result = `(${j}, ${i})`;
      frames.push({
        caption: `${x} needs ${need} — and ${need} is already in the map, at index ${j}. One lookup, one pass: the pair is ${result}.`,
        layers: [
          arr(nums, { tone: (k) => (k === i || k === j ? 'match' : k < i ? 'done' : undefined), markers: [{ at: i, label: 'i', tone: 'match' }] }),
          map(need),
          vars({ x, need }, ['need']),
        ],
      });
      break;
    }
    seen.set(x, i);
    frames.push({
      caption:
        need === x
          ? `${x} needs ${need} — itself. The map is checked BEFORE ${x} goes in, so it can't pair with itself. Store ${x} → ${i}.`
          : `${x} needs ${need}. Not in the map, so remember ${x} → ${i} and keep walking.`,
      layers: [
        arr(nums, { tone: (k) => (k === i ? 'active' : k < i ? 'done' : undefined), markers: [{ at: i, label: 'i', tone: 'active' }] }),
        map(undefined, x),
        vars({ x, need }, ['need']),
      ],
    });
  }

  return {
    pattern: 'hashing',
    title: 'Trade memory for a second loop',
    setup: `nums = [${nums.join(', ')}], target = ${target} — find two indices that add up to the target`,
    frames,
    result,
    takeaway: 'Store what you have seen, keyed by what a future element will ask for. Every lookup is O(1), so the nested loop disappears.',
  };
}

// ---------------------------------------------------------------- two pointers

export function twoPointers(): PatternAnimation {
  const nums = [1, 3, 4, 6, 8, 11];
  const target = 10;
  const frames: Frame[] = [];
  let l = 0;
  let r = nums.length - 1;
  const ruledOut = new Set<number>();
  const layer = (hot: Tone = 'active'): ArrayLayer =>
    arr(nums, {
      tone: (k) => (ruledOut.has(k) ? 'dim' : k === l || k === r ? hot : undefined),
      markers: [
        { at: l, label: 'L', tone: hot },
        { at: r, label: 'R', tone: hot },
      ],
    });

  frames.push({
    caption: `The array is sorted, so start at both ends. Too big means R must come in; too small means L must go out.`,
    layers: [layer(), vars({ target })],
  });

  let result = 'no pair';
  while (l < r) {
    const sum = nums[l]! + nums[r]!;
    if (sum === target) {
      result = `(${nums[l]}, ${nums[r]})`;
      frames.push({ caption: `${nums[l]} + ${nums[r]} = ${sum}. Found it — and nothing was compared twice.`, layers: [layer('match'), vars({ sum, target }, ['sum'])] });
      break;
    }
    if (sum > target) {
      frames.push({
        caption: `${nums[l]} + ${nums[r]} = ${sum}, too big. Every pair using ${nums[r]} is bigger still, so drop it: R moves left.`,
        layers: [layer('bad'), vars({ sum, target }, ['sum'])],
      });
      ruledOut.add(r);
      r--;
    } else {
      frames.push({
        caption: `${nums[l]} + ${nums[r]} = ${sum}, too small. Every pair using ${nums[l]} is smaller still, so drop it: L moves right.`,
        layers: [layer('bad'), vars({ sum, target }, ['sum'])],
      });
      ruledOut.add(l);
      l++;
    }
  }

  return {
    pattern: 'two-pointers',
    title: 'Two ends, closing in',
    setup: `sorted nums = [${nums.join(', ')}], target = ${target} — find a pair that sums to the target`,
    frames,
    result,
    takeaway: 'Sortedness tells you which pointer to move. Each step discards a whole row of pairs, so it is O(n) instead of O(n²).',
  };
}

// ---------------------------------------------------------------- sliding window

export function slidingWindow(): PatternAnimation {
  const s = 'abcbad';
  const chars = [...s];
  const frames: Frame[] = [];
  const inWindow = new Set<string>();
  let l = 0;
  let best = 0;
  let bestSpan: [number, number] = [0, -1];

  const layer = (r: number, hot: Tone, note?: string): Layer[] => [
    arr(chars, {
      tone: (k) => (k < l ? 'dim' : k <= r ? (k === r ? hot : 'window') : undefined),
      markers: [
        { at: l, label: 'L' },
        { at: Math.max(r, 0), label: 'R', tone: hot },
      ],
      spans: r >= l ? [{ from: l, to: r, tone: 'window', label: `${r - l + 1}` }] : [],
    }),
    { kind: 'queue', label: 'letters in the window (a set)', items: [...inWindow].map((c) => ({ v: c, id: `w${c}` })), empty: 'empty' },
    vars({ best: note ?? best }),
  ];

  frames.push({ caption: 'Grow the window with R. The moment it breaks the rule — a repeated letter — shrink it from L until it holds again.', layers: layer(-1, 'active') });

  for (let r = 0; r < chars.length; r++) {
    const c = chars[r]!;
    while (inWindow.has(c)) {
      frames.push({
        caption: `'${c}' is already inside. Shrink: '${chars[l]}' leaves from the left.`,
        layers: layer(r, 'bad'),
      });
      inWindow.delete(chars[l]!);
      l++;
    }
    inWindow.add(c);
    if (r - l + 1 > best) {
      best = r - l + 1;
      bestSpan = [l, r];
    }
    frames.push({
      caption: `Take '${c}'. The window "${s.slice(l, r + 1)}" has no repeats — length ${r - l + 1}${r - l + 1 === best ? ', the best so far' : ''}.`,
      layers: layer(r, 'active'),
    });
  }

  frames.push({
    caption: `R reached the end. Neither pointer ever moved backwards, so that was at most 2n steps. Longest: "${s.slice(bestSpan[0], bestSpan[1] + 1)}", length ${best}.`,
    layers: [
      arr(chars, { tone: (k) => (k >= bestSpan[0] && k <= bestSpan[1] ? 'match' : 'dim'), spans: [{ from: bestSpan[0], to: bestSpan[1], tone: 'match', label: `${best}` }] }),
      vars({ best }, ['best']),
    ],
  });

  return {
    pattern: 'sliding-window',
    title: 'Grow on the right, shrink on the left',
    setup: `s = "${s}" — the longest substring with no repeated letter`,
    frames,
    result: String(best),
    takeaway: 'Both pointers only ever move forward, so a window over n elements costs O(n), however often it shrinks.',
  };
}

// ---------------------------------------------------------------- prefix sum

export function prefixSum(): PatternAnimation {
  const nums = [3, 1, 4, 1, 5, 9];
  const prefix: (number | string)[] = Array(nums.length + 1).fill('');
  prefix[0] = 0;
  const frames: Frame[] = [];
  const [qa, qb] = [1, 4];

  frames.push({
    caption: 'Precompute running totals once. P[i] is the sum of everything before index i, so P[0] = 0.',
    layers: [arr(nums, { label: 'nums' }), arr(prefix, { label: 'P', tone: (k) => (k === 0 ? 'active' : undefined) })],
  });

  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = (prefix[i] as number) + nums[i]!;
    frames.push({
      caption: `P[${i + 1}] = P[${i}] + nums[${i}] = ${prefix[i]} + ${nums[i]} = ${prefix[i + 1]}.`,
      layers: [
        arr(nums, { label: 'nums', tone: (k) => (k === i ? 'active' : k < i ? 'done' : undefined) }),
        arr(prefix, { label: 'P', tone: (k) => (k === i + 1 ? 'active' : k === i ? 'window' : k < i ? 'done' : undefined) }),
      ],
    });
  }

  const total = (prefix[qb + 1] as number) - (prefix[qa] as number);
  frames.push({
    caption: `Any range is now one subtraction. Sum of nums[${qa}..${qb}] = P[${qb + 1}] − P[${qa}] = ${prefix[qb + 1]} − ${prefix[qa]} = ${total}. No loop.`,
    layers: [
      arr(nums, { label: 'nums', tone: (k) => (k >= qa && k <= qb ? 'match' : 'dim'), spans: [{ from: qa, to: qb, tone: 'match', label: `sum ${total}` }] }),
      arr(prefix, { label: 'P', tone: (k) => (k === qa || k === qb + 1 ? 'match' : 'dim') }),
    ],
  });

  return {
    pattern: 'prefix-sum',
    title: 'Every range sum, one subtraction',
    setup: `nums = [${nums.join(', ')}] — then the sum of nums[${qa}..${qb}]`,
    frames,
    result: String(total),
    takeaway: 'Pay O(n) once to build P, and every range query after that is O(1): P[j + 1] − P[i].',
  };
}

// ---------------------------------------------------------------- binary search

export function binarySearch(): PatternAnimation {
  const nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const target = 23;
  const frames: Frame[] = [];
  let lo = 0;
  let hi = nums.length - 1;

  const layer = (mid: number, hot: Tone): ArrayLayer =>
    arr(nums, {
      tone: (k) => (k < lo || k > hi ? 'dim' : k === mid ? hot : 'window'),
      markers: [
        { at: lo, label: 'lo' },
        { at: mid, label: 'mid', tone: hot },
        { at: hi, label: 'hi' },
      ],
    });

  frames.push({ caption: `Sorted, so look in the middle. Whatever mid says, half the remaining range can be thrown away.`, layers: [layer(-1, 'active'), vars({ target })] });

  let result = 'not found';
  let steps = 0;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    steps++;
    if (nums[mid] === target) {
      result = String(mid);
      frames.push({ caption: `nums[${mid}] = ${nums[mid]}. Found in ${steps} looks — out of ${nums.length} elements.`, layers: [layer(mid, 'match'), vars({ target, steps }, ['steps'])] });
      break;
    }
    if (nums[mid]! < target) {
      frames.push({ caption: `nums[${mid}] = ${nums[mid]} < ${target}, so the answer is to the right. Everything up to mid is gone.`, layers: [layer(mid, 'bad'), vars({ target, steps })] });
      lo = mid + 1;
    } else {
      frames.push({ caption: `nums[${mid}] = ${nums[mid]} > ${target}, so the answer is to the left. Everything from mid on is gone.`, layers: [layer(mid, 'bad'), vars({ target, steps })] });
      hi = mid - 1;
    }
  }

  return {
    pattern: 'binary-search',
    title: 'Halve it every time',
    setup: `sorted nums = [${nums.join(', ')}], target = ${target}`,
    frames,
    result,
    takeaway: 'Each look discards half of what is left, so n elements take about log₂ n looks. Write mid as lo + (hi − lo) / 2.',
  };
}

// ---------------------------------------------------------------- greedy

export function greedy(): PatternAnimation {
  const nums = [2, 3, 1, 0, 4];
  const last = nums.length - 1;
  const frames: Frame[] = [];
  let reach = 0;

  const layer = (i: number, hot: Tone): ArrayLayer =>
    arr(nums, {
      label: 'max jump from here',
      tone: (k) => (k === i ? hot : k <= reach ? 'window' : undefined),
      markers: [
        { at: i, label: 'i', tone: hot },
        { at: Math.min(reach, last), label: 'reach', tone: 'match' },
      ],
    });

  frames.push({ caption: `Don't try every jump. Just track the farthest index you could reach so far — one number.`, layers: [layer(0, 'active'), vars({ reach })] });

  let result = 'false';
  for (let i = 0; i <= last; i++) {
    if (i > reach) {
      frames.push({ caption: `Index ${i} is beyond reach ${reach}. Nothing can get here, so the end is unreachable.`, layers: [layer(i, 'bad'), vars({ reach })] });
      break;
    }
    const before = reach;
    reach = Math.max(reach, i + nums[i]!);
    frames.push({
      caption:
        reach > before
          ? `From ${i} you can jump ${nums[i]}, reaching ${i + nums[i]!}. Reach grows to ${reach}.`
          : nums[i] === 0
            ? `A 0 at index ${i} — a dead end on its own, but reach is already ${reach}, past it. The greedy choice stepped over the trap.`
            : `From ${i}, ${i + nums[i]!} is no further than ${reach}. Reach stays.`,
      layers: [layer(i, 'active'), vars({ reach }, reach > before ? ['reach'] : [])],
    });
    if (reach >= last) {
      result = 'true';
      frames.push({ caption: `Reach ${reach} covers the last index ${last}. Reachable — decided in one pass, no backtracking.`, layers: [layer(i, 'match'), vars({ reach }, ['reach'])] });
      break;
    }
  }

  return {
    pattern: 'greedy',
    title: 'Keep only the best reach',
    setup: `nums = [${nums.join(', ')}] — each value is the longest jump from there. Can you reach the end?`,
    frames,
    result,
    takeaway: 'A greedy works when one number can summarise every choice so far. Here, "farthest reachable" makes all the paths irrelevant.',
  };
}

// ---------------------------------------------------------------- bit manipulation

export function bits(): PatternAnimation {
  const nums = [4, 1, 2, 1, 2];
  const frames: Frame[] = [];
  const bin = (n: number) => n.toString(2).padStart(3, '0');
  let acc = 0;

  frames.push({
    caption: 'XOR everything together. x ^ x = 0 and x ^ 0 = x, so every pair cancels and only the loner survives.',
    layers: [{ kind: 'array', indices: true, cells: nums.map((n) => ({ v: n, sub: bin(n) })) }, vars({ acc: `${acc} (${bin(acc)})` })],
  });

  nums.forEach((n, i) => {
    const before = acc;
    acc ^= n;
    frames.push({
      caption: `${bin(before)} ^ ${bin(n)} = ${bin(acc)}.${acc === 0 ? ' Everything so far has cancelled.' : ''}`,
      layers: [
        { kind: 'array', indices: true, cells: nums.map((m, k) => ({ v: m, sub: bin(m), tone: k === i ? 'active' : k < i ? 'done' : undefined })), markers: [{ at: i, label: '^', tone: 'active' }] },
        vars({ acc: `${acc} (${bin(acc)})` }, ['acc']),
      ],
    });
  });

  frames.push({
    caption: `The pairs of 1s and 2s cancelled out. What is left, ${acc}, is the number that appears once — O(n) time, O(1) space.`,
    layers: [{ kind: 'array', indices: true, cells: nums.map((m) => ({ v: m, sub: bin(m), tone: m === acc ? 'match' : 'dim' })) }, vars({ acc: `${acc} (${bin(acc)})` }, ['acc'])],
  });

  return {
    pattern: 'bit-manipulation',
    title: 'Let the pairs cancel',
    setup: `nums = [${nums.join(', ')}] — every value appears twice except one`,
    frames,
    result: String(acc),
    takeaway: 'XOR is its own inverse. When pairs must cancel, a running XOR finds what is left without any extra memory.',
  };
}

// ---------------------------------------------------------------- intervals

export function intervals(): PatternAnimation {
  const input: [number, number][] = [
    [1, 3],
    [8, 10],
    [2, 6],
    [15, 18],
  ];
  const label = (iv: [number, number]) => `${iv[0]}–${iv[1]}`;
  const frames: Frame[] = [];

  frames.push({ caption: 'Unsorted, overlaps can hide anywhere. Sort by start and they can only happen between neighbours.', layers: [arr(input.map(label), { label: 'intervals' })] });

  const sorted = [...input].sort((a, b) => a[0] - b[0]);
  frames.push({ caption: 'Sorted by start. Now one left-to-right sweep is enough.', layers: [arr(sorted.map(label), { label: 'sorted', tone: () => 'window' })] });

  const merged: [number, number][] = [[...sorted[0]!]];
  frames.push({
    caption: `Start the output with ${label(sorted[0]!)}.`,
    layers: [arr(sorted.map(label), { label: 'sorted', tone: (k) => (k === 0 ? 'done' : undefined), markers: [{ at: 0, label: 'i' }] }), arr(merged.map(label), { label: 'merged', tone: () => 'active' })],
  });

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const lastOut = merged[merged.length - 1]!;
    if (cur[0] <= lastOut[1]) {
      const was = label(lastOut);
      lastOut[1] = Math.max(lastOut[1], cur[1]);
      frames.push({
        caption: `${label(cur)} starts at ${cur[0]}, before ${was} ends at ${was.split('–')[1]}. They overlap: stretch the last one to ${label(lastOut)}.`,
        layers: [
          arr(sorted.map(label), { label: 'sorted', tone: (k) => (k === i ? 'active' : k < i ? 'done' : undefined), markers: [{ at: i, label: 'i', tone: 'active' }] }),
          arr(merged.map(label), { label: 'merged', tone: (k) => (k === merged.length - 1 ? 'match' : undefined) }),
        ],
      });
    } else {
      merged.push([...cur]);
      frames.push({
        caption: `${label(cur)} starts after ${label(lastOut)} ends. A gap — start a new interval.`,
        layers: [
          arr(sorted.map(label), { label: 'sorted', tone: (k) => (k === i ? 'active' : k < i ? 'done' : undefined), markers: [{ at: i, label: 'i', tone: 'active' }] }),
          arr(merged.map(label), { label: 'merged', tone: (k) => (k === merged.length - 1 ? 'active' : undefined) }),
        ],
      });
    }
  }

  const result = merged.map((m) => `[${m[0]},${m[1]}]`).join(' ');
  frames.push({ caption: `Done: ${merged.length} intervals. The sort was O(n log n); the sweep was O(n).`, layers: [arr(merged.map(label), { label: 'merged', tone: () => 'match' })] });

  return {
    pattern: 'intervals',
    title: 'Sort, then sweep once',
    setup: `intervals = ${input.map((iv) => `[${iv[0]},${iv[1]}]`).join(' ')} — merge the overlapping ones`,
    frames,
    result,
    takeaway: 'Sorting by start means an interval can only overlap the one before it. The sort is the whole trick; the sweep is trivial.',
  };
}

// ---------------------------------------------------------------- stack

export function stack(): PatternAnimation {
  const s = '({[]})';
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const chars = [...s];
  const st: Cell[] = [];
  const frames: Frame[] = [];
  let uid = 0;
  const stackLayer = (hot?: Tone): StackLayer => ({ kind: 'stack', label: 'stack (top first)', items: [...st].reverse().map((c, k) => ({ ...c, tone: k === 0 ? hot : undefined })), empty: 'empty' });

  frames.push({ caption: 'Every closer must match the most recent unmatched opener. "Most recent" is a stack.', layers: [arr(chars), stackLayer()] });

  let result = 'true';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const at = (tone: Tone): ArrayLayer => arr(chars, { tone: (k) => (k === i ? tone : k < i ? 'done' : undefined), markers: [{ at: i, label: 'i', tone }] });
    if (!pairs[c]) {
      st.push({ v: c, id: `s${uid++}` });
      frames.push({ caption: `'${c}' opens. Push it and wait for its closer.`, layers: [at('active'), stackLayer('active')] });
    } else {
      const top = st[st.length - 1];
      if (top?.v === pairs[c]) {
        frames.push({ caption: `'${c}' closes, and the top is '${top.v}' — a match. Pop it.`, layers: [at('match'), stackLayer('match')] });
        st.pop();
      } else {
        result = 'false';
        frames.push({ caption: `'${c}' closes, but the top is ${top ? `'${top.v}'` : 'nothing'}. Mismatch — invalid.`, layers: [at('bad'), stackLayer('bad')] });
        break;
      }
    }
  }

  if (result === 'true' && st.length > 0) result = 'false';
  frames.push({
    caption: result === 'true' ? 'Every opener was closed in order and the stack is empty. Valid.' : 'Something was left open or closed out of order. Invalid.',
    layers: [arr(chars, { tone: () => (result === 'true' ? 'match' : 'bad') }), stackLayer()],
  });

  return {
    pattern: 'stack',
    title: 'The most recent one first',
    setup: `s = "${s}" — are the brackets balanced and correctly nested?`,
    frames,
    result,
    takeaway: 'When the next thing to resolve is always the most recent unresolved thing, you want a stack.',
  };
}

// ---------------------------------------------------------------- monotonic stack

export function monotonicStack(): PatternAnimation {
  const nums = [2, 1, 5, 3, 6, 4];
  const ans: (number | string)[] = nums.map(() => '?');
  const st: number[] = [];
  const frames: Frame[] = [];

  const layers = (i: number, popped: number[] = []): Layer[] => [
    arr(nums, {
      label: 'nums',
      tone: (k) => (k === i ? 'active' : popped.includes(k) ? 'match' : st.includes(k) ? 'window' : undefined),
      markers: i >= 0 && i < nums.length ? [{ at: i, label: 'i', tone: 'active' }] : [],
    }),
    { kind: 'stack', label: 'waiting (indices)', items: [...st].reverse().map((k) => ({ v: nums[k]!, sub: `#${k}`, id: `m${k}` })), empty: 'empty' },
    arr(ans, { label: 'next greater', tone: (k) => (popped.includes(k) ? 'match' : ans[k] === '?' ? 'dim' : 'done') }),
  ];

  frames.push({ caption: 'Keep a stack of indices still waiting for a bigger value. It stays decreasing from bottom to top.', layers: layers(-1) });

  for (let i = 0; i < nums.length; i++) {
    const popped: number[] = [];
    while (st.length > 0 && nums[st[st.length - 1]!]! < nums[i]!) {
      const k = st.pop()!;
      ans[k] = nums[i]!;
      popped.push(k);
    }
    st.push(i);
    frames.push({
      caption:
        popped.length > 0
          ? `${nums[i]} is bigger than ${popped.map((k) => nums[k]).join(' and ')} — that answers them. Pop, record ${nums[i]}, then ${nums[i]} waits too.`
          : `${nums[i]} is not bigger than the top, so nothing is answered. ${nums[i]} joins the waiting stack.`,
      layers: layers(i, popped),
    });
  }

  while (st.length > 0) ans[st.pop()!] = -1;
  frames.push({
    caption: 'Whatever is still waiting never met a bigger value: −1. Every index was pushed once and popped once — O(n) total.',
    layers: [arr(nums, { label: 'nums' }), arr(ans, { label: 'next greater', tone: () => 'match' })],
  });

  return {
    pattern: 'monotonic-stack',
    title: 'Wait until something bigger shows up',
    setup: `nums = [${nums.join(', ')}] — for each element, the next element to its right that is larger`,
    frames,
    result: ans.join(','),
    takeaway: 'Each element is pushed once and popped once, so the whole scan is O(n) even though there is a loop inside the loop.',
  };
}
