import type { Pattern } from '../types.ts';

export const treePatterns: Pattern[] = [
  {
    id: 'tree-dfs',
    name: 'Tree DFS',
    group: 'Trees & Heaps',
    summary: 'Solve a tree problem by combining answers from the left and right subtrees.',
    signals: [
      'Height, depth, diameter, balance, path sums',
      'Validate or search a BST (in-order traversal is sorted)',
      'Lowest common ancestor; build a tree from traversals',
      "A node's answer depends on its children's answers",
    ],
    idea:
      "Define what a recursive call returns for a subtree, trust it for the children, and combine. Post-order (children first) computes heights, diameters and path sums; pre-order passes context down (BST bounds, the max seen on the path); in-order visits a BST in sorted order. When the answer isn't what the function returns (a diameter, say), update a field on the side while returning something else (the height).",
    steps: [
      'Define the contract: what does dfs(node) return?',
      'Handle the base case (null node).',
      'Recurse on the children, then combine (post-order), or pass state down (pre-order).',
      'If the global answer differs from the return value, update it on the side.',
    ],
    template: {
      title: 'Post-order with a side answer, and pre-order with bounds',
      code: `// Post-order: return the height, update the diameter (in edges) on the side.
int diameter;

int diameterOfBinaryTree(TreeNode root) {
    diameter = 0;
    height(root);
    return diameter;
}

int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left), right = height(node.right);
    diameter = Math.max(diameter, left + right);   // longest path through this node
    return 1 + Math.max(left, right);
}

// Pre-order with bounds passed down: validate a BST. Call with Long.MIN_VALUE, Long.MAX_VALUE.
boolean isValidBst(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return isValidBst(node.left, low, node.val) && isValidBst(node.right, node.val, high);
}`,
    },
    complexity: 'O(n) time; O(h) recursion stack: O(log n) if balanced, O(n) if skewed.',
    pitfalls: [
      'Validating a BST against direct children only; pass bounds down instead.',
      'int bounds break when node values reach Integer.MIN/MAX_VALUE; use long or null.',
      'Very deep (skewed) trees can overflow the call stack; switch to iteration.',
    ],
    leetcodeTags: ['binary-tree', 'tree', 'binary-search-tree'],
  },
  {
    id: 'tree-bfs',
    name: 'Tree BFS (Level Order)',
    group: 'Trees & Heaps',
    summary: 'Process a tree level by level with a queue.',
    signals: [
      'Level order, zigzag order, averages or maxima per level',
      'What is visible from the right or left side',
      'Minimum depth or the nearest leaf',
      'Width of a level, or linking nodes on the same level',
    ],
    idea:
      "A queue visits nodes in order of distance from the root. Snapshot the queue size at the start of each round: exactly that many nodes form the current level, so you can aggregate per level (average, rightmost node, width). BFS also reaches the shallowest matching node first, which DFS can't guarantee without exploring everything.",
    steps: [
      'Offer the root (if not null) to a queue.',
      'While the queue is not empty: size = queue.size(); process exactly size nodes.',
      'For each node, record level info and offer its non-null children.',
      'After the inner loop, finish the level (append it, update the width…).',
    ],
    template: {
      title: 'Level-by-level traversal',
      code: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    Deque<TreeNode> queue = new ArrayDeque<>();
    if (root != null) queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();                  // nodes in the current level
        List<Integer> level = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        levels.add(level);
    }
    return levels;
}

// Right side view: the last node of each level.
List<Integer> rightSideView(TreeNode root) {
    List<Integer> view = new ArrayList<>();
    Deque<TreeNode> queue = new ArrayDeque<>();
    if (root != null) queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) view.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return view;
}`,
    },
    complexity: 'O(n) time, O(w) space where w is the widest level (up to n/2).',
    pitfalls: [
      'Reading queue.size() in the loop condition: it changes as children are added.',
      'ArrayDeque rejects null; check children before offering them.',
      'Width problems: positional indices overflow on deep trees; renumber per level.',
    ],
    leetcodeTags: ['breadth-first-search'],
  },
  {
    id: 'heap',
    name: 'Heap / Top-K',
    group: 'Trees & Heaps',
    summary: 'A priority queue keeps the best k candidates, or the next smallest item, at O(log n) per operation.',
    signals: [
      'Top k / kth largest / k closest / k most frequent',
      'Repeatedly take the smallest or largest item (scheduling, simulation)',
      'Merge k sorted lists or streams',
      'Running median of a stream (two heaps)',
    ],
    idea:
      "For top-k, keep a heap of size k whose root is the worst of the current best k: a MIN-heap for the k largest. Each new element either beats the root and replaces it, or it doesn't. That's O(n log k) instead of O(n log n), and it works on streams. For a k-way merge the heap holds the current head of each list. Two heaps (a max-heap for the lower half, a min-heap for the upper half) give the median in O(1).",
    steps: [
      'Decide what the heap holds and its order (min-heap for k largest, max-heap for k smallest).',
      'Offer each candidate; if the size exceeds k, poll the root.',
      "For merging, seed the heap with each source's first item; poll one, offer its successor.",
      'Read the answer: the root is the kth best; the contents are the top k.',
    ],
    template: {
      title: 'Top-k with a bounded heap, and a k-way merge',
      code: `// kth largest: keep a min-heap of the k largest values seen so far.
int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();                   // drop the smallest
    }
    return heap.peek();
}

// k-way merge: the heap holds the current head of each sorted list.
ListNode mergeK(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
    for (ListNode head : lists) if (head != null) heap.offer(head);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();
        tail.next = node;
        tail = node;
        if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;
}`,
    },
    complexity: 'O(n log k) for top-k; O(N log k) to merge k lists with N nodes in total; O(k) space.',
    pitfalls: [
      'A max-heap of all n elements works but costs O(n log n) time and O(n) memory.',
      'Comparators like (a, b) -> a - b overflow on large values; use Integer.compare.',
      'Iterating a PriorityQueue is NOT sorted order; only poll() is.',
    ],
    leetcodeTags: ['heap-priority-queue'],
  },
];
