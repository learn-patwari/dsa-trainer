import { lazy, Suspense } from 'react';
import type { PatternId } from '../../../shared/types.ts';
import { Loading } from '../components.tsx';

const Player = lazy(() => import('./Player.tsx'));

/** The player, loaded on first use: the scenes and all 23 generators are their own chunk. */
export function PatternAnimation({ pattern, autoPlay = false }: { pattern: PatternId; autoPlay?: boolean }) {
  return (
    <Suspense fallback={<Loading label="Loading the animation…" />}>
      <Player pattern={pattern} autoPlay={autoPlay} />
    </Suspense>
  );
}

interface HintProps {
  /** Null while the pattern is still hidden (blind mode, before you've answered). */
  pattern: PatternId | null;
  revealed: boolean;
  /** True while the attempt is ungraded, so watching costs a hint point. */
  costs: boolean;
  onReveal: () => void;
}

/**
 * The pattern, shown moving on a small example. It's a hint, so it costs what
 * the text hints cost; and in blind mode it waits until the pattern is out,
 * because an animation titled "two pointers" would give the answer away.
 */
export function AnimatedHint({ pattern, revealed, costs, onReveal }: HintProps) {
  if (!pattern) {
    return (
      <p className="tiny muted hint-anim">
        An animated walkthrough of this problem's pattern unlocks once you've answered — showing it now would name the pattern.
      </p>
    );
  }
  if (!revealed) {
    return (
      <div className="hint-anim">
        <button type="button" className="btn btn-sm" onClick={onReveal}>
          ▶ Watch the pattern move{costs ? ' (−1 point)' : ''}
        </button>
        <span className="tiny muted" style={{ marginLeft: '0.5rem' }}>
          The technique, step by step, on a small example — not this problem's answer.
        </span>
      </div>
    );
  }
  return (
    <div className="hint-anim">
      <PatternAnimation pattern={pattern} autoPlay />
    </div>
  );
}
