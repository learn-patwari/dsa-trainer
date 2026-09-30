import type { Frame, GraphEdge, GraphLayer, GraphNode, PatternAnimation, StackLayer, Tone } from './types.ts';

/** Position for heap index i in a tree of the given depth: level by level, spread evenly. */
export function heapPos(i: number, depth: number): { x: number; y: number } {
  const d = Math.floor(Math.log2(i + 1));
  const offset = i - (2 ** d - 1);
  const slots = 2 ** d;
  return { x: ((offset + 0.5) / slots) * 100, y: depth === 0 ? 50 : 10 + (d / depth) * 80 };
}

/** A binary tree stored by heap index (null for a missing node), drawn with per-node tones. */
function tree(values: readonly (number | null)[], tone: (i: number) => Tone | undefined, sub: (i: number) => string | undefined = () => undefined, label?: string): GraphLayer {
  const present = values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0);
  const depth = Math.floor(Math.log2(Math.max(...present) + 1));
  const nodes: GraphNode[] = present.map((i) => ({ id: `t${i}`, v: values[i]!, ...heapPos(i, depth), tone: tone(i), sub: sub(i) }));
  const edges: GraphEdge[] = present
    .filter((i) => i > 0)
    .map((i) => {
      const parent = Math.floor((i - 1) / 2);
      const t = tone(i);
      return { from: `t${parent}`, to: `t${i}`, tone: t === 'hidden' ? 'hidden' : t === 'active' || t === 'match' ? t : undefined };
    });
  return { kind: 'graph', label, nodes, edges };
}

// ---------------------------------------------------------------- tree DFS

export function treeDfs(): PatternAnimation {
  const values = [3, 9, 20, null, null, 15, 7];
  const frames: Frame[] = [];
  const state = new Map<number, 'open' | 'done'>();
  const returned = new Map<number, number>();
  const calls: number[] = [];

  const snap = (caption: string, hot?: number) =>
    frames.push({
      caption,
      layers: [
        tree(
          values,
          (i) => (i === hot ? 'active' : state.get(i) === 'done' ? 'done' : state.get(i) === 'open' ? 'window' : undefined),
          (i) => (returned.has(i) ? `→ ${returned.get(i)}` : undefined),
        ),
        { kind: 'stack', label: 'call stack', items: [...calls].reverse().map((i) => ({ v: values[i]!, id: `c${i}`, sub: `depth(${values[i]})` })), empty: 'empty' } satisfies StackLayer,
      ],
    });

  snap('Ask each node one question: how deep is the tree below you? A node can only answer once both children have.');

  const depth = (i: number): number => {
    if (i >= values.length || values[i] == null) return 0;
    state.set(i, 'open');
    calls.push(i);
    snap(`Visit ${values[i]}. Before it can answer, it asks its children.`, i);
    const l = depth(2 * i + 1);
    const r = depth(2 * i + 2);
    const d = 1 + Math.max(l, r);
    returned.set(i, d);
    state.set(i, 'done');
    calls.pop();
    snap(
      l === 0 && r === 0
        ? `${values[i]} is a leaf: both children are null, which answer 0. So ${values[i]} returns 1.`
        : `${values[i]} heard ${l} from the left and ${r} from the right. It returns 1 + max(${l}, ${r}) = ${d}.`,
      i,
    );
    return d;
  };

  const result = depth(0);
  snap(`The root answers ${result}. Every node was visited once — O(n) time, O(h) stack for the recursion.`);

  return {
    pattern: 'tree-dfs',
    title: 'Answers flow up from the leaves',
    setup: 'root = [3, 9, 20, null, null, 15, 7] — the maximum depth',
    frames,
    result: String(result),
    takeaway: 'Define what a node returns in terms of what its children return. Handle null first; the recursion does the rest.',
  };
}

// ---------------------------------------------------------------- tree BFS

