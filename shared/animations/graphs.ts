import type { Cell, Frame, GraphEdge, GraphLayer, GraphNode, GridLayer, PatternAnimation, Tone } from './types.ts';

// ---------------------------------------------------------------- flood fill (islands)

export function graphTraversal(): PatternAnimation {
  const grid = [
    [1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
  ];
  const m = grid.length;
  const n = grid[0]!.length;
  const island: number[][] = grid.map((row) => row.map(() => 0)); // 0 = unvisited, k = which island
  const frames: Frame[] = [];
  let count = 0;
  let queue: [number, number][] = [];

  const layer = (cur?: [number, number]): GridLayer => ({
    kind: 'grid',
    label: 'grid (1 = land)',
    rows: grid.map((row, r) =>
      row.map((v, c): Cell => {
        const k = island[r]![c]!;
        const queued = queue.some(([qr, qc]) => qr === r && qc === c);
        let tone: Tone | undefined;
        if (cur && cur[0] === r && cur[1] === c) tone = 'active';
        else if (queued) tone = 'window';
        else if (k === count && k > 0) tone = 'match';
        else if (k > 0) tone = 'done';
        else if (v === 0) tone = 'dim';
        return { v: k > 0 ? `#${k}` : v, tone };
      }),
    ),
  });

  frames.push({ caption: 'Scan every cell. Unvisited land means a new island — flood it with BFS so none of its cells is counted twice.', layers: [layer(), { kind: 'vars', items: [{ k: 'islands', v: '0' }] }] });

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r]![c] !== 1 || island[r]![c] !== 0) continue;
      count++;
      island[r]![c] = count;
      queue = [[r, c]];
      frames.push({ caption: `Unvisited land at (${r}, ${c}): island #${count}. Mark it visited as it enters the queue, not when it leaves.`, layers: [layer([r, c]), { kind: 'vars', items: [{ k: 'islands', v: String(count), tone: 'active' }] }] });
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        const found: string[] = [];
        for (const [dr, dc] of dirs) {
          const nr = cr + dr!;
          const nc = cc + dc!;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
          if (grid[nr]![nc] !== 1 || island[nr]![nc] !== 0) continue;
          island[nr]![nc] = count;
          queue.push([nr, nc]);
          found.push(`(${nr}, ${nc})`);
        }
        frames.push({
          caption: found.length > 0 ? `From (${cr}, ${cc}), land at ${found.join(' and ')} joins island #${count}.` : `(${cr}, ${cc}) has no new land around it.${queue.length === 0 ? ` Island #${count} is complete.` : ''}`,
          layers: [layer([cr, cc]), { kind: 'vars', items: [{ k: 'islands', v: String(count) }] }],
        });
      }
    }
  }

  frames.push({ caption: `Scan finished: ${count} islands. Every cell was looked at a constant number of times — O(m·n).`, layers: [layer(), { kind: 'vars', items: [{ k: 'islands', v: String(count), tone: 'match' }] }] });

  return {
    pattern: 'graph-traversal',
    title: 'Flood each island once',
    setup: 'a 4 × 5 grid of land (1) and water (0) — how many islands?',
    frames,
    result: String(count),
    takeaway: 'Mark cells visited when you enqueue them. Marking on dequeue lets the same cell into the queue several times.',
  };
}

// ---------------------------------------------------------------- topological sort (Kahn)

