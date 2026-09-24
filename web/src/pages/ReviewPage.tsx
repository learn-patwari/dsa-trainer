import { Link } from 'react-router';
import type { ReviewItem } from '../../../shared/types.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading, ProgressBar } from '../components.tsx';

/** The spaced-repetition queue: what you'd otherwise quietly forget. */
export function ReviewPage() {
  const { data, error, reload } = useLoad(api.review, []);
  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;
  const { summary, due, upcoming } = data;

  return (
    <main className="page stack">
      <div>
        <h1>Review</h1>
        <p className="muted" style={{ margin: 0 }}>
          Solving a problem once doesn't keep it. Every attempt schedules the next one — a day later, then three, a week,
          three weeks, two months — and a weak score sends a problem back to the start.
        </p>
      </div>

      <section className="grid grid-stats">
        <div className="card">
          <div className="stat-label">Due now</div>
          <div className="stat-value">{summary.due}</div>
          <span className="small muted">{summary.due === 0 ? 'Nothing owing. Go learn something new.' : 'Retake the approach check.'}</span>
        </div>
        <div className="card">
          <div className="stat-label">Next 7 days</div>
          <div className="stat-value">{summary.next7}</div>
          <span className="small muted">Already scheduled</span>
        </div>
        <div className="card">
          <div className="stat-label">In rotation</div>
          <div className="stat-value">{summary.scheduled}</div>
          <span className="small muted">Problems with a review date</span>
        </div>
        <div className="card">
          <div className="stat-label">Settled</div>
          <div className="stat-value">
            {summary.mastered}
            <span className="muted" style={{ fontSize: '1rem' }}> / {summary.scheduled}</span>
          </div>
          <ProgressBar value={summary.mastered} max={Math.max(1, summary.scheduled)} label="Problems that survived every interval" />
        </div>
      </section>

      <section className="card">
        <h2>Due now</h2>
        {due.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Nothing is due. Attempt a problem and it joins the rotation automatically.
          </p>
        ) : (
          <Table items={due} showOverdue />
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="card">
          <h2>Coming up</h2>
          <Table items={upcoming} />
        </section>
      )}
    </main>
  );
}

function Table({ items, showOverdue = false }: { items: ReviewItem[]; showOverdue?: boolean }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Problem</th>
            <th>Pattern</th>
            <th>Last score</th>
            <th>Interval</th>
            <th>{showOverdue ? 'Waiting' : 'Due'}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.slug}>
              <td>
                <Link to={`/problems/${r.slug}?mode=pattern`}>{r.title}</Link>{' '}
                <DifficultyTag difficulty={r.difficulty} />
              </td>
              <td className="small">
                <Link to={`/patterns/${r.pattern}`}>{r.patternName}</Link>
              </td>
              <td className="mono small">{r.lastPercent}%</td>
              <td className="small muted">
                {r.step}/{r.of}
                {r.lapses > 0 && <span className="tag tag-warn" style={{ marginLeft: '0.4rem' }}>forgotten {r.lapses}×</span>}
              </td>
              <td className="small muted">{showOverdue ? dueLabel(r.overdueDays) : new Date(r.dueAt).toLocaleDateString()}</td>
              <td>
                <Link className="btn btn-sm" to={`/problems/${r.slug}?mode=pattern`}>
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function dueLabel(days: number): string {
  if (days <= 0) return 'today';
  return days === 1 ? '1 day late' : `${days} days late`;
}
