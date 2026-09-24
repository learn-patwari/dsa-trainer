import { useState } from 'react';
import { Link } from 'react-router';
import type { DashboardState, DifficultyProgress, PatternSummary } from '../../../shared/types.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading, ProgressBar, Rating, RatingDelta, TierLabel, timeAgo } from '../components.tsx';

export function Dashboard() {
  const { data, error, reload } = useLoad(api.state, []);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      await api.syncProfile();
      reload();
    } catch (e) {
      setSyncError((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;

  const started = data.patterns.filter((p) => p.rating != null).length;
  const groups = groupBy(data.patterns, (p) => p.group);

  return (
    <main className="page stack">
      <div className="spread">
        <div>
          <h1>Your training</h1>
          <p className="muted" style={{ margin: 0 }}>
            Learn a pattern, answer an approach check on its LeetCode problems, and watch each pattern's rating move.
          </p>
        </div>
        <div className="row">
          <Link className="btn btn-primary" to="/blind">
            Blind practice
          </Link>
          <Link className="btn" to="/patterns">
            Browse patterns
          </Link>
        </div>
      </div>

      <section className="grid grid-stats">
        <div className="card">
          <div className="stat-label">Overall rating</div>
          <div className="stat-value mono">{data.overall ?? '—'}</div>
          <TierLabel tier={data.overallTier} />
        </div>
        <div className="card">
          <div className="stat-label">Problems attempted</div>
          <div className="stat-value">
            {data.attemptedProblems}
            <span className="muted" style={{ fontSize: '1rem' }}> / {data.totalProblems}</span>
          </div>
          <ProgressBar value={data.attemptedProblems} max={data.totalProblems} label="Problems attempted" />
        </div>
        <div className="card">
          <div className="stat-label">Patterns started</div>
          <div className="stat-value">
            {started}
            <span className="muted" style={{ fontSize: '1rem' }}> / {data.patterns.length}</span>
          </div>
          <ProgressBar value={started} max={data.patterns.length} label="Patterns started" />
        </div>
        <div className="card">
          <div className="stat-label">Day streak</div>
          <div className="stat-value">
            {data.streak.current}
            {data.streak.best > 0 && <span className="muted" style={{ fontSize: '1rem' }}> / best {data.streak.best}</span>}
          </div>
          <span className="small muted">
            {data.streak.activeToday ? 'Practised today — nice.' : data.streak.current > 0 ? 'Practise today to keep it.' : 'One attempt starts a streak.'}
          </span>
        </div>
        <div className="card">
          <div className="stat-label">LeetCode</div>
          {data.leetcode ? (
            <>
              <div className="stat-value">{data.leetcode.solvedCounts.all}</div>
              <span className="small muted">solved by {data.leetcode.username}</span>
              <div className="row" style={{ marginTop: '0.5rem' }}>
                <button className="btn btn-sm" disabled={syncing} onClick={sync}>
                  {syncing ? 'Syncing…' : 'Sync'}
                </button>
                {data.leetcode.syncedAt && <span className="tiny muted">synced {timeAgo(data.leetcode.syncedAt)}</span>}
              </div>
              {syncError && <div className="tiny delta-down">{syncError}</div>}
            </>
          ) : (
            <p className="small" style={{ marginTop: '0.4rem' }}>
              <Link to="/leetcode">Import your profile</Link> to skip problems you've solved and target topics you've avoided.
            </p>
          )}
        </div>
      </section>

      <PlanCard data={data} reload={reload} />

      <section className="card">
        <h2>Up next</h2>
        {data.upNext.length === 0 ? (
          <p className="muted">You've attempted every curated problem. Retake any of them as practice, or try blind mode.</p>
        ) : (
          <div className="grid grid-3">
            {data.upNext.map((r) => (
              <Link key={r.slug} to={`/problems/${r.slug}?mode=pattern`} className="card card-flat card-link">
                <div className="spread small">
                  <span className="tag tag-accent">{r.patternName}</span>
                  <DifficultyTag difficulty={r.difficulty} />
                </div>
                <h3 style={{ margin: '0.6rem 0 0.3rem' }}>{r.title}</h3>
                <p className="small muted" style={{ margin: 0 }}>
                  {r.reason}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {data.revisit.length > 0 && (
        <section className="card">
          <h2>Worth another look</h2>
          <p className="small muted">
            You solved these on LeetCode a while ago. Redo the approach check to see whether the idea actually stuck.
          </p>
          <div className="grid grid-3">
            {data.revisit.map((r) => (
              <Link key={r.slug} to={`/problems/${r.slug}?mode=pattern`} className="card card-flat card-link">
                <div className="spread small">
                  <span className="tag tag-accent">{r.patternName}</span>
                  <DifficultyTag difficulty={r.difficulty} />
                </div>
                <h3 style={{ margin: '0.6rem 0 0.3rem' }}>{r.title}</h3>
                <p className="small muted" style={{ margin: 0 }}>
                  Solved {Math.round(r.days / 30)} month{Math.round(r.days / 30) === 1 ? '' : 's'} ago on LeetCode
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        <h2 style={{ margin: 0 }}>Pattern ratings</h2>
        {[...groups].map(([group, patterns]) => (
          <div key={group}>
            <div className="pattern-group-label">{group}</div>
            <div className="grid grid-3">
              {patterns.map((p) => (
                <PatternCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Progress by difficulty</h2>
        <p className="small muted">Attempted here versus actually solved on LeetCode — the second number is the one interviews test.</p>
        <div className="grid grid-3">
          {data.difficulty.map((d) => (
            <DifficultyCard key={d.difficulty} d={d} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Recent attempts</h2>
        {data.recent.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No attempts yet. Pick something from "Up next" to get your first rating.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Score</th>
                  <th>Rating</th>
                  <th>Mode</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((a) => (
                  <tr key={a.at + a.slug}>
                    <td>
                      <Link to={`/problems/${a.slug}?mode=${a.mode}`}>{a.title}</Link>
                    </td>
                    <td className="mono">{a.percent}%</td>
                    <td>{a.rated ? <RatingDelta before={a.ratingBefore} after={a.ratingAfter} /> : <span className="muted small">practice</span>}</td>
                    <td className="small muted">{a.mode === 'blind' ? 'Blind' : 'Pattern'}</td>
                    <td className="small muted">{timeAgo(a.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const PLAN_SIZES = [50, 75, 100, 150, 197];
const PLAN_WEEKS = [4, 6, 8, 12, 16];

function PlanCard({ data, reload }: { data: DashboardState; reload: () => void }) {
  const { plan } = data;
  const [size, setSize] = useState(75);
  const [weeks, setWeeks] = useState(8);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!plan) {
    return (
      <section className="card">
        <h2>Study plan</h2>
        <p className="small muted">
          Pick how many problems to get through and by when. The dashboard then tells you how many to do today and whether you're on schedule.
        </p>
        <div className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: '0.75rem' }}>
          <label className="small">
            Problems
            <select className="input" value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ display: 'block', marginTop: '0.25rem' }}>
              {PLAN_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="small">
            Weeks
            <select className="input" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} style={{ display: 'block', marginTop: '0.25rem' }}>
              {PLAN_WEEKS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" disabled={busy} onClick={() => act(() => api.setPlan(size, weeks))}>
            {busy ? 'Starting…' : 'Start plan'}
          </button>
          <span className="tiny muted">≈ {Math.ceil(size / (weeks * 7))} problem(s) a day</span>
        </div>
        {error && <div className="tiny delta-down">{error}</div>}
      </section>
    );
  }

  const pace =
    plan.behindBy > 0
      ? { cls: 'tag tag-warn', text: `${plan.behindBy} behind schedule` }
      : plan.behindBy < 0
        ? { cls: 'tag tag-good', text: `${-plan.behindBy} ahead` }
        : { cls: 'tag tag-good', text: 'On track' };

  return (
    <section className="card">
      <div className="spread">
        <h2 style={{ margin: 0 }}>Study plan</h2>
        <button className="btn btn-sm" disabled={busy} onClick={() => act(api.clearPlan)}>
          Stop plan
        </button>
      </div>
      <div className="spread" style={{ marginTop: '0.75rem', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="stat-label">Today</div>
          <div className="stat-value">
            {plan.doneToday}
            <span className="muted" style={{ fontSize: '1rem' }}> / {plan.todayTarget} problems</span>
          </div>
          <span className="small muted">
            {plan.doneToday >= plan.todayTarget ? "Today's target is done." : `${plan.todayTarget - plan.doneToday} to go today.`}
          </span>
        </div>
        <span className={pace.cls}>{pace.text}</span>
      </div>
      <div style={{ marginTop: '0.9rem' }}>
        <ProgressBar value={plan.done} max={plan.size} label="Study plan progress" />
        <div className="spread tiny muted" style={{ marginTop: '0.4rem' }}>
          <span>
            {plan.done}/{plan.size} problems since the plan started
          </span>
          <span>
            Day {plan.daysElapsed} of {plan.daysTotal}
          </span>
        </div>
      </div>
      {error && <div className="tiny delta-down">{error}</div>}
    </section>
  );
}

function DifficultyCard({ d }: { d: DifficultyProgress }) {
  return (
    <div className="card card-flat">
      <div className="spread">
        <DifficultyTag difficulty={d.difficulty} />
        <span className="tiny muted">{d.total} in the bank</span>
      </div>
      <div className="stat-value" style={{ marginTop: '0.4rem' }}>
        {d.attempted}
        <span className="muted" style={{ fontSize: '1rem' }}> / {d.total} attempted</span>
      </div>
      <ProgressBar value={d.attempted} max={d.total} label={`${d.difficulty} attempted`} />
      <div className="tiny muted" style={{ marginTop: '0.4rem' }}>{d.lcSolved} solved on LeetCode</div>
    </div>
  );
}

/** Matches LC_SOLVES_REQUIRED on the server: solve this many of a pattern's problems on LeetCode. */
const LC_SOLVES_REQUIRED = 2;

function PatternCard({ p }: { p: PatternSummary }) {
  const avoided = p.lcTagSolved != null && p.lcTagSolved < 5;
  return (
    <Link to={`/patterns/${p.id}`} className="card card-link">
      <div className="spread">
        <h3 style={{ margin: 0 }}>{p.name}</h3>
        <Rating rating={p.rating} tier={p.tier} />
      </div>
      <p className="small muted" style={{ margin: '0.4rem 0 0.7rem' }}>
        {p.summary}
      </p>
      <ProgressBar value={p.attempted} max={p.total} label={`${p.name} progress`} />
      <div className="spread tiny muted" style={{ marginTop: '0.4rem' }}>
        <span>
          {p.attempted}/{p.total} attempted · LeetCode {Math.min(p.lcSolvedInSet, LC_SOLVES_REQUIRED)}/{LC_SOLVES_REQUIRED}
        </span>
        {p.complete ? (
          <span className="tag tag-good">Complete</span>
        ) : avoided ? (
          <span className="tag tag-warn">Rarely practiced on LeetCode</span>
        ) : p.lcSolvedInSet > 0 ? (
          <span>{p.lcSolvedInSet} solved there</span>
        ) : null}
      </div>
    </Link>
  );
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) m.set(key(it), [...(m.get(key(it)) ?? []), it]);
  return m;
}
