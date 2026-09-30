import type { Cell, Frame, ListLayer, Marker, PatternAnimation, Tone, VarsLayer } from './types.ts';

function list(values: readonly number[], next: (number | null)[], markers: Marker[], tone: (i: number) => Tone | undefined = () => undefined, label?: string): ListLayer {
  const nodes: Cell[] = values.map((v, i) => ({ v, tone: tone(i), id: `n${i}` }));
  return { kind: 'list', label, nodes, next: [...next], markers };
}

function vars(items: Record<string, string>): VarsLayer {
  return { kind: 'vars', items: Object.entries(items).map(([k, v]) => ({ k, v })) };
}

// ---------------------------------------------------------------- reverse a list

export function linkedList(): PatternAnimation {
  const values = [1, 2, 3, 4];
  const next: (number | null)[] = [1, 2, 3, null];
  const frames: Frame[] = [];
  let prev: number | null = null;
  let curr: number | null = 0;
  const name = (i: number | null) => (i == null ? 'null' : String(values[i]));
  const marks = (): Marker[] => [
    ...(prev != null ? [{ at: prev, label: 'prev', tone: 'done' as Tone }] : []),
    ...(curr != null ? [{ at: curr, label: 'curr', tone: 'active' as Tone }] : []),
  ];

  frames.push({
    caption: 'Three pointers: prev, curr, and next. Flip one arrow per step — but save curr.next first, or the rest of the list is lost.',
    layers: [list(values, next, marks(), (i) => (i === curr ? 'active' : undefined)), vars({ prev: name(prev), curr: name(curr) })],
  });

  while (curr != null) {
    const saved: number | null = next[curr]!;
    next[curr] = prev;
    const flipped: number = curr;
    frames.push({
      caption: `Save next = ${name(saved)}. Point ${values[flipped]} back at ${name(prev)}. Then step: prev = ${values[flipped]}, curr = ${name(saved)}.`,
      layers: [
        list(values, next, [{ at: flipped, label: 'curr', tone: 'active' }, ...(saved != null ? [{ at: saved, label: 'next', tone: 'window' as Tone }] : [])], (i) =>
          i === flipped ? 'active' : prev != null && i <= (prev as number) ? 'done' : undefined,
        ),
        vars({ prev: name(prev), curr: name(flipped), next: name(saved) }),
      ],
    });
    prev = flipped;
    curr = saved;
  }

  frames.push({
    caption: `curr ran off the end, so prev is the new head: ${values[prev!]}. Every arrow flipped once — O(n) time, O(1) space.`,
    layers: [list(values, next, [{ at: prev!, label: 'head', tone: 'match' }], () => 'done'), vars({ head: name(prev) })],
  });

  const order: number[] = [];
  for (let at: number | null = prev; at != null; at = next[at]!) order.push(values[at]!);

  return {
    pattern: 'linked-list',
    title: 'Flip the arrows one at a time',
    setup: 'head = 1 → 2 → 3 → 4 — reverse the list in place',
    frames,
    result: order.join('→'),
    takeaway: 'Save the next node before you overwrite the pointer. That one line is the difference between reversing a list and losing it.',
  };
}

// ---------------------------------------------------------------- tortoise and hare

export function fastSlow(): PatternAnimation {
  const values = [1, 2, 3, 4, 5, 6];
  const next: (number | null)[] = [1, 2, 3, 4, 5, 2]; // 6 points back at 3: a cycle
  const frames: Frame[] = [];
  let slow = 0;
  let fast = 0;
  const marks = (a: string, b: string, tone: Tone = 'active'): Marker[] =>
    slow === fast ? [{ at: slow, label: `${a}+${b}`, tone: 'match' }] : [{ at: slow, label: a, tone: 'window' }, { at: fast, label: b, tone }];

  frames.push({
    caption: 'slow moves one node, fast moves two. If there is a cycle, fast laps slow and they must meet inside it.',
    layers: [list(values, next, marks('slow', 'fast')), vars({ slow: '1', fast: '1' })],
  });

  let steps = 0;
  do {
    slow = next[slow]!;
    fast = next[next[fast]!]!;
    steps++;
    frames.push({
      caption:
        slow === fast
          ? `They meet at ${values[slow]} after ${steps} steps. A cycle exists — fast could only catch slow by going round.`
          : `Step ${steps}: slow at ${values[slow]}, fast at ${values[fast]}. Inside a cycle the gap shrinks by one each step.`,
      layers: [list(values, next, marks('slow', 'fast'), (i) => (i === slow || i === fast ? (slow === fast ? 'match' : 'active') : undefined)), vars({ slow: String(values[slow]), fast: String(values[fast]) })],
    });
  } while (slow !== fast);

  // Phase two: one pointer back to the head; at equal speed they meet at the entrance.
  let a = 0;
  let b = slow;
  frames.push({
    caption: 'To find where the cycle starts: send one pointer back to the head. Move both one step at a time.',
    layers: [list(values, next, [{ at: a, label: 'a', tone: 'window' }, { at: b, label: 'b', tone: 'active' }]), vars({ a: String(values[a]), b: String(values[b]) })],
  });
  while (a !== b) {
    a = next[a]!;
    b = next[b]!;
    frames.push({
      caption: a === b ? `They meet at ${values[a]}: that is where the cycle begins.` : `a at ${values[a]}, b at ${values[b]}.`,
      layers: [
        list(values, next, a === b ? [{ at: a, label: 'a+b', tone: 'match' }] : [{ at: a, label: 'a', tone: 'window' }, { at: b, label: 'b', tone: 'active' }], (i) => (a === b && i === a ? 'match' : undefined)),
        vars({ a: String(values[a]), b: String(values[b]) }),
      ],
    });
  }

  return {
    pattern: 'fast-slow',
    title: 'The hare laps the tortoise',
    setup: '1 → 2 → 3 → 4 → 5 → 6 → back to 3 — is there a cycle, and where does it start?',
    frames,
    result: `cycle at ${values[a]}`,
    takeaway: 'Two speeds find a cycle with O(1) memory, where a visited set would need O(n). Reset one pointer to find the entrance.',
  };
}
