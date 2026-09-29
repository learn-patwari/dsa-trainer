import { useState } from 'react';
import { PATTERNS } from '../../../shared/patterns/index.ts';
import { POINTS } from '../../../shared/scoring.ts';
import type { AttemptSubmission, PatternId, PracticeMode, QuizView } from '../../../shared/types.ts';

interface Props {
  quiz: QuizView;
  mode: PracticeMode;
  submitting: boolean;
  /** True when this attempt will move the pattern rating, i.e. it's your first. */
  rated: boolean;
  /** Set when the check can't be graded yet, e.g. the code hasn't been run. */
  blocked: { reason: string; action: string; onAction: () => void } | null;
  onSubmit: (answers: Omit<AttemptSubmission, 'hintsUsed' | 'elapsedSec' | 'activeSec'>) => void;
}

const GROUPS = [...new Set(PATTERNS.map((p) => p.group))];

export function Quiz({ quiz, mode, submitting, rated, blocked, onSubmit }: Props) {
  const [pattern, setPattern] = useState<PatternId | null>(null);
  // In blind mode you commit to a pattern before seeing the other questions, whose wording can give it away.
  const [locked, setLocked] = useState(!quiz.askPattern);
  const [brute, setBrute] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [space, setSpace] = useState<string | null>(null);
  const [edges, setEdges] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);

  const unanswered = [quiz.askPattern && !pattern, quiz.brute && !brute, !insight, !time, !space].filter(Boolean).length;
  const answered = [pattern, brute, insight, time, space].filter(Boolean).length + (edges.size > 0 ? 1 : 0);
  // An empty submit is a slip, and on a first attempt it would spend the only rated try on a zero.
  const blank = answered === 0;
  // Question numbers shift depending on which questions this problem asks.
  let step = quiz.askPattern ? 1 : 0;
  const n = () => `${++step}. `;

  const toggleEdge = (i: number) =>
    setEdges((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (!locked) {
    return (
      <div>
        <div className="q-title">
          <span>1. Which pattern fits best?</span>
          <span className="q-points">{POINTS.pattern} pts</span>
        </div>
        <p className="small muted">Decide before you see the other questions. You can't change it afterwards.</p>
        <div className="pattern-picker">
          {GROUPS.map((g) => (
            <div key={g}>
              <div className="pattern-group-label">{g}</div>
              <div className="chips">
                {PATTERNS.filter((p) => p.group === g).map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`chip${pattern === p.id ? ' selected' : ''}`}
                    aria-pressed={pattern === p.id}
                    onClick={() => setPattern(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => { setPattern(null); setLocked(true); }}>
            Not sure, skip (0 pts)
          </button>
          <button type="button" className="btn btn-primary" disabled={!pattern} onClick={() => setLocked(true)}>
            Lock in{pattern ? `: ${PATTERNS.find((p) => p.id === pattern)!.name}` : ''}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (blank || blocked) return;
        if (unanswered > 0 && rated && !confirming) {
          setConfirming(true);
          return;
        }
        onSubmit({ mode, pattern, brute, insight, time, space, edgeCasesHandled: [...edges] });
      }}
    >
      {quiz.askPattern && (
        <div className="q">
          <div className="q-title">
            <span>1. Pattern</span>
            <span className="q-points">{POINTS.pattern} pts</span>
          </div>
          <span className="tag tag-accent">{pattern ? PATTERNS.find((p) => p.id === pattern)!.name : 'Skipped'}</span>{' '}
          <span className="tiny muted">locked in</span>
        </div>
      )}

      {quiz.brute && (
        <div className="q">
          <div className="q-title">
            <span>{n()}What does the obvious brute force cost?</span>
            <span className="q-points">{POINTS.brute} pt</span>
          </div>
          <p className="small muted">
            Start where an interview starts: the straightforward solution and its time complexity. You'll see the reference one
            after you submit.
          </p>
          <div className="segmented" role="radiogroup" aria-label="Brute-force time complexity">
            {quiz.brute.options.map((o) => (
              <button type="button" key={o} role="radio" aria-checked={brute === o} className={brute === o ? 'selected' : ''} onClick={() => setBrute(o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <fieldset className="q" style={{ border: 'none', margin: 0 }}>
        <legend className="q-title" style={{ width: '100%', padding: 0 }}>
          <span>
            {n()}
            {quiz.insight.q}
          </span>
          <span className="q-points">{POINTS.insight} pts</span>
        </legend>
        <div className="options" role="radiogroup">
          {quiz.insight.options.map((o) => (
            <label key={o} className={`option${insight === o ? ' selected' : ''}`}>
              <input type="radio" name="insight" checked={insight === o} onChange={() => setInsight(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="q">
        <div className="q-title">
          <span>{n()}Complexity of the best approach</span>
          <span className="q-points">
            {POINTS.time} + {POINTS.space} pts
          </span>
        </div>
        {quiz.vars && <p className="small muted">{quiz.vars}</p>}
        <p className="tiny muted">Space means extra memory: the returned output doesn't count, and in-place sorting counts as O(1).</p>
        <div className="small" style={{ fontWeight: 600, margin: '0.5rem 0 0.35rem' }}>
          Time
        </div>
        <div className="segmented" role="radiogroup" aria-label="Time complexity">
          {quiz.time.map((o) => (
            <button type="button" key={o} role="radio" aria-checked={time === o} className={time === o ? 'selected' : ''} onClick={() => setTime(o)}>
              {o}
            </button>
          ))}
        </div>
        <div className="small" style={{ fontWeight: 600, margin: '0.75rem 0 0.35rem' }}>
          Space
        </div>
        <div className="segmented" role="radiogroup" aria-label="Space complexity">
          {quiz.space.map((o) => (
            <button type="button" key={o} role="radio" aria-checked={space === o} className={space === o ? 'selected' : ''} onClick={() => setSpace(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="q">
        <div className="q-title">
          <span>{n()}Does your approach handle these?</span>
          <span className="q-points">{POINTS.edgeCases} pt</span>
        </div>
        <p className="small muted">Self-check: tick only the cases your approach handles correctly.</p>
        {quiz.edgeCases.map((ec, i) => (
          <label key={ec} className="check">
            <input type="checkbox" checked={edges.has(i)} onChange={() => toggleEdge(i)} />
            <span>{ec}</span>
          </label>
        ))}
      </div>

      {confirming && (
        <div className="callout warn small" style={{ marginTop: '1rem' }}>
          <strong>
            {unanswered} question{unanswered > 1 ? 's are' : ' is'} unanswered.
          </strong>{' '}
          {unanswered > 1 ? 'They' : 'It'} will score 0, and this first attempt is the one that sets your rating — retakes
          afterwards are practice only.
          <div className="row" style={{ marginTop: '0.6rem' }}>
            <button type="submit" className="btn btn-sm" disabled={submitting}>
              Submit anyway
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirming(false)}>
              Keep answering
            </button>
          </div>
        </div>
      )}

      {blocked && (
        <div className="callout warn small" style={{ marginTop: '1rem' }}>
          {blocked.reason}
          <div className="row" style={{ marginTop: '0.6rem' }}>
            <button type="button" className="btn btn-sm" onClick={blocked.onAction}>
              {blocked.action}
            </button>
          </div>
        </div>
      )}

      <div className="spread" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <span className="small muted">
          {blocked
            ? 'Answer these now if you like — they are graded once the code compiles.'
            : blank
            ? 'Answer at least one question to submit.'
            : unanswered > 0
              ? `${unanswered} unanswered question${unanswered > 1 ? 's' : ''} will score 0.`
              : 'All questions answered.'}
        </span>
        <button className="btn btn-primary" type="submit" disabled={submitting || blank || confirming || blocked !== null}>
          {submitting ? 'Grading…' : 'Submit approach'}
        </button>
      </div>
    </form>
  );
}
