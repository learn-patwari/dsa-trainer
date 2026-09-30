import { useEffect, useRef, useState } from 'react';
import { animationFor } from '../../../shared/animations/index.ts';
import type { PatternId } from '../../../shared/types.ts';
import { Scene } from './Scene.tsx';

// Loaded lazily: the scenes and all 23 generators only arrive when you ask to watch.

const SPEEDS = [0.5, 1, 1.5, 2] as const;

/** Long captions get longer on screen, so the text can be read before it moves on. */
function dwellMs(caption: string, speed: number): number {
  return Math.max(1700, caption.length * 42) / speed;
}

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

interface Props {
  pattern: PatternId;
  /** Start playing as soon as it's shown — for a hint the learner just asked for. */
  autoPlay?: boolean;
}

export default function AnimationPlayer({ pattern, autoPlay = false }: Props) {
  const anim = animationFor(pattern);
  const last = anim.frames.length - 1;
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoPlay && !reduced);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const root = useRef<HTMLDivElement>(null);

  // A different pattern is a different animation: start it from the top.
  useEffect(() => {
    setI(0);
    setPlaying(autoPlay && !reduced);
  }, [pattern, autoPlay, reduced]);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((n) => Math.min(last, n + 1)), dwellMs(anim.frames[i]!.caption, speed));
    return () => clearTimeout(t);
  }, [playing, i, last, speed, anim]);

  const go = (n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(last, n)));
  };
  const toggle = () => {
    if (i >= last) {
      setI(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight' || e.key === 'l') {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'j') {
      e.preventDefault();
      go(i - 1);
    } else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(last);
  };

  const frame = anim.frames[i]!;
  const done = i === last;

  return (
    <div className="anim-player" ref={root} tabIndex={0} onKeyDown={onKey} aria-roledescription="animation" aria-label={`${anim.title}. Space to play or pause, arrow keys to step.`}>
      <div className="anim-head">
        <div>
          <div className="anim-title">{anim.title}</div>
          <div className="small muted">{anim.setup}</div>
        </div>
        <span className="tag tiny">
          step {i + 1} / {last + 1}
        </span>
      </div>

      <Scene layers={frame.layers} />

      <p className="anim-caption" aria-live="polite">
        {frame.caption}
      </p>

      {done && (
        <div className="anim-takeaway small">
          <strong>Remember:</strong> {anim.takeaway}
        </div>
      )}

      <div className="anim-controls">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(0)} disabled={i === 0} aria-label="Back to the start" title="Home">
          ⏮
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step" title="←">
          ◀
        </button>
        <button type="button" className="btn btn-sm btn-primary anim-play" onClick={toggle} aria-label={playing ? 'Pause' : done ? 'Replay' : 'Play'} title="Space">
          {playing ? '❚❚ Pause' : done ? '↻ Replay' : '▶ Play'}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(i + 1)} disabled={done} aria-label="Next step" title="→">
          ▶
        </button>
        <input
          type="range"
          className="anim-scrub"
          min={0}
          max={last}
          value={i}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Step"
        />
        <select className="input anim-speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEEDS)[number])} aria-label="Speed">
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
