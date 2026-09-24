import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import type { AttemptResult, AttemptSubmission, PracticeMode } from '../../../shared/types.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading } from '../components.tsx';
import { Quiz } from '../problem/Quiz.tsx';
import { ResultCard } from '../problem/ResultCard.tsx';
import { Statement } from '../problem/Statement.tsx';
import { MySolution } from '../problem/MySolution.tsx';
import { BUDGET_SEC, TimerBar } from '../problem/TimerBar.tsx';
import { useTimer } from '../problem/useTimer.ts';
import { NotesEditor } from '../problem/Workbench.tsx';

/** "3 months ago", for a unix timestamp in seconds. */
function describeAge(unixSeconds: number): string {
  const days = Math.floor((Date.now() / 1000 - unixSeconds) / 86_400);
  if (days < 1) return 'today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} month${months === 1 ? '' : 's'} ago` : `${Math.floor(months / 12)}y ago`;
}

const JavaEditor = lazy(() => import('../problem/JavaEditor.tsx'));

type Tab = 'approach' | 'java' | 'notes' | 'solution';

/** A LeetCode solve older than this is worth redoing (matches the server). */
const REVISIT_AFTER_DAYS = 60;

export function ProblemPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const mode: PracticeMode = params.get('mode') === 'blind' ? 'blind' : 'pattern';

  const view = useLoad(() => api.problem(slug, mode), [slug, mode]);
  const lc = useLoad(() => api.leetcodeProblem(slug), [slug]);

  const [tab, setTab] = useState<Tab>('approach');
  const [hintsShown, setHintsShown] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [retakes, setRetakes] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timer = useTimer();
  const { restart: restartTimer, takeUnflushed } = timer;

  useEffect(() => {
    setTab('approach');
    setHintsShown(0);
    setResult(null);
    setRetakes(0);
    setSubmitError(null);
    restartTimer();
  }, [slug, mode, restartTimer]);

  /** Hands the seconds since the last call to the server, so a closed tab loses nothing. */
  const flush = useCallback(
    (useBeacon = false) => {
      const delta = takeUnflushed();
      if (delta.elapsedSec <= 0) return;
      if (useBeacon && navigator.sendBeacon) {
        // The page is going away; fetch would be cancelled, a beacon isn't.
        navigator.sendBeacon(`/api/problems/${slug}/time`, new Blob([JSON.stringify(delta)], { type: 'application/json' }));
        return;
      }
      void api.addTime(slug, delta).catch(() => {}); // a lost tick isn't worth an error
    },
    [slug, takeUnflushed],
  );

  // Pausing or stopping is a deliberate break: bank what's counted so far right away.
  useEffect(() => {
    if (timer.status === 'paused' || timer.status === 'stopped') flush();
  }, [timer.status, flush]);

  // Bank the time on a schedule, when the tab goes away, and when you leave the page.
  useEffect(() => {
    const id = setInterval(() => flush(), 30_000);
    const onHide = () => document.visibilityState === 'hidden' && flush(true);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', () => flush(true));
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      flush(true);
    };
  }, [flush]);

  if (view.error) return <main className="page"><ErrorBox message={view.error} onRetry={view.reload} /></main>;
  const v = view.data?.slug === slug ? view.data : null;
  if (!v) return <main className="page"><Loading /></main>;
  const lcProblem = lc.data?.slug === slug ? lc.data : null;

  // Show the stored result when revisiting, unless you chose to retake.
  const shown = result ?? (retakes === 0 ? (v.progress?.lastResult ?? null) : null);
  const attemptedBefore = (v.progress?.attempts ?? 0) > 0;
  const solveAgeDays = v.lcSolvedAt != null ? Math.floor((Date.now() / 1000 - v.lcSolvedAt) / 86_400) : null;
  const staleSolve = solveAgeDays != null && solveAgeDays >= REVISIT_AFTER_DAYS;

  const submit = async (answers: Omit<AttemptSubmission, 'hintsUsed' | 'elapsedSec' | 'activeSec'>) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await api.submit(slug, {
        ...answers,
        hintsUsed: hintsShown,
        elapsedSec: timer.elapsedSec,
        activeSec: timer.activeSec,
      });
      timer.stop();
      flush();
      setResult(r);
      view.reload();
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const retake = () => {
    flush();
    setResult(null);
    setRetakes((n) => n + 1);
    restartTimer();
    setTab('approach');
  };

  const next =
    mode === 'blind'
      ? { href: `/blind?exclude=${slug}`, label: 'Next blind problem' }
      : v.nextInPattern
        ? { href: `/problems/${v.nextInPattern}?mode=pattern`, label: 'Next problem' }
        : { href: v.pattern ? `/patterns/${v.pattern.id}` : '/patterns', label: 'Back to the pattern' };

  return (
    <main className="page page-wide stack">
      <div className="spread">
        <div>
          <div className="small muted">
            {mode === 'blind' ? (
              <Link to="/blind">Blind practice</Link>
            ) : (
              v.pattern && <Link to={`/patterns/${v.pattern.id}`}>{v.pattern.name}</Link>
            )}
          </div>
          <h1 style={{ margin: '0.2rem 0 0.4rem' }}>
            <span className="muted mono" style={{ fontWeight: 500 }}>
              {v.id}.
            </span>{' '}
            {v.title}
          </h1>
          <div className="row small">
            <DifficultyTag difficulty={v.difficulty} />
            {v.pattern ? <span className="tag tag-accent">{v.pattern.name}</span> : <span className="tag">Pattern hidden</span>}
            {v.lcSolved && (
              <span className="tag tag-good">
                Solved on LeetCode{v.lcSolvedAt != null && ` · ${describeAge(v.lcSolvedAt)}`}
              </span>
            )}
            {staleSolve && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  retake();
                  setTab('approach');
                }}
                title={`You solved this ${describeAge(v.lcSolvedAt!)}; try the approach check again from scratch`}
              >
                Retry
              </button>
            )}
            {v.progress?.lastRun && v.progress.lastRun.checked > 0 && v.progress.lastRun.passed === v.progress.lastRun.checked && (
              <span className="tag tag-good" title={`All ${v.progress.lastRun.checked} example tests passed`}>
                Code verified
              </span>
            )}
            {attemptedBefore && (
              <span className="muted">
                {v.progress!.attempts} attempt{v.progress!.attempts > 1 ? 's' : ''} · best {v.progress!.bestPercent}%
              </span>
            )}
          </div>
        </div>
        {!shown && (
          <TimerBar timer={timer} budgetSec={BUDGET_SEC[v.difficulty]} stored={v.progress?.time ?? null} />
        )}
      </div>

      <div className="split">
        <section className="card">
          <Statement
            slug={slug}
            problem={lcProblem}
            error={lc.error}
            onRetry={lc.reload}
            showTags={mode === 'pattern' || attemptedBefore}
            hintsShown={hintsShown}
            onRevealHint={() => setHintsShown((h) => h + 1)}
            hintsCost={!shown}
          />
        </section>

        <section className="card sticky-col">
          <div className="tabs" role="tablist">
            {(['approach', 'java', 'notes', 'solution'] as const)
              .filter((t) => t !== 'solution' || v.lcSolved || v.progress?.leetcodeSolution)
              .map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                  {{ approach: 'Approach check', java: 'Java', notes: 'Notes', solution: 'My LeetCode solution' }[t]}
                </button>
              ))}
          </div>

          <div hidden={tab !== 'approach'}>
            {shown ? (
              <ResultCard result={shown} nextHref={next.href} nextLabel={next.label} onRetake={retake} />
            ) : (
              <div className="stack" style={{ gap: '0.75rem' }}>
                <div className="callout small">
                  {mode === 'blind'
                    ? 'Blind mode: the pattern is hidden. Read the problem, sketch an approach (Notes tab), then answer. Spotting the pattern yourself is worth 3 points.'
                    : `You know this is a ${v.pattern?.name} problem. Show you can apply it: the key idea, its complexity and the edge cases.`}
                  {attemptedBefore && ' This is a practice retake; it will not change your rating.'}
                </div>
                {submitError && <ErrorBox message={submitError} />}
                <Quiz key={`${slug}-${mode}-${retakes}`} quiz={v.quiz} mode={mode} submitting={submitting} onSubmit={submit} />
              </div>
            )}
          </div>
          <div hidden={tab !== 'java'}>
            <Suspense fallback={<Loading label="Loading the editor…" />}>
              <JavaEditor
                key={slug}
                slug={slug}
                savedCode={v.progress?.code ?? null}
                starter={lcProblem?.javaSnippet ?? null}
                save={(code) => api.saveWork(slug, { code })}
                onRan={view.reload}
              />
            </Suspense>
          </div>
          <div hidden={tab !== 'notes'}>
            <NotesEditor key={slug} savedNotes={v.progress?.notes ?? null} save={(notes) => api.saveWork(slug, { notes })} />
          </div>
          {(v.lcSolved || v.progress?.leetcodeSolution) && (
            <div hidden={tab !== 'solution'}>
              <MySolution
                key={slug}
                slug={slug}
                saved={v.progress?.leetcodeSolution ?? null}
                sessionConfigured={v.sessionConfigured}
                solvedAt={v.lcSolvedAt}
                onFetched={view.reload}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
