import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { DashboardProblem, Difficulty } from '../../../shared/types.ts';
import { DifficultyTag } from '../components.tsx';

type Status = 'all' | 'todo' | 'attempted' | 'lc';

const STATUSES: { id: Status; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'Not attempted' },
  { id: 'attempted', label: 'Attempted' },
  { id: 'lc', label: 'Solved on LeetCode' },
];

/** Every problem in the bank in one filterable list, so nothing is hidden behind a pattern page. */
export function AllProblems({ problems }: { problems: DashboardProblem[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [pattern, setPattern] = useState('all');

  const patterns = useMemo(() => [...new Map(problems.map((p) => [p.pattern, p.patternName]))], [problems]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter(
      (p) =>
        (pattern === 'all' || p.pattern === pattern) &&
        (difficulty === 'all' || p.difficulty === difficulty) &&
        (status === 'all' ||
          (status === 'todo' && p.attempts === 0) ||
          (status === 'attempted' && p.attempts > 0) ||
          (status === 'lc' && p.lcSolved)) &&
        (!q || p.title.toLowerCase().includes(q) || String(p.id) === q),
    );
  }, [problems, query, status, difficulty, pattern]);

  return (
    <section className="card stack">
      <div className="spread">
        <h2 style={{ margin: 0 }}>All problems</h2>
        <span className="small muted">
          {shown.length === problems.length ? `${problems.length} problems` : `${shown.length} of ${problems.length}`}
        </span>
      </div>
      <div className="row">
        <input
          type="search"
          placeholder="Search title or number"
          aria-label="Search problems"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: '1 1 14rem' }}
        />
        <select aria-label="Pattern" value={pattern} onChange={(e) => setPattern(e.target.value)}>
          <option value="all">All patterns</option>
          {patterns.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}>
          <option value="all">Any difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <div className="chips">
        {STATUSES.map((s) => (
          <button key={s.id} className={`chip${status === s.id ? ' selected' : ''}`} onClick={() => setStatus(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="muted">No problems match those filters.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Pattern</th>
                <th>Difficulty</th>
                <th>Your best</th>
                <th>LeetCode</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((q) => (
                <tr key={q.slug}>
                  <td className="mono muted">{q.id}</td>
                  <td>
                    <Link to={`/problems/${q.slug}?mode=pattern`}>{q.title}</Link>
                  </td>
                  <td>
                    <Link to={`/patterns/${q.pattern}`} className="small">
                      {q.patternName}
                    </Link>
                  </td>
                  <td>
                    <DifficultyTag difficulty={q.difficulty} />
                  </td>
                  <td className="mono">
                    {q.bestPercent != null ? `${q.bestPercent}%` : <span className="muted">—</span>}
                    {q.codeVerified && (
                      <span className="tag tag-good" style={{ marginLeft: '0.4rem' }} title="Your code passed every example test">
                        code ✓
                      </span>
                    )}
                  </td>
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
      )}
    </section>
  );
}