export function topologicalSort(): PatternAnimation {
  const pos: Record<string, [number, number]> = { A: [8, 50], B: [36, 20], C: [36, 80], D: [64, 50], E: [92, 50] };
  const edges: [string, string][] = [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['C', 'D'],
    ['D', 'E'],
  ];
  const indeg: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const [, to] of edges) indeg[to]!++;
  const used = new Set<string>();
  const order: string[] = [];
  let queue = Object.keys(indeg).filter((k) => indeg[k] === 0);
  const frames: Frame[] = [];

  const graph = (hot?: string): GraphLayer => ({
    kind: 'graph',
    nodes: Object.entries(pos).map(([id, [x, y]]): GraphNode => ({
      id,
      v: id,
      x,
      y,
      tone: id === hot ? 'active' : order.includes(id) ? 'done' : queue.includes(id) ? 'window' : undefined,
      sub: order.includes(id) ? undefined : `in ${indeg[id]}`,
    })),
    edges: edges.map(([from, to]): GraphEdge => ({ from, to, directed: true, tone: used.has(`${from}${to}`) ? 'dim' : from === hot ? 'active' : undefined })),
  });
  const orderLayer = () => ({ kind: 'array' as const, label: 'order', cells: order.map((v) => ({ v, tone: 'done' as Tone })) });

  frames.push({ caption: `Count incoming edges. Anything with none has no prerequisites left, so it can go first: ${queue.join(', ')}.`, layers: [graph(), { kind: 'queue', label: 'ready', items: queue.map((v) => ({ v, id: v })) }, orderLayer()] });

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    const freed: string[] = [];
    for (const [from, to] of edges) {
      if (from !== node) continue;
      used.add(`${from}${to}`);
      indeg[to]!--;
      if (indeg[to] === 0) {
        queue.push(to);
        freed.push(to);
      }
    }
    frames.push({
      caption: freed.length > 0 ? `Take ${node}. Removing its edges drops ${freed.join(' and ')} to zero — now ready.` : `Take ${node}. ${edges.some(([f]) => f === node) ? 'Its edges come off, but nothing else is freed yet.' : 'Nothing depends on it.'}`,
      layers: [graph(node), { kind: 'queue', label: 'ready', items: queue.map((v) => ({ v, id: v })), empty: 'empty' }, orderLayer()],
    });
  }

  const complete = order.length === Object.keys(indeg).length;
  frames.push({
    caption: complete ? `All ${order.length} nodes came out: ${order.join(' → ')} is a valid order. If fewer had come out, the rest would be stuck in a cycle.` : 'Some nodes never reached zero — they sit on a cycle, so no valid order exists.',
    layers: [graph(), orderLayer()],
  });

  return {
    pattern: 'topological-sort',
    title: 'Peel off what has no prerequisites',
    setup: 'A → B, A → C, B → D, C → D, D → E — an order that respects every arrow',
    frames,
    result: order.join(''),
    takeaway: 'Repeatedly take a node with in-degree 0. If some never reach 0, there is a cycle — that is how course-schedule detects it.',
  };
}

// ---------------------------------------------------------------- union-find

export function unionFind(): PatternAnimation {
  const n = 6;
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = Array(n).fill(1) as number[];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [3, 4],
    [2, 0],
    [4, 5],
  ];
  const frames: Frame[] = [];
  const redundant: string[] = [];

  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]!]!; // path halving
      x = parent[x]!;
    }
    return x;
  };

  const layers = (hot: number[] = [], tone: Tone = 'active') => [
    {
      kind: 'graph' as const,
      label: 'each node points at its parent',
      nodes: parent.map((_, i): GraphNode => ({ id: `u${i}`, v: i, x: 8 + i * 16.8, y: parent[i] === i ? 25 : 72, tone: hot.includes(i) ? tone : parent[i] === i ? 'done' : undefined, sub: parent[i] === i ? 'root' : undefined })),
      edges: parent.flatMap((p, i): GraphEdge[] => (p === i ? [] : [{ from: `u${i}`, to: `u${p}`, directed: true }])),
      height: 120,
    },
    { kind: 'array' as const, label: 'parent', indices: true, cells: parent.map((p, i) => ({ v: p, tone: (hot.includes(i) ? tone : undefined) as Tone | undefined })) },
  ];

  frames.push({ caption: 'Every node starts as its own root. Two nodes are connected exactly when find() gives them the same root.', layers: layers() });

  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) {
      redundant.push(`${a}–${b}`);
      frames.push({ caption: `Edge ${a}–${b}: find(${a}) = find(${b}) = ${ra}. Already connected, so this edge closes a cycle.`, layers: layers([a, b], 'bad') });
      continue;
    }
    const [big, small] = size[ra]! >= size[rb]! ? [ra, rb] : [rb, ra];
    parent[small] = big;
    size[big]! += size[small]!;
    frames.push({ caption: `Edge ${a}–${b}: roots ${ra} and ${rb} differ. Attach the smaller tree (${small}) under the bigger (${big}) so trees stay shallow.`, layers: layers([a, b]) });
  }

  const roots = new Set(parent.map((_, i) => find(i)));
  frames.push({
    caption: `${roots.size} components remain. With union by size and path compression, each operation is effectively constant time.`,
    layers: layers([...roots], 'match'),
  });

  return {
    pattern: 'union-find',
    title: 'Point everything at a root',
    setup: `6 nodes, edges ${edges.map(([a, b]) => `${a}–${b}`).join(', ')} — how many components, and which edge is redundant?`,
    frames,
    result: `${roots.size} components, redundant ${redundant.join(',')}`,
    takeaway: 'union() returning false is a free cycle check. Union by size plus path compression makes every call effectively O(1).',
  };
}

