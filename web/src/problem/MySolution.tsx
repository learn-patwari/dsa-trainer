import { useState } from 'react';
import type { LeetCodeSolution } from '../../../shared/types.ts';
import { api } from '../api.ts';
import { ErrorBox } from '../components.tsx';

interface Props {
  slug: string;
  saved: LeetCodeSolution | null;
  sessionConfigured: boolean;
  solvedAt: number | null;
  onFetched: () => void;
}

/** Your own accepted LeetCode submission, fetched on demand with the session cookie. */
export function MySolution({ slug, saved, sessionConfigured, solvedAt, onFetched }: Props) {
  const [solution, setSolution] = useState<LeetCodeSolution | null>(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchIt = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await api.fetchSolution(slug);
      setSolution(r.solution);
      setMessage(r.message);
      onFetched();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      {!sessionConfigured ? (
        <div className="callout warn small">
          To pull your own accepted code from LeetCode, put <code>LEETCODE_SESSION</code> in <code>.env</code> and restart (steps
          are on the LeetCode page). Without it the trainer only knows <em>that</em> you solved it, not what you wrote.
        </div>
      ) : (
        <div className="row">
          <button className="btn btn-sm btn-primary" onClick={fetchIt} disabled={busy}>
            {busy ? 'Fetching…' : solution ? 'Fetch again' : 'Fetch my accepted solution'}
          </button>
          {solvedAt != null && <span className="small muted">Solved {new Date(solvedAt * 1000).toLocaleDateString()}</span>}
        </div>
      )}
      {error && <ErrorBox message={error} />}
      {message && <div className="callout small">{message}</div>}
      {solution && (
        <>
          <div className="row tiny muted">
            <span className="tag">{solution.lang}</span>
            <span>accepted {new Date(solution.solvedAt * 1000).toLocaleString()}</span>
            {solution.runtime && <span>· {solution.runtime}</span>}
            {solution.memory && <span>· {solution.memory}</span>}
          </div>
          {solution.code ? (
            <>
              <pre className="code-block">
                <code>{solution.code}</code>
              </pre>
              <div className="row">
                <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(solution.code!)}>
                  Copy
                </button>
                <a className="btn btn-sm btn-ghost" href={`https://leetcode.com/submissions/detail/${solution.submissionId}/`} target="_blank" rel="noreferrer">
                  View on LeetCode ↗
                </a>
              </div>
            </>
          ) : (
            <p className="small muted">LeetCode returned the submission date but not its code.</p>
          )}
        </>
      )}
    </div>
  );
}
