import { useEffect, useRef, useState } from 'react';
import { animationFor, sortAnimationFor } from '../../../shared/animations/index.ts';
import type { Animation, SortId } from '../../../shared/animations/index.ts';
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
  /** One of these: a pattern's animation, a sorting algorithm's, or one you built (a dry run). */
  pattern?: PatternId;
  sort?: SortId;
  animation?: Animation;
  /** Start playing as soon as it's shown — for a hint the learner just asked for. */
  autoPlay?: boolean;
  /** Start in the big-letter, dark-stage style of an explainer video. */
  video?: boolean;
}

export default function AnimationPlayer({ pattern, sort, animation, autoPlay = false, video: startVideo = false }: Props) {
  const anim = animation ?? (sort ? sortAnimationFor(sort) : animationFor(pattern!));
  const last = Math.max(0, anim.frames.length - 1);
  const [video, setVideo] = useState(startVideo);
  const [fullscreen, setFullscreen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  // A trace being edited can lose steps while it plays; never read past the end.
  const at = Math.min(i, last);
  const [playing, setPlaying] = useState(autoPlay && !reduced);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else {
      setVideo(true); // full screen is for presenting: use the stage look
      void root.current?.requestFullscreen?.();
    }
  };

  // A different pattern is a different animation: start it from the top.
  useEffect(() => {
    setI(0);
    setPlaying(autoPlay && !reduced);
  }, [pattern, sort, autoPlay, reduced]);

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
      go(at + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'j') {
      e.preventDefault();
      go(at - 1);
    } else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(last);
  };

  const frame = anim.frames[at];
  const done = at === last;
  if (!frame) return <div className="anim-player small muted">Nothing to play yet — add a step.</div>;

  return (
    <div
      className={`anim-player${video ? ' is-stage' : ''}${fullscreen ? ' is-fullscreen' : ''}`}
      ref={root}
      tabIndex={0}
      onKeyDown={onKey}
      aria-roledescription="animation"
      aria-label={`${anim.title}. Space to play or pause, arrow keys to step.`}
    >
      <div className="anim-head">
        <div>
          <div className="anim-title">{anim.title}</div>
          <div className="small muted">{anim.setup}</div>
        </div>
        <div className="row" style={{ gap: '0.35rem', flexWrap: 'nowrap' }}>
          <button type="button" className={`btn btn-sm btn-ghost anim-mode${video ? ' is-on' : ''}`} onClick={() => setVideo((v) => !v)} aria-pressed={video} title="Big letters on a dark stage, like an explainer video">
            🎬 Video
          </button>
          <button type="button" className="btn btn-sm btn-ghost anim-mode" onClick={toggleFullscreen} title={fullscreen ? 'Leave full screen (Esc)' : 'Full screen'}>
            {fullscreen ? '✕' : '⛶'}
          </button>
          <span className="tag tiny">
            step {at + 1} / {last + 1}
          </span>
        </div>
      </div>

      <Scene layers={frame.layers} />

      <p className="anim-caption" aria-live="polite">
        {frame.caption}
      </p>

      {done && anim.takeaway && (
        <div className="anim-takeaway small">
          <strong>Remember:</strong> {anim.takeaway}
        </div>
      )}

      <div className="anim-controls">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(0)} disabled={at === 0} aria-label="Back to the start" title="Home">
          ⏮
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous step" title="←">
          ◀
        </button>
        <button type="button" className="btn btn-sm btn-primary anim-play" onClick={toggle} aria-label={playing ? 'Pause' : done ? 'Replay' : 'Play'} title="Space">
          {playing ? '❚❚ Pause' : done ? '↻ Replay' : '▶ Play'}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => go(at + 1)} disabled={done} aria-label="Next step" title="→">
          ▶
        </button>
        <input
          type="range"
          className="anim-scrub"
          min={0}
          max={last}
          value={at}
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