export function treeBfs(): PatternAnimation {
  const values = [1, 2, 3, 4, 5, null, 6];
  const frames: Frame[] = [];
  const done = new Set<number>();
  const levels: number[][] = [];
  let queue: number[] = [0];

  const snap = (caption: string, hot: number[] = []) =>
    frames.push({
      caption,
      layers: [
        tree(values, (i) => (hot.includes(i) ? 'active' : done.has(i) ? 'done' : queue.includes(i) ? 'window' : undefined)),
        { kind: 'queue', label: 'queue (front first)', items: queue.map((i) => ({ v: values[i]!, id: `q${i}` })), empty: 'empty' },
        { kind: 'map', label: 'levels', entries: levels.map((lv, k) => ({ k: `level ${k}`, v: `[${lv.join(', ')}]` })), empty: 'none yet' },
      ],
    });

  snap('Process the tree one level at a time. The queue holds the next level while you finish this one.');

  while (queue.length > 0) {
    const size = queue.length;
    const level: number[] = [];
    snap(`${size} node${size > 1 ? 's' : ''} in the queue — that is exactly one level. Snapshot the size before the loop.`, [...queue]);
    const nextQueue: number[] = [];
    for (let k = 0; k < size; k++) {
      const i = queue[k]!;
      level.push(values[i]!);
      for (const c of [2 * i + 1, 2 * i + 2]) if (c < values.length && values[c] != null) nextQueue.push(c);
      done.add(i);
    }
    queue = nextQueue;
    levels.push(level);
    snap(`Level ${levels.length - 1} done: [${level.join(', ')}]. Their children are now the queue.`);
  }

  snap('The queue is empty — every level recorded, each node visited once. O(n) time, O(width) queue.');

  return {
    pattern: 'tree-bfs',
    title: 'One level at a time',
    setup: 'root = [1, 2, 3, 4, 5, null, 6] — the values level by level',
    frames,
    result: levels.map((l) => `[${l.join(',')}]`).join(''),
    takeaway: 'Take queue.size() before the inner loop. Then one pass of the loop is exactly one level.',
  };
}

// ---------------------------------------------------------------- heap / top-k

export function heap(): PatternAnimation {
  const stream = [3, 1, 5, 12, 2, 11];
  const k = 3;
  const h: number[] = [];
  const frames: Frame[] = [];

  const up = (i: number) => {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (h[p]! <= h[i]!) break;
      [h[p], h[i]] = [h[i]!, h[p]!];
      i = p;
    }
  };
  const down = (i: number) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < h.length && h[l]! < h[m]!) m = l;
      if (r < h.length && h[r]! < h[m]!) m = r;
      if (m === i) break;
      [h[m], h[i]] = [h[i]!, h[m]!];
      i = m;
    }
  };

  const heapLayer = (hot: Tone = 'active'): GraphLayer => {
    const depth = Math.max(1, Math.floor(Math.log2(Math.max(1, h.length))));
    return {
      kind: 'graph',
      label: `min-heap, size ≤ ${k}`,
      nodes: h.map((v, i) => ({ id: `h${v}`, v, ...heapPos(i, depth), tone: i === 0 ? hot : undefined, sub: i === 0 ? 'min' : undefined })),
      edges: h.map((v, i) => (i === 0 ? null : { from: `h${h[Math.floor((i - 1) / 2)]}`, to: `h${v}` })).filter((e): e is GraphEdge => e !== null),
      height: 150,
    };
  };
  const streamLayer = (at: number) => ({ kind: 'array' as const, label: 'stream', indices: true, cells: stream.map((v, i) => ({ v, tone: (i === at ? 'active' : i < at ? 'done' : undefined) as Tone | undefined })), markers: at >= 0 && at < stream.length ? [{ at, label: 'next' }] : [] });

  frames.push({ caption: `Keep only the ${k} largest seen so far, in a min-heap. Its root is then the ${k}rd largest — and the first to evict.`, layers: [streamLayer(-1), heapLayer()] });

  stream.forEach((x, i) => {
    h.push(x);
    up(h.length - 1);
    if (h.length > k) {
      frames.push({ caption: `Push ${x}. The heap now holds ${k + 1} — one too many.`, layers: [streamLayer(i), heapLayer('bad')] });
      const evicted = h[0]!;
      h[0] = h[h.length - 1]!;
      h.pop();
      down(0);
      frames.push({ caption: `Pop the smallest, ${evicted}: it can't be in the top ${k}. O(log k) per push, not O(n log n) for a full sort.`, layers: [streamLayer(i), heapLayer('active')] });
    } else {
      frames.push({ caption: `Push ${x}. Still ${h.length} of ${k}, so keep everything.`, layers: [streamLayer(i), heapLayer('active')] });
    }
  });

  frames.push({ caption: `Stream done. The heap holds the top ${k}, and its root ${h[0]} is the ${k}rd largest overall.`, layers: [streamLayer(stream.length), heapLayer('match')] });

  return {
    pattern: 'heap',
    title: 'A small heap for the top k',
    setup: `stream = [${stream.join(', ')}], k = ${k} — the ${k}rd largest value`,
    frames,
    result: String(h[0]),
    takeaway: 'For the k largest, keep a MIN-heap of size k. Whatever is smaller than its root cannot make the cut. O(n log k).',
  };
}

