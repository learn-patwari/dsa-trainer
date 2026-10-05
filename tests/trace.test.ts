import { describe, expect, it } from 'vitest';
import type { ArrayLayer, MapLayer, StackLayer, VarsLayer } from '../shared/animations/index.ts';
import { copyStep, newTrace, parseInput, stepFrame, traceToAnimation, validateTrace, windowOf, type Trace } from '../shared/trace.ts';

/** The frame from the explainer video: "abcdbcbb", L on c, R on d, the set holding [c, d]. */
function slidingWindow(): Trace {
  const t = newTrace('"abcdbcbb"', ['L', 'R'], ['set']);
  const s = t.steps[0]!;
  s.pointers = { L: 2, R: 3 };
  s.data.ds0 = [
    { id: 'i1', v: 'c' },
    { id: 'i2', v: 'd' },
  ];
  s.note = 'd is new, so add it and grow the window';
  return t;
}

/** What the browser sends: the trace after a JSON round trip. */
const wire = (t: unknown) => JSON.parse(JSON.stringify(t)) as Record<string, unknown>;

describe('parseInput', () => {
  it('reads a LeetCode string as characters and brackets or commas as an array', () => {
    expect(parseInput('"abcabcbb"')).toEqual({ kind: 'string', values: [...'abcabcbb'] });
    expect(parseInput('abc')).toEqual({ kind: 'string', values: ['a', 'b', 'c'] });
    expect(parseInput('[2,7,11,15]')).toEqual({ kind: 'array', values: ['2', '7', '11', '15'] });
    expect(parseInput(' 2, 7 , 11 ')).toEqual({ kind: 'array', values: ['2', '7', '11'] });
    expect(parseInput('["a","b"]')).toEqual({ kind: 'array', values: ['a', 'b'] });
    expect(parseInput('[]')).toEqual({ kind: 'array', values: [] });
  });

  it('keeps a comma inside a quoted string as a character', () => {
    expect(parseInput('"a,b"')).toEqual({ kind: 'string', values: ['a', ',', 'b'] });
  });

  it('stops at 60 cells, which is as many as fit on screen', () => {
    expect(parseInput('x'.repeat(100)).values).toHaveLength(60);
    expect(parseInput(`[${Array.from({ length: 100 }, (_, i) => i).join(',')}]`).values).toHaveLength(60);
  });
});

describe('a new trace', () => {
  it('starts the first pointer at 0, the rest off the array, and the window on', () => {
    const t = newTrace('[1,2,3]', ['i', 'j', 'k'], ['map', 'stack']);
    expect(t.steps).toHaveLength(1);
    expect(t.steps[0]).toEqual({ note: '', pointers: { i: 0, j: null, k: null }, window: true, highlight: [], data: { ds0: [], ds1: [] } });
    expect(t.structures).toEqual([
      { id: 'ds0', kind: 'map', label: 'HashMap' },
      { id: 'ds1', kind: 'stack', label: 'Stack' },
    ]);
  });

  it('has no window with fewer than two pointers', () => {
    expect(newTrace('abc', ['i'], []).steps[0]!.window).toBe(false);
  });

  it('carries the state into the next iteration without sharing it', () => {
    const t = slidingWindow();
    const s = t.steps[0]!;
    s.highlight = [3];
    const next = copyStep(s);
    expect(next).toMatchObject({ note: '', highlight: [], window: true, pointers: { L: 2, R: 3 } });
    next.pointers.R = 4;
    next.data.ds0!.push({ id: 'i3', v: 'b' });
    next.data.ds0![0]!.v = 'changed';
    expect(s.pointers.R).toBe(3);
    expect(s.data.ds0!.map((i) => i.v)).toEqual(['c', 'd']);
  });
});

