import type { TimeSpent } from '../../../shared/types.ts';
import { formatDuration } from '../components.tsx';
import type { Timer } from './useTimer.ts';

/** Target minutes per difficulty — the budget you'd get in a real interview. */
export const BUDGET_SEC = { Easy: 15 * 60, Medium: 30 * 60, Hard: 45 * 60 } as const;

interface Props {
  timer: Timer;
  /** Interview budget for this problem's difficulty, in seconds. */
  budgetSec: number;
  /** Everything banked against this problem before today. */
  stored: TimeSpent | null;
}

export function TimerBar({ timer, budgetSec, stored }: Props) {
  const { status, elapsedSec, activeSec, away, autoPaused } = timer;
  const over = elapsedSec > budgetSec;
  const totalSec = (stored?.totalSec ?? 0) + elapsedSec;

  return (
    <div className="timer" role="group" aria-label="Attempt timer">
      <div className="timer-clocks">
        <span className={`timer-main mono ${over ? 'timer-over' : ''}`} title={`Wall clock. Interview budget for this difficulty: ${formatDuration(budgetSec)}`}>
          ⏱ {formatDuration(elapsedSec)}
        </span>
        <span
          className={`timer-active mono ${away && status === 'running' ? 'timer-held' : ''}`}
          title="Time this tab was actually in front of you — it pauses by itself when you switch away"
        >
          {formatDuration(activeSec)} active
        </span>
      </div>

      <div className="timer-buttons">
        {status === 'running' && (
          <button className="btn btn-sm" onClick={timer.pause}>
            Pause
          </button>
        )}
        {(status === 'paused' || status === 'idle') && (
          <button className="btn btn-sm" onClick={timer.resume}>
            {status === 'idle' ? 'Start' : 'Resume'}
          </button>
        )}
        {status === 'stopped' ? (
          <button className="btn btn-sm" onClick={timer.restart}>
            Restart
          </button>
        ) : (
          <button className="btn btn-sm" onClick={timer.stop} disabled={status === 'idle'}>
            Stop
          </button>
        )}
      </div>

      <div className="timer-note tiny muted">
        {status === 'running' && away && 'Held — this tab is in the background.'}
        {status === 'running' && !away && `Budget ${formatDuration(budgetSec)}${over ? ' — over' : ''}`}
        {status === 'paused' && (autoPaused ? 'Paused itself — you were away for a while.' : 'Paused.')}
        {status === 'stopped' && 'Stopped.'}
        {status === 'idle' && 'Not started.'}
        {stored != null && stored.totalSec > 0 && (
          <>
            {' · '}
            <span title={`${formatDuration(stored.activeSec + activeSec)} of it actually at the screen`}>
              {formatDuration(totalSec)} on this problem all up
            </span>
          </>
        )}
      </div>
    </div>
  );
}
