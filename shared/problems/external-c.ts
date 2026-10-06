import { EXTERNAL_ID_BASE, type CuratedProblem } from '../types.ts';

// Problems that are not on LeetCode (batch C: graphs, trees, linked lists, backtracking).
// The first option of every question is the correct one.

const CSES = (id: number) => ({ name: 'CSES', url: `https://cses.fi/problemset/task/${id}` });
const GFG = (path: string) => ({ name: 'GeeksforGeeks', url: `https://www.geeksforgeeks.org/${path}/` });

export const externalGraphsTrees: CuratedProblem[] = [
  {
    slug: 'minimum-swaps-to-sort', id: EXTERNAL_ID_BASE + 51, title: 'Minimum Swaps to Sort an Array', difficulty: 'Medium', pattern: 'graph-traversal', alsoAccept: ['union-find'],
    brute: { text: 'Try every sequence of swaps, breadth-first, until the array is sorted.', time: ['O(n!)', 'O(n log n)', 'O(n)', 'O(n²)'] },
    insight: {
      q: 'The array has distinct values. How do you find the fewest swaps (of any two positions) that sort it?',
      options: [
        'Link each position to where its value belongs; the links form cycles, and a cycle of length L needs L − 1 swaps',
        'Count the inversions in the array, because each swap of two positions removes exactly one inversion at a time',
        'Swap every element with the smallest remaining element, as selection sort does, and count how many swaps it makes',
        'Count the positions where a[i] is not in its sorted place and halve that number to get the swap count',
      ],
      why: 'Mapping each index to the target index of its value yields a permutation, which splits into disjoint cycles. A cycle of L elements can be fixed with L − 1 swaps and no fewer. Inversions are removed by adjacent swaps, not arbitrary ones, and selection sort can use more swaps than needed.',
    },
    vars: 'n = length of a',
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n!)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Already sorted: 0 swaps', 'A reversed array', 'Cycles of length 1 (fixed points) cost nothing'],
    approach: 'Sort a copy to get each value\'s target index (a hash map value → index). Walk positions; for each unvisited i follow i → target(a[i]) marking visited and counting the cycle length L, adding L − 1 to the answer. O(n log n) for the sort, O(n) for the cycles.',
    external: {
      source: GFG('minimum-number-swaps-required-sort-array'),
      statement: '<p>Given an array <code>a</code> of <strong>distinct</strong> integers, return the minimum number of swaps of any two elements needed to sort it in ascending order.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= a.length &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'minSwaps', params: [{ name: 'a', type: 'integer[]' }], returns: 'integer' },
      examples: [
        { input: ['[4,3,2,1]'], output: '2', explain: 'Swap positions 0 and 3, then 1 and 2.' },
        { input: ['[1,5,4,3,2]'], output: '2' },
        { input: ['[1,2,3]'], output: '0' },
      ],
      askedAt: ['IBM', 'Samsung', 'Salesforce', 'Amazon'],
      reference: `class Solution {
    public int minSwaps(int[] a) {
        int n = a.length;
        int[] sorted = a.clone();
        Arrays.sort(sorted);
        Map<Integer, Integer> target = new HashMap<>();
        for (int i = 0; i < n; i++) target.put(sorted[i], i);
        boolean[] seen = new boolean[n];
        int swaps = 0;
        for (int i = 0; i < n; i++) {
            if (seen[i]) continue;
            int len = 0, j = i;
            while (!seen[j]) { seen[j] = true; j = target.get(a[j]); len++; }
            swaps += len - 1;
        }
        return swaps;
    }
}`,
    },
  },
  {
    slug: 'message-route', id: EXTERNAL_ID_BASE + 52, title: 'Message Route', difficulty: 'Easy', pattern: 'graph-traversal',
    brute: { text: 'Enumerate every simple path from computer 1 to computer n and keep the shortest.', time: ['O(n!)', 'O(n + m)', 'O(n·m)', 'O(m log n)'] },
    insight: {
      q: 'The network is unweighted and you want the fewest hops between two computers. Which traversal?',
      options: [
        'Breadth-first search from computer 1, which reaches every computer in order of its distance',
        'Depth-first search from computer 1, taking the first path it finds that happens to end at computer n',
        'Dijkstra\'s algorithm with a min-heap, since a plain breadth-first search cannot find shortest paths',
        'Union-find over the connections, which checks that a route exists and then reads the route straight off',
      ],
      why: 'BFS explores in layers, so the first time it reaches a node is along a shortest path in an unweighted graph. DFS finds some path, not the shortest. Dijkstra works but is unnecessary overhead, and union-find only says whether a path exists.',
    },
    vars: 'n = computers, m = connections',
    time: ['O(n + m)', 'O(n·m)', 'O(m log n)', 'O(n!)'],
    space: ['O(n + m)', 'O(1)', 'O(n!)', 'O(log n)'],
    edgeCases: ['n is not reachable from 1: return −1', 'n = 1 itself would be a route of one computer', 'Parallel edges and cycles'],
    approach: 'Build an adjacency list. BFS from 1 recording dist[v] = number of computers on the route so far (dist[1] = 1). Return dist[n], or −1 if n was never reached. O(n + m).',
    external: {
      source: CSES(1667),
      statement: '<p>A network has <code>n</code> computers numbered 1 to <code>n</code> and the given bidirectional connections. A message starts at computer 1 and must reach computer <code>n</code>, passing through as few computers as possible.</p><p>Return the number of computers on the shortest route (counting both ends), or <code>-1</code> if there is none.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= n &lt;= 10<sup>5</sup></code>, up to <code>2·10<sup>5</sup></code> connections</li></ul>',
      signature: { name: 'messageRoute', params: [{ name: 'n', type: 'integer' }, { name: 'edges', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['5', '[[1,2],[1,3],[1,4],[2,3],[5,4]]'], output: '3', explain: '1 → 4 → 5.' },
        { input: ['3', '[[1,2]]'], output: '-1' },
        { input: ['2', '[[1,2]]'], output: '2' },
      ],
      reference: `class Solution {
    public int messageRoute(int n, int[][] edges) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
        int[] dist = new int[n + 1];
        Deque<Integer> q = new ArrayDeque<>();
        dist[1] = 1;
        q.add(1);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (dist[v] == 0) { dist[v] = dist[u] + 1; q.add(v); }
        }
        return dist[n] == 0 ? -1 : dist[n];
    }
}`,
    },
  },
  {
    slug: 'building-roads', id: EXTERNAL_ID_BASE + 53, title: 'Building Roads', difficulty: 'Easy', pattern: 'union-find', alsoAccept: ['graph-traversal'],
    brute: { text: 'Try adding every set of extra roads and test connectivity each time.', time: ['O(2^(n²))', 'O(n + m)', 'O(n·m)', 'O(n log n)'] },
    insight: {
      q: 'Some cities are already linked by roads. What is the fewest new roads that connect everything?',
      options: [
        'Count the connected components (union-find or a traversal); exactly components − 1 new roads are then needed',
        'Build one new road for each city that has no road at all, since only those cities are left disconnected',
        'm − n + 1, the number of independent cycles in the graph, since each cycle is one extra road in the graph',
        'n − 1 roads, since a connected network on n cities always needs exactly that many roads whatever exists',
      ],
      why: 'Each new road can merge at most two components into one, and a road between two different components always does. So it takes exactly (components − 1) roads. Union-find counts components while the existing roads are added.',
    },
    vars: 'n = cities, m = existing roads',
    time: ['O(n + m·α(n))', 'O(n·m)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n + m)', 'O(n²)'],
    edgeCases: ['Already connected: 0', 'No roads at all: n − 1', 'Duplicate roads should not change the count'],
    approach: 'Start with n components. Union the endpoints of each road; each successful merge reduces the count by one. The answer is the remaining count minus 1. Near-linear with path compression and union by size.',
    external: {
      source: CSES(1666),
      statement: '<p>A country has <code>n</code> cities, numbered 1 to <code>n</code>, and some roads between them. You may build new roads between any two cities.</p><p>Return the minimum number of new roads needed so that every city can reach every other.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>5</sup></code>, up to <code>2·10<sup>5</sup></code> roads</li></ul>',
      signature: { name: 'newRoadsNeeded', params: [{ name: 'n', type: 'integer' }, { name: 'roads', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['4', '[[1,2],[3,4]]'], output: '1' },
        { input: ['1', '[]'], output: '0' },
        { input: ['5', '[[1,2],[2,3],[4,5]]'], output: '1' },
      ],
      reference: `class Solution {
    int[] parent;
    int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    public int newRoadsNeeded(int n, int[][] roads) {
        parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        int components = n;
        for (int[] r : roads) {
            int a = find(r[0]), b = find(r[1]);
            if (a != b) { parent[a] = b; components--; }
        }
        return components - 1;
    }
}`,
    },
  },
  {
    slug: 'roads-and-libraries', id: EXTERNAL_ID_BASE + 54, title: 'Roads and Libraries', difficulty: 'Medium', pattern: 'union-find', alsoAccept: ['graph-traversal', 'greedy'],
    brute: { text: 'Try every choice of which cities get libraries and which roads to repair.', time: ['O(2ⁿ·m)', 'O(n + m)', 'O(n log n)', 'O(n·m)'] },
    insight: {
      q: 'Every city must reach a library, either having one or connecting by repaired roads. How do you minimise cost?',
      options: [
        'Libraries cheaper: one per city. Otherwise one library plus (size − 1) roads for each component',
        'Build a library in every city that touches at least one road, and leave the isolated cities without one',
        'Repair every single road in the country first, then build exactly one library somewhere in the network',
        'Build libraries only in the largest component and repair nothing in the smaller components around it',
      ],
      why: 'Cities in different components can never share a library, so each component needs its own. Within a component, one library plus a spanning tree of (size − 1) repaired roads is the cheapest way to serve everyone, unless roads cost more than libraries, in which case a library everywhere wins.',
    },
    vars: 'n = cities, m = roads',
    time: ['O(n + m·α(n))', 'O(n·m)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n + m)', 'O(n²)'],
    edgeCases: ['cLib ≤ cRoad: roads never help, so the answer is n·cLib', 'Isolated cities each need their own library', 'The total can exceed int, so use long'],
    approach: 'If cLib ≤ cRoad return n·cLib. Otherwise union the road endpoints with union-find, find each component\'s size s, and add cLib + (s − 1)·cRoad. Return the total as a long.',
    external: {
      source: { name: 'HackerRank', url: 'https://www.hackerrank.com/challenges/torque-and-development/problem' },
      statement: '<p>A country has <code>n</code> cities (numbered from 1) and some destroyed roads that could be repaired at <code>cRoad</code> each. A library costs <code>cLib</code> to build. A citizen has access to a library if their city has one or can reach a city with one through repaired roads.</p><p>Return the minimum total cost so that every city has access to a library (as a <code>long</code>).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 10<sup>5</sup></code>, up to <code>10<sup>5</sup></code> roads, <code>1 &lt;= cLib, cRoad &lt;= 10<sup>5</sup></code></li></ul>',
      signature: { name: 'roadsAndLibraries', params: [{ name: 'n', type: 'integer' }, { name: 'cLib', type: 'integer' }, { name: 'cRoad', type: 'integer' }, { name: 'cities', type: 'integer[][]' }], returns: 'long' },
      examples: [
        { input: ['3', '2', '1', '[[1,2],[3,1],[2,3]]'], output: '4', explain: 'One library plus two repaired roads.' },
        { input: ['6', '2', '5', '[[1,3],[3,4],[2,4],[1,2],[2,3],[5,6]]'], output: '12', explain: 'Roads cost more than libraries, so a library in every city.' },
        { input: ['5', '6', '1', '[[1,2],[1,3],[1,4]]'], output: '15' },
      ],
      reference: `class Solution {
    int[] parent, size;
    int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    public long roadsAndLibraries(int n, int cLib, int cRoad, int[][] cities) {
        if (cLib <= cRoad) return (long) n * cLib;
        parent = new int[n + 1];
        size = new int[n + 1];
        for (int i = 0; i <= n; i++) { parent[i] = i; size[i] = 1; }
        for (int[] c : cities) {
            int a = find(c[0]), b = find(c[1]);
            if (a != b) { parent[a] = b; size[b] += size[a]; }
        }
        long cost = 0;
        for (int i = 1; i <= n; i++) if (find(i) == i) cost += cLib + (long) (size[i] - 1) * cRoad;
        return cost;
    }
}`,
    },
  },
  {
    slug: 'game-routes', id: EXTERNAL_ID_BASE + 55, title: 'Game Routes', difficulty: 'Medium', pattern: 'topological-sort', alsoAccept: ['dp-1d'],
    brute: { text: 'Depth-first search from level 1, counting every path with no memo.', time: ['O(2ⁿ)', 'O(n + m)', 'O(n·m)', 'O(n log n)'] },
    insight: {
      q: 'The levels form a directed acyclic graph. How do you count the routes from level 1 to level n?',
      options: [
        'Go in topological order; paths[v] = the sum of paths[u] over edges u → v, with paths[1] = 1',
        'Run a BFS from level 1 and count how many times level n is taken from the queue along the way',
        'The number of routes is simply the number of teleporters that leave level 1, one route for each of them',
        'Run Dijkstra from level 1 and read the distance to level n, which equals the number of routes there',
      ],
      why: 'Every path into v ends with some edge u → v, so paths[v] = Σ paths[u]. In a DAG a topological order guarantees every u is finished before v, so each edge is handled once. Plain BFS recounts shared prefixes and loses the DAG structure.',
    },
    vars: 'n = levels, m = teleporters (edges)',
    time: ['O(n + m)', 'O(2ⁿ)', 'O(n·m)', 'O(n log n)'],
    space: ['O(n + m)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['No route: 0', 'Parallel edges count as different routes', 'The answer is taken modulo 1,000,000,007'],
    approach: 'Compute in-degrees, then run Kahn\'s algorithm. paths[1] = 1. When popping u, for each edge u → v add paths[u] to paths[v] (mod 10⁹ + 7) and enqueue v when its in-degree reaches 0. Return paths[n]. O(n + m).',
    external: {
      source: CSES(1681),
      statement: '<p>A game has <code>n</code> levels numbered 1 to <code>n</code> and one-way teleporters <code>[a, b]</code> from level <code>a</code> to level <code>b</code>. There are no cycles. You start at level 1 and want to finish at level <code>n</code>.</p><p>Return the number of different routes from level 1 to level <code>n</code>, modulo <code>1,000,000,007</code>.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= n &lt;= 10<sup>5</sup></code>, up to <code>2·10<sup>5</sup></code> teleporters</li></ul>',
      signature: { name: 'countRoutes', params: [{ name: 'n', type: 'integer' }, { name: 'teleporters', type: 'integer[][]' }], returns: 'integer' },
      examples: [
        { input: ['4', '[[1,2],[2,4],[1,3],[3,4],[1,4]]'], output: '3' },
        { input: ['2', '[[1,2]]'], output: '1' },
        { input: ['3', '[[1,2]]'], output: '0' },
      ],
      reference: `class Solution {
    public int countRoutes(int n, int[][] teleporters) {
        final int MOD = 1_000_000_007;
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        int[] indeg = new int[n + 1];
        for (int[] t : teleporters) { g.get(t[0]).add(t[1]); indeg[t[1]]++; }
        long[] paths = new long[n + 1];
        paths[1] = 1;
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.add(i);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) {
                paths[v] = (paths[v] + paths[u]) % MOD;
                if (--indeg[v] == 0) q.add(v);
            }
        }
        return (int) paths[n];
    }
}`,
    },
  },
  {
    slug: 'floyd-warshall-all-pairs', id: EXTERNAL_ID_BASE + 56, title: 'All-Pairs Shortest Paths (Floyd–Warshall)', difficulty: 'Medium', pattern: 'shortest-path',
    brute: { text: 'Run a path search from every source with no sharing of work between sources.', time: ['O(V·(V + E)·V)', 'O(V³)', 'O(V²)', 'O(V + E)'] },
    insight: {
      q: 'You need the shortest distance between every pair of vertices. What does the classic DP iterate over?',
      options: [
        'Let each vertex k act as an allowed stop: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
        'Relax every edge in turn, repeating the whole pass V − 1 times, until no distance can be improved',
        'Keep a min-heap of vertices ordered by distance from one source and settle them one at a time',
        'Run a breadth-first search from every vertex and ignore the edge weights, since the layers are what count',
      ],
      why: 'After processing intermediate vertices 0..k, dist[i][j] is the shortest path using only those as stops. Adding vertex k either helps (go through k) or does not. Three nested loops with k outermost give O(V³) and handle negative edges (but not negative cycles).',
    },
    vars: 'V = number of vertices',
    time: ['O(V³)', 'O(V²)', 'O(V·E)', 'O(V log V)'],
    space: ['O(V²)', 'O(V)', 'O(1)', 'O(V³)'],
    edgeCases: ['k must be the OUTER loop', 'Unreachable pairs stay at INF; do not add INF to INF', 'dist[i][i] stays 0'],
    approach: 'Copy the matrix. For k, i, j in that loop order, if dist[i][k] and dist[k][j] are both below INF and their sum is smaller than dist[i][j], update it. Return the matrix. O(V³) time, O(V²) space.',
    external: {
      source: GFG('floyd-warshall-algorithm-dp-16'),
      statement: '<p>A weighted directed graph with <code>V</code> vertices is given as an adjacency matrix <code>dist</code>: <code>dist[i][j]</code> is the weight of the edge from <code>i</code> to <code>j</code>, <code>0</code> on the diagonal, and <code>99999</code> means there is no edge. There are no negative cycles.</p><p>Return the matrix of shortest distances between every pair, again using <code>99999</code> for pairs with no path.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= V &lt;= 100</code>, edge weights between <code>-100</code> and <code>1000</code></li></ul>',
      signature: { name: 'floydWarshall', params: [{ name: 'dist', type: 'integer[][]' }], returns: 'integer[][]' },
      examples: [
        { input: ['[[0,5,99999,10],[99999,0,3,99999],[99999,99999,0,1],[99999,99999,99999,0]]'], output: '[[0,5,8,9],[99999,0,3,4],[99999,99999,0,1],[99999,99999,99999,0]]' },
        { input: ['[[0,1],[99999,0]]'], output: '[[0,1],[99999,0]]' },
        { input: ['[[0,4,99999],[2,0,-1],[99999,99999,0]]'], output: '[[0,4,3],[2,0,-1],[99999,99999,0]]' },
      ],
      reference: `class Solution {
    public int[][] floydWarshall(int[][] dist) {
        final int INF = 99999;
        int v = dist.length;
        int[][] d = new int[v][];
        for (int i = 0; i < v; i++) d[i] = dist[i].clone();
        for (int k = 0; k < v; k++)
            for (int i = 0; i < v; i++)
                for (int j = 0; j < v; j++)
                    if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        return d;
    }
}`,
    },
  },
  {
    slug: 'detect-negative-cycle', id: EXTERNAL_ID_BASE + 57, title: 'Detect a Negative Cycle (Bellman–Ford)', difficulty: 'Medium', pattern: 'shortest-path',
    brute: { text: 'Enumerate every cycle in the graph and sum its weights.', time: ['O(2ⁿ)', 'O(V·E)', 'O(E log V)', 'O(V + E)'] },
    insight: {
      q: 'Dijkstra fails with negative weights. How do you tell whether a cycle with negative total weight exists?',
      options: [
        'Relax all edges V − 1 times; if any edge still relaxes on one more pass, a negative cycle exists',
        'Run Dijkstra and report a negative cycle whenever any computed distance turns out to be below zero',
        'Run a depth-first search and report a negative cycle whenever it meets a back edge in the traversal',
        'Add a large constant to every weight so none are negative, then run Dijkstra and compare the results',
      ],
      why: 'Without a negative cycle shortest paths use at most V − 1 edges, so V − 1 rounds of relaxing everything settle all distances. If a V-th round still improves something, a cycle that keeps reducing the cost must exist. Adding a constant changes which paths are shortest, and a back edge only shows a cycle, not its sign.',
    },
    vars: 'V = vertices, E = edges',
    time: ['O(V·E)', 'O(E log V)', 'O(V + E)', 'O(V³ · E)'],
    space: ['O(V)', 'O(1)', 'O(V·E)', 'O(E)'],
    edgeCases: ['A negative cycle not reachable from vertex 0: start every distance at 0 so all vertices are covered', 'A zero-weight cycle is NOT negative', 'A self-loop with negative weight'],
    approach: 'Set dist[v] = 0 for every vertex (a virtual source connected to all). Repeat V − 1 times: for each edge u → v with weight w, if dist[u] + w < dist[v] set dist[v]. Do one more pass; if any edge still relaxes return true, otherwise false. O(V·E).',
    external: {
      source: GFG('detect-negative-cycle-graph-bellman-ford'),
      statement: '<p>A directed graph has <code>n</code> vertices (numbered from 0) and edges <code>[u, v, w]</code> meaning an edge from <code>u</code> to <code>v</code> with weight <code>w</code>, which may be negative.</p><p>Return <code>true</code> if the graph contains a cycle whose total weight is negative (anywhere in the graph, not only reachable from vertex 0).</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 500</code>, up to <code>5000</code> edges, <code>-10<sup>4</sup> &lt;= w &lt;= 10<sup>4</sup></code></li></ul>',
      signature: { name: 'hasNegativeCycle', params: [{ name: 'n', type: 'integer' }, { name: 'edges', type: 'integer[][]' }], returns: 'boolean' },
      examples: [
        { input: ['3', '[[0,1,1],[1,2,-1],[2,0,-1]]'], output: 'true', explain: 'The cycle 0 → 1 → 2 → 0 sums to −1.' },
        { input: ['3', '[[0,1,1],[1,2,2]]'], output: 'false' },
        { input: ['2', '[[0,1,-1],[1,0,1]]'], output: 'false', explain: 'The cycle sums to 0.' },
      ],
      reference: `class Solution {
    public boolean hasNegativeCycle(int n, int[][] edges) {
        long[] dist = new long[n];
        for (int round = 0; round < n; round++) {
            boolean changed = false;
            for (int[] e : edges) {
                if (dist[e[0]] + e[2] < dist[e[1]]) { dist[e[1]] = dist[e[0]] + e[2]; changed = true; }
            }
            if (!changed) return false;
            if (round == n - 1) return true;
        }
        return false;
    }
}`,
    },
  },
  {
    slug: 'flight-discount', id: EXTERNAL_ID_BASE + 58, title: 'Flight Discount', difficulty: 'Hard', pattern: 'shortest-path',
    brute: { text: 'For every flight, try using the coupon on it and run Dijkstra each time.', time: ['O(m · m log n)', 'O(m log n)', 'O(n + m)', 'O(n²)'] },
    insight: {
      q: 'You may halve the price of exactly one flight (rounded down) on your trip. How do you model that?',
      options: [
        'Run Dijkstra on states (city, couponUsed); an edge may flip the flag once, at half price',
        'Run Dijkstra once, then halve the most expensive flight on the single cheapest path that it found',
        'Halve the price of every flight in the network and run one ordinary Dijkstra on the reduced prices',
        'Run Dijkstra from both ends and take the smaller of the two distances to city n as the final answer',
      ],
      why: 'The best use of the coupon is not always on the most expensive edge of the cheapest ordinary path; a different path may be better once discounted. Doubling the state space with a "coupon used" flag lets one Dijkstra explore every combination of path and discounted edge at once.',
    },
    vars: 'n = cities, m = flights',
    time: ['O((n + m) log n)', 'O(m² log n)', 'O(n·m)', 'O(n + m)'],
    space: ['O(n + m)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Discounted price is floor(price / 2)', 'The coupon need not be used if the trip is free of expensive flights, but using it never costs more', 'Costs exceed int, so use long'],
    approach: 'Keep dist[city][0/1] where the second index says whether the coupon has been used. From (u, f) via an edge of price w: relax (v, f) with + w, and if f = 0 also relax (v, 1) with + w / 2. Use a priority queue on (distance, city, flag). Return min(dist[n][0], dist[n][1]).',
    external: {
      source: CSES(1195),
      statement: '<p>A country has <code>n</code> cities (numbered from 1) and one-way flights <code>[a, b, price]</code>. You travel from city 1 to city <code>n</code> and hold one discount coupon: on <strong>one</strong> flight of your choice the price is halved, rounded down.</p><p>Return the minimum total price. It is guaranteed that city <code>n</code> is reachable.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= n &lt;= 10<sup>5</sup></code>, up to <code>2·10<sup>5</sup></code> flights, <code>1 &lt;= price &lt;= 10<sup>9</sup></code></li></ul>',
      signature: { name: 'cheapestWithDiscount', params: [{ name: 'n', type: 'integer' }, { name: 'flights', type: 'integer[][]' }], returns: 'long' },
      examples: [
        { input: ['3', '[[1,2,3],[2,3,1],[1,3,7]]'], output: '2', explain: '1 → 2 → 3 with the coupon on the 3: 1 + 1.' },
        { input: ['2', '[[1,2,10]]'], output: '5' },
        { input: ['4', '[[1,2,10],[2,4,10],[1,3,4],[3,4,100]]'], output: '15' },
      ],
      reference: `class Solution {
    public long cheapestWithDiscount(int n, int[][] flights) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());
        for (int[] f : flights) g.get(f[0]).add(new int[] {f[1], f[2]});
        long INF = Long.MAX_VALUE / 4;
        long[][] dist = new long[n + 1][2];
        for (long[] row : dist) Arrays.fill(row, INF);
        dist[1][0] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((x, y) -> Long.compare(x[0], y[0]));
        pq.add(new long[] {0, 1, 0});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1], used = (int) cur[2];
            if (cur[0] > dist[u][used]) continue;
            for (int[] e : g.get(u)) {
                int v = e[0];
                long w = e[1];
                if (cur[0] + w < dist[v][used]) { dist[v][used] = cur[0] + w; pq.add(new long[] {dist[v][used], v, used}); }
                if (used == 0 && cur[0] + w / 2 < dist[v][1]) { dist[v][1] = cur[0] + w / 2; pq.add(new long[] {dist[v][1], v, 1}); }
            }
        }
        return Math.min(dist[n][0], dist[n][1]);
    }
}`,
    },
  },
  {
    slug: 'top-view-of-a-binary-tree', id: EXTERNAL_ID_BASE + 59, title: 'Top View of a Binary Tree', difficulty: 'Medium', pattern: 'tree-bfs',
    brute: { text: 'For every possible column, search the whole tree for its highest node.', time: ['O(n·w)', 'O(n)', 'O(n log n)', 'O(h)'] },
    insight: {
      q: 'Looking from above, you see the first node in each vertical column. How do you find it?',
      options: [
        'BFS carrying each node\'s column (left −1, right +1); the first node seen in a column is the visible one',
        'Depth-first search that keeps the deepest node seen in each column, since lower nodes cover higher ones',
        'Print the root, then the leftmost path from it, then the rightmost path from it, going downwards in both',
        'Print every node whose value is larger than the value of its parent, since those are the visible ones',
      ],
      why: 'BFS visits nodes top to bottom, so the first node to land in a column is the topmost one. Tracking a column index per node (parent ± 1) groups nodes by vertical line. Depth-first order does not guarantee that the first visit is the highest, and the boundary walk misses interior columns.',
    },
    vars: 'n = number of nodes',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n·h)'],
    space: ['O(n)', 'O(1)', 'O(h)', 'O(n²)'],
    edgeCases: ['A single node', 'A skewed tree (a straight line)', 'Two nodes in the same column at the same depth: the left subtree\'s node is visited first in BFS'],
    approach: 'BFS with a queue of (node, column). For each dequeued node, if its column has no entry yet in a map, record the node\'s value. Enqueue left with column − 1 and right with column + 1. Output the recorded values ordered by column. O(n).',
    external: {
      source: GFG('print-nodes-top-view-binary-tree'),
      statement: '<p>The <em>top view</em> of a binary tree is the set of nodes visible when you look at the tree from above: for each vertical line (the root is on line 0, a left child is one line to the left of its parent, a right child one line to the right), the topmost node on that line.</p><p>Return the values of the top view, from the leftmost line to the rightmost.</p><p><strong>Constraints:</strong></p><ul><li>The tree has between 1 and <code>10<sup>5</sup></code> nodes.</li></ul>',
      signature: { name: 'topView', params: [{ name: 'root', type: 'TreeNode' }], returns: 'list<integer>' },
      examples: [
        { input: ['[1,2,3,4,5,6,7]'], output: '[4,2,1,3,7]' },
        { input: ['[1,2,3,null,4,null,null,null,5]'], output: '[2,1,3]', explain: 'Nodes 4 and 5 are hidden under 1 and 3.' },
        { input: ['[10,20,30,40,60,90,100]'], output: '[40,20,10,30,100]' },
        { input: ['[1]'], output: '[1]' },
      ],
      askedAt: ['Microsoft', 'MakeMyTrip', 'OYO'],
      reference: `class Solution {
    public List<Integer> topView(TreeNode root) {
        TreeMap<Integer, Integer> first = new TreeMap<>();
        Deque<Object[]> q = new ArrayDeque<>();
        q.add(new Object[] {root, 0});
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            TreeNode node = (TreeNode) cur[0];
            int col = (int) cur[1];
            first.putIfAbsent(col, node.val);
            if (node.left != null) q.add(new Object[] {node.left, col - 1});
            if (node.right != null) q.add(new Object[] {node.right, col + 1});
        }
        return new ArrayList<>(first.values());
    }
}`,
    },
  },
  {
    slug: 'sum-of-the-longest-root-to-leaf-path', id: EXTERNAL_ID_BASE + 60, title: 'Sum of the Longest Root-to-Leaf Path', difficulty: 'Medium', pattern: 'tree-dfs',
    brute: { text: 'List every root-to-leaf path, then compare their lengths and sums.', time: ['O(n·h)', 'O(n)', 'O(n log n)', 'O(h)'] },
    insight: {
      q: 'You want the longest root-to-leaf path and, among ties, the largest sum. What does each recursive call return?',
      options: [
        'Return (depth, sum) per call; keep the deeper child (larger sum on a tie) and add this node',
        'Return only the depth, then walk the tree a second time to add up the values along the deepest path found',
        'Return only the sum, and let the path with the maximum sum decide the answer, whatever its length may be',
        'Return a list of every path below the node and compare all of those lists at the root of the tree',
      ],
      why: 'A post-order DFS lets each node pick the better of its two children\'s results in O(1): the larger depth wins, and a tie goes to the larger sum. The node then extends that result by one level and its own value, so the whole tree is visited once.',
    },
    vars: 'n = number of nodes, h = height',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n·h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Several leaves at the maximum depth: take the largest sum', 'A single node', 'Negative values'],
    approach: 'dfs(node) returns (depth, sum). For a null node return (0, 0). Take the better child pair (greater depth; on a tie, greater sum) and return (depth + 1, sum + node.val). The answer is the sum of dfs(root). O(n) time, O(h) stack.',
    external: {
      source: GFG('sum-nodes-longest-path-root-leaf-node'),
      statement: '<p>Given a binary tree, find the root-to-leaf path with the most nodes and return the sum of its values. If several paths are equally long, return the largest of their sums.</p><p><strong>Constraints:</strong></p><ul><li>The tree has between 1 and <code>10<sup>5</sup></code> nodes, with values between <code>-1000</code> and <code>1000</code>.</li></ul>',
      signature: { name: 'sumOfLongestPath', params: [{ name: 'root', type: 'TreeNode' }], returns: 'integer' },
      examples: [
        { input: ['[4,2,5,7,1,2,3,null,null,6]'], output: '13', explain: 'The path 4 → 2 → 1 → 6 is the only one with four nodes.' },
        { input: ['[1,2,3]'], output: '4', explain: 'Both paths have two nodes; 1 + 3 is larger.' },
        { input: ['[5]'], output: '5' },
      ],
      reference: `class Solution {
    public int sumOfLongestPath(TreeNode root) {
        return dfs(root)[1];
    }
    private int[] dfs(TreeNode node) {
        if (node == null) return new int[] {0, 0};
        int[] l = dfs(node.left), r = dfs(node.right);
        int[] best = (l[0] > r[0] || (l[0] == r[0] && l[1] >= r[1])) ? l : r;
        return new int[] {best[0] + 1, best[1] + node.val};
    }
}`,
    },
  },
  {
    slug: 'children-sum-property', id: EXTERNAL_ID_BASE + 61, title: 'Check the Children Sum Property', difficulty: 'Easy', pattern: 'tree-dfs',
    brute: { text: 'For each node recompute the sums of its children by walking their whole subtrees.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(h)'] },
    insight: {
      q: 'Every non-leaf node must equal the sum of its two children (a missing child counts as 0). How do you verify it?',
      options: [
        'Recurse: a node passes if it is a leaf or equals the sum of its direct children, and both subtrees pass too',
        'Compute the sum of all the node values in the tree and compare that total with the value held at the root',
        'Check only the root, since the property holds for all the other nodes whenever it holds for the root alone',
        'Sort the node values and compare adjacent ones, since parents and children end up next to each other when sorted',
      ],
      why: 'The property is local to each node and its two direct children, so one pass checking each node is enough and the checks are independent. Whole-tree sums or sorting say nothing about the parent-child relationship.',
    },
    vars: 'n = number of nodes, h = height',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n)', 'O(n²)'],
    edgeCases: ['An empty tree or a single leaf is valid', 'A node with only one child must equal that child', 'Negative values'],
    approach: 'check(node): if null or a leaf return true. Otherwise compute childSum = (left?.val ?? 0) + (right?.val ?? 0); return node.val == childSum && check(left) && check(right). O(n).',
    external: {
      source: GFG('check-for-children-sum-property-in-a-binary-tree'),
      statement: '<p>A binary tree satisfies the <em>children sum property</em> if every node that has at least one child has a value equal to the sum of its children\'s values (a missing child counts as 0). Leaves always satisfy it.</p><p>Return <code>true</code> if the tree satisfies the property.</p><p><strong>Constraints:</strong></p><ul><li>The tree has between 1 and <code>10<sup>5</sup></code> nodes.</li></ul>',
      signature: { name: 'childrenSumHolds', params: [{ name: 'root', type: 'TreeNode' }], returns: 'boolean' },
      examples: [
        { input: ['[10,8,2,3,5,2]'], output: 'true' },
        { input: ['[1,4,3]'], output: 'false' },
        { input: ['[5]'], output: 'true' },
      ],
      reference: `class Solution {
    public boolean childrenSumHolds(TreeNode root) {
        if (root == null || (root.left == null && root.right == null)) return true;
        int sum = (root.left == null ? 0 : root.left.val) + (root.right == null ? 0 : root.right.val);
        return root.val == sum && childrenSumHolds(root.left) && childrenSumHolds(root.right);
    }
}`,
    },
  },
  {
    slug: 'add-one-to-a-linked-list-number', id: EXTERNAL_ID_BASE + 62, title: 'Add One to a Number Held in a Linked List', difficulty: 'Medium', pattern: 'linked-list',
    brute: { text: 'Reverse the list, add one with a carry from the least significant digit, then reverse it back.', time: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'] },
    insight: {
      q: 'The digits are stored most-significant first, so a carry travels backwards. How do you add one in a single forward pass?',
      options: [
        'Remember the last node whose digit is not 9; add one to it and zero every node after it (new head if all 9s)',
        'Convert the whole list to a long, add one to it and then convert that result back into a list of digits',
        'Add one to the head node and carry forwards through the list, since the carry flows from left to right',
        'Append a new node holding the value 1 at the end of the list, which adds one to the number represented',
      ],
      why: 'Adding one only changes the trailing run of 9s, which turn into 0s, and the digit just before that run, which goes up by one. Finding that last non-9 node needs one pass and no reversal. A long overflows for lists longer than ~18 digits.',
    },
    vars: 'n = number of digits',
    time: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['All nines: a new leading 1 is needed', 'A single digit 9 becomes 10', 'The list [0] becomes [1]'],
    approach: 'Walk the list recording lastNotNine. If none exists (all 9s) create a new head with value 1 and zero everything. Otherwise do lastNotNine.val++ and set every node after it to 0. Return the head. O(n) time, O(1) space.',
    external: {
      source: GFG('add-1-number-represented-linked-list'),
      statement: '<p>A non-negative integer is stored in a singly linked list, one decimal digit per node, with the <strong>most significant digit first</strong>. Add 1 to the number and return the head of the resulting list.</p><p><strong>Constraints:</strong></p><ul><li>The list has between 1 and <code>10<sup>5</sup></code> nodes, each a digit 0-9, with no leading zeros except the number 0 itself.</li></ul>',
      signature: { name: 'addOne', params: [{ name: 'head', type: 'ListNode' }], returns: 'ListNode' },
      examples: [
        { input: ['[4,5,6]'], output: '[4,5,7]' },
        { input: ['[9,9,9]'], output: '[1,0,0,0]' },
        { input: ['[0]'], output: '[1]' },
      ],
      reference: `class Solution {
    public ListNode addOne(ListNode head) {
        ListNode lastNotNine = null;
        for (ListNode cur = head; cur != null; cur = cur.next) if (cur.val != 9) lastNotNine = cur;
        if (lastNotNine == null) {
            ListNode newHead = new ListNode(1, head);
            for (ListNode cur = head; cur != null; cur = cur.next) cur.val = 0;
            return newHead;
        }
        lastNotNine.val++;
        for (ListNode cur = lastNotNine.next; cur != null; cur = cur.next) cur.val = 0;
        return head;
    }
}`,
    },
  },
  {
    slug: 'rat-in-a-maze', id: EXTERNAL_ID_BASE + 63, title: 'Rat in a Maze', difficulty: 'Medium', pattern: 'backtracking',
    brute: { text: 'Generate every sequence of moves of length up to n² and test which ones reach the exit.', time: ['O(4^(n²))', 'O(3^(n²))', 'O(n²)', 'O(n⁴)'] },
    insight: {
      q: 'You must list every path from the top-left to the bottom-right through open cells without revisiting a cell. What technique?',
      options: [
        'Backtracking: mark the cell visited, try each direction, recurse, then unmark it so other paths can use it',
        'Dynamic programming over the cells, since the paths to a cell overlap and can be counted just once',
        'Breadth-first search from the start, which finds every path through the maze layer by layer in order',
        'Greedy: always step towards the exit first, and never revisit or give up a move once it has been made',
      ],
      why: 'You need all paths, not one, so after exploring a move the choice must be undone (the cell un-marked) to let other branches reuse it. Trying the directions in the order D, L, R, U produces the paths already in lexicographic order. BFS and DP count or find shortest paths, not list simple ones.',
    },
    vars: 'n = side length of the maze',
    time: ['O(4^(n²)) in the worst case', 'O(n²)', 'O(n³)', 'O(n log n)'],
    space: ['O(n²)', 'O(1)', 'O(n)', 'O(4ⁿ)'],
    edgeCases: ['The start or the exit is blocked: no paths', 'A 1×1 open maze', 'Multiple paths of different lengths'],
    approach: 'dfs(r, c, path): if (r, c) is the exit record the path. Otherwise mark the cell visited and for each direction in the order D, L, R, U that is inside the grid, open and unvisited, recurse with the letter appended; then unmark. The paths are produced in lexicographic order.',
    external: {
      source: GFG('rat-in-a-maze-backtracking-2'),
      statement: '<p>A rat starts at the top-left cell <code>(0, 0)</code> of an <code>n × n</code> maze and wants to reach the bottom-right cell. A cell with <code>1</code> is open and <code>0</code> is blocked. The rat can move <code>D</code> (down), <code>L</code>, <code>R</code> or <code>U</code>, and may not visit the same cell twice on one path.</p><p>Return every path as a string of moves, sorted in lexicographic order. Return an empty list if there is none.</p><p><strong>Constraints:</strong></p><ul><li><code>2 &lt;= n &lt;= 5</code></li></ul>',
      signature: { name: 'findPaths', params: [{ name: 'maze', type: 'integer[][]' }], returns: 'list<string>' },
      examples: [
        { input: ['[[1,0,0,0],[1,1,0,1],[1,1,0,0],[0,1,1,1]]'], output: '["DDRDRR","DRDDRR"]' },
        { input: ['[[1,1],[1,1]]'], output: '["DR","RD"]' },
        { input: ['[[1,0],[1,0]]'], output: '[]' },
      ],
      reference: `class Solution {
    private int n;
    private int[][] m;
    private boolean[][] seen;
    private List<String> out;
    public List<String> findPaths(int[][] maze) {
        m = maze;
        n = maze.length;
        seen = new boolean[n][n];
        out = new ArrayList<>();
        if (m[0][0] == 1 && m[n - 1][n - 1] == 1) go(0, 0, new StringBuilder());
        return out;
    }
    private void go(int r, int c, StringBuilder path) {
        if (r == n - 1 && c == n - 1) { out.add(path.toString()); return; }
        seen[r][c] = true;
        char[] dir = {'D', 'L', 'R', 'U'};
        int[] dr = {1, 0, 0, -1}, dc = {0, -1, 1, 0};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nc >= 0 && nr < n && nc < n && m[nr][nc] == 1 && !seen[nr][nc]) {
                path.append(dir[k]);
                go(nr, nc, path);
                path.setLength(path.length() - 1);
            }
        }
        seen[r][c] = false;
    }
}`,
    },
  },
  {
    slug: 'm-coloring-problem', id: EXTERNAL_ID_BASE + 64, title: 'M-Coloring Problem', difficulty: 'Medium', pattern: 'backtracking',
    brute: { text: 'Try all mⁿ colour assignments and test each against every edge.', time: ['O(mⁿ·E)', 'O(n + E)', 'O(n·m)', 'O(n log n)'] },
    insight: {
      q: 'Can the vertices be coloured with at most m colours so adjacent vertices differ? How do you search?',
      options: [
        'Colour vertices one by one, trying each colour no neighbour uses, recurse, and backtrack when a vertex is stuck',
        'Colour every vertex with colour 1, then repair conflicts by bumping colours up one at a time with no undo',
        'Run BFS and alternate two colours down the layers, which decides whether any number of colours is enough',
        'Check that the number of edges is at most m, since each colour can cover at most one edge in the graph',
      ],
      why: 'Graph colouring with m colours is NP-complete in general, so the standard answer is pruned backtracking: a partial colouring that already breaks an edge is abandoned immediately, and the choice is undone to try the next colour. Alternating two colours only decides bipartiteness.',
    },
    vars: 'n = vertices, E = edges, m = colours',
    time: ['O(mⁿ) worst case, pruned in practice', 'O(n + E)', 'O(n·m)', 'O(n²)'],
    space: ['O(n)', 'O(1)', 'O(n·m)', 'O(mⁿ)'],
    edgeCases: ['No edges: a single colour suffices', 'A triangle needs 3 colours', 'm = 1 with at least one edge is impossible'],
    approach: 'Build an adjacency matrix or list. solve(v): if v == n return true; for each colour c in 1..m, if no neighbour of v already has colour c, assign it and recurse on v + 1; if that succeeds return true, otherwise reset v to uncoloured. Return false when no colour works.',
    external: {
      source: GFG('m-coloring-problem-backtracking-5'),
      statement: '<p>An undirected graph has <code>n</code> vertices numbered 0 to <code>n-1</code> and the given <code>edges</code>. Return <code>true</code> if the vertices can be coloured using at most <code>m</code> colours so that no two vertices joined by an edge share a colour.</p><p><strong>Constraints:</strong></p><ul><li><code>1 &lt;= n &lt;= 20</code>, <code>1 &lt;= m &lt;= n</code></li></ul>',
      signature: { name: 'canColour', params: [{ name: 'n', type: 'integer' }, { name: 'edges', type: 'integer[][]' }, { name: 'm', type: 'integer' }], returns: 'boolean' },
      examples: [
        { input: ['4', '[[0,1],[1,2],[2,3],[3,0],[0,2]]', '3'], output: 'true' },
        { input: ['3', '[[0,1],[1,2],[0,2]]', '2'], output: 'false', explain: 'A triangle needs three colours.' },
        { input: ['1', '[]', '1'], output: 'true' },
      ],
      reference: `class Solution {
    private List<List<Integer>> g;
    private int[] color;
    private int n, m;
    public boolean canColour(int n, int[][] edges, int m) {
        this.n = n;
        this.m = m;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); g.get(e[1]).add(e[0]); }
        color = new int[n];
        return solve(0);
    }
    private boolean solve(int v) {
        if (v == n) return true;
        for (int c = 1; c <= m; c++) {
            boolean ok = true;
            for (int u : g.get(v)) if (color[u] == c) { ok = false; break; }
            if (!ok) continue;
            color[v] = c;
            if (solve(v + 1)) return true;
            color[v] = 0;
        }
        return false;
    }
}`,
    },
  },
];