// ---------------------------------------------------------------- Dijkstra

export function shortestPath(): PatternAnimation {
  const pos: Record<string, [number, number]> = { A: [8, 50], B: [40, 18], C: [40, 82], D: [70, 50], E: [94, 50] };
  const weighted: [string, string, number][] = [
    ['A', 'B', 4],
    ['A', 'C', 1],
    ['C', 'B', 2],
    ['B', 'D', 1],
    ['C', 'D', 5],
    ['D', 'E', 3],
  ];
  const dist: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };
  const settled = new Set<string>();
  let pq: [number, string][] = [[0, 'A']];
  const frames: Frame[] = [];
  const show = (d: number) => (d === Infinity ? '∞' : String(d));

  const layers = (hot?: string, relaxed: string[] = [], hotTone: Tone = 'active') => [
    {
      kind: 'graph' as const,
      nodes: Object.entries(pos).map(([id, [x, y]]): GraphNode => ({
        id,
        v: id,
        x,
        y,
        sub: show(dist[id]!),
        tone: id === hot ? hotTone : relaxed.includes(id) ? 'window' : settled.has(id) ? 'done' : undefined,
      })),
      edges: weighted.map(([a, b, w]): GraphEdge => ({ from: a, to: b, label: String(w), tone: hot && ((a === hot && relaxed.includes(b)) || (b === hot && relaxed.includes(a))) ? 'active' : undefined })),
    },
    { kind: 'queue' as const, label: 'min-heap (dist:node)', items: [...pq].sort((x, y) => x[0] - y[0]).map(([d, v], i) => ({ v: `${d}:${v}`, id: `${d}${v}${i}` })), empty: 'empty' },
  ];

  frames.push({ caption: 'Always expand the closest unsettled node. With non-negative weights, the closest one can never get closer later.', layers: layers() });

  while (pq.length > 0) {
    pq.sort((x, y) => x[0] - y[0]);
    const [d, u] = pq.shift()!;
    if (settled.has(u)) {
      frames.push({ caption: `Pop ${d}:${u} — but ${u} is already settled at ${dist[u]}. A stale entry: skip it. Cheaper than updating the heap in place.`, layers: layers(u, [], 'dim') });
      continue;
    }
    settled.add(u);
    const relaxed: string[] = [];
    for (const [a, b, w] of weighted) {
      const v = a === u ? b : b === u ? a : null;
      if (!v || settled.has(v)) continue;
      if (d + w < dist[v]!) {
        dist[v] = d + w;
        pq.push([d + w, v]);
        relaxed.push(v);
      }
    }
    frames.push({
      caption: relaxed.length > 0 ? `Settle ${u} at ${d}. Going through ${u} is cheaper for ${relaxed.map((v) => `${v} (now ${dist[v]})`).join(' and ')}.` : `Settle ${u} at ${d}. No neighbour gets any cheaper through it.`,
      layers: layers(u, relaxed),
    });
  }

  frames.push({ caption: `Every node settled. Shortest distances from A: ${Object.entries(dist).map(([k, v]) => `${k} ${v}`).join(', ')}. O(E log V).`, layers: layers(undefined, [], 'match') });

  return {
    pattern: 'shortest-path',
    title: 'Settle the closest node first',
    setup: 'weighted graph, start at A — the cheapest distance to every node',
    frames,
    result: Object.entries(dist)
      .map(([k, v]) => `${k}${v}`)
      .join(' '),
    takeaway: 'Push new distances instead of decreasing keys, and skip any entry that pops for an already-settled node.',
  };
}
