import { useState } from 'react';
import { Link } from 'react-router';
import type { LookupResult } from '../../../shared/types.ts';
import { api, type CatalogMatch } from '../api.ts';
import { DifficultyTag, ErrorBox } from '../components.tsx';

/** Paste any LeetCode problem and find out which pattern it needs, plus what else is like it. */
export function FinderPage() {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [matches, setMatches] = useState<CatalogMatch[] | null>(null);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    setMatches(null);
    try {
      const r = await api.lookup(q);
      setResult(r.result ?? null);
      setMatches(r.matches ?? null);
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page stack">
      <div>
        <h1>Pattern finder</h1>
        <p className="muted">
          Paste a LeetCode link, a slug, or part of a title. You get the pattern it needs — hand-assigned when the problem is in
          your bank, inferred from its topic tags and wording otherwise — plus problems that drill the same idea.
        </p>
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
      >
        <input
          className="input"
          style={{ flex: 1, minWidth: '16rem' }}
          placeholder="https://leetcode.com/problems/… or “rotting oranges”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="LeetCode problem"
        />
        <button className="btn btn-primary" disabled={busy || !query.trim()}>
          {busy ? 'Looking…' : 'Find the pattern'}
        </button>
      </form>

      {error && <ErrorBox message={error} />}

      {matches && (
        <section className="card">
          <h2>Which one?</h2>
          <div className="stack" style={{ gap: '0.4rem' }}>
            {matches.map((m) => (
              <button key={m.slug} className="btn" style={{ justifyContent: 'space-between' }} onClick={() => void search(m.slug)}>
                <span>
                  <span className="muted mono">{m.id}. </span>
                  {m.title}
                </span>
                <DifficultyTag difficulty={m.difficulty} />
              </button>
            ))}
          </div>
        </section>
      )}

      {result && <Result result={result} />}
    </main>
  );
}

function Result({ result }: { result: LookupResult }) {
  const top = result.guesses[0];
  const pattern = result.curated?.pattern ?? top?.pattern ?? null;
  return (
    <>
      <section className="card">
        <div className="spread">
          <div>
            <h2 style={{ margin: 0 }}>
              <span className="muted mono" style={{ fontWeight: 500 }}>
                {result.id}.{' '}
              </span>
              {result.title}
            </h2>
            <div className="row small" style={{ marginTop: '0.4rem' }}>
              <DifficultyTag difficulty={result.difficulty} />
              {result.lcSolved && <span className="tag tag-good">Solved on LeetCode</span>}
              {result.topicTags.map((t) => (
                <span key={t.slug} className="tag">
                  {t.name}
                </span>
              ))}
            </div>
          </div>
          <a className="btn btn-sm" href={`https://leetcode.com/problems/${result.slug}/`} target="_blank" rel="noreferrer">
            Open on LeetCode ↗
          </a>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {result.curated ? (
            <div className="callout good">
              <strong>{result.curated.name}</strong> — this problem is in your bank, so the pattern is hand-assigned.{' '}
              <Link to={`/problems/${result.slug}?mode=pattern`}>Practice it</Link> or{' '}
              <Link to={`/patterns/${result.curated.pattern}`}>read the lesson</Link>.
            </div>
          ) : top ? (
            <div className="callout">
              Most likely <strong>{top.name}</strong> ({top.confidence}% of the evidence) — {top.why.join(', ')}.{' '}
              <Link to={`/patterns/${top.pattern}`}>Read the lesson</Link>.
            </div>
          ) : (
            <div className="callout warn">
              Its tags don't match any of the 23 patterns. It may be a maths, simulation or design problem.
            </div>
          )}

          {result.guesses.length > 1 && (
            <div className="stack" style={{ gap: '0.35rem', marginTop: '0.75rem' }}>
              <div className="tiny muted" style={{ fontWeight: 600 }}>
                {result.curated ? "WHAT THE TAGS ALONE WOULD SUGGEST — USEFUL TO SEE HOW MISLEADING THEY CAN BE" : 'OTHER CANDIDATES'}
              </div>
              {result.guesses.map((g) => (
                <div key={g.pattern} className="row" style={{ gap: '0.6rem' }}>
                  <Link to={`/patterns/${g.pattern}`} style={{ minWidth: '11rem' }} className="small">
                    {g.name}
                  </Link>
                  <div className="bar" style={{ flex: 1, maxWidth: '14rem' }}>
                    <span style={{ width: `${g.confidence}%` }} />
                  </div>
                  <span className="tiny muted mono">{g.confidence}%</span>
                  <span className="tiny muted">{g.why.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {result.similar.length > 0 && (
        <section className="card">
          <h2>More of the same {pattern ? 'pattern' : 'kind'}</h2>
          <p className="small muted">Starred problems are in your bank, with a lesson and an approach check.</p>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {result.similar.map((s) => (
                  <tr key={s.slug}>
                    <td>
                      {s.curated ? (
                        <Link to={`/problems/${s.slug}?mode=pattern`}>★ {s.title}</Link>
                      ) : (
                        <a href={`https://leetcode.com/problems/${s.slug}/`} target="_blank" rel="noreferrer">
                          {s.title} ↗
                        </a>
                      )}
                    </td>
                    <td>
                      <DifficultyTag difficulty={s.difficulty} />
                    </td>
                    <td className="small muted">
                      {s.attempted ? 'attempted here' : ''} {s.lcSolved ? '· solved on LeetCode' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
