import type { PatternId } from '../types.ts';

/**
 * The vocabulary an animation is drawn in. A frame is a caption plus a stack of
 * layers; the player renders one frame at a time and CSS transitions do the
 * moving. Generators never hand-write frames — they run the real algorithm and
 * record its state, so the picture always matches what the code would do.
 */

/** How a cell or node should read at this moment. */
export type Tone =
  | 'plain'
  | 'active' // being looked at right now
  | 'match' // the thing we were looking for
  | 'window' // inside the current range
  | 'done' // finished with, settled
  | 'dim' // ruled out
  | 'bad' // a conflict or a failed check
  | 'hidden'; // not reached yet — present for layout, invisible

export interface Cell {
  v: string | number;
  tone?: Tone;
  /** Stable identity, so a pushed item animates in and a kept one doesn't flicker. */
  id?: string;
  /** Small text under the value, e.g. an index or a node name. */
  sub?: string;
}

export interface Marker {
  at: number;
  label: string;
  tone?: Tone;
}

export interface Span {
  from: number;
  to: number;
  tone?: Tone;
  label?: string;
}

export interface ArrayLayer {
  kind: 'array';
  label?: string;
  cells: Cell[];
  /** Pointers drawn under the cells; they slide between positions. */
  markers?: Marker[];
  /** A bracket over a contiguous range, e.g. a sliding window. */
  spans?: Span[];
  /** Show 0..n-1 under each cell unless a cell has its own `sub`. */
  indices?: boolean;
}

export interface MapLayer {
  kind: 'map';
  label: string;
  entries: { k: string; v: string; tone?: Tone }[];
  empty?: string;
}

export interface StackLayer {
  kind: 'stack' | 'queue';
  label: string;
  items: Cell[];
  empty?: string;
}

export interface VarsLayer {
  kind: 'vars';
  items: { k: string; v: string; tone?: Tone }[];
}

export interface GridLayer {
  kind: 'grid';
  label?: string;
  rows: Cell[][];
  /** Headers for DP tables. */
  colLabels?: string[];
  rowLabels?: string[];
}

/** Positions are 0-100 in both axes; the renderer scales them. */
export interface GraphNode {
  id: string;
  v: string | number;
  x: number;
  y: number;
  tone?: Tone;
  sub?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  tone?: Tone;
  label?: string;
  directed?: boolean;
}

export interface GraphLayer {
  kind: 'graph';
  label?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Taller canvas for deep trees. */
  height?: number;
}

/** A singly linked list, laid out left to right; `next` may point anywhere, even backwards. */
export interface ListLayer {
  kind: 'list';
  label?: string;
  nodes: Cell[];
  /** Index each node points at, or null for the end. */
  next: (number | null)[];
  markers?: Marker[];
}

export type Layer = ArrayLayer | MapLayer | StackLayer | VarsLayer | GridLayer | GraphLayer | ListLayer;

export interface Frame {
  /** What just happened and why — the actual hint. */
  caption: string;
  layers: Layer[];
}

export interface PatternAnimation {
  pattern: PatternId;
  title: string;
  /** The input, stated the way a problem would state it. */
  setup: string;
  frames: Frame[];
  /** What the run computed, so tests can hold it to the right answer. */
  result: string;
  /** The one sentence to remember. */
  takeaway: string;
}