describe('drawing a step', () => {
  it('draws the video frame: the window between L and R, arrows under both, and the set', () => {
    const t = slidingWindow();
    const frame = stepFrame(t, t.steps[0]!, 0);
    const [arr, set] = frame.layers as [ArrayLayer, StackLayer];
    expect(frame.caption).toBe('d is new, so add it and grow the window');
    expect(arr.label).toBe('s');
    expect(arr.cells.map((c) => c.v).join('')).toBe('abcdbcbb');
    expect(arr.cells.map((c) => c.tone ?? '-')).toEqual(['-', '-', 'window', 'window', '-', '-', '-', '-']);
    expect(arr.markers).toEqual([
      { at: 2, label: 'L', tone: 'active' },
      { at: 3, label: 'R', tone: 'active' },
    ]);
    expect(arr.spans).toEqual([{ from: 2, to: 3, tone: 'window', label: '2' }]);
    expect(set).toMatchObject({ kind: 'queue', label: 'HashSet', items: [{ v: 'c' }, { v: 'd' }] });
  });

  it('names an array input nums and shades nothing once the window is switched off', () => {
    const t = newTrace('[2,7,11,15]', ['L', 'R'], []);
    const s = t.steps[0]!;
    s.pointers = { L: 0, R: 2 };
    expect(windowOf(t, s)).toEqual([0, 2]);
    s.window = false;
    const arr = stepFrame(t, s, 4).layers[0] as ArrayLayer;
    expect(arr.label).toBe('nums');
    expect(arr.spans).toEqual([]);
    expect(stepFrame(t, s, 4).caption).toBe('Step 5');
  });

  it('keeps the window the right way round when the pointers cross', () => {
    const t = newTrace('abcdef', ['L', 'R'], []);
    const s = t.steps[0]!;
    s.pointers = { L: 4, R: 1 };
    expect(windowOf(t, s)).toEqual([1, 4]);
    s.pointers.R = null;
    expect(windowOf(t, s)).toBeNull();
  });

  it('lets a highlight stand out inside the window', () => {
    const t = slidingWindow();
    t.steps[0]!.highlight = [3, 6];
    const arr = stepFrame(t, t.steps[0]!, 0).layers[0] as ArrayLayer;
    expect(arr.cells.map((c) => c.tone ?? '-')).toEqual(['-', '-', 'window', 'active', '-', '-', 'active', '-']);
  });

  it('leaves out a pointer that is off the array, and stacks two on one cell', () => {
    const t = newTrace('abc', ['i', 'j', 'k'], []);
    t.steps[0]!.pointers = { i: 1, j: 1, k: null };
    const arr = stepFrame(t, t.steps[0]!, 0).layers[0] as ArrayLayer;
    expect(arr.markers!.map((m) => `${m.label}@${m.at}`)).toEqual(['i@1', 'j@1']);
  });

  it('shows a stack top first, a queue front first, a map as entries, a list with indices and variables as name = value', () => {
    const t = newTrace('abc', [], ['stack', 'queue', 'map', 'list', 'vars']);
    const s = t.steps[0]!;
    const items = (...vs: string[]) => vs.map((v, n) => ({ id: `x${n}${v}`, v }));
    s.data.ds0 = items('(', '[');
    s.data.ds1 = items('1', '2');
    s.data.ds2 = [{ id: 'm1', k: 'a', v: '0' }];
    s.data.ds3 = items('7', '8');
    s.data.ds4 = [{ id: 'v1', k: 'best', v: '3' }];
    const [, stack, queue, map, list, vars] = stepFrame(t, s, 0).layers as [ArrayLayer, StackLayer, StackLayer, MapLayer, ArrayLayer, VarsLayer];
    expect(stack).toMatchObject({ kind: 'stack', label: 'Stack (top first)' });
    expect(stack.items.map((i) => i.v)).toEqual(['[', '(']);
    expect(queue).toMatchObject({ kind: 'queue', label: 'Queue (front first)' });
    expect(queue.items.map((i) => i.v)).toEqual(['1', '2']);
    expect(map.entries).toEqual([{ k: 'a', v: '0' }]);
    expect(list).toMatchObject({ kind: 'array', label: 'List', indices: true });
    expect(list.cells.map((c) => c.v)).toEqual(['7', '8']);
    expect(vars.items).toEqual([{ k: 'best', v: '3' }]);
  });

  it('plays every step as one frame of an animation', () => {
    const t = slidingWindow();
    t.steps.push(copyStep(t.steps[0]!));
    const anim = traceToAnimation(t, 'Dry run · Longest Substring');
    expect(anim.title).toBe('Dry run · Longest Substring');
    expect(anim.setup).toBe('input: "abcdbcbb"');
    expect(anim.frames).toHaveLength(2);
    expect(anim.frames[1]!.caption).toBe('Step 2');
  });
});

