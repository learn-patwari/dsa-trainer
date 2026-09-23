import { useState } from 'react';
import { Link } from 'react-router';
import { api, useLoad } from '../api.ts';
import { ErrorBox, Loading, Rating, timeAgo } from '../components.tsx';

export function LeetCodePage() {
  const { data, error, reload } = useLoad(api.state, []);
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState<null | 'public' | 'session' | 'remove' | 'reset'>(null);
  const [message, setMessage] = useState<{ kind: 'good' | 'bad'; text: string } | null>(null);
  const [resetText, setResetText] = useState('');

  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;
  const lc = data.leetcode;

  const run = async (kind: NonNullable<typeof busy>, action: () => Promise<string>) => {
    setBusy(kind);
    setMessage(null);
    try {
      setMessage({ kind: 'good', text: await action() });
      reload();
    } catch (e) {
      setMessage({ kind: 'bad', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const importPublic = () =>
    run('public', async () => {
      const r = await api.importProfile({ username: username.trim() });
      return `Imported ${r.username}: ${r.solvedCounts.all} solved, ${r.solvedSlugs.length} recent accepted problems.`;
    });
  const importSession = () =>
    run('session', async () => {
      const r = await api.importProfile({ useSession: true });
      return `Imported the full solved list for ${r.username}: ${r.solvedSlugs.length} problems.`;
    });

  const curatedSolved = data.patterns.reduce((s, p) => s + p.lcSolvedInSet, 0);
  const rows = [...data.patterns].sort((a, b) => (a.lcTagSolved ?? 1e9) - (b.lcTagSolved ?? 1e9));

  return (
    <main className="page stack">
      <div>
        <h1>LeetCode profile</h1>
        <p className="muted">
          Importing lets the trainer skip problems you've already solved and push patterns you've been avoiding to the top of
          "Up next". Your ratings here still come only from the approach checks you take in this app.
        </p>
      </div>

      {message && <div className={`callout ${message.kind}`}>{message.text}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section className="card">
          <h2>Public profile</h2>
          <p className="small muted">
            Uses only public data: solved counts, solved counts per topic, and your most recent accepted problems (LeetCode
            shows only a short recent list publicly).
          </p>
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              if (username.trim()) importPublic();
            }}
          >
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="LeetCode username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="LeetCode username"
              autoComplete="off"
            />
            <button className="btn btn-primary" disabled={!username.trim() || busy != null}>
              {busy === 'public' ? 'Importing…' : 'Import'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Full solved list</h2>
          {data.sessionConfigured ? (
            <>
              <p className="small muted">
                <code>LEETCODE_SESSION</code> is set on the server, so the trainer can read your complete solved list. The
                cookie stays on this machine and is only sent to leetcode.com.
              </p>
              <button className="btn btn-primary" onClick={importSession} disabled={busy != null}>
                {busy === 'session' ? 'Importing…' : 'Import full solved list'}
              </button>
            </>
          ) : (
            <div className="small">
              <p className="muted">To import every problem you've solved (not just recent ones):</p>
              <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
                <li>
                  Copy <code>.env.example</code> to <code>.env</code> in the <code>dsa-trainer</code> folder.
                </li>
                <li>
                  In a browser signed in to leetcode.com, open DevTools → Application → Cookies and copy{' '}
                  <code>LEETCODE_SESSION</code> (and <code>csrftoken</code>) into <code>.env</code>.
                </li>
                <li>Restart the app, then come back here.</li>
              </ol>
              <p className="tiny muted" style={{ marginTop: '0.5rem' }}>
                Treat the cookie like a password: it signs in as you. Never commit <code>.env</code>.
              </p>
            </div>
          )}
        </section>
      </div>

      {lc ? (
        <section className="card">
          <div className="spread">
            <div>
              <h2 style={{ margin: 0 }}>{lc.username}</h2>
              <span className="small muted">
                {lc.fullList ? 'Full solved list' : 'Public profile'} · imported {timeAgo(lc.importedAt)}
              </span>
            </div>
            <button className="btn btn-sm btn-danger" disabled={busy != null} onClick={() => run('remove', async () => (await api.removeImport(), 'Import removed.'))}>
              Remove import
            </button>
          </div>
          <div className="grid grid-stats" style={{ margin: '1rem 0' }}>
            <Stat label="Solved on LeetCode" value={lc.solvedCounts.all} />
            <Stat label="Easy / Medium / Hard" value={`${lc.solvedCounts.easy} / ${lc.solvedCounts.medium} / ${lc.solvedCounts.hard}`} />
            <Stat label="Curated problems solved" value={`${curatedSolved} / ${data.totalProblems}`} />
          </div>
          {!lc.fullList && (
            <p className="small muted">
              Only your recent accepted problems are known, so "curated problems solved" undercounts. Import the full list for
              an exact picture.
            </p>
          )}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Solved on LeetCode (by topic)</th>
                  <th>Curated solved there</th>
                  <th>Your rating here</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/patterns/${p.id}`}>{p.name}</Link>
                    </td>
                    <td>
                      {p.lcTagSolved == null ? (
                        <span className="muted small">no matching topic tag</span>
                      ) : (
                        <span className="row" style={{ gap: '0.4rem' }}>
                          <span className="mono">{p.lcTagSolved}</span>
                          {p.lcTagSolved < 5 && <span className="tag tag-warn">Avoided</span>}
                        </span>
                      )}
                    </td>
                    <td className="mono">
                      {p.lcSolvedInSet}/{p.total}
                    </td>
                    <td>
                      <Rating rating={p.rating} tier={p.tier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny muted" style={{ marginTop: '0.5rem' }}>
            Topic counts come from LeetCode's tags, which only roughly match these patterns (for example, both DP patterns
            share the "Dynamic Programming" tag).
          </p>
        </section>
      ) : (
        <div className="card empty">No LeetCode data imported yet.</div>
      )}

      <section className="card">
        <h2>Start over</h2>
        <p className="small muted">
          Erases every rating, attempt, saved code and note, and the LeetCode import. Cached problem statements are kept. Type{' '}
          <code>RESET</code> to confirm.
        </p>
        <div className="row">
          <input className="input" value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="RESET" aria-label="Type RESET to confirm" />
          <button
            className="btn btn-danger"
            disabled={resetText !== 'RESET' || busy != null}
            onClick={() =>
              run('reset', async () => {
                await api.reset();
                setResetText('');
                return 'Progress erased. Fresh start!';
              })
            }
          >
            Erase all progress
          </button>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
