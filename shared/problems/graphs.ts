import type { CuratedProblem } from '../types.ts';

const GRID_TIME = ['O(m · n)', 'O((m · n)²)', 'O(m + n)', 'O(m · n · log(m · n))'] as const;
const GRID_SPACE = ['O(m · n)', 'O(1)', 'O(m + n)', 'O((m · n)²)'] as const;
const VE_TIME = ['O(V + E)', 'O(V · E)', 'O(V²)', 'O(E log V)'] as const;
const VE_SPACE = ['O(V + E)', 'O(1)', 'O(V²)', 'O(V · E)'] as const;

export const graphTraversalProblems: CuratedProblem[] = [
  {
    slug: 'flood-fill', id: 733, title: 'Flood Fill', difficulty: 'Easy', pattern: 'graph-traversal',
    insight: {
      q: 'Which pixels should change color?',
      options: [
        'Pixels 4-connected to the start that share its original color',
        'Every pixel in the image that has the same color as the start',
        'Only the four direct neighbors of the starting pixel',
        'Pixels connected diagonally or orthogonally, whatever their color',
      ],
      why: 'Flood fill is a connected-component traversal. If the new color equals the original, return immediately: recolored pixels would still match the original color and the DFS would never stop.',
    },
    vars: 'm × n image',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['New color equals the original color (return immediately)', 'A 1×1 image', 'The region touches the border'],
    approach:
      'orig = image[sr][sc]; if orig == color return image. dfs(r, c): if out of bounds or image[r][c] != orig return; image[r][c] = color; recurse on the four neighbors.',
  },
  {
    slug: 'number-of-islands', id: 200, title: 'Number of Islands', difficulty: 'Medium', pattern: 'graph-traversal',
    alsoAccept: ['union-find'],
    insight: {
      q: 'How do you count the islands?',
      options: [
        'Each unvisited \'1\' starts an island; DFS/BFS marks the whole island',
        'Count all the \'1\' cells, since each one belongs to exactly one island',
        'Count the \'1\' cells whose right and bottom neighbors are both water',
        'Count the rows that contain at least one land cell',
      ],
      why: 'Each traversal consumes exactly one connected component, so the number of traversals started is the number of islands. Union-Find over land cells gives the same count. Corner-counting tricks break on irregular shapes.',
    },
    vars: 'm × n grid',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['No land at all', 'The whole grid is one island', "Diagonal neighbors don't connect"],
    approach: "For each cell with grid[r][c] == '1': count++ and sink the island with DFS (set cells to '0', recurse on four neighbors). Return count.",
  },
  {
    slug: 'max-area-of-island', id: 695, title: 'Max Area of Island', difficulty: 'Medium', pattern: 'graph-traversal',
    insight: {
      q: "How do you compute each island's area?",
      options: [
        'DFS returns 1 + its neighbors\' areas, marking cells visited',
        'Count every 1 in the grid, since that is the total land area',
        'Multiply the island\'s width by its height from its bounding box',
        'Run a BFS from each land cell without marking visited cells',
      ],
      why: "One traversal covers exactly one island, and summing the cells it visits gives the area. Marking cells visited guarantees each cell is counted once. The bounding box over-counts irregular shapes.",
    },
    vars: 'm × n grid',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['No land (answer 0)', 'Irregular shapes', 'Diagonal cells belong to different islands'],
    approach: 'area(r, c): if out of bounds or grid[r][c] == 0 return 0; set grid[r][c] = 0; return 1 + the areas of the four neighbors. Track the maximum over all start cells.',
  },
  {
    slug: 'clone-graph', id: 133, title: 'Clone Graph', difficulty: 'Medium', pattern: 'graph-traversal',
    alsoAccept: ['hashing'],
    insight: {
      q: 'How do you copy a graph that may contain cycles?',
      options: [
        'Traverse with a map original → clone; reuse clones already made',
        'Recursively copy each neighbor, without remembering visited nodes',
        'Copy the node values into a list and rebuild the edges from it',
        'Copy only the first node\'s neighbor list, since it is connected to the rest',
      ],
      why: 'The map is both the visited set and the way to connect edges to clones that already exist, so cycles are closed instead of being copied forever.',
    },
    vars: 'V = number of nodes, E = number of edges',
    time: [...VE_TIME],
    space: ['O(V)', 'O(1)', 'O(V²)', 'O(V · E)'],
    edgeCases: ['Empty graph (null)', 'A single node with no neighbors', 'Cycles (every undirected edge is one)'],
    approach:
      'clone(node): if null return null; if the map has node return map.get(node). Create the copy, put it in the map FIRST, then add clone(neighbor) for each neighbor. Return the copy.',
  },
  {
    slug: 'rotting-oranges', id: 994, title: 'Rotting Oranges', difficulty: 'Medium', pattern: 'graph-traversal',
    insight: {
      q: 'How do you compute the minutes until every orange rots?',
      options: [
        'Multi-source BFS from all rotten oranges; one level per minute',
        'Run a separate BFS from each rotten orange and add up the times',
        'Run a DFS from the first rotten orange and count the steps',
        'The number of fresh oranges, since one rots per minute',
      ],
      why: 'All rotten oranges spread at the same time, which is exactly BFS started from all of them together. The number of levels processed is the time; any fresh orange left unreached means −1.',
    },
    vars: 'm × n grid',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['No fresh oranges at the start (0)', 'A fresh orange that can never be reached (−1)', 'Fresh oranges but no rotten ones (−1)'],
    approach:
      'Enqueue all rotten cells and count fresh ones. BFS level by level: rot each fresh neighbor (fresh--) and enqueue it; count a minute for each level that rots something. Return fresh == 0 ? minutes : −1.',
  },
  {
    slug: '01-matrix', id: 542, title: '01 Matrix', difficulty: 'Medium', pattern: 'graph-traversal',
    alsoAccept: ['dp-2d'],
    insight: {
      q: "How do you get every cell's distance to its nearest 0 efficiently?",
      options: [
        'Multi-source BFS starting from every 0 at once',
        'A separate BFS from every 1 cell until it reaches its nearest 0',
        'The distance to the closest 0 in the same row',
        'A DFS from each 0, overwriting distances along the way',
      ],
      why: 'Turning the question around (spread outward from every zero together) computes all distances in a single BFS. A BFS per 1-cell is O((m·n)²). A two-pass DP (top-left, then bottom-right) also works in O(m·n).',
    },
    vars: 'm × n matrix',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['Cells that are already 0', 'A single 0 far from most cells', 'An all-zero matrix'],
    approach: "Enqueue every 0 and mark each 1 as unvisited (−1). BFS: give each unvisited neighbor distance current + 1 and enqueue it.",
  },
  {
    slug: 'pacific-atlantic-water-flow', id: 417, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', pattern: 'graph-traversal',
    insight: {
      q: 'How do you find the cells that can reach both oceans efficiently?',
      options: [
        'Climb uphill from each ocean\'s border; keep cells reached by both',
        'Run a DFS downhill from every cell toward both oceans',
        'Take the cells that are higher than all their neighbors',
        'Take the cells on the main diagonal, which touch both coasts',
      ],
      why: 'Water flows downhill, so climbing uphill from the oceans finds every cell that drains into each of them with two traversals in total, instead of one search per cell.',
    },
    vars: 'm × n grid',
    time: [...GRID_TIME],
    space: [...GRID_SPACE],
    edgeCases: ['A single row or column (every cell reaches both)', 'Flat regions (equal heights flow both ways)', 'Corner cells touch both oceans'],
    approach:
      'DFS/BFS from all Pacific border cells (top row, left column) into neighbors with height ≥ current, marking pac. Repeat from the Atlantic borders (bottom row, right column) into atl. Return the cells marked in both.',
  },
  {
    slug: 'word-ladder', id: 127, title: 'Word Ladder', difficulty: 'Hard', pattern: 'graph-traversal',
    insight: {
      q: 'Why is this a BFS problem, and how do you find neighbors quickly?',
      options: [
        'BFS over words; try 26 letters per position against a set',
        'DFS through every transformation sequence and keep the shortest',
        'Sort the word list and walk through it in alphabetical order',
        'Compute the edit distance between beginWord and endWord',
      ],
      why: 'The shortest transformation sequence is a shortest path in an unweighted graph, hence BFS. Generating each word\'s variants (or wildcard patterns like h*t) avoids comparing every pair of words. Edit distance ignores the dictionary.',
    },
    vars: 'N = number of words, L = word length; 26-letter variant',
    time: ['O(N · L²)', 'O(N² · L)', 'O(26^L)', 'O(N!)'],
    space: ['O(N · L)', 'O(1)', 'O(N²)', 'O(26^L)'],
    edgeCases: ['endWord not in the list (return 0)', 'beginWord not in the list (that is allowed)', 'No path exists'],
    approach:
      "Put the list in a set. BFS from beginWord with level 1. For each word and position, try 'a'..'z'; if the new word is in the set, return level + 1 when it is endWord, otherwise enqueue it and remove it from the set. Return 0 if the queue empties.",
  },
];

