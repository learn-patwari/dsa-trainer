import { Link, useParams } from 'react-router';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading, ProgressBar, Rating } from '../components.tsx';

export function PatternPage() {
  const { id = '' } = useParams();
  const { data, error, reload } = useLoad(() => api.pattern(id), [id]);
  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;

  const { pattern: p, summary: s, problems } = data;
  const next = problems.find((q) => q.attempts === 0 && !q.lcSolved) ?? problems.find((q) => q.attempts === 0);

  return (
    <main className="page stack">
      <div className="spread">
        <div>
          <div className="small muted">
            <Link to="/patterns">Patterns</Link> / {p.group}
          </div>
          <h1 style={{ marginTop: '0.25rem' }}>{p.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {p.summary}
          </p>
        </div>
        <div className="card card-flat" style={{ minWidth: 240 }}>
          <div className="spread">
            <span className="stat-label">Pattern rating</span>
            <Rating rating={s.rating} tier={s.tier} />
          </div>
          <div style={{ margin: '0.6rem 0 0.3rem' }}>
            <ProgressBar value={s.attempted} max={s.total} label="Problems attempted" />
          </div>
          <div className="tiny muted">
            {s.attempted}/{s.total} attempted
            {s.lcTagSolved != null && ` · ${s.lcTagSolved} solved on LeetCode under these topics`}
          </div>
          {next && (
            <Link className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }} to={`/problems/${next.slug}?mode=pattern`}>
              {s.attempted === 0 ? 'Start practicing' : 'Continue'}: {next.title}
            </Link>
          )}
        </div>
      </div>

      <div className="lesson-grid lesson">
        <section className="card">
          <h2>Spot it when…</h2>
          <ul>
            {p.signals.map((sig) => (
              <li key={sig}>{sig}</li>
            ))}
          </ul>
          <h2 style={{ marginTop: '1rem' }}>The idea</h2>
          <p>{p.idea}</p>
          <h2 style={{ marginTop: '1rem' }}>How to apply it</h2>
          <ol>
            {p.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h2 style={{ marginTop: '1rem' }}>Complexity</h2>
          <p>{p.complexity}</p>
          <h2 style={{ marginTop: '1rem' }}>Common pitfalls</h2>
          <ul>
            {p.pitfalls.map((pit) => (
              <li key={pit}>{pit}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="spread" style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Java template</h2>
            <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(p.template.code)}>
              Copy
            </button>
          </div>
          <p className="small muted">{p.template.title}. Compiles as-is; adapt the marked parts to your problem.</p>
          <pre className="code-block">
            <code>{p.template.code}</code>
          </pre>
        </section>
      </div>

      <section className="card">
        <h2>Problems</h2>
        <p className="small muted">
          Ordered easy to hard. Only your first attempt at each problem changes your rating; later attempts are practice.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Your best</th>
                <th>LeetCode</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {problems.map((q) => (
                <tr key={q.slug}>
                  <td className="mono muted">{q.id}</td>
                  <td>
                    <Link to={`/problems/${q.slug}?mode=pattern`}>{q.title}</Link>
                  </td>
                  <td>
                    <DifficultyTag difficulty={q.difficulty} />
                  </td>
                  <td className="mono">{q.bestPercent != null ? `${q.bestPercent}%` : <span className="muted">—</span>}</td>
                  <td>{q.lcSolved ? <span className="tag tag-good">Solved</span> : <span className="muted small">—</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link className="btn btn-sm" to={`/problems/${q.slug}?mode=pattern`}>
                      {q.attempts > 0 ? 'Review' : 'Practice'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
