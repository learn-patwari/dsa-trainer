import { Link } from 'react-router';
import { PATTERNS } from '../../../shared/patterns/index.ts';
import { api, useLoad } from '../api.ts';
import { ErrorBox, Loading, Rating } from '../components.tsx';

/** A recognition cheat sheet: every pattern with the cues that give it away. */
export function PatternsPage() {
  const { data, error, reload } = useLoad(api.state, []);
  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;
  const byId = new Map(data.patterns.map((s) => [s.id, s]));
  const groups = [...new Set(PATTERNS.map((p) => p.group))];

  return (
    <main className="page stack">
      <div>
        <h1>Patterns</h1>
        <p className="muted">
          Most interview problems are one of these patterns in disguise. Learn the cues on the left of each card; the approach
          check will ask you to spot them without the pattern name in blind mode.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group} className="stack">
          <div className="pattern-group-label">{group}</div>
          <div className="grid grid-3">
            {PATTERNS.filter((p) => p.group === group).map((p) => {
              const s = byId.get(p.id)!;
              return (
                <Link key={p.id} to={`/patterns/${p.id}`} className="card card-link">
                  <div className="spread">
                    <h3 style={{ margin: 0 }}>{p.name}</h3>
                    <Rating rating={s.rating} tier={s.tier} />
                  </div>
                  <p className="small muted" style={{ margin: '0.4rem 0 0.6rem' }}>
                    {p.summary}
                  </p>
                  <div className="tiny muted" style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                    SPOT IT WHEN
                  </div>
                  <ul className="small" style={{ margin: 0, paddingLeft: '1.1rem' }}>
                    {p.signals.slice(0, 3).map((sig) => (
                      <li key={sig}>{sig}</li>
                    ))}
                  </ul>
                  <div className="tiny muted" style={{ marginTop: '0.6rem' }}>
                    {s.attempted}/{s.total} problems attempted
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
