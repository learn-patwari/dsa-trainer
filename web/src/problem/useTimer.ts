import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Two clocks on one set of controls.
 *
 * `elapsedSec` is the wall clock: it runs from Start until you pause or stop,
 * whatever you do with the window. `activeSec` only runs while this tab is
 * actually in front of you — switch tab, minimise, or click into another
 * window and it stops, then picks up when you come back. The gap between the
 * two is the time you thought you were working.
 *
 * Leave for longer than AWAY_LIMIT_MS and the whole thing pauses itself, so a
 * problem forgotten in a background tab doesn't bank the rest of the afternoon. Come
 * back and it picks up where it left off — only a pause you asked for waits for you.
 */

/** How long the tab may sit in the background before the timer gives up on you. */
export const AWAY_LIMIT_MS = 5 * 60 * 1000;

export type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface Timer {
  status: TimerStatus;
  /** True when the pause came from walking away rather than from the button. */
  autoPaused: boolean;
  elapsedSec: number;
  activeSec: number;
  /** True when the tab is hidden or unfocused, so the active clock is held. */
  away: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** Back to zero and running, for a retake. */
  restart: () => void;
  /** Seconds not yet handed to the server, and a way to mark them banked. */
  takeUnflushed: () => { elapsedSec: number; activeSec: number };
}

function isInFront(): boolean {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible' && document.hasFocus();
}

export function useTimer(autoStart = true): Timer {
  const [status, setStatus] = useState<TimerStatus>(autoStart ? 'running' : 'idle');
  const [away, setAway] = useState(() => !isInFront());
  const [autoPaused, setAutoPaused] = useState(false);
  const awayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, tick] = useState(0);

  // Accumulated whole milliseconds, plus the moment each clock last started.
  const elapsedMs = useRef(0);
  const activeMs = useRef(0);
  const elapsedFrom = useRef<number | null>(autoStart ? Date.now() : null);
  const activeFrom = useRef<number | null>(autoStart && isInFront() ? Date.now() : null);
  const flushedMs = useRef({ elapsed: 0, active: 0 });

  /** Folds whatever is running into the totals, so both clocks can be read exactly. */
  const settle = useCallback((now = Date.now()) => {
    if (elapsedFrom.current != null) {
      elapsedMs.current += now - elapsedFrom.current;
      elapsedFrom.current = now;
    }
    if (activeFrom.current != null) {
      activeMs.current += now - activeFrom.current;
      activeFrom.current = now;
    }
  }, []);

  const start = useCallback(() => {
    settle();
    elapsedFrom.current = Date.now();
    activeFrom.current = isInFront() ? Date.now() : null;
    setAway(!isInFront());
    setAutoPaused(false);
    setStatus('running');
  }, [settle]);

  const halt = useCallback(
    (next: TimerStatus) => {
      settle();
      elapsedFrom.current = null;
      activeFrom.current = null;
      setStatus(next);
    },
    [settle],
  );

  const pause = useCallback(() => {
    setAutoPaused(false);
    halt('paused');
  }, [halt]);
  const stop = useCallback(() => {
    setAutoPaused(false);
    halt('stopped');
  }, [halt]);

  const restart = useCallback(() => {
    elapsedMs.current = 0;
    activeMs.current = 0;
    flushedMs.current = { elapsed: 0, active: 0 };
    start();
  }, [start]);

  // Only the active clock follows the window; the wall clock keeps running —
  // until you've been gone long enough that you clearly aren't coming back.
  useEffect(() => {
    const clearAwayTimer = () => {
      if (awayTimeout.current != null) clearTimeout(awayTimeout.current);
      awayTimeout.current = null;
    };
    const sync = () => {
      const front = isInFront();
      setAway(!front);
      // It paused itself while you were gone; you're back, so carry on.
      if (front && status === 'paused' && autoPaused) {
        start();
        return;
      }
      if (status !== 'running') return;
      settle();
      activeFrom.current = front ? Date.now() : null;
      clearAwayTimer();
      if (!front) {
        awayTimeout.current = setTimeout(() => {
          setAutoPaused(true);
          halt('paused');
        }, AWAY_LIMIT_MS);
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);
    return () => {
      clearAwayTimer();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('blur', sync);
    };
  }, [status, settle, halt, autoPaused, start]);

  // Redraw once a second while something is moving.
  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const takeUnflushed = useCallback(() => {
    settle();
    const elapsedSec = Math.floor((elapsedMs.current - flushedMs.current.elapsed) / 1000);
    const activeSec = Math.floor((activeMs.current - flushedMs.current.active) / 1000);
    if (elapsedSec <= 0) return { elapsedSec: 0, activeSec: 0 };
    flushedMs.current = {
      elapsed: flushedMs.current.elapsed + elapsedSec * 1000,
      active: flushedMs.current.active + Math.max(0, activeSec) * 1000,
    };
    return { elapsedSec, activeSec: Math.max(0, Math.min(elapsedSec, activeSec)) };
  }, [settle]);

  const now = Date.now();
  const liveElapsed = elapsedMs.current + (elapsedFrom.current != null ? now - elapsedFrom.current : 0);
  const liveActive = activeMs.current + (activeFrom.current != null ? now - activeFrom.current : 0);

  return {
    status,
    autoPaused,
    elapsedSec: Math.floor(liveElapsed / 1000),
    activeSec: Math.floor(liveActive / 1000),
    away,
    start,
    pause,
    resume: start,
    stop,
    restart,
    takeUnflushed,
  };
}
