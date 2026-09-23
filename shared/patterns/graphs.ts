import type { Pattern } from '../types.ts';

export const graphPatterns: Pattern[] = [
  {
    id: 'graph-traversal',
    name: 'Graph BFS / DFS',
    group: 'Graphs',
    summary: 'Explore connected cells or nodes: DFS for reachability, BFS for fewest steps.',
    signals: [
      'A grid of cells: islands, regions, flood fill',
      'Count connected components; copy a graph',
      'Minimum number of steps / minutes / transformations (unweighted)',
      'Something spreads from several sources at once',
    ],
    idea:
      "Treat each cell or node as a vertex and its neighbors as edges. DFS answers \"what can I reach?\" (component size, region membership). BFS explores in rings of equal distance, so the first time it reaches a node is the shortest path in an unweighted graph; putting every source in the queue at the start gives multi-source BFS. Mark nodes visited when you enqueue them, not when you dequeue them.",
    steps: [
      'Model the graph: 4-directional grid neighbors or an adjacency list.',
      'Pick DFS for reachability or components, BFS for the shortest number of steps.',
      'Mark visited when you push/enqueue, so nothing is queued twice.',
      'For multi-source problems, enqueue every source first, then expand.',
    ],
    template: {
      title: 'DFS flood fill and multi-source BFS on a grid',
      code: `static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

// DFS: count islands of '1' cells, sinking each island as it is found.
int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { count++; sink(grid, r, c); }
    return count;
}

void sink(char[][] grid, int r, int c) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
    grid[r][c] = '0';                                    // mark visited
    for (int[] d : DIRS) sink(grid, r + d[0], c + d[1]);
}

// Multi-source BFS: distance from every cell to its nearest 0.
int[][] distanceToNearestZero(int[][] mat) {
    int rows = mat.length, cols = mat[0].length;
    int[][] dist = new int[rows][cols];
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (mat[r][c] == 0) queue.offer(new int[] {r, c});   // every source starts at 0
            else dist[r][c] = -1;                                 // not reached yet
        }
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] d : DIRS) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[cell[0]][cell[1]] + 1;           // mark on enqueue
            queue.offer(new int[] {nr, nc});
        }
    }
    return dist;
}`,
    },
    complexity: 'O(V + E); on an R×C grid, O(R·C) time and space.',
    pitfalls: [
      'Marking visited on dequeue lets the same node be enqueued many times.',
      'Recursive DFS on a huge grid can overflow the stack; use BFS or an explicit stack.',
      "Mutating the input grid to mark visited: fine in interviews, but say you're doing it.",
    ],
    leetcodeTags: ['graph', 'depth-first-search'],
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    group: 'Graphs',
    summary: 'Order a DAG so every edge points forward, or detect the cycle that makes it impossible.',
    signals: [
      'Prerequisites, dependencies, "must happen before"',
      'Can all tasks be finished? In what order?',
      'Detect a cycle in a DIRECTED graph',
      'Earliest finish time or longest path in a DAG',
    ],
    idea:
      "Kahn's algorithm repeatedly removes nodes with in-degree 0: nothing still waiting has to come before them. Removing a node decrements its neighbors' in-degrees, releasing new zero in-degree nodes. If fewer than n nodes get processed, the rest lie on a cycle. The processing order is a valid topological order, and DP along it (finish = max over prerequisites + own time) solves scheduling problems.",
    steps: [
      'Build the adjacency list and in-degree array (double-check the edge direction!).',
      'Queue every node with in-degree 0.',
      "Pop a node, append it to the order, decrement its neighbors' in-degrees; queue any that reach 0.",
      'If the order has fewer than n nodes, there is a cycle.',
    ],
    template: {
      title: "Kahn's algorithm",
      code: `// edges[i] = {from, to}: "from" must come before "to".
int[] topoOrder(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        indegree[e[1]]++;
    }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.offer(i);
    int[] order = new int[n];
    int size = 0;
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order[size++] = node;
        for (int next : adj.get(node)) {
            if (--indegree[next] == 0) queue.offer(next);
        }
    }
    return size == n ? order : new int[0];   // empty result: the graph has a cycle
}`,
    },
    complexity: 'O(V + E) time and space.',
    pitfalls: [
      'Reversed edges: Course Schedule gives pairs as [course, prerequisite].',
      'Isolated nodes have in-degree 0 and must be queued too.',
      'DFS cycle detection needs three states (unvisited / in progress / done), not a boolean.',
    ],
    leetcodeTags: ['topological-sort'],
  },
  {
    id: 'union-find',
    name: 'Union-Find',
    group: 'Graphs',
    summary: 'Track which elements are connected as edges arrive, in near-constant time per operation.',
    signals: [
      'Number of connected components, provinces or groups',
      'Does this edge create a cycle? (redundant connection)',
      'Merge items that share something (accounts with a common email)',
      "Minimum spanning tree (Kruskal's algorithm)",
    ],
    idea:
      "Each element points to a parent; following parents reaches the set's representative (its root). union(a, b) links one root under the other; find(x) walks to the root and compresses the path, so later lookups are almost O(1). If find(a) == find(b) before a union, the edge closes a cycle. Each successful union reduces the component count by one.",
    steps: [
      'Initialize parent[i] = i: every element starts alone.',
      'For each relationship, union the two elements.',
      'A union whose elements already share a root reveals a cycle or redundancy.',
      'Components = n − successful unions.',
    ],
    template: {
      title: 'Union-Find with path halving and union by size',
      code: `class UnionFind {
    private final int[] parent, size;
    int components;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving
            x = parent[x];
        }
        return x;
    }

    /** Returns false if a and b were already connected (the edge would close a cycle). */
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                     // smaller tree goes under the larger one
        size[ra] += size[rb];
        components--;
        return true;
    }
}`,
    },
    complexity: 'O(α(n)) ≈ O(1) amortized per operation; O(n) space.',
    pitfalls: [
      'Without path compression and union by size, find() can degrade to O(n).',
      'Comparing parent[a] == parent[b] instead of find(a) == find(b).',
      'Items that are not integers (emails, names) need an index mapping first.',
    ],
    leetcodeTags: ['union-find'],
  },
  {
    id: 'shortest-path',
    name: 'Shortest Path (Dijkstra)',
    group: 'Graphs',
    summary: 'Always expand the closest unfinished node, then relax its edges.',
    signals: [
      'Weighted edges (time, cost, probability, effort) and a best-total question',
      'Network delay, cheapest route, path that minimizes its largest step',
      'A grid where each move has a different cost',
      'At most k stops or edges (Bellman-Ford style rounds)',
    ],
    idea:
      "With non-negative weights, the unfinished node with the smallest tentative distance can never be improved later, so finalize it and relax its outgoing edges. A min-heap of (distance, node) makes this O(E log V). The same skeleton works for any path cost that never improves as a path grows: maximum probability (multiply, use a max-heap) or minimax effort (cost = largest step so far). With a hop limit, run k + 1 Bellman-Ford rounds over a copy of the distances instead.",
    steps: [
      'Build an adjacency list with weights.',
      'Set dist[source] = 0 and push (0, source) onto a min-heap.',
      'Pop the smallest; skip it if stale (d > dist[node]); relax each edge, pushing improvements.',
      'Read dist[target], or the max over dist when every node must be reached.',
    ],
    template: {
      title: 'Dijkstra with a binary heap',
      code: `// Shortest distances from src over directed edges {u, v, w}; Long.MAX_VALUE = unreachable.
long[] dijkstra(int n, int[][] edges, int src) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) adj.get(e[0]).add(new int[] {e[1], e[2]});

    long[] dist = new long[n];
    Arrays.fill(dist, Long.MAX_VALUE);
    dist[src] = 0;
    PriorityQueue<long[]> heap = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
    heap.offer(new long[] {0, src});
    while (!heap.isEmpty()) {
        long[] top = heap.poll();
        int u = (int) top[1];
        if (top[0] > dist[u]) continue;                   // stale entry
        for (int[] edge : adj.get(u)) {
            int v = edge[0];
            long candidate = dist[u] + edge[1];
            if (candidate < dist[v]) {
                dist[v] = candidate;
                heap.offer(new long[] {candidate, v});
            }
        }
    }
    return dist;
}`,
    },
    complexity: 'O((V + E) log V) time, O(V + E) space.',
    pitfalls: [
      'Negative edge weights break Dijkstra; use Bellman-Ford instead.',
      "Not skipping stale heap entries: still correct, but much slower.",
      'Hop limits (k stops) need Bellman-Ford rounds or a (node, stops) state.',
    ],
    leetcodeTags: ['shortest-path'],
  },
];
