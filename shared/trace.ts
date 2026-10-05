import type { Animation, Cell, Frame, Layer, Marker, Span } from './animations/types.ts';

/**
 * A dry run you build yourself, iteration by iteration: an array or string, some
 * pointers, and whatever data structures the algorithm keeps — then played back
 * like a video. Each step stores the whole state (not a diff), so any step can be
 * edited on its own and playback never has to replay history.
 */

export type StructureKind = 'set' | 'map' | 'stack' | 'queue' | 'list' | 'vars';

export const STRUCTURE_KINDS: { kind: StructureKind; label: string; hint: string }[] = [
  { kind: 'set', label: 'HashSet', hint: 'add, remove, contains' },
  { kind: 'map', label: 'HashMap', hint: 'put key → value' },
  { kind: 'stack', label: 'Stack', hint: 'push, pop — top shown first' },
  { kind: 'queue', label: 'Queue', hint: 'offer at the back, poll from the front' },
  { kind: 'list', label: 'List', hint: 'append, remove last — shown with indices' },
  { kind: 'vars', label: 'Variables', hint: 'name = value, e.g. best = 3' },
];

export interface TraceStructure {
  id: string;
  kind: StructureKind;
  label: string;
}

/** One entry in a structure. `id` is kept across steps so a new item animates in and an old one doesn't flicker. */
export interface TraceItem {
  id: string;
  v: string;
  /** The key, for maps and variables. */
  k?: string;
}

export interface TraceStep {
  /** What happens in this iteration — the caption when it plays. */
  note: string;
  pointers: Record<string, number | null>;
  /** Shade the window between the first two pointers. */
  window: boolean;
  /** Extra cells to emphasise this step. */
  highlight: number[];
  data: Record<string, TraceItem[]>;
}

export interface Trace {
  version: 1;
  /** Exactly what was typed: `abcdbcbb`, `"abc"`, `[2,7,11,15]` or `2, 7, 11`. */
  input: string;
  /** Pointer names in order; the window runs from the first to the second. */
  pointers: string[];
  structures: TraceStructure[];
  steps: TraceStep[];
}

export const TRACE_LIMITS = { steps: 200, cells: 60, pointers: 6, structures: 6, items: 60, text: 300 } as const;