describe('validateTrace', () => {
  it('accepts what the editor produces', () => {
    const t = slidingWindow();
    t.steps.push(copyStep(t.steps[0]!));
    expect(validateTrace(wire(t))).toEqual(t);
    expect(validateTrace(wire(newTrace('abc', [], [])))).toBeTruthy();
  });

  const broken: [string, (t: Record<string, any>) => unknown, RegExp][] = [
    ['not an object', () => 'trace', /not an object/],
    ['an array', () => [], /not an object/],
    ['another version', (t) => ({ ...t, version: 2 }), /version/],
    ['an input that is not text', (t) => ({ ...t, input: 42 }), /input/],
    ['two pointers with one name', (t) => ({ ...t, pointers: ['L', 'L'] }), /share a name/],
    ['a long pointer name', (t) => ({ ...t, pointers: ['L', 'a'.repeat(13)] }), /pointers/],
    ['a blank pointer name', (t) => ({ ...t, pointers: ['L', ' '] }), /pointers/],
    ['seven pointers', (t) => ({ ...t, pointers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }), /pointers/],
    ['seven structures', (t) => ({ ...t, structures: Array.from({ length: 7 }, (_, i) => ({ id: `d${i}`, kind: 'set', label: 'S' })) }), /at most 6/],
    ['an unknown structure kind', (t) => ({ ...t, structures: [{ id: 'ds0', kind: 'tree', label: 'T' }] }), /malformed/],
    ['a null structure', (t) => ({ ...t, structures: [null] }), /malformed/],
    ['two structures with one id', (t) => ({ ...t, structures: [t.structures[0], t.structures[0]] }), /share an id/],
    ['no steps', (t) => ({ ...t, steps: [] }), /1–200 steps/],
    ['201 steps', (t) => ({ ...t, steps: Array.from({ length: 201 }, () => t.steps[0]) }), /1–200 steps/],
    ['a null step', (t) => ({ ...t, steps: [null] }), /step is malformed/],
    ['a pointer off the input', (t) => ({ ...t, steps: [{ ...t.steps[0], pointers: { L: 2, R: 8 } }] }), /pointer R is off the input/],
    ['a fractional pointer', (t) => ({ ...t, steps: [{ ...t.steps[0], pointers: { L: 1.5, R: 3 } }] }), /pointer L/],
    ['a pointer the trace does not have', (t) => ({ ...t, steps: [{ ...t.steps[0], pointers: { L: 0, X: 1 } }] }), /does not have/],
    ['a highlight off the input', (t) => ({ ...t, steps: [{ ...t.steps[0], highlight: [99] }] }), /highlighted/],
    ['data for a missing structure', (t) => ({ ...t, steps: [{ ...t.steps[0], data: { nope: [] } }] }), /does not have/],
    ['61 items', (t) => ({ ...t, steps: [{ ...t.steps[0], data: { ds0: Array.from({ length: 61 }, (_, i) => ({ id: `i${i}`, v: 'x' })) } }] }), /at most 60/],
    ['a null item', (t) => ({ ...t, steps: [{ ...t.steps[0], data: { ds0: [null] } }] }), /item is malformed/],
    ['an item that is too long', (t) => ({ ...t, steps: [{ ...t.steps[0], data: { ds0: [{ id: 'i1', v: 'x'.repeat(101) }] } }] }), /item is malformed/],
  ];

  it.each(broken)('refuses %s', (_name, mutate, why) => {
    const body = mutate(wire(slidingWindow()));
    expect(() => validateTrace(body)).toThrow(/^That trace can't be saved: /);
    expect(() => validateTrace(body)).toThrow(why);
  });
});
