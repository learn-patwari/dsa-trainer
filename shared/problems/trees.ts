import type { CuratedProblem } from '../types.ts';

const TREE_VARS = 'n = number of nodes, h = height of the tree';
const LEVEL_VARS = 'n = number of nodes, w = maximum width of a level';

export const treeDfsProblems: CuratedProblem[] = [
  {
    slug: 'invert-binary-tree', id: 226, title: 'Invert Binary Tree', difficulty: 'Easy', pattern: 'tree-dfs',
    alsoAccept: ['tree-bfs'],
    brute: { text: 'Collect the levels, reverse each one, and rebuild the tree.', time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'] },
    insight: {
      q: 'What does inverting the tree require at each node?',
      options: [
        'Swap its left and right children, then invert both subtrees recursively',
        'Swap the values of the leftmost and rightmost nodes on each level',
        'Reverse the in-order traversal and rebuild a tree from the result',
        'Swap only the root\'s two children; the subtrees follow along with them',
      ],
      why: "A mirror image swaps the children of EVERY node. Doing that at each node, recursively or with a BFS queue, visits each node once. Swapping only values or only the root's children doesn't mirror deeper structure.",
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['Empty tree', 'A single node', 'A skewed tree (deep recursion)'],
    approach: 'If root is null return null. Swap root.left and root.right, then invert both children. Return root.',
  },
  {
    slug: 'maximum-depth-of-binary-tree', id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', pattern: 'tree-dfs',
    alsoAccept: ['tree-bfs'],
    brute: { text: 'Enumerate every root-to-leaf path and take the longest.', time: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(n log n)'] },
    insight: {
      q: 'How is the depth defined recursively?',
      options: [
        'depth(node) = 1 + max(depth(left), depth(right)); depth(null) = 0',
        'depth(node) = 1 + depth(left) + depth(right), counting both branches',
        'depth(node) = 1 + min(depth(left), depth(right)), with depth(null) = 0',
        'depth = log₂(number of nodes), rounded up to the next whole number',
      ],
      why: 'Each subtree reports its own depth and the node adds one level on top of the deeper one. The sum counts nodes, the min is a different problem, and log₂ only holds for perfect trees.',
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n log n)', 'O(h)', 'O(n²)'],
    space: ['O(h)', 'O(1)', 'O(n log n)', 'O(n²)'],
    edgeCases: ['Empty tree (depth 0)', 'A single node (depth 1)', 'A skewed tree (depth n)'],
    approach: 'Return 0 for null; otherwise return 1 + max(maxDepth(left), maxDepth(right)). BFS counting levels works too.',
  },
  {
    slug: 'diameter-of-binary-tree', id: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy', pattern: 'tree-dfs',
    brute: { text: 'Recompute the height from every node separately.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'] },
    insight: {
      q: 'How do you get the diameter in a single traversal?',
      options: [
        'Return heights; at each node update best with left + right height',
        'Compute height(root.left) + height(root.right) once, at the root only',
        'Run a separate height computation from every node and take the best',
        'Double the height of the tree, since the longest path goes down both sides',
      ],
      why: "The longest path bends at some top node, where its length is the sum of the two child heights. That node need not be the root, so every node is a candidate. Computing heights bottom-up in one post-order pass keeps it O(n); recomputing heights per node is O(n²).",
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['A single node (diameter 0)', "The longest path doesn't pass through the root", 'A skewed tree'],
    approach:
      'height(node): if null return 0; l = height(left), r = height(right); best = max(best, l + r); return 1 + max(l, r). The answer (in edges) is best.',
  },
  {
    slug: 'validate-binary-search-tree', id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', pattern: 'tree-dfs',
    brute: { text: 'For every node, scan its whole left and right subtree for a violation.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'] },
    insight: {
      q: 'What must every node satisfy in a valid BST?',
      options: [
        'It must lie within bounds inherited from all its ancestors',
        'left.val < node.val < right.val must hold for its direct children',
        'Its value must be greater than its parent\'s value',
        'The tree must be height-balanced, like any well-formed search tree',
      ],
      why: 'A node deep in the left subtree must be smaller than every ancestor it lies to the left of. Checking only direct children misses trees like 5 → (4, 6 → (3, 7)). Passing (low, high) bounds down, or checking that the in-order traversal strictly increases, catches it.',
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['Duplicate values are invalid', 'Values equal to Integer.MIN_VALUE / MAX_VALUE (use long or null bounds)', 'A violation two levels down'],
    approach:
      'valid(node, low, high): null is valid; if node.val <= low or node.val >= high return false; recurse left with (low, node.val) and right with (node.val, high). Start with Long.MIN_VALUE and Long.MAX_VALUE.',
  },
  {
    slug: 'kth-smallest-element-in-a-bst', id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium', pattern: 'tree-dfs',
    brute: { text: 'Collect every value in order, then index into the list.', time: ['O(n)', 'O(h + k)', 'O(n log n)', 'O(k log n)'] },
    insight: {
      q: 'How do you find the kth smallest value?',
      options: [
        'An in-order traversal is sorted, so stop at the kth node it visits',
        'Take the kth node of a level-order traversal, since upper levels hold smaller values',
        'Go left k times from the root, since the left child is always smaller',
        'Pre-order traversal visits a BST in sorted order; take its kth node',
      ],
      why: 'In-order (left, node, right) yields sorted order for a BST. An iterative traversal can stop after k pops, costing O(h + k) instead of visiting all n nodes.',
    },
    vars: TREE_VARS,
    time: ['O(h + k)', 'O(n log n)', 'O(n²)', 'O(k log n)'],
    space: ['O(h)', 'O(1)', 'O(n log n)', 'O(k²)'],
    edgeCases: ['k = 1 (the leftmost node)', 'k = n (the largest value)', 'A skewed tree'],
    approach:
      'Iterative in-order: push nodes while moving left; pop one, decrement k and return its value when k reaches 0; then move to its right child. Follow-up for frequent inserts: store subtree sizes in the nodes.',
  },
  {
    slug: 'lowest-common-ancestor-of-a-binary-search-tree', id: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium', pattern: 'tree-dfs',
    alsoAccept: ['binary-search'],
    brute: { text: 'Search the whole tree for both nodes, then compare their paths.', time: ['O(n)', 'O(h)', 'O(log n)', 'O(n²)'] },
    insight: {
      q: 'How does the BST property locate the lowest common ancestor?',
      options: [
        'Walk down: both smaller → left, both larger → right, else stop here',
        'Record both root-to-node paths with a full DFS and compare them',
        'In a BST the lowest common ancestor is always the root',
        'The node whose value is closest to the average of p and q',
      ],
      why: 'While p and q are on the same side of the current node, the LCA must be on that side too. The first node where they split, or that equals one of them, is the LCA. The walk is O(h) with O(1) space; the path-recording approach ignores the BST ordering.',
    },
    vars: 'n = number of nodes, h = height of the tree; iterative walk',
    time: ['O(h)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
    edgeCases: ['p is an ancestor of q (answer p)', 'p and q on opposite sides of the root', 'A skewed tree'],
    approach: 'node = root. Loop: if both p.val and q.val < node.val go left; if both > node.val go right; otherwise return node.',
  },
  {
    slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', pattern: 'tree-dfs',
    brute: { text: 'Scan the inorder array for the root at every recursion step.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'] },
    insight: {
      q: 'How do the two traversals pin down the tree?',
      options: [
        'preorder[0] is the root; its inorder index splits left and right',
        'inorder[0] is always the root, and preorder tells you where each subtree ends',
        'The middle element of preorder is the root, as when building a balanced tree',
        'Insert the preorder values into a BST one by one, in the order given',
      ],
      why: "Pre-order lists the root first; in-order places the left subtree before the root and the right subtree after it. The root's in-order index (O(1) with a HashMap) gives the left subtree's size, which also splits the pre-order range. Inserting into a BST only works if the tree is a BST.",
    },
    vars: 'n = number of nodes',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['A single node', 'A left- or right-skewed tree', 'Values must be unique for the index map'],
    approach:
      'Map inorder values to indices. build(preStart, inLeft, inRight): root = preorder[preStart]; mid = index[root]; leftSize = mid − inLeft; root.left = build(preStart + 1, inLeft, mid − 1); root.right = build(preStart + 1 + leftSize, mid + 1, inRight).',
  },
  {
    slug: 'lowest-common-ancestor-of-a-binary-tree', id: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', pattern: 'tree-dfs',
    brute: { text: 'Find the path to each node, then walk the two paths together.', time: ['O(n)', 'O(h)', 'O(n log n)', 'O(n²)'] },
    insight: {
      q: 'What should the recursive function return to find the LCA in one pass?',
      options: [
        'Return node if it is p or q; if both sides return non-null, it is the LCA',
        'Return whether a subtree contains p, then run a second traversal for q',
        'Go left if both values are smaller than the node, right if both are larger',
        'Return the depths of p and q and pick the shallower of the two nodes',
      ],
      why: 'A non-null result means that subtree contains p or q. The first node receiving non-null results from both sides is where the paths split. Returning a node as soon as it equals p covers the case where q lies beneath p. Comparing values only works for BSTs.',
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['p is an ancestor of q', 'p and q in different subtrees of the root', 'Values are not ordered (not a BST)'],
    approach:
      'lca(node): if node is null or equals p or q, return node. left = lca(node.left); right = lca(node.right). If both are non-null return node; otherwise return the non-null one.',
  },
  {
    slug: 'binary-tree-maximum-path-sum', id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', pattern: 'tree-dfs',
    brute: { text: 'From every node, explore all the downward paths on both sides.', time: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'] },
    insight: {
      q: 'What should dfs(node) return, and what should it record on the side?',
      options: [
        'Return node + max(0, best child); record node + both clamped children',
        'Return the best path through node using both children, so the parent can extend it',
        'Return the sum of the node\'s entire subtree, since a path can collect it all',
        'Return the largest single value in the subtree and combine at the root',
      ],
      why: 'A path bends at most once, at its top node. A parent can only extend ONE downward branch, so that is the return value; the bent path using both children is only a candidate answer. Clamping negative branches to 0 means "don\'t take that branch".',
    },
    vars: TREE_VARS,
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(h)'],
    space: ['O(h)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['All values negative (answer = the largest single value)', 'A single node', 'The best path avoids the root'],
    approach:
      'gain(node): if null return 0. l = max(0, gain(left)); r = max(0, gain(right)); best = max(best, node.val + l + r); return node.val + max(l, r). Start best at Integer.MIN_VALUE so all-negative trees work.',
  },
  {
    slug: 'serialize-and-deserialize-binary-tree', id: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', pattern: 'tree-dfs',
    alsoAccept: ['tree-bfs'],
    brute: { text: 'Store every root-to-leaf path and rebuild the tree from them.', time: ['O(n · h)', 'O(n)', 'O(n²)', 'O(2ⁿ)'] },
    insight: {
      q: 'What makes a single traversal enough to rebuild the tree?',
      options: [
        'Write a pre-order list with null markers, e.g. \'1,2,#,#,3,#,#\', and parse it back',
        'Store only the in-order traversal, which lists every node exactly once',
        'Store the pre-order traversal without null markers, since the root comes first',
        'Store the values in sorted order and rebuild them as a balanced BST',
      ],
      why: 'Without null markers, different trees can share a traversal. With them, pre-order parses unambiguously: read a value, build the left subtree, then the right. Level order with null markers (how LeetCode prints trees) works too.',
    },
    vars: 'n = number of nodes',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Empty tree', 'Negative and multi-digit values', 'A deeply skewed tree (recursion depth)'],
    approach:
      "serialize: pre-order DFS appending the value or '#', comma-separated. deserialize: split into a queue of tokens; build() polls a token, returns null for '#', otherwise creates the node and sets node.left = build(), node.right = build().",
  },
];

export const treeBfsProblems: CuratedProblem[] = [
  {
    slug: 'average-of-levels-in-binary-tree', id: 637, title: 'Average of Levels in Binary Tree', difficulty: 'Easy', pattern: 'tree-bfs',
    brute: { text: 'For each depth, walk the whole tree collecting the nodes at it.', time: ['O(n · h)', 'O(n)', 'O(n²)', 'O(n log n)'] },
    insight: {
      q: 'How do you compute one average per level?',
      options: [
        'BFS: process queue.size() nodes per round, summing in a long',
        'In-order traversal, averaging each pair of consecutive values',
        'Average all node values once and repeat that value for every level',
        'DFS that divides each value by its depth before adding it to a total',
      ],
      why: 'Snapshotting the queue size isolates one level per round. Summing in a long or double avoids overflow when values are near the int limits. DFS with per-depth (sum, count) lists also works.',
    },
    vars: LEVEL_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(w)'],
    space: ['O(w)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['A single node', 'Values near Integer.MAX_VALUE (int sums overflow)', 'A skewed tree (one node per level)'],
    approach:
      'Queue the root. While the queue is non-empty: size = queue.size(); poll size nodes, adding their values to a long sum and offering their children; append sum / (double) size.',
  },
  {
    slug: 'binary-tree-level-order-traversal', id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', pattern: 'tree-bfs',
    brute: { text: 'For each depth, traverse the tree collecting just that level.', time: ['O(n · h)', 'O(n)', 'O(n²)', 'O(n log n)'] },
    insight: {
      q: 'How do you separate one level from the next?',
      options: [
        'Read queue.size() first; exactly that many nodes form the level',
        'Use a stack instead of a queue so each level comes out together',
        'Start a new level whenever a polled node has no children',
        'Start a new level whenever a value is smaller than the previous one',
      ],
      why: "When a round starts, the queue holds exactly one level's nodes, and their children are appended behind them. Processing size nodes per round keeps the levels apart.",
    },
    vars: LEVEL_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(w)'],
    space: ['O(w)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['Empty tree (return [])', 'A single node', 'A skewed tree'],
    approach:
      'If root is null return []. Queue the root. While non-empty: size = queue.size(); build a list from size polled nodes, offering their non-null children; add the list to the result.',
  },
  {
    slug: 'binary-tree-right-side-view', id: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium', pattern: 'tree-bfs',
    alsoAccept: ['tree-dfs'],
    brute: { text: 'Collect every level, then keep the last node of each.', time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(h)'] },
    insight: {
      q: 'Which nodes are visible from the right side?',
      options: [
        'The last node processed on each level of a BFS',
        'The nodes along the chain of right children starting from the root',
        'All the leaf nodes, read from top to bottom',
        'The node with the largest value on each level',
      ],
      why: 'A left subtree can be deeper than the right one, so following right children alone misses nodes. On each level, the rightmost node is the one you see.',
    },
    vars: 'n = number of nodes, w = maximum width of a level; complexities are for BFS',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(w)'],
    space: ['O(w)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['A left subtree deeper than the right one', 'Empty tree', 'A single node'],
    approach:
      "BFS level by level; add the value of the node at index size − 1 of each level. Alternatively, DFS right-first and record a node the first time its depth is reached.",
  },
  {
    slug: 'binary-tree-zigzag-level-order-traversal', id: 103, title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', pattern: 'tree-bfs',
    brute: { text: 'Collect the levels first, then reverse every other list.', time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(h)'] },
    insight: {
      q: 'How do you alternate the direction of each level?',
      options: [
        'Normal BFS; add to the front of the list on every other level',
        'Flip the order children are offered into the queue on every other level',
        'Run a DFS and reverse the entire result list at the end',
        'Sort each level ascending, then descending, alternately',
      ],
      why: 'The queue must stay left-to-right so the next level comes out right; only the way each level is written changes. Flipping the child order in a single queue scrambles the level after next.',
    },
    vars: LEVEL_VARS,
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(w)'],
    space: ['O(w)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['Empty tree', 'Levels with a single node', 'Uneven levels'],
    approach:
      'Standard BFS with a flag leftToRight. For each level build a LinkedList: addLast when leftToRight, addFirst otherwise. Flip the flag after each level.',
  },
  {
    slug: 'maximum-width-of-binary-tree', id: 662, title: 'Maximum Width of Binary Tree', difficulty: 'Medium', pattern: 'tree-bfs',
    brute: { text: 'Pad the tree out as a complete array and measure each level.', time: ['O(2^h)', 'O(n)', 'O(n²)', 'O(n log n)'] },
    insight: {
      q: 'How do you measure the width of a level, counting the null gaps between nodes?',
      options: [
        'Heap-style positions (2i, 2i + 1); width = last − first + 1',
        'Count the non-null nodes on each level and keep the maximum',
        'Count the leaves of the tree, since the widest level holds the leaves',
        'Use 2^depth for the deepest level, since a level can hold that many nodes',
      ],
      why: 'Positions encode where a node would sit in a complete tree, so gaps are counted automatically. Renumber each level relative to its first position so the numbers do not overflow on deep, skewed trees.',
    },
    vars: 'n = number of nodes, w = maximum number of nodes on a level',
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
    space: ['O(w)', 'O(1)', 'O(2ⁿ)', 'O(n²)'],
    edgeCases: ['Deep skewed trees (positions overflow without renumbering)', 'A single node (width 1)', 'A wide gap between the only two nodes on a level'],
    approach:
      'BFS over (node, pos). For each level remember the first position; width = lastPos − firstPos + 1. Offer children with positions 2·(pos − first) and 2·(pos − first) + 1 to keep numbers small.',
  },
];

export const heapProblems: CuratedProblem[] = [
  {
    slug: 'kth-largest-element-in-a-stream', id: 703, title: 'Kth Largest Element in a Stream', difficulty: 'Easy', pattern: 'heap',
    brute: { text: 'Keep every value and sort on each add() to find the kth largest.', time: ['O(n log n) per add', 'O(log k) per add', 'O(n) per add', 'O(k log n) per add'] },
    insight: {
      q: 'How should add() return the kth largest quickly?',
      options: [
        'A min-heap of the k largest values; its root is the answer',
        'A max-heap of every value, popping k times on each add() to find the kth',
        'A sorted array, inserting each value at its binary-searched position',
        'Only the maximum value seen so far, updated on every add()',
      ],
      why: 'The root of a size-k min-heap is the smallest of the k largest values, which is exactly the kth largest. Each add is O(log k). Inserting into a sorted array shifts O(n) elements.',
    },
    vars: 'n = values added so far, k = the rank',
    time: ['O(log k) per add', 'O(k log n) per add', 'O(n) per add', 'O(1) per add'],
    space: ['O(k)', 'O(n)', 'O(1)', 'O(n log n)'],
    edgeCases: ['Fewer than k initial values', 'Duplicate values', 'Negative values'],
    approach: 'Constructor: call add() for each initial value. add(val): heap.offer(val); if heap.size() > k, heap.poll(). Return heap.peek().',
  },
  {
    slug: 'k-closest-points-to-origin', id: 973, title: 'K Closest Points to Origin', difficulty: 'Medium', pattern: 'heap',
    brute: { text: 'Sort all the points by distance and take the first k.', time: ['O(n log n)', 'O(n log k)', 'O(n)', 'O(n · k)'] },
    insight: {
      q: 'How do you keep only the k closest points efficiently?',
      options: [
        'A max-heap of size k on squared distance, evicting the farthest',
        'A min-heap of size k on distance, evicting the root when it grows past k',
        'Sort the points by x coordinate, then by y coordinate',
        'Round the Math.sqrt distances to ints and bucket the points by distance',
      ],
      why: 'The max-heap root is the farthest of the current best k, which is exactly the one to evict. A min-heap would evict the closest point. Squared distances avoid floating point entirely. Quickselect is an O(n)-average alternative.',
    },
    vars: 'n = number of points',
    time: ['O(n log k)', 'O(n²)', 'O(k log n)', 'O(n · k)'],
    space: ['O(k)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['k equals n', 'Ties in distance (any order is accepted)', 'Coordinates up to 10⁴ (the squared distance fits in an int)'],
    approach:
      'Use a max-heap comparing x² + y² in descending order. Offer each point and poll when the size exceeds k. The heap holds the answer.',
  },
  {
    slug: 'kth-largest-element-in-an-array', id: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium', pattern: 'heap',
    brute: { text: 'Sort the array and read the kth value from the end.', time: ['O(n log n)', 'O(n log k)', 'O(n)', 'O(k log n)'] },
    insight: {
      q: 'How do you find the kth largest without sorting everything?',
      options: [
        'A min-heap holding the k largest values: its root is the kth largest',
        'A max-heap of size k: its root is the kth largest once all values are seen',
        'Partition once around the median value and return the element at index k',
        'Binary-search the unsorted array for the position k from the end',
      ],
      why: 'A size-k min-heap discards everything below the current kth largest, costing O(n log k). A size-k max-heap would keep the k SMALLEST. Quickselect partitions around a random pivot and recurses into one side: O(n) on average.',
    },
    vars: 'n = length of nums; complexities are for the heap approach',
    time: ['O(n log k)', 'O(n²)', 'O(k log k)', 'O(log n)'],
    space: ['O(k)', 'O(1)', 'O(n²)', 'O(n log n)'],
    edgeCases: ['k = 1 (the maximum)', 'k = n (the minimum)', 'Duplicates count separately (it is the kth in sorted order, not the kth distinct)'],
    approach:
      'Offer each number into a min-heap and poll when the size exceeds k; return heap.peek(). For O(n) average, quickselect index n − k with a random pivot.',
  },
  {
    slug: 'top-k-frequent-elements', id: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', pattern: 'heap',
    alsoAccept: ['hashing'],
    brute: { text: 'Count the values, sort them all by frequency, take the first k.', time: ['O(n log n)', 'O(n log k)', 'O(n)', 'O(k log n)'] },
    insight: {
      q: 'After counting frequencies, how do you pick the k most frequent faster than a full sort?',
      options: [
        'A size-k min-heap on frequency, or buckets indexed by frequency',
        'Sort the distinct values themselves and take the last k of them',
        'A max-heap of size k on frequency, evicting the root when it grows past k',
        'Take the first k distinct values in input order, since they appear first',
      ],
      why: 'Frequencies are at most n, so bucket[f] can list the values seen f times, and scanning from high f to low collects k values in O(n). The size-k min-heap on frequency is the general O(n log k) approach; a max-heap would evict the most frequent value.',
    },
    vars: 'n = length of nums; complexities are for the heap approach',
    time: ['O(n log k)', 'O(n²)', 'O(k²)', 'O(n · k)'],
    space: ['O(n)', 'O(1)', 'O(k²)', 'O(log n)'],
    edgeCases: ['k equals the number of distinct values', 'A single distinct value', 'Negative numbers'],
    approach:
      'Count with a HashMap. Offer (value, count) into a min-heap on count, polling when the size exceeds k; the heap holds the answer. Bucket alternative: lists indexed by count, scanned from n down.',
  },
  {
    slug: 'task-scheduler', id: 621, title: 'Task Scheduler', difficulty: 'Medium', pattern: 'heap',
    alsoAccept: ['greedy'],
    brute: { text: 'Simulate the timeline second by second, picking an available task each time.', time: ['O(T · n)', 'O(T)', 'O(T log T)', 'O(T²)'] },
    insight: {
      q: 'What determines the minimum number of intervals?',
      options: [
        'max(tasks, (maxCount − 1) × (n + 1) + number of tasks tied at maxCount)',
        'The number of tasks multiplied by n, since each task needs n idle slots',
        'The number of distinct tasks multiplied by (n + 1)',
        'Exactly the number of tasks, since tasks can always be reordered to fill gaps',
      ],
      why: 'The most frequent task forces maxCount − 1 full frames of length n + 1, followed by a final frame holding every task tied at maxCount. If other tasks overflow those frames, no idling is needed and the answer is simply the task count. A max-heap simulation with a cooldown queue gives the same result.',
    },
    vars: 'T = number of tasks (26 task types)',
    time: ['O(T)', 'O(T log T)', 'O(T · n)', 'O(T²)'],
    space: ['O(1)', 'O(T)', 'O(T · n)', 'O(n)'],
    edgeCases: ['n = 0 (answer = number of tasks)', 'Several tasks tied for the maximum count', 'So many distinct tasks that no idling is needed'],
    approach:
      'Count tasks in 26 counters. maxCount = the highest count; ties = how many types have it. Return max(tasks.length, (maxCount − 1) × (n + 1) + ties).',
  },
  {
    slug: 'merge-k-sorted-lists', id: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard', pattern: 'heap',
    alsoAccept: ['linked-list'],
    brute: { text: 'Merge the lists one at a time, left to right.', time: ['O(N · k)', 'O(N log k)', 'O(N)', 'O(k log N)'] },
    insight: {
      q: 'How do you keep picking the smallest node among k lists efficiently?',
      options: [
        'Each list\'s head in a min-heap; poll, append, offer its successor',
        'Compare all k heads at every step and take the smallest one',
        'Concatenate all the lists into one and sort the result',
        'Merge list 1 with list 2, then the result with list 3, and so on',
      ],
      why: 'The heap never holds more than k nodes, so each of the N nodes costs O(log k). Pairwise divide-and-conquer merging also achieves O(N log k); merging one list at a time costs O(N · k).',
    },
    vars: 'N = total number of nodes, k = number of lists',
    time: ['O(N log k)', 'O(N · k)', 'O(N log N)', 'O(k log N)'],
    space: ['O(k)', 'O(1)', 'O(N)', 'O(N · k)'],
    edgeCases: ['An empty array of lists', 'Some lists are null', 'k = 1'],
    approach:
      'Offer every non-null head into a PriorityQueue ordered by val. With a dummy tail: poll the smallest, attach it, offer its next if non-null. Return dummy.next.',
  },
  {
    slug: 'find-median-from-data-stream', id: 295, title: 'Find Median from Data Stream', difficulty: 'Hard', pattern: 'heap',
    brute: { text: 'Keep every number in a list and sort it on each findMedian().', time: ['O(n log n) per query', 'O(log n) per add', 'O(n) per query', 'O(1) per query'] },
    insight: {
      q: 'How do you get the median in O(1) while numbers keep arriving?',
      options: [
        'Max-heap for the lower half, min-heap for the upper half, kept balanced',
        'Keep an ArrayList and sort it every time findMedian() is called',
        'Keep a running average, which equals the median of the stream',
        'Keep one min-heap and pop half of it on every findMedian() call',
      ],
      why: 'The two heap tops are the middle elements. Each add pushes into one heap, moves its top across to preserve order, then rebalances sizes: O(log n). findMedian reads one or two tops in O(1). An average is the mean, not the median.',
    },
    vars: 'n = numbers added so far',
    time: ['O(log n) add, O(1) median', 'O(1) add, O(n log n) median', 'O(n) add, O(1) median', 'O(log n) add, O(log n) median'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Even count (average the two tops as a double)', 'Duplicates', 'Values near the int limits (add as long/double)'],
    approach:
      'low = max-heap, high = min-heap. add(x): low.offer(x); high.offer(low.poll()); if high.size() > low.size(), low.offer(high.poll()). findMedian: low larger → low.peek(); else (low.peek() + (double) high.peek()) / 2.',
  },
];
