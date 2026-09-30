import { heapPos } from './trees.ts';
import type { Cell, Frame, GraphEdge, GraphLayer, GraphNode, PatternAnimation, Tone } from './types.ts';

// ---------------------------------------------------------------- 1-D DP (house robber)

export function dp1d(): PatternAnimation {
  const nums = [2, 7, 9, 3, 1];
  const dp: (number | string)[] = nums.map(() => '');
  const frames: Frame[] = [];
  const layers = (i: number, deps: number[] = [], hot: Tone = 'active') => [
    { kind: 'array' as const, label: 'house values', indices: true, cells: nums.map((v, k) => ({ v, tone: (k === i ? hot : undefined) as Tone | undefined })) },
    { kind: 'array' as const, label: 'dp[i] = best loot from houses 0..i', indices: true, cells: dp.map((v, k) => ({ v, tone: (k === i ? hot : deps.includes(k) ? 'window' : v === '' ? 'dim' : 'done') as Tone })) },
  ];

  frames.push({ caption: 'dp[i] is the best you can do with the first i + 1 houses. Each house is a choice: rob it (and skip its neighbour) or skip it.', layers: layers(-1) });

  dp[0] = nums[0]!;
  frames.push({ caption: `One house: take it. dp[0] = ${dp[0]}.`, layers: layers(0) });
  dp[1] = Math.max(nums[0]!, nums[1]!);
  frames.push({ caption: `Two houses, adjacent, so pick the richer one. dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.`, layers: layers(1, [0]) });

  for (let i = 2; i < nums.length; i++) {
    const skip = dp[i - 1] as number;
    const rob = (dp[i - 2] as number) + nums[i]!;
    dp[i] = Math.max(skip, rob);
    frames.push({
      caption: `House ${i}: skip it and keep dp[${i - 1}] = ${skip}, or rob it for dp[${i - 2}] + ${nums[i]} = ${rob}. ${rob > skip ? 'Rob' : skip > rob ? 'Skip' : 'Either'} — dp[${i}] = ${dp[i]}.`,
      layers: layers(i, [i - 1, i - 2]),
    });
  }

  const best = dp[dp.length - 1] as number;
  frames.push({ caption: `The answer is the last cell, ${best}. Each cell read two earlier ones, so two variables would do instead of an array: O(1) space.`, layers: layers(dp.length - 1, [], 'match') });

  return {
    pattern: 'dp-1d',
    title: 'Each answer from the two before it',
    setup: `houses = [${nums.join(', ')}] — the most you can take without robbing two neighbours`,
    frames,
    result: String(best),
    takeaway: 'Write the recurrence first, in words: "the best up to i is the better of skipping i or taking it". The table just stores it.',
  };
}

// ---------------------------------------------------------------- 2-D DP (grid paths)

export function dp2d(): PatternAnimation {
  const rows = 3;
  const cols = 4;
  const dp: (number | '')[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
  const frames: Frame[] = [];
  const grid = (hot?: [number, number], deps: [number, number][] = [], hotTone: Tone = 'active') => ({
    kind: 'grid' as const,
    label: 'dp[r][c] = ways to reach cell (r, c)',
    rows: dp.map((row, r) =>
      row.map((v, c): Cell => {
        const isHot = hot && hot[0] === r && hot[1] === c;
        const isDep = deps.some(([dr, dc]) => dr === r && dc === c);
        return { v, tone: isHot ? hotTone : isDep ? 'window' : v === '' ? 'dim' : 'done' };
      }),
    ),
  });

  frames.push({ caption: 'Moving only right or down, every path into a cell arrives from above or from the left. So its count is the sum of those two.', layers: [grid()] });

  for (let c = 0; c < cols; c++) dp[0]![c] = 1;
  for (let r = 0; r < rows; r++) dp[r]![0] = 1;
  frames.push({ caption: 'The top row and left column can each be reached one way only — straight along the edge. Fill them with 1.', layers: [grid()] });

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      const up = dp[r - 1]![c] as number;
      const left = dp[r]![c - 1] as number;
      dp[r]![c] = up + left;
      frames.push({ caption: `(${r}, ${c}) = from above ${up} + from the left ${left} = ${up + left}.`, layers: [grid([r, c], [[r - 1, c], [r, c - 1]])] });
    }
  }

  const result = dp[rows - 1]![cols - 1] as number;
  frames.push({ caption: `The bottom-right cell holds the answer: ${result} paths. m·n cells, O(1) work each. Only the row above is ever read, so one row of memory suffices.`, layers: [grid([rows - 1, cols - 1], [], 'match')] });

  return {
    pattern: 'dp-2d',
    title: 'Fill the table from its neighbours',
    setup: `a ${rows} × ${cols} grid, moving only right or down — how many paths from top-left to bottom-right?`,
    frames,
    result: String(result),
    takeaway: 'Two indices, one recurrence over neighbouring cells. Fill in an order where the cells you depend on are already done.',
  };
}