export const topoSortProblems: CuratedProblem[] = [
  {
    slug: 'course-schedule', id: 207, title: 'Course Schedule', difficulty: 'Medium', pattern: 'topological-sort',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'When can all the courses be finished?',
      options: [
        'Exactly when there\'s no cycle; Kahn\'s algorithm processes all n courses',
        'When every course has at most one prerequisite',
        'When there are fewer prerequisite pairs than courses',
        'When no course lists itself as its own prerequisite',
      ],
      why: "In a cycle every course waits for another, so none can start. Kahn's algorithm repeatedly takes courses with no remaining prerequisites; processing all n means no cycle. DFS with three colors (unvisited / visiting / done) detects the same thing.",
    },
    vars: 'V = number of courses, E = number of prerequisite pairs',
    time: [...VE_TIME],
    space: [...VE_SPACE],
    edgeCases: ['No prerequisites (true)', 'A self-loop [a, a]', 'Disconnected groups of courses', 'A cycle among otherwise unrelated courses'],
    approach:
      'For each pair [a, b] add the edge b → a and indegree[a]++. Queue courses with in-degree 0; pop, count, and decrement neighbors, queueing those that reach 0. Return count == numCourses.',
  },
  {
    slug: 'course-schedule-ii', id: 210, title: 'Course Schedule II', difficulty: 'Medium', pattern: 'topological-sort',
    insight: {
      q: 'How do you return a valid order of courses?',
      options: [
        'The order Kahn\'s algorithm removes courses (or [] if not all are)',
        'Sort the courses by how many prerequisites each one has',
        'List the courses in DFS pre-order starting from course 0',
        'Return the courses sorted by label, from 0 to n − 1',
      ],
      why: 'A course is removed only after all its prerequisites have been removed, so the removal order is a valid topological order. Reversed DFS post-order works too; plain pre-order does not.',
    },
    vars: 'V = number of courses, E = number of prerequisite pairs',
    time: [...VE_TIME],
    space: [...VE_SPACE],
    edgeCases: ['A cycle (return [])', 'No prerequisites (any order)', 'Several valid orders (any one is accepted)'],
    approach: "Run Kahn's algorithm as in Course Schedule, appending each popped course to the result. Return it if it has numCourses entries, else an empty array.",
  },
  {
    slug: 'find-eventual-safe-states', id: 802, title: 'Find Eventual Safe States', difficulty: 'Medium', pattern: 'topological-sort',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'How do you find every node that can never reach a cycle?',
      options: [
        'Reverse the edges and peel from terminal nodes with Kahn\'s algorithm',
        'Return just the nodes with out-degree 0, since they have no way to loop',
        'Return the nodes that do not lie on any cycle themselves',
        'Return the nodes reachable from node 0 by a DFS',
      ],
      why: 'A node is safe when every path from it ends at a terminal. In the reversed graph, a node\'s remaining "in-degree" is its original out-degree, so peeling terminals releases a node once all its edges lead to safe nodes. Nodes that merely point INTO a cycle are unsafe too.',
    },
    vars: 'V = number of nodes, E = number of edges',
    time: [...VE_TIME],
    space: [...VE_SPACE],
    edgeCases: ['Self-loops (unsafe)', 'Isolated terminal nodes (safe)', 'A node pointing into a cycle (unsafe)'],
    approach:
      'Build the reversed graph and outDeg[i] = graph[i].length. Queue nodes with outDeg 0. Pop u and mark it safe; for each v with an original edge v → u, decrement outDeg[v] and queue it at 0. Return the safe nodes in ascending order.',
  },
  {
    slug: 'minimum-height-trees', id: 310, title: 'Minimum Height Trees', difficulty: 'Medium', pattern: 'topological-sort',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'Which nodes give minimum-height trees?',
      options: [
        'The centers: trim leaves layer by layer until one or two remain',
        'The node with the highest degree, since it is closest to everything',
        'Always node 0, since any node can be chosen as the root',
        'The leaves of the tree, since they sit at the ends of the longest path',
      ],
      why: 'The best roots sit in the middle of the longest path, so there are at most two. Peeling leaves inward (a topological sort on degree-1 nodes) reaches them in O(n); running a BFS from every node would be O(n²).',
    },
    vars: 'n = number of nodes',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['n = 1 (answer [0])', 'n = 2 (both nodes)', 'A star-shaped tree (its center)'],
    approach:
      "If n <= 2 return all nodes. Build adjacency and degrees; queue the leaves. While more than 2 nodes remain, remove the current leaf layer, decrement their neighbors' degrees and queue new leaves. The remaining nodes are the answer.",
  },
  {
    slug: 'parallel-courses-iii', id: 2050, title: 'Parallel Courses III', difficulty: 'Hard', pattern: 'topological-sort',
    alsoAccept: ['dp-1d'],
    insight: {
      q: 'How do you compute the minimum total time?',
      options: [
        'Topological order; finish[v] = time[v] + max finish of its prerequisites',
        'Add up the time of every course, since each one must be taken',
        'Take the largest single course time, since courses run in parallel',
        'Sort the courses by time and schedule the shortest ones first',
      ],
      why: "With unlimited parallelism a course starts as soon as its slowest prerequisite ends, so finish times are a longest-path DP over the DAG, computed in topological order with Kahn's algorithm.",
    },
    vars: 'n = number of courses, E = number of relations',
    time: ['O(n + E)', 'O(n · E)', 'O(n²)', 'O(E log n)'],
    space: ['O(n + E)', 'O(1)', 'O(n²)', 'O(n · E)'],
    edgeCases: ['No relations (answer = largest time)', 'One long chain (answer = its total)', 'Prerequisites finishing at different times'],
    approach:
      'Build adjacency and in-degrees; start[v] = 0. Queue in-degree-0 courses. Pop u, finish = start[u] + time[u]; for each v, start[v] = max(start[v], finish), decrement its in-degree and queue at 0. Return the largest finish.',
  },
];

