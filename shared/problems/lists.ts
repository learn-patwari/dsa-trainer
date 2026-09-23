import type { CuratedProblem } from '../types.ts';

export const stackProblems: CuratedProblem[] = [
  {
    slug: 'valid-parentheses', id: 20, title: 'Valid Parentheses', difficulty: 'Easy', pattern: 'stack',
    insight: {
      q: 'What makes a closing bracket valid?',
      options: [
        'It must match the most recent unmatched opening bracket, so keep openers on a stack',
        'The total number of opening and closing brackets must be equal at the end',
        'Each bracket type must have exactly as many openers as closers overall',
        'It must match the very first opening bracket that appears in the string',
      ],
      why: 'Brackets close in last-opened, first-closed order, which is exactly a stack. Counting is fooled by "([)]" and ")(".',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Odd length (can return false immediately)', 'Starts with a closing bracket', 'Only openers ("((")', 'Interleaved types "([)]"'],
    approach:
      'Push the expected closer for every opener. For a closer, the stack must be non-empty and its top must equal the closer; pop it. At the end the stack must be empty.',
  },
  {
    slug: 'min-stack', id: 155, title: 'Min Stack', difficulty: 'Medium', pattern: 'stack',
    insight: {
      q: 'How can getMin() stay O(1) even after pops?',
      options: [
        'Store with each value the minimum of the stack at that moment',
        'Keep one variable holding the minimum and update it whenever a value is pushed',
        'Keep all the elements in a sorted list alongside the stack',
        'Scan the stack for the smallest element whenever getMin() is called',
      ],
      why: 'Each level remembers the minimum of everything below it, so popping automatically restores the previous minimum. A single variable cannot recover the old minimum once the current one is popped.',
    },
    time: ['O(1) per operation', 'O(log n) per operation', 'O(n) for getMin', 'O(n) for pop'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Pushing a value equal to the current minimum', 'Popping the current minimum', 'Negative values and Integer.MIN_VALUE'],
    approach:
      "Keep a stack of pairs (value, minSoFar) where minSoFar = min(value, the previous top's minSoFar). push adds a pair, pop removes one, top returns value and getMin returns the top's minSoFar, all in O(1).",
  },
  {
    slug: 'evaluate-reverse-polish-notation', id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', pattern: 'stack',
    insight: {
      q: 'How do you evaluate the tokens?',
      options: [
        'Push numbers; for an operator pop b, then pop a, and push the result of a op b',
        'Evaluate strictly left to right, applying each operator to a running result',
        'Convert the tokens back to infix, then evaluate them with operator precedence',
        'On an operator pop two values and push (first popped) op (second popped)',
      ],
      why: 'In postfix, an operator applies to the two most recent results, so a stack holds the operands. The first pop is the RIGHT operand, which matters for − and /. Java\'s / truncates toward zero, as the problem requires.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Negative numbers such as "-3" (not an operator)', 'Division truncating toward zero (−7 / 2 = −3)', 'A single number'],
    approach:
      'For each token: if it is exactly "+", "-", "*" or "/", pop b, pop a and push a op b; otherwise push Integer.parseInt(token). The last value on the stack is the result.',
  },
  {
    slug: 'decode-string', id: 394, title: 'Decode String', difficulty: 'Medium', pattern: 'stack',
    insight: {
      q: 'How do you handle nested patterns like 3[a2[c]]?',
      options: [
        'On \'[\' push (current string, count) and reset; on \']\' pop and repeat the string',
        'Expand each bracket as soon as its digit appears, without saving outer state',
        'Multiply the counts of all enclosing brackets and repeat each letter that many times',
        'Count the digits and letters separately, then rebuild the string from the counts',
      ],
      why: "Each '[' opens a level whose result must be repeated and appended to the enclosing level's partial string. A stack of (partial string, count) contexts, or recursion, restores the outer level at ']'. Multiplying counts loses the order (\"accaccacc\" is not \"aaacccccc\").",
    },
    vars: 'n = length of the decoded output, d = nesting depth',
    time: ['O(n · d)', 'O(n²)', 'O(2ⁿ)', 'O(d)'],
    space: ['O(n)', 'O(1)', 'O(d)', 'O(n²)'],
    edgeCases: ['Multi-digit counts such as "10[a]"', 'Nesting such as "3[a2[c]]"', 'Letters outside brackets ("2[a]bc")', 'Adjacent groups "2[a]3[b]"'],
    approach:
      "Scan characters. Digits build k = k * 10 + digit. On '[' push (current, k) and reset both. Letters are appended to current. On ']' pop (prev, count) and set current = prev + current repeated count times. The final current is the answer.",
  },
  {
    slug: 'asteroid-collision', id: 735, title: 'Asteroid Collision', difficulty: 'Medium', pattern: 'stack',
    insight: {
      q: 'When do two asteroids collide?',
      options: [
        'A left-mover hits right-movers on top of the stack until one survives',
        'Any two neighbors with opposite signs collide, whichever of them comes first',
        'Only neighbors moving in the same direction, when the one behind is faster',
        'All asteroids eventually collide, so only the largest one survives',
      ],
      why: 'A left-mover followed by a right-mover move apart and never meet. A new left-mover can destroy several right-movers on the stack in turn, so the stack holds the survivors so far; each asteroid is pushed and popped at most once.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Equal sizes (both explode)', 'A left-mover destroying several right-movers', 'Leading left-movers survive ([-2, -1, 1, 2])', 'No collisions at all'],
    approach:
      'For each asteroid a: while a < 0 and the top is positive, compare sizes: if top < −a pop and continue; if top == −a pop and a explodes too; otherwise a explodes. If a survives, push it. The stack is the answer.',
  },
];

export const monotonicStackProblems: CuratedProblem[] = [
  {
    slug: 'next-greater-element-i', id: 496, title: 'Next Greater Element I', difficulty: 'Easy', pattern: 'monotonic-stack',
    insight: {
      q: 'How do you get every next-greater answer for nums2 in one pass?',
      options: [
        'A decreasing stack over nums2: a bigger value pops and answers smaller ones',
        'For each queried value, scan to its right in nums2 until a bigger one appears',
        'Sort nums2 and use each value\'s successor in sorted order as its answer',
        'Keep a max-heap of the values to the right of each position in nums2',
      ],
      why: 'The stack holds values still waiting for a bigger element to their right. Each value is pushed and popped once, so all answers cost O(n). A map value → answer then serves each query from nums1 in O(1).',
    },
    vars: 'm = length of nums1, n = length of nums2',
    time: ['O(m + n)', 'O(m · n)', 'O(n log n)', 'O(n²)'],
    space: ['O(n)', 'O(1)', 'O(m · n)', 'O(n²)'],
    edgeCases: ['No greater element (answer −1)', 'Decreasing nums2', 'The queried value is the last element of nums2'],
    approach:
      'Scan nums2: while the stack top is smaller than x, pop it and set next[top] = x; then push x. Values left on the stack map to −1. Answer each nums1 value with next.getOrDefault(v, −1).',
  },
  {
    slug: 'daily-temperatures', id: 739, title: 'Daily Temperatures', difficulty: 'Medium', pattern: 'monotonic-stack',
    insight: {
      q: 'How do you find, for each day, how long until a warmer day?',
      options: [
        'A stack of indices with falling temperatures; a warmer day pops them',
        'For each day, scan forward until a warmer day appears, then record the gap',
        'Sort the days by temperature and compare each day with its sorted neighbor',
        'Track the hottest temperature seen so far and compare every day against it',
      ],
      why: 'Indices still waiting for a warmer day sit on the stack in decreasing temperature order, and the current day answers every colder index on top at once. Each index is pushed and popped once: O(n).',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Strictly decreasing temperatures (all zeros)', 'Equal temperatures are not warmer', 'The last day (always 0)'],
    approach:
      'For each i: while the stack is non-empty and temps[i] > temps[top], pop j and set answer[j] = i − j. Push i. Indices left on the stack keep 0.',
  },
  {
    slug: 'online-stock-span', id: 901, title: 'Online Stock Span', difficulty: 'Medium', pattern: 'monotonic-stack',
    insight: {
      q: 'How do you make next(price) fast when spans can be long?',
      options: [
        'A stack of (price, span); pop entries ≤ today and add their spans',
        'Store every price and scan backwards on each call until a higher price appears',
        'Keep only yesterday\'s span and add 1 whenever today\'s price is higher',
        'Keep the prices in a sorted set and count how many are ≤ today',
      ],
      why: "A popped day is dominated by today's price, so its whole span folds into today's span. Each price is pushed and popped at most once: O(1) amortized per call. A sorted set counts non-consecutive days.",
    },
    time: ['O(1) amortized per call', 'O(n) per call', 'O(log n) per call', 'O(n²) per call'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Strictly increasing prices (spans keep growing)', 'Equal prices count as ≤', 'The very first call (span 1)'],
    approach: 'span = 1. While the top price ≤ price, pop it and add its span. Push (price, span) and return span.',
  },
  {
    slug: 'car-fleet', id: 853, title: 'Car Fleet', difficulty: 'Medium', pattern: 'monotonic-stack',
    alsoAccept: ['greedy'],
    insight: {
      q: 'How do you count the fleets that arrive?',
      options: [
        'Sort by position, nearest first; a later arrival time starts a new fleet',
        'Sort the cars by speed and count how many distinct speeds there are',
        'Simulate every car second by second until all of them reach the target',
        'Count the cars that are faster than the car directly behind them',
      ],
      why: 'A car can never pass the one ahead, so it joins that fleet if it would arrive no later. Scanning from the car nearest the target, a car starts a new fleet only when its time is strictly greater than the slowest time ahead of it.',
    },
    time: ['O(n log n)', 'O(n)', 'O(n²)', 'O(n · target)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(target)'],
    edgeCases: ['A single car', 'Cars meeting exactly at the target (one fleet)', 'Cars that never catch up'],
    approach:
      'Pair each car with time = (target − position) / (double) speed and sort by position descending. Track the current fleet time; if a car\'s time is greater, it is a new fleet (count it and update the fleet time); otherwise it merges.',
  },
  {
    slug: 'remove-k-digits', id: 402, title: 'Remove K Digits', difficulty: 'Medium', pattern: 'monotonic-stack',
    alsoAccept: ['greedy'],
    insight: {
      q: 'Which digits should go to make the number as small as possible?',
      options: [
        'While k > 0 and the last kept digit > current, drop the last kept digit',
        'Remove the k largest digits, since large digits make the number bigger',
        'Remove the first k digits, since leading digits are the most significant',
        'Remove the last k digits, since that keeps the most significant ones intact',
      ],
      why: 'A larger digit followed by a smaller one should go, because removing it moves the smaller digit into a more significant position. An increasing stack applies this greedily ("1432219", k = 3 gives "1219"; dropping the largest digits gives "1221"). Leftover k removes from the end.',
    },
    time: ['O(n)', 'O(n · k)', 'O(n log n)', 'O(n²)'],
    space: ['O(n)', 'O(1)', 'O(k)', 'O(n²)'],
    edgeCases: ['k equals the length (answer "0")', 'Leading zeros ("10200", k = 1 → "200")', 'Digits already increasing (remove from the end)'],
    approach:
      'Use a StringBuilder as a stack. For each digit d: while k > 0 and the last digit > d, delete it and k--. Append d. Remove k more digits from the end, strip leading zeros, and return "0" if nothing is left.',
  },
  {
    slug: 'largest-rectangle-in-histogram', id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', pattern: 'monotonic-stack',
    insight: {
      q: 'What limits the widest rectangle that uses bar i as its height?',
      options: [
        'The nearest shorter bar on each side (found via an increasing stack)',
        'The tallest bars on either side, since they bound how far the rectangle reaches',
        'Nothing: a rectangle of that height can always span the whole histogram',
        'Only the two bars immediately next to i, which decide whether it can grow',
      ],
      why: 'A rectangle of height heights[i] extends until a shorter bar blocks it. When a bar is popped from an increasing stack, the current index is its first shorter bar on the right and the new top is the first shorter bar on the left, so its best width is known in O(1).',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'],
    space: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    edgeCases: ['All bars equal', 'Strictly increasing heights (flush the stack at the end)', 'A zero-height bar', 'A single bar'],
    approach:
      'Iterate i from 0 to n, using height 0 at i = n as a sentinel. While the stack is non-empty and h < heights[top]: pop top; width = empty ? i : i − peek − 1; best = max(best, heights[top] × width). Push i.',
  },
];

export const linkedListProblems: CuratedProblem[] = [
  {
    slug: 'reverse-linked-list', id: 206, title: 'Reverse Linked List', difficulty: 'Easy', pattern: 'linked-list',
    insight: {
      q: 'What must happen at each step of an iterative, in-place reversal?',
      options: [
        'Save next, point curr.next to prev, then advance prev and curr',
        'Swap the values of the first and last nodes, then move both ends inward',
        'Point curr.next to prev first, then read curr.next to move forward',
        'Copy the values into an array and write them back in reverse order',
      ],
      why: 'Saving next first keeps the rest of the list reachable; overwriting it first loses everything after curr. After the loop, prev is the new head. The recursive version uses O(n) stack space.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Empty list', 'A single node', 'Two nodes'],
    approach: 'prev = null, curr = head. While curr != null: next = curr.next; curr.next = prev; prev = curr; curr = next. Return prev.',
  },
  {
    slug: 'merge-two-sorted-lists', id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', pattern: 'linked-list',
    insight: {
      q: 'What removes the special case of picking the merged head?',
      options: [
        'Start from a dummy node and always attach the smaller of the two heads to tail',
        'Always use list1\'s head as the merged head and insert list2\'s nodes into it',
        'Copy both lists into an array, sort it, and rebuild a new list from it',
        'Merge recursively, which is just as safe as a loop for very long lists',
      ],
      why: 'With a dummy node every node, including the first, is attached the same way. When one list runs out, the rest of the other is attached in O(1).',
    },
    vars: 'm, n = lengths of the two lists',
    time: ['O(m + n)', 'O(m · n)', 'O((m + n) log(m + n))', 'O(min(m, n))'],
    space: ['O(1)', 'O(m + n)', 'O(log(m + n))', 'O(m · n)'],
    edgeCases: ['One or both lists empty', 'Equal values in both lists', 'One list entirely smaller than the other'],
    approach:
      'dummy = new ListNode(0), tail = dummy. While both lists are non-null, attach the smaller head to tail.next and advance that list and tail. Attach whatever remains and return dummy.next.',
  },
  {
    slug: 'remove-nth-node-from-end-of-list', id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', pattern: 'linked-list',
    alsoAccept: ['two-pointers', 'fast-slow'],
    insight: {
      q: 'How do you find the nth node from the end in one pass?',
      options: [
        'Put fast n steps ahead of slow (from a dummy), then move both together',
        'Reverse the list, remove the nth node from the front, then reverse it back',
        'Remove the node at index n counted from the front of the list',
        'Advance a single pointer n steps from the head and delete that node',
      ],
      why: 'Keeping a gap of n nodes means that when fast reaches the last node, slow sits just before the node to delete. Starting at a dummy handles deleting the head.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Removing the head (n equals the length)', 'A single-node list', 'Removing the last node (n = 1)'],
    approach:
      'dummy.next = head; fast = slow = dummy. Advance fast n times, then move both until fast.next == null. Unlink with slow.next = slow.next.next and return dummy.next.',
  },
  {
    slug: 'reorder-list', id: 143, title: 'Reorder List', difficulty: 'Medium', pattern: 'linked-list',
    alsoAccept: ['fast-slow'],
    insight: {
      q: 'How do you reorder L0 → Ln → L1 → Ln−1 → … in place?',
      options: [
        'Find the middle, reverse the second half, then interleave the halves',
        'Repeatedly walk to the tail and move it right after the current node',
        'Sort the nodes by value so that small and large values alternate',
        'Reverse the whole list, then interleave it with the original list',
      ],
      why: 'Reversing the second half turns Ln, Ln−1, … into a forward list, so a simple alternating merge produces the answer in O(n) time and O(1) space. Walking to the tail each time is O(n²), and reversing the whole list destroys the original.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Lengths 1 and 2 (unchanged)', 'Odd vs even length', 'Forgetting to cut the first half (creates a cycle)'],
    approach:
      'Find the middle with slow/fast; set second = slow.next and cut with slow.next = null. Reverse second. Then alternate: take a node from the first half, then one from the reversed half, until the second half runs out.',
  },
  {
    slug: 'copy-list-with-random-pointer', id: 138, title: 'Copy List with Random Pointer', difficulty: 'Medium', pattern: 'linked-list',
    alsoAccept: ['hashing'],
    insight: {
      q: "How do you wire each copy's random pointer correctly?",
      options: [
        'Map each original to its copy first; then wire next and random via the map',
        'Copy the next links first, then point each copy\'s random at the original\'s random',
        'Copy the values into an array and rebuild the random links by matching values',
        'Deep-copy recursively along next; the random pointers come along for free',
      ],
      why: 'random can point anywhere, even forward, so every copy must exist before random links are wired; a map original → copy makes that easy. Pointing at the original nodes leaks the old list into the copy, and values can repeat.',
    },
    vars: 'n = number of nodes; complexities are for the hash-map approach',
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
    edgeCases: ['Empty list', 'random pointing to the node itself', 'random = null', 'random pointing forward'],
    approach:
      'Pass 1: map.put(node, new Node(node.val)) for each node. Pass 2: copy.next = map.get(node.next) and copy.random = map.get(node.random) (a null key maps to null). Return map.get(head). For O(1) extra space, interleave copies A → A\' → B → B\' and unweave afterwards.',
  },
  {
    slug: 'lru-cache', id: 146, title: 'LRU Cache', difficulty: 'Medium', pattern: 'linked-list',
    alsoAccept: ['hashing'],
    insight: {
      q: 'Which structure gives O(1) get and put with LRU eviction?',
      options: [
        'A hash map to nodes in a doubly linked list kept in recency order',
        'A hash map plus a queue of keys, removing a key from the queue on each access',
        'A min-heap of entries keyed by their last access time',
        'An array of entries scanned for the least recently used one on eviction',
      ],
      why: "The map finds a node in O(1); the doubly linked list unlinks it from the middle and re-inserts it at the front in O(1) because each node knows both neighbors. The tail is always the least recently used entry. LinkedHashMap with accessOrder = true does exactly this.",
    },
    vars: 'c = capacity',
    time: ['O(1) per operation', 'O(log c) per operation', 'O(c) per operation', 'O(1) get, O(c) put'],
    space: ['O(c)', 'O(1)', 'O(c²)', 'O(log c)'],
    edgeCases: ['Capacity 1', 'put() on an existing key (update value and recency)', 'get() on a missing key (return −1)', 'Eviction right after a get() reordered entries'],
    approach:
      'HashMap<key, Node> plus a doubly linked list with dummy head and tail. get: if present, move the node to the front and return its value. put: if present, update and move to front; otherwise insert at the front and, if over capacity, remove tail.prev from the list and the map.',
  },
  {
    slug: 'reverse-nodes-in-k-group', id: 25, title: 'Reverse Nodes in k-Group', difficulty: 'Hard', pattern: 'linked-list',
    insight: {
      q: 'How do you reverse each group of k nodes in place?',
      options: [
        'Check that k nodes remain, reverse them, reconnect, and move on',
        'Reverse the whole list first, then reverse each group of k back again',
        'Swap the node values group by group using a temporary array',
        'Reverse every group, including a final group that is shorter than k',
      ],
      why: "Each group is an ordinary reversal of k nodes; the work is in reconnecting. The node before the group must point to the group's new head, and the group's old head becomes its tail, which is the next group's predecessor. A final group shorter than k stays as is, and values must not be changed.",
    },
    time: ['O(n)', 'O(n · k)', 'O(n²)', 'O(n log k)'],
    space: ['O(1)', 'O(k)', 'O(n)', 'O(n / k)'],
    edgeCases: ['k = 1 (unchanged)', 'Length a multiple of k', 'A leftover group shorter than k', 'k equals the length'],
    approach:
      'dummy → head, groupPrev = dummy. Loop: find the kth node after groupPrev; stop if it does not exist. Reverse the k nodes, starting prev at kth.next. Then tmp = groupPrev.next (the new group tail), groupPrev.next = kth, groupPrev = tmp.',
  },
];

export const fastSlowProblems: CuratedProblem[] = [
  {
    slug: 'linked-list-cycle', id: 141, title: 'Linked List Cycle', difficulty: 'Easy', pattern: 'fast-slow',
    insight: {
      q: 'How do you detect a cycle with O(1) extra memory?',
      options: [
        'slow moves 1, fast moves 2; they meet exactly when there is a cycle',
        'Store every visited node in a HashSet and stop when one repeats',
        'Count nodes until the count exceeds the length of the list',
        'Check whether the tail\'s next pointer leads back to the head',
      ],
      why: 'Inside a cycle fast gains one step per iteration, so it must land on slow; without a cycle it reaches null. A HashSet works but uses O(n) memory, and the cycle need not include the head.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['Empty list', 'A single node pointing to itself', "A cycle that doesn't include the head"],
    approach:
      'slow = fast = head. While fast != null && fast.next != null: slow = slow.next; fast = fast.next.next; if slow == fast return true. Return false.',
  },
  {
    slug: 'middle-of-the-linked-list', id: 876, title: 'Middle of the Linked List', difficulty: 'Easy', pattern: 'fast-slow',
    insight: {
      q: 'How do you find the middle in a single pass?',
      options: [
        'fast moves 2, slow moves 1; when fast runs out, slow is the middle',
        'Count the nodes in one pass, then walk halfway in a second pass',
        'Reverse the list and return the head of the reversed list',
        'Advance fast three steps for every single step of slow',
      ],
      why: 'fast covers twice the distance of slow, so when fast reaches the end, slow has covered half. With the condition fast != null && fast.next != null, slow ends on the second middle for even lengths, as required. Counting first takes two passes.',
    },
    time: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['A single node', 'Even length (return the second middle)', 'Two nodes'],
    approach: 'slow = fast = head. While fast != null && fast.next != null: slow = slow.next; fast = fast.next.next. Return slow.',
  },
  {
    slug: 'happy-number', id: 202, title: 'Happy Number', difficulty: 'Easy', pattern: 'fast-slow',
    alsoAccept: ['hashing'],
    insight: {
      q: "How do you know when to stop if the number isn't happy?",
      options: [
        'The sequence reaches 1 or loops; detect the loop with slow/fast pointers',
        'Stop after 100 iterations, since every unhappy number repeats before then',
        'Stop once the value grows beyond the original number, which means it diverges',
        'Stop when the value has a single digit, since single digits are never happy',
      ],
      why: 'Values quickly fall below a few hundred, so the sequence must eventually repeat. Treating next(x) like a linked list, Floyd detects the loop with O(1) memory; a HashSet of seen values is the simpler alternative. 7 is single-digit and still happy.',
    },
    vars: 'n = the input number; complexities are for the slow/fast pointer approach',
    time: ['O(log n)', 'O(n)', 'O(n log n)', 'O(√n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(√n)'],
    edgeCases: ['n = 1 (already happy)', 'Single digits such as 7 (happy) and 2 (not)', 'Large inputs near 2³¹ − 1'],
    approach:
      "next(x) = sum of the squares of x's digits. slow = n, fast = next(n). While fast != 1 and slow != fast: slow = next(slow); fast = next(next(fast)). Return fast == 1.",
  },
  {
    slug: 'linked-list-cycle-ii', id: 142, title: 'Linked List Cycle II', difficulty: 'Medium', pattern: 'fast-slow',
    insight: {
      q: 'After slow and fast meet, how do you find where the cycle begins?',
      options: [
        'Reset one pointer to head; step both by 1; they meet at the entrance',
        'The point where slow and fast first meet is always the cycle entrance',
        'Measure the cycle length L; the entrance is always exactly L nodes from the head',
        'Move fast back to head and keep moving it two steps at a time',
      ],
      why: 'If the part before the cycle has length a and they meet b steps into a cycle of length c, then 2(a + b) = a + b + kc, so a = kc − b. Walking a steps from the head and from the meeting point lands both on the entrance.',
    },
    time: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['No cycle (return null)', 'The cycle starts at the head', 'A single node pointing to itself'],
    approach:
      'Run Floyd: slow one step, fast two. If fast hits null, return null. When they meet, set p = head and advance p and slow one step at a time until p == slow; that node is the entrance.',
  },
  {
    slug: 'find-the-duplicate-number', id: 287, title: 'Find the Duplicate Number', difficulty: 'Medium', pattern: 'fast-slow',
    alsoAccept: ['binary-search'],
    insight: {
      q: 'How do you find the duplicate without modifying the array, using O(1) extra space?',
      options: [
        'Treat i → nums[i] as a linked list; the duplicate is its cycle entrance',
        'Sort the array and return the first value that equals its neighbor',
        'Keep a HashSet of the values seen so far and return the first repeat',
        'Subtract n·(n − 1)/2 from the array sum to get the duplicated value',
      ],
      why: 'Values lie in [1, n] across n + 1 slots, so following i → nums[i] from index 0 must loop, and the duplicated value is where two arrows converge: the cycle entrance. Sorting modifies the array, a set uses O(n) space, and the sum trick fails when the duplicate appears more than twice.',
    },
    time: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    space: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    edgeCases: ['The duplicate appears many times ([2, 2, 2, 2, 2])', 'The smallest input ([1, 1])', 'The duplicate equals n'],
    approach:
      'slow = fast = 0. Repeat slow = nums[slow], fast = nums[nums[fast]] until they are equal. Then p = 0; advance p = nums[p] and slow = nums[slow] until they meet; that value is the duplicate. (Binary search on the value range with counting is an O(n log n) alternative.)',
  },
];