// ---------------------------------------------------------------- backtracking (subsets)

export function backtracking(): PatternAnimation {
  const nums = [1, 2, 3];
  const depth = nums.length;
  const total = 2 ** (depth + 1) - 1; // a full binary decision tree
  const label = new Map<number, string>();
  const visited = new Set<number>();
  const recorded: string[] = [];
  const path: number[] = [];
  const frames: Frame[] = [];
  const fmt = (xs: number[]) => (xs.length ? `{${xs.join(',')}}` : '{}');
  /** What fits inside a node: "12" for {1,2}, "∅" for the empty set. */
  const short = (xs: number[]) => (xs.length ? xs.join('') : '∅');

  const tree = (hot?: number, hotTone: Tone = 'active'): GraphLayer => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    for (let i = 0; i < total; i++) {
      nodes.push({ id: `b${i}`, v: label.get(i) ?? '', ...heapPos(i, depth), tone: i === hot ? hotTone : visited.has(i) ? (i >= 2 ** depth - 1 ? 'match' : 'done') : 'hidden' });
      if (i > 0) edges.push({ from: `b${Math.floor((i - 1) / 2)}`, to: `b${i}`, tone: visited.has(i) ? undefined : 'hidden', label: i % 2 === 1 ? `+${nums[Math.floor(Math.log2(i + 1)) - 1]}` : undefined });
    }
    return { kind: 'graph', label: 'left = take it, right = skip it', nodes, edges, height: 170 };
  };
  const side = () => [
    { kind: 'array' as const, label: 'path', cells: path.map((v) => ({ v, tone: 'active' as Tone })) },
    { kind: 'map' as const, label: `subsets found (${recorded.length})`, entries: recorded.map((s, k) => ({ k: String(k + 1), v: s })), empty: 'none yet' },
  ];

  frames.push({ caption: 'At each element, branch twice: take it or leave it. Every root-to-leaf path is one subset — 2ⁿ leaves.', layers: [tree(), ...side()] });

  const go = (i: number, node: number) => {
    visited.add(node);
    label.set(node, short(path));
    if (i === depth) {
      recorded.push(fmt(path));
      frames.push({ caption: `A leaf: record ${fmt(path)}. Then back up — undo the last choice so the next branch starts clean.`, layers: [tree(node, 'match'), ...side()] });
      return;
    }
    frames.push({ caption: `Decide on ${nums[i]}. Path so far: ${fmt(path)}.`, layers: [tree(node), ...side()] });
    path.push(nums[i]!);
    go(i + 1, 2 * node + 1);
    path.pop();
    go(i + 1, 2 * node + 2);
  };
  go(0, 0);

  frames.push({ caption: `All ${recorded.length} subsets. Copying each one costs up to n, so the total is O(n · 2ⁿ) — the output size, which no algorithm can beat.`, layers: [tree(), ...side()] });

  return {
    pattern: 'backtracking',
    title: 'Choose, explore, un-choose',
    setup: `nums = [${nums.join(', ')}] — every subset`,
    frames,
    result: String(recorded.length),
    takeaway: 'Add, recurse, remove. Record a COPY of the path — storing the path itself stores something you are about to empty.',
  };
}