export const unionFindProblems: CuratedProblem[] = [
  {
    slug: 'number-of-provinces', id: 547, title: 'Number of Provinces', difficulty: 'Medium', pattern: 'union-find',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'How do you count provinces from the adjacency matrix?',
      options: [
        'Union every connected pair; answer = n − successful unions',
        'Count the 1s in the matrix and divide by 2 for the symmetry',
        'Count the cities that are not connected to any other city',
        'Count the rows of the matrix, since each row describes one city',
      ],
      why: 'Each successful union merges two components, so components = n − unions. A DFS from every unvisited city counts the same thing. Counting edges says nothing about connectivity.',
    },
    vars: 'n = number of cities',
    time: ['O(n² · α(n))', 'O(n³)', 'O(n)', 'O(n² log n)'],
    space: ['O(n)', 'O(n²)', 'O(1)', 'O(n log n)'],
    edgeCases: ['No connections (n provinces)', 'Everyone connected (1 province)', 'The matrix is symmetric: scan only j > i'],
    approach: 'UnionFind(n). For every i < j with isConnected[i][j] == 1, union(i, j). Return the component count.',
  },
  {
    slug: 'redundant-connection', id: 684, title: 'Redundant Connection', difficulty: 'Medium', pattern: 'union-find',
    insight: {
      q: 'How do you find the edge that creates the cycle?',
      options: [
        'Union edges in order; the first one joining an existing set is redundant',
        'Remove the edge whose two node labels are the largest',
        'Find a node with degree 3 or more and remove one of its edges',
        'Always return the last edge of the input list',
      ],
      why: 'If both endpoints are already connected, the edge closes a cycle. Because the graph is a tree plus one edge, the first such edge found is the cycle edge that appears LAST in the input, which is what the problem asks for.',
    },
    vars: 'n = number of nodes (= number of edges)',
    time: ['O(n · α(n))', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['The cycle includes node 1', 'The redundant edge is the last edge', 'Nodes are 1-indexed (size arrays n + 1)'],
    approach: 'UnionFind(n + 1). For each edge [u, v]: if find(u) == find(v) return the edge; otherwise union(u, v).',
  },
  {
    slug: 'accounts-merge', id: 721, title: 'Accounts Merge', difficulty: 'Medium', pattern: 'union-find',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'How do you merge accounts that share any email?',
      options: [
        'Union all emails within each account, then group emails by root',
        'Merge accounts that have the same name, since a name identifies a person',
        'Merge only accounts whose first listed emails are identical',
        'Sort every email alphabetically and split the list by name',
      ],
      why: 'Sharing an email is transitive: A–B and B–C make A, B and C one person, which Union-Find (or DFS over an email graph) captures. Names can\'t be used, because different people can share a name.',
    },
    vars: 'N = total number of emails, L = maximum email length',
    time: ['O(N log N · L)', 'O(N² · L)', 'O(N)', 'O(2ᴺ)'],
    space: ['O(N · L)', 'O(1)', 'O(N²)', 'O(L)'],
    edgeCases: ['Two different people with the same name', 'An account with a single email', 'A chain A–B–C linked through different emails'],
    approach:
      "Give each email an id and remember its owner's name. For each account, union its first email with every other email. Group emails by root, sort each group, and prepend the owner's name.",
  },
  {
    slug: 'number-of-operations-to-make-network-connected', id: 1319, title: 'Number of Operations to Make Network Connected', difficulty: 'Medium', pattern: 'union-find',
    alsoAccept: ['graph-traversal'],
    insight: {
      q: 'What is the minimum number of cable moves?',
      options: [
        'components − 1, if there are at least n − 1 cables; else −1',
        'The number of redundant cables, since each one must be moved',
        'n minus the number of cables, since each cable links two computers',
        'The number of isolated computers, since only they need a new cable',
      ],
      why: 'Joining c components takes c − 1 cables, and any redundant cable (one closing a cycle) can be moved. A connected network of n computers needs at least n − 1 cables, so with fewer it is impossible.',
    },
    vars: 'n = number of computers, E = number of cables',
    time: ['O(n + E · α(n))', 'O(n · E)', 'O(n²)', 'O(E²)'],
    space: ['O(n)', 'O(1)', 'O(n · E)', 'O(n²)'],
    edgeCases: ['Fewer than n − 1 cables (−1)', 'Already connected (0)', 'Many isolated computers'],
    approach: 'If connections.length < n − 1 return −1. Union every cable and return components − 1.',
  },
  {
    slug: 'min-cost-to-connect-all-points', id: 1584, title: 'Min Cost to Connect All Points', difficulty: 'Medium', pattern: 'union-find',
    alsoAccept: ['heap', 'greedy'],
    insight: {
      q: 'How do you connect all points at minimum total cost?',
      options: [
        'A minimum spanning tree: Kruskal with Union-Find, or Prim',
        'Connect each point to its nearest neighbor and add up those costs',
        'Run Dijkstra from point 0 and add up all the shortest distances',
        'Connect the points in order of x coordinate, left to right',
      ],
      why: "The cheapest cycle-free way to connect everything is a minimum spanning tree. Kruskal adds the cheapest edge joining two different components (Union-Find checks this). Nearest-neighbor links can leave separate clusters, and a shortest-path tree is not an MST.",
    },
    vars: "n = number of points; the graph is complete (n² edges); Kruskal's algorithm",
    time: ['O(n² log n)', 'O(n)', 'O(n³)', 'O(n log n)'],
    space: ['O(n²)', 'O(1)', 'O(n)', 'O(n³)'],
    edgeCases: ['A single point (cost 0)', 'Duplicate coordinates', 'Collinear points'],
    approach:
      "Generate all pairs with their Manhattan distance, sort by cost, and add edges through Union-Find until n − 1 edges are used. Prim's with an O(n²) array scan avoids storing all the edges.",
  },
];

