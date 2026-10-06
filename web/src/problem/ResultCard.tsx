import { Link } from 'react-router';
import { patternName } from '../../../shared/patterns/index.ts';
import type { AttemptResult, ComplexityDerivation, ComplexityWalkthrough } from '../../../shared/types.ts';
import { formatDuration, RatingDelta, ScoreRing } from '../components.tsx';
import { studyLinks } from '../links.ts';

const ICON = { correct: '✓', partial: '~', wrong: '✗', skipped: '–' } as const;

interface Props {
  result: AttemptResult;
  /** How the complexity is counted, when the server has sent it. */
  complexity?: ComplexityWalkthrough | null;
  nextHref: string | null;
  nextLabel: string;
  onRetake: () => void;
  /** Set for problems that are not on LeetCode, which have no editorial or solutions page to link. */
  source?: { name: string; url: string } | null;
}

export function ResultCard({ result: r, complexity, nextHref, nextLabel, onRetake, source }: Props) {
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
            {r.elapsedSec > 0 && `Time ${formatDuration(r.elapsedSec)}${r.activeSec > 0 && r.activeSec < r.elapsedSec ? ` (${formatDuration(r.activeSec)} at the screen)` : ''} · `}
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

      {complexity && <ComplexityCard walkthrough={complexity} result={r} />}

      <div>
        <div className="small muted" style={{ marginBottom: '0.35rem' }}>Read more</div>
        <div className="row small" style={{ flexWrap: 'wrap' }}>
          {(source
            ? [{ label: `Original on ${source.name}`, href: source.url, note: 'The problem where it was published, with its own discussion' }, ...studyLinks(r.slug, r.title).filter((l) => l.label === 'NeetCode video' || l.label === 'takeuforward')]
            : studyLinks(r.slug, r.title)
          ).map((l) => (
            <a key={l.label} className="btn btn-sm btn-ghost" href={l.href} target="_blank" rel="noreferrer" title={l.note}>
              {l.label} ↗
            </a>
          ))}
        </div>
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

/**
 * The counting behind the answer: each piece of work and its cost, then how the
 * pieces combine. Shows whether your own complexity answers were right, too.
 */
function ComplexityCard({ walkthrough, result }: { walkthrough: ComplexityWalkthrough; result: AttemptResult }) {
  const verdict = (key: 'time' | 'space') => result.breakdown.find((q) => q.key === key);
  return (
    <div className="cx-card">
      <div className="cx-title">How the complexity adds up</div>
      <div className="cx-grid">
        <Derivation label="Time" d={walkthrough.time} mark={verdict('time')?.verdict} />
        <Derivation label="Space" d={walkthrough.space} mark={verdict('space')?.verdict} />
      </div>
      <div className="tiny muted" style={{ marginTop: '0.5rem' }}>
        Sequential steps add, and only the biggest term survives. Work inside a loop multiplies by the number of times the
        loop runs. The <Link to="/reference">Reference</Link> tab has the costs of every routine used here.
      </div>
    </div>
  );
}

function Derivation({ label, d, mark }: { label: string; d: ComplexityDerivation; mark?: string }) {
  return (
    <div className="cx-col">
      <div className="cx-head">
        <span className="cx-label">{label}</span>
        {mark === 'correct' ? <span className="tag tag-good tiny">you had it</span> : mark ? <span className="tag tag-warn tiny">worth a second look</span> : null}
      </div>
      <ol className="cx-steps">
        {d.steps.map(([what, cost], i) => (
          <li key={i}>
            <span className="cx-what">{what}</span>
            <span className="cx-cost mono">{cost}</span>
          </li>
        ))}
      </ol>
      <div className="cx-so mono">→ {d.so}</div>
    </div>
  );
}