/** Splits the input into cells: a bracketed or comma list becomes values, anything else characters. */
export function parseInput(raw: string): { kind: 'array' | 'string'; values: string[] } {
  const s = raw.trim();
  if (s.startsWith('[') || (s.includes(',') && !/^["']/.test(s))) {
    const inner = s.replace(/^\[|\]$/g, '');
    const values = inner
      .split(',')
      .map((x) => x.trim().replace(/^["']|["']$/g, ''))
      .filter((x) => x.length > 0);
    return { kind: 'array', values: values.slice(0, TRACE_LIMITS.cells) };
  }
  const unquoted = s.replace(/^["']|["']$/g, '');
  return { kind: 'string', values: [...unquoted].slice(0, TRACE_LIMITS.cells) };
}

export function emptyStep(trace: Pick<Trace, 'pointers' | 'structures'>): TraceStep {
  return {
    note: '',
    pointers: Object.fromEntries(trace.pointers.map((p, i) => [p, i === 0 ? 0 : null])),
    window: trace.pointers.length >= 2,
    highlight: [],
    data: Object.fromEntries(trace.structures.map((s) => [s.id, []])),
  };
}

export function newTrace(input: string, pointers: string[], kinds: StructureKind[]): Trace {
  const structures = kinds.map((kind, i) => ({ id: `ds${i}`, kind, label: STRUCTURE_KINDS.find((k) => k.kind === kind)!.label }));
  const base = { pointers, structures };
  return { version: 1, input, pointers, structures, steps: [emptyStep(base)] };
}

/** The next step starts as a copy of this one — the way an iteration carries its state forward. */
export function copyStep(step: TraceStep): TraceStep {
  return {
    note: '',
    pointers: { ...step.pointers },
    window: step.window,
    highlight: [],
    data: Object.fromEntries(Object.entries(step.data).map(([k, items]) => [k, items.map((it) => ({ ...it }))])),
  };
}

// ---------------------------------------------------------------- playback

/** The window a step shades, if its first two pointers are both placed. */
export function windowOf(trace: Trace, step: TraceStep): [number, number] | null {
  if (!step.window || trace.pointers.length < 2) return null;
  const a = step.pointers[trace.pointers[0]!];
  const b = step.pointers[trace.pointers[1]!];
  if (a == null || b == null) return null;
  return [Math.min(a, b), Math.max(a, b)];
}

function structureLayer(s: TraceStructure, items: TraceItem[]): Layer {
  switch (s.kind) {
    case 'set':
      return { kind: 'queue', label: s.label, items: items.map((it) => ({ v: it.v, id: it.id })), empty: 'empty' };
    case 'queue':
      return { kind: 'queue', label: `${s.label} (front first)`, items: items.map((it) => ({ v: it.v, id: it.id })), empty: 'empty' };
    case 'stack':
      return { kind: 'stack', label: `${s.label} (top first)`, items: [...items].reverse().map((it) => ({ v: it.v, id: it.id })), empty: 'empty' };
    case 'map':
      return { kind: 'map', label: s.label, entries: items.map((it) => ({ k: it.k ?? '?', v: it.v })), empty: 'empty' };
    case 'list':
      return { kind: 'array', label: s.label, indices: true, cells: items.map((it): Cell => ({ v: it.v, id: it.id })) };
    case 'vars':
      return { kind: 'vars', items: items.map((it) => ({ k: it.k ?? '?', v: it.v })) };
  }
}

/** One frame for one step, in the same vocabulary as the pattern animations. */
export function stepFrame(trace: Trace, step: TraceStep, index: number): Frame {
  const { kind, values } = parseInput(trace.input);
  const win = windowOf(trace, step);
  const markers: Marker[] = trace.pointers
    .map((p): Marker | null => {
      const at = step.pointers[p];
      return at == null || at < 0 || at >= values.length ? null : { at, label: p, tone: 'active' };
    })
    .filter((m): m is Marker => m !== null);
  const spans: Span[] = win ? [{ from: win[0], to: Math.min(win[1], values.length - 1), tone: 'window', label: String(win[1] - win[0] + 1) }] : [];

  return {
    caption: step.note.trim() || `Step ${index + 1}`,
    layers: [
      {
        kind: 'array',
        label: kind === 'string' ? 's' : 'nums',
        indices: true,
        cells: values.map((v, i): Cell => ({ v, tone: step.highlight.includes(i) ? 'active' : win && i >= win[0] && i <= win[1] ? 'window' : undefined })),
        markers,
        spans: spans.filter((sp) => sp.from <= sp.to),
      },
      ...trace.structures.map((s) => structureLayer(s, step.data[s.id] ?? [])),
    ],
  };
}

export function traceToAnimation(trace: Trace, title = 'Your dry run'): Animation {
  return {
    title,
    setup: `input: ${trace.input}`,
    frames: trace.steps.map((st, i) => stepFrame(trace, st, i)),
    result: '',
    takeaway: '',
  };
}

// ---------------------------------------------------------------- validation (server side)

const isStr = (v: unknown, max: number = TRACE_LIMITS.text): v is string => typeof v === 'string' && v.length <= max;

/** Checks a trace from the browser before it is stored. Throws a readable message. */
export function validateTrace(body: unknown): Trace {
  function bad(why: string): never {
    throw new Error(`That trace can't be saved: ${why}.`);
  }
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

  if (!isObj(body)) bad('it is not an object');
  if (body.version !== 1) bad('unknown version');
  if (!isStr(body.input, 2000)) bad('the input must be text');
  const cells = parseInput(body.input).values.length;
  const onInput = (v: unknown): boolean => Number.isInteger(v) && (v as number) >= 0 && (v as number) < cells;

  const pointers = body.pointers;
  if (!Array.isArray(pointers) || pointers.length > TRACE_LIMITS.pointers || !pointers.every((p) => isStr(p, 12) && p.trim() !== '')) {
    bad(`pointers must be at most ${TRACE_LIMITS.pointers} short names`);
  }
  if (new Set(pointers).size !== pointers.length) bad('two pointers share a name');

  const structures = body.structures;
  if (!Array.isArray(structures) || structures.length > TRACE_LIMITS.structures) bad(`it can keep at most ${TRACE_LIMITS.structures} data structures`);
  const kinds = new Set<unknown>(STRUCTURE_KINDS.map((k) => k.kind));
  const ids = new Set<string>();
  for (const s of structures) {
    if (!isObj(s) || !isStr(s.id, 20) || !s.id || !kinds.has(s.kind) || !isStr(s.label, 40)) bad('a data structure is malformed');
    if (ids.has(s.id)) bad('two data structures share an id');
    ids.add(s.id);
  }

  const steps = body.steps;
  if (!Array.isArray(steps) || steps.length === 0 || steps.length > TRACE_LIMITS.steps) bad(`it needs 1–${TRACE_LIMITS.steps} steps`);
  for (const s of steps) {
    if (!isObj(s) || !isStr(s.note, 1000) || typeof s.window !== 'boolean') bad('a step is malformed');
    if (!Array.isArray(s.highlight) || !s.highlight.every(onInput)) bad('a highlighted cell is off the input');
    if (!isObj(s.pointers)) bad('a step has no pointers');
    for (const [name, at] of Object.entries(s.pointers)) {
      if (!pointers.includes(name)) bad('a step moves a pointer the trace does not have');
      if (at !== null && !onInput(at)) bad(`pointer ${name} is off the input`);
    }
    if (!isObj(s.data)) bad('a step has no data');
    for (const [id, items] of Object.entries(s.data)) {
      if (!ids.has(id)) bad('a step fills a data structure the trace does not have');
      if (!Array.isArray(items) || items.length > TRACE_LIMITS.items) bad(`a data structure can hold at most ${TRACE_LIMITS.items} items`);
      for (const it of items) {
        if (!isObj(it) || !isStr(it.id, 20) || !isStr(it.v, 100) || (it.k !== undefined && !isStr(it.k, 100))) bad('an item is malformed');
      }
    }
  }
  return body as unknown as Trace;
}