// ---------------------------------------------------------------- trie

export function trie(): PatternAnimation {
  const words = ['cat', 'car', 'dog'];
  interface TNode {
    id: string;
    ch: string;
    kids: Map<string, TNode>;
    end: boolean;
    depth: number;
    x: number;
  }
  const mk = (ch: string, depth: number, id: string): TNode => ({ id, ch, kids: new Map(), end: false, depth, x: 0 });
  const root = mk('·', 0, 'root');

  // Build the whole trie once to lay it out, then reveal it insert by insert.
  for (const w of words) {
    let n = root;
    for (const [i, c] of [...w].entries()) {
      if (!n.kids.has(c)) n.kids.set(c, mk(c, i + 1, `${n.id}/${c}`));
      n = n.kids.get(c)!;
    }
  }
  const leaves: TNode[] = [];
  const collect = (n: TNode) => (n.kids.size === 0 ? leaves.push(n) : n.kids.forEach(collect));
  collect(root);
  leaves.forEach((l, i) => (l.x = ((i + 0.5) / leaves.length) * 100));
  const place = (n: TNode): number => {
    if (n.kids.size === 0) return n.x;
    const xs = [...n.kids.values()].map(place);
    n.x = xs.reduce((a, b) => a + b, 0) / xs.length;
    return n.x;
  };
  place(root);
  const all: TNode[] = [];
  const walk = (n: TNode) => {
    all.push(n);
    n.kids.forEach(walk);
  };
  walk(root);
  const maxDepth = Math.max(...all.map((n) => n.depth));

  const shown = new Set<string>(['root']);
  const ends = new Set<string>();
  const frames: Frame[] = [];
  const layer = (hot: string[] = [], hotTone: Tone = 'active', bad?: string): GraphLayer => ({
    kind: 'graph',
    label: 'trie',
    nodes: all.map((n) => ({
      id: n.id,
      v: n.ch,
      x: n.x,
      y: 10 + (n.depth / maxDepth) * 80,
      tone: hot.includes(n.id) ? hotTone : n.id === bad ? 'bad' : shown.has(n.id) ? (ends.has(n.id) ? 'done' : undefined) : 'hidden',
      sub: ends.has(n.id) && shown.has(n.id) ? 'word' : undefined,
    })),
    edges: all
      .filter((n) => n !== root)
      .map((n) => ({ from: n.id.slice(0, n.id.lastIndexOf('/')) || 'root', to: n.id, tone: shown.has(n.id) ? (hot.includes(n.id) ? hotTone : undefined) : ('hidden' as Tone) })),
    height: 170,
  });

  frames.push({ caption: 'Each edge is one letter. Words that share a prefix share the path — that is the whole saving.', layers: [layer()] });

  for (const w of words) {
    let n = root;
    const path: string[] = [];
    let created = 0;
    for (const c of w) {
      n = n.kids.get(c)!;
      path.push(n.id);
      if (!shown.has(n.id)) created++;
      shown.add(n.id);
    }
    ends.add(n.id);
    frames.push({
      caption: created === w.length ? `Insert "${w}": nothing shared yet, so ${w.length} new nodes. Mark the last as a word end.` : `Insert "${w}": the first ${w.length - created} letters already exist — only ${created} new node${created > 1 ? 's' : ''}.`,
      layers: [layer(path)],
    });
  }

  const search = (q: string, prefixOnly: boolean): { ok: boolean; path: string[]; failAt?: string } => {
    let n = root;
    const path: string[] = [];
    for (const c of q) {
      const next = n.kids.get(c);
      if (!next) return { ok: false, path, failAt: `${n.id}/${c}` };
      n = next;
      path.push(n.id);
    }
    return { ok: prefixOnly || n.end, path };
  };

  const pre = search('ca', true);
  frames.push({ caption: 'startsWith("ca"): follow c, then a. Both edges exist, so some word starts with "ca". O(length of the query), however many words are stored.', layers: [layer(pre.path, 'match')] });

  const miss = search('cow', false);
  frames.push({ caption: 'search("cow"): c exists, but c has no "o" child. Stop there — no need to look at "dog" or anything else.', layers: [layer(miss.path, 'bad')] });

  return {
    pattern: 'trie',
    title: 'Shared prefixes, shared paths',
    setup: `insert ${words.map((w) => `"${w}"`).join(', ')}, then look up the prefix "ca" and the word "cow"`,
    frames,
    result: `ca:${pre.ok} cow:${miss.ok}`,
    takeaway: 'Lookups cost the length of the word, not the number of words. Mark word ends explicitly, or a prefix looks like a word.',
  };
}
