import type { Pattern } from '../types.ts';

export const listPatterns: Pattern[] = [
  {
    id: 'stack',
    name: 'Stack',
    group: 'Stacks & Linked Lists',
    summary: 'Last in, first out: match, cancel, or evaluate nested structure.',
    signals: [
      'Matching pairs: brackets, tags, open/close events',
      'Nested structure: k[…] decoding, expressions, file paths',
      'A new item cancels or combines with the most recent one (collisions, backspaces)',
      'You need the most recent unresolved item in O(1)',
    ],
    idea:
      'A stack keeps the most recent unresolved item on top. Each new item either resolves the top (a closing bracket matches the last opener, an operator consumes the last two operands, a left-moving asteroid hits the last right-moving one) or becomes the new top. Nested structures unwind naturally: push context when you enter a level and pop it when you leave.',
    steps: [
      'Decide what the stack holds: characters, indices, numbers, or saved contexts.',
      'For each item: while it resolves the top, pop and combine.',
      'Otherwise push it.',
      'Whatever remains at the end is unmatched or survived.',
    ],
    template: {
      title: 'Matching brackets and evaluating RPN',
      code: `// Matching brackets: push the closer you expect to see next.
boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        switch (c) {
            case '(' -> stack.push(')');
            case '[' -> stack.push(']');
            case '{' -> stack.push('}');
            default -> {
                if (stack.isEmpty() || stack.pop() != c) return false;
            }
        }
    }
    return stack.isEmpty();
}

// Reverse Polish Notation: an operator consumes the two most recent operands.
int evalRpn(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+", "-", "*", "/" -> {
                int b = stack.pop(), a = stack.pop();   // first pop is the RIGHT operand
                stack.push(switch (t) {
                    case "+" -> a + b;
                    case "-" -> a - b;
                    case "*" -> a * b;
                    default -> a / b;
                });
            }
            default -> stack.push(Integer.parseInt(t));
        }
    }
    return stack.pop();
}`,
    },
    complexity: 'O(n) time (each item is pushed and popped at most once), O(n) space.',
    pitfalls: [
      'Popping an empty stack: check isEmpty() first.',
      'Operand order for - and /: the first pop is the right-hand operand.',
      'java.util.Stack is legacy and synchronized; prefer ArrayDeque.',
    ],
    leetcodeTags: ['stack'],
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    group: 'Stacks & Linked Lists',
    summary: "Keep a stack in sorted order to find every element's next greater/smaller neighbor in O(n).",
    signals: [
      'Next greater / next smaller / previous smaller element',
      '"How many days until…", stock span, visibility problems',
      'Largest rectangle or area bounded by the nearest smaller bar',
      'Remove k digits/characters to get the smallest possible result',
    ],
    idea:
      'Scan left to right, keeping the indices whose answer is still unknown on a stack in monotonic order. When the current element breaks the order (it is bigger than the top, for "next greater"), it is the answer for the top: pop and record. Every index is pushed and popped once, so all answers cost O(n) in total instead of O(n²).',
    steps: [
      'Pick the order: a decreasing stack finds next greater; an increasing stack finds next smaller.',
      'For each index i: while nums[i] breaks the order with the top, pop the top; nums[i] is its answer.',
      'Push i.',
      'Indices still on the stack have no answer; give them the default (−1, 0, n…).',
    ],
    template: {
      title: 'Next greater element and largest rectangle',
      code: `// Next greater element to the right (-1 if none). Stack holds indices; values decrease.
int[] nextGreater(int[] nums) {
    int[] answer = new int[nums.length];
    Arrays.fill(answer, -1);
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
            answer[stack.pop()] = nums[i];      // first bigger value to the right
        }
        stack.push(i);
    }
    return answer;
}

// Largest rectangle in a histogram: pop a bar once it can't extend any further right.
int largestRectangle(int[] heights) {
    Deque<Integer> stack = new ArrayDeque<>();  // indices; heights increase
    int best = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = (i == heights.length) ? 0 : heights[i];   // sentinel flushes the stack
        while (!stack.isEmpty() && h < heights[stack.peek()]) {
            int height = heights[stack.pop()];
            int left = stack.isEmpty() ? -1 : stack.peek();
            best = Math.max(best, height * (i - left - 1));
        }
        stack.push(i);
    }
    return best;
}`,
    },
    complexity: 'O(n) time (each index is pushed and popped once), O(n) space.',
    pitfalls: [
      'Storing values instead of indices when you need distances or widths.',
      'Strict vs non-strict comparison decides how equal values behave.',
      'Forgetting to flush the stack at the end; a 0-height sentinel helps.',
    ],
    leetcodeTags: ['monotonic-stack'],
  },
  {
    id: 'linked-list',
    name: 'Linked List Manipulation',
    group: 'Stacks & Linked Lists',
    summary: 'Rewire nodes safely with a dummy head and careful pointer updates.',
    signals: [
      'Reverse all or part of a list, or reorder its nodes',
      'Merge sorted lists, remove the nth node, partition around a value',
      'O(1) extra space required on a linked list',
      'Design needing O(1) removal from the middle (LRU cache)',
    ],
    idea:
      "Linked-list problems are mostly about not losing references. A dummy node before the head removes the special case of replacing the head. Before overwriting a next pointer, save it. Reversal is the core building block: prev / curr / next pointers walking forward, flipping one arrow per step.",
    steps: [
      'Create a dummy node pointing at head if the head can change.',
      'Walk with a pointer to the node BEFORE the one you will modify.',
      'Save next before rewiring; update pointers in a fixed order.',
      'Return dummy.next.',
    ],
    template: {
      title: 'Iterative reversal and merging with a dummy head',
      code: `// Reverse a list iteratively: flip one arrow per step.
ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;   // save before overwriting
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

// Merge two sorted lists using a dummy head.
ListNode merge(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}`,
    },
    complexity: 'O(n) time, O(1) extra space for iterative rewiring.',
    pitfalls: [
      'Overwriting next before saving it loses the rest of the list.',
      'Special-casing head changes instead of using a dummy node.',
      'Dereferencing curr.next.next when curr.next is null.',
    ],
    leetcodeTags: ['linked-list'],
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    group: 'Stacks & Linked Lists',
    summary: 'Two pointers moving at different speeds detect cycles and find midpoints.',
    signals: [
      'Detect a cycle in a list, or in an implicit sequence x → f(x)',
      'Find the middle of a linked list in one pass',
      'Find where a cycle starts; a duplicate in [1..n] with O(1) space',
      'O(1) space is required where a hash set would be the easy answer',
    ],
    idea:
      "If slow moves one step and fast moves two, fast gains one step per iteration: inside a cycle it must land on slow, and without a cycle it falls off the end. When fast reaches the end, slow is at the middle. Floyd's trick: after they meet, restart one pointer from the head and step both by one; they meet again at the cycle's entrance.",
    steps: [
      'Start slow and fast at the head (or at the start value).',
      'Advance slow by 1 and fast by 2 while fast and fast.next exist.',
      'If they meet there is a cycle; for its entrance, reset one pointer to head and step both by 1.',
      'If fast runs out there is no cycle, and slow is at the middle.',
    ],
    template: {
      title: "Floyd's cycle detection and the middle node",
      code: `// Floyd: returns the node where the cycle starts, or null if there is no cycle.
ListNode cycleStart(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {                   // met inside the cycle
            ListNode p = head;
            while (p != slow) { p = p.next; slow = slow.next; }
            return p;                         // cycle entrance
        }
    }
    return null;
}

// Middle node (the second middle when the length is even).
ListNode middle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    },
    complexity: 'O(n) time, O(1) space.',
    pitfalls: [
      'Checking fast.next.next without first checking fast.next.',
      'Comparing node values instead of node identity (==).',
      'Starting fast one step ahead changes which middle you get on even lengths.',
    ],
    leetcodeTags: [],
  },
];
