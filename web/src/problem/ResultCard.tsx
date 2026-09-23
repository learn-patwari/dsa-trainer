import { Link } from 'react-router';
import { patternName } from '../../../shared/patterns/index.ts';
import type { AttemptResult } from '../../../shared/types.ts';
import { formatDuration, RatingDelta, ScoreRing } from '../components.tsx';

const ICON = { correct: '✓', partial: '~', wrong: '✗', skipped: '–' } as const;

interface Props {
  result: AttemptResult;
  nextHref: string | null;
  nextLabel: string;
  onRetake: () => void;
}

export function ResultCard({ result: r, nextHref, nextLabel, onRetake }: Props) {
  return (
    <div className="stack">
      <div className="row" style={{ gap: '1rem', alignItems: 'center' }}>
        <ScoreRing percent={r.percent} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {r.score} / {r.maxScore} points
          </div>
          {r.rated ? (
            <div className="small">
              {patternName(r.pattern)} rating <span className="mono">{r.ratingBefore}</span> →{' '}
              <span className="mono">{r.ratingAfter}</span> (<RatingDelta before={r.ratingBefore} after={r.ratingAfter} />)
            </div>
          ) : (
            <div className="small muted">Practice attempt: only your first attempt at a problem changes your rating.</div>
          )}
          <div className="tiny muted">
            {r.hintPenalty > 0 && `Hint penalty −${r.hintPenalty} · `}
            {r.elapsedSec > 0 && `Time ${formatDuration(r.elapsedSec)} · `}
            {r.mode === 'blind' ? 'Blind mode' : 'Pattern mode'}
          </div>
        </div>
      </div>

      <div>
        {r.breakdown.map((q) => (
          <div key={q.key} className="verdict">
            <span className={`verdict-icon v-${q.verdict}`} aria-label={q.verdict}>
              {ICON[q.verdict]}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="spread">
                <strong>{q.label}</strong>
                <span className="small muted mono">
                  {q.earned}/{q.max}
                </span>
              </div>
              {q.key === 'edgeCases' ? (
                <div className="small">
                  <span className="muted">You handle {q.chosen}:</span> {q.correct}
                </div>
              ) : (
                <>
                  {q.verdict !== 'correct' && (
                    <div className="small">
                      <span className="muted">Your answer:</span> {q.chosen ?? 'skipped'}
                    </div>
                  )}
                  <div className="small">
                    <span className="muted">{q.verdict === 'correct' ? 'Answer:' : 'Correct:'}</span> {q.correct}
                  </div>
                </>
              )}
              {q.explanation && (
                <div className="small muted" style={{ marginTop: '0.3rem' }}>
                  {q.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="callout good">
        <div className="small" style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
          Reference approach
        </div>
        <div className="small">{r.approach}</div>
      </div>

      <div className="row">
        {nextHref && (
          <Link className="btn btn-primary" to={nextHref}>
            {nextLabel}
          </Link>
        )}
        <button className="btn" onClick={onRetake}>
          Retake as practice
        </button>
        <Link className="btn btn-ghost" to={`/patterns/${r.pattern}`}>
          {patternName(r.pattern)} lesson
        </Link>
      </div>
    </div>
  );
}
