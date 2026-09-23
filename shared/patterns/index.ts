import { PATTERN_IDS, type Pattern, type PatternId } from '../types.ts';
import { arrayPatterns } from './arrays.ts';
import { dpPatterns } from './dp.ts';
import { graphPatterns } from './graphs.ts';
import { listPatterns } from './lists.ts';
import { techniquePatterns } from './techniques.ts';
import { treePatterns } from './trees.ts';

const byId = new Map<PatternId, Pattern>(
  [...arrayPatterns, ...listPatterns, ...treePatterns, ...techniquePatterns, ...graphPatterns, ...dpPatterns].map(
    (p) => [p.id, p],
  ),
);

/** All patterns in curriculum order. */
export const PATTERNS: Pattern[] = PATTERN_IDS.map((id) => {
  const p = byId.get(id);
  if (!p) throw new Error(`Missing lesson for pattern "${id}"`);
  return p;
});

export function getPattern(id: PatternId): Pattern {
  return byId.get(id)!;
}

export function patternName(id: PatternId): string {
  return byId.get(id)?.name ?? id;
}

export function isPatternId(x: unknown): x is PatternId {
  return typeof x === 'string' && byId.has(x as PatternId);
}
