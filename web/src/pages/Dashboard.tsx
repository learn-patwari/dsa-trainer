import { Link } from 'react-router';
import type { PatternSummary } from '../../../shared/types.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading, ProgressBar, Rating, RatingDelta, TierLabel, timeAgo } from '../components.tsx';

export function Dashboard() {
  const { data, error, reload } = useLoad(api.state, []);
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
          <div className="stat-label">LeetCode</div>
          {data.leetcode ? (
            <>
              <div className="stat-value">{data.leetcode.solvedCounts.all}</div>
              <span className="small muted">solved by {data.leetcode.username}</span>
            </>
          ) : (
            <p className="small" style={{ marginTop: '0.4rem' }}>
              <Link to="/leetcode">Import your profile</Link> to skip problems you've solved and target topics you've avoided.
            </p>
          )}
        </div>
      </section>

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
          {p.attempted}/{p.total} attempted
        </span>
        {avoided ? (
          <span className="tag tag-warn">Rarely practiced on LeetCode</span>
        ) : p.lcSolvedInSet > 0 ? (
          <span>{p.lcSolvedInSet} solved on LeetCode</span>
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
