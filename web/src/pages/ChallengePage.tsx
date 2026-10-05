import DOMPurify from 'dompurify';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PATTERNS } from '../../../shared/patterns/index.ts';
import type { ChallengeAnswer, ChallengeQuestion, PatternId } from '../../../shared/types.ts';
import { api } from '../api.ts';
import { DifficultyTag, ErrorBox, formatDuration, Loading } from '../components.tsx';
import { FinderTool } from './FinderPage.tsx';

const GROUPS = [...new Set(PATTERNS.map((p) => p.group))];

/**
 * Pattern challenge: one question, always the same one — which pattern does this need?
 * Problems come from the whole LeetCode catalog, not just the curated bank.
 */
function PatternChallenge() {
  const [question, setQuestion] = useState<ChallengeQuestion | null>(null);
  const [answer, setAnswer] = useState<ChallengeAnswer | null>(null);
  const [chosen, setChosen] = useState<PatternId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const next = async (exclude?: string) => {
    setBusy(true);
    setError(null);
    setAnswer(null);
    setChosen(null);
    try {
      const q = await api.challengeNext(exclude);
      setQuestion(q);
      startedAt.current = Date.now();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!question) return;
    setBusy(true);
    try {
      setAnswer(await api.challengeAnswer(question.slug, chosen));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const stats = answer?.stats ?? question?.stats;
  const elapsed = Math.max(0, Math.round((now - startedAt.current) / 1000));

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h2 style={{ margin: 0 }}>Pattern challenge</h2>
          <p className="muted" style={{ margin: 0 }}>
            One question, any problem on LeetCode: which pattern does it need? No options narrowed down, no pattern name in
            sight — exactly what an unseen interview problem feels like.
          </p>
        </div>
        {stats && (
          <div className="row" style={{ gap: '1.25rem' }}>
            <Stat label="Asked" value={stats.asked} />
            <Stat label="Correct" value={stats.asked ? `${Math.round((100 * stats.correct) / stats.asked)}%` : '—'} />
            <Stat label="Streak" value={stats.streak} />
            <Stat label="Best" value={stats.bestStreak} />
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} onRetry={() => void next()} />}

      {!question ? (
        <div className="card empty">
          {busy ? (
            <Loading label="Picking a problem…" />
          ) : (
            <>
              <p>Ready? Problems are drawn from all ~4,000 free LeetCode problems, weighted toward Medium.</p>
              <button className="btn btn-primary" onClick={() => void next()}>
                Start the challenge
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="split">
          <section className="card">
            <div className="spread" style={{ marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>{question.title}</h2>
              <span className="row small">
                <DifficultyTag difficulty={question.difficulty} />
                {!answer && <span className="tag mono">⏱ {formatDuration(elapsed)}</span>}
              </span>
            </div>
            <Statement html={question.contentHtml} />
          </section>

          <section className="card sticky-col">
            {answer ? (
              <Verdict answer={answer} question={question} onNext={() => void next(question.slug)} busy={busy} />
            ) : (
              <>
                <h2>Which pattern does this need?</h2>
                <div className="pattern-picker">
                  {GROUPS.map((g) => (
                    <div key={g}>
                      <div className="pattern-group-label">{g}</div>
                      <div className="chips">
                        {PATTERNS.filter((p) => p.group === g).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`chip${chosen === p.id ? ' selected' : ''}`}
                            aria-pressed={chosen === p.id}
                            onClick={() => setChosen(p.id)}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="btn btn-ghost" onClick={submit} disabled={busy}>
                    No idea, show me
                  </button>
                  <button className="btn btn-primary" onClick={submit} disabled={busy || !chosen}>
                    Lock it in
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Verdict({ answer, question, onNext, busy }: { answer: ChallengeAnswer; question: ChallengeQuestion; onNext: () => void; busy: boolean }) {
  return (
    <div className="stack">
      <div className={`callout ${answer.correct ? 'good' : 'bad'}`}>
        <strong>{answer.correct ? 'Correct' : answer.chosen ? 'Not this time' : 'Skipped'}</strong>
        {' — '}
        {answer.accepted.length ? (
          <>
            this is {answer.accepted.map((a) => a.name).join(' or ')}
            {!answer.correct && answer.chosen && <> , not {PATTERNS.find((p) => p.id === answer.chosen)!.name}</>}.
          </>
        ) : (
          <>its tags don't match any of the 23 patterns — skip this one.</>
        )}
      </div>
      {answer.why.length > 0 && (
        <ul className="small muted" style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {answer.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {!answer.curated && (
        <p className="tiny muted" style={{ margin: 0 }}>
          This problem isn't in your bank, so the answer comes from LeetCode's own topic tags. Close relatives count as correct.
        </p>
      )}
      <div className="row">
        <button className="btn btn-primary" onClick={onNext} disabled={busy}>
          Next problem
        </button>
        {answer.lessonPattern && (
          <Link className="btn" to={`/patterns/${answer.lessonPattern}`}>
            Read the lesson
          </Link>
        )}
        {answer.curated ? (
          <Link className="btn btn-ghost" to={`/problems/${question.slug}?mode=pattern`}>
            Full approach check
          </Link>
        ) : (
          <a className="btn btn-ghost" href={`https://leetcode.com/problems/${question.slug}/`} target="_blank" rel="noreferrer">
            Solve on LeetCode ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Statement({ html }: { html: string | null }) {
  const clean = useMemo(() => (html ? DOMPurify.sanitize(html) : ''), [html]);
  if (!html) return <p className="muted">LeetCode didn't return this statement. Skip to the next one.</p>;
  return <div className="statement" dangerouslySetInnerHTML={{ __html: clean }} />;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="tiny muted">{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

type Tab = 'pattern' | 'blind' | 'finder';

const TABS: { id: Tab; label: string }[] = [
  { id: 'pattern', label: 'Pattern challenge' },
  { id: 'blind', label: 'Blind practice' },
  { id: 'finder', label: 'Pattern finder' },
];

/** Everything that tests whether you can spot the pattern unaided, in one place. */
export function ChallengePage() {
  const [params, setParams] = useSearchParams();
  const [tab, setTabState] = useState<Tab>(TABS.find((t) => t.id === params.get('tab'))?.id ?? 'pattern');
  const setTab = (t: Tab) => {
    setTabState(t);
    setParams({ tab: t }, { replace: true });
  };

  return (
    <main className="page stack">
      <div>
        <h1>Challenge</h1>
        <p className="muted" style={{ margin: 0 }}>
          Spot the pattern without being told. Take a surprise problem from all of LeetCode, practise your bank with the pattern
          hidden, or look up what pattern any problem needs.
        </p>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Kept mounted so switching tabs doesn't throw away a question you're halfway through. */}
      <div hidden={tab !== 'pattern'}>
        <PatternChallenge />
      </div>
      {tab === 'blind' && <BlindPractice />}
      {tab === 'finder' && <FinderTool />}
    </main>
  );
}

function BlindPractice() {
  return (
    <div className="card stack">
      <h2 style={{ margin: 0 }}>Blind practice</h2>
      <p className="muted" style={{ margin: 0 }}>
        Opens a problem from your five weakest patterns with the pattern name hidden. Read it, sketch an approach, then answer —
        spotting the pattern yourself is worth 3 points. You can also reach it from the dashboard.
      </p>
      <div>
        <Link className="btn btn-primary" to="/blind">
          Start blind practice
        </Link>
      </div>
    </div>
  );
}