export const shortestPathProblems: CuratedProblem[] = [
  {
    slug: 'network-delay-time', id: 743, title: 'Network Delay Time', difficulty: 'Medium', pattern: 'shortest-path',
    insight: {
      q: 'How long until every node has received the signal?',
      options: [
        'Dijkstra from k; the answer is the largest distance (−1 if unreachable)',
        'Add up the weights of all the edges in the network',
        'Run a BFS from k and count the number of edges to the farthest node',
        'Take the heaviest edge leaving k, since the signal waits for it',
      ],
      why: 'Each node receives the signal at its shortest-path distance from k, so everyone has it at the maximum of those distances. Edges are weighted (and non-negative), so Dijkstra rather than plain BFS.',
    },
    vars: 'V = number of nodes, E = number of edges',
    time: ['O(E log V)', 'O(V · E)', 'O(V + E)', 'O(V³)'],
    space: ['O(V + E)', 'O(1)', 'O(V²)', 'O(V · E)'],
    edgeCases: ['An unreachable node (−1)', 'Nodes are 1-indexed', 'Several edges between the same pair'],
    approach: 'Build adjacency lists. Dijkstra from k with a min-heap of (dist, node), skipping stale entries. Return the max distance, or −1 if any is still infinite.',
  },
  {
    slug: 'path-with-maximum-probability', id: 1514, title: 'Path with Maximum Probability', difficulty: 'Medium', pattern: 'shortest-path',
    insight: {
      q: "How do you adapt Dijkstra when a path's value is the product of its probabilities?",
      options: [
        'A MAX-heap on probability, multiplying along edges',
        'Run a BFS and take the first path that reaches end',
        'Add the probabilities instead of multiplying them, then run Dijkstra',
        'Use a MIN-heap on probability so the weakest paths are settled first',
      ],
      why: 'Dijkstra needs path values that can only get worse as a path grows. Probabilities in [0, 1] only shrink when multiplied, so expanding the most probable node first is correct. Using −log(p) as the weight turns it into an ordinary shortest-path problem.',
    },
    vars: 'V = number of nodes, E = number of edges',
    time: ['O(E log V)', 'O(V · E)', 'O(V + E)', 'O(V³)'],
    space: ['O(V + E)', 'O(1)', 'O(V²)', 'O(V · E)'],
    edgeCases: ['No path between start and end (return 0)', 'Edges with probability 1 or 0', 'Undirected edges must be added both ways'],
    approach: 'prob[start] = 1. Max-heap of (prob, node). Pop the most probable node, skip stale entries, and for each edge if prob[u] × p > prob[v], update and push. Return prob[end].',
  },
  {
    slug: 'path-with-minimum-effort', id: 1631, title: 'Path With Minimum Effort', difficulty: 'Medium', pattern: 'shortest-path',
    alsoAccept: ['binary-search', 'union-find'],
    insight: {
      q: "A path's effort is its largest single step. How do you minimize it?",
      options: [
        'Dijkstra where a path costs its largest step: max(cost(u), |Δh|)',
        'BFS counting steps, since the shortest path has the fewest climbs',
        'Minimize the sum of the height differences along the path',
        'Greedily step to the neighbor with the smallest height difference',
      ],
      why: "Extending a path never lowers its maximum step, so Dijkstra with max instead of + is valid. Binary search on the effort limit with a BFS check, or Kruskal-style Union-Find adding edges by weight, also work. Greedy stepping can walk into a dead end.",
    },
    vars: 'm × n grid',
    time: ['O(m · n · log(m · n))', 'O((m · n)²)', 'O(m · n)', 'O(4^(m·n))'],
    space: ['O(m · n)', 'O(1)', 'O((m · n)²)', 'O(m + n)'],
    edgeCases: ['A 1×1 grid (effort 0)', 'All heights equal', 'The best path is long but flat'],
    approach:
      'effort = ∞ everywhere, effort[0][0] = 0; min-heap of (effort, r, c). Pop; if it is the target, return its effort. For each neighbor, cand = max(effort, |Δheight|); if smaller than its effort, update and push.',
  },
  {
    slug: 'cheapest-flights-within-k-stops', id: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', pattern: 'shortest-path',
    alsoAccept: ['graph-traversal', 'dp-2d'],
    insight: {
      q: "Why doesn't plain Dijkstra work, and what does?",
      options: [
        'k + 1 Bellman-Ford rounds, each relaxing from a copy of last round\'s prices',
        'Plain Dijkstra works as long as you stop after popping k cities',
        'A BFS counting stops, ignoring the prices of the flights',
        'Sort the flights by price and take the cheapest k + 1 of them',
      ],
      why: "A cheaper route with too many stops can block a slightly pricier route that respects the limit. Round i of Bellman-Ford finds the cheapest prices using at most i flights; relaxing from a copy stops one round from chaining two flights. Dijkstra over (city, stops) states also works.",
    },
    vars: 'n = number of cities, E = number of flights, k = stop limit',
    time: ['O(k · E)', 'O(E log n)', 'O(n³)', 'O(n + E)'],
    space: ['O(n)', 'O(n · k)', 'O(1)', 'O(n²)'],
    edgeCases: ['No route within k stops (−1)', 'k = 0 (direct flights only)', 'A cheaper route that needs too many stops'],
    approach:
      'prices = ∞, prices[src] = 0. Repeat k + 1 times: tmp = copy of prices; for each flight (u, v, w), if prices[u] < ∞ and prices[u] + w < tmp[v], set tmp[v]; then prices = tmp. Return prices[dst] or −1.',
  },
  {
    slug: 'swim-in-rising-water', id: 778, title: 'Swim in Rising Water', difficulty: 'Hard', pattern: 'shortest-path',
    alsoAccept: ['binary-search', 'union-find', 'heap'],
    insight: {
      q: 'What is the least time at which you can reach the bottom-right cell?',
      options: [
        'The minimum over paths of the highest cell; expand the lowest cell first',
        'The sum of the elevations along the cheapest path',
        'Always grid[n−1][n−1], since you must wait for the target cell',
        'The number of cells on the shortest path to the corner',
      ],
      why: 'At time t you can use every cell with elevation ≤ t, so the answer is the minimax value of a path. Expanding the lowest reachable cell first finds it (Dijkstra with max). Binary search on t with a flood fill, or Union-Find adding cells by elevation, also work.',
    },
    vars: 'n × n grid',
    time: ['O(n² log n)', 'O(n⁴)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(n²)', 'O(1)', 'O(n)', 'O(n⁴)'],
    edgeCases: ['A 1×1 grid (answer grid[0][0])', 'The start cell is the highest', 'A longer detour that stays lower'],
    approach:
      'Min-heap of (elevation, r, c) seeded with (grid[0][0], 0, 0), plus a visited array. Pop the lowest cell and set t = max(t, elevation); if it is the target return t; push unvisited neighbors.',
  },
];
