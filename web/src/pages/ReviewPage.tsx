import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { DelayedItem, ReviewItem, ReviewSummary } from '../../../shared/types.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag, ErrorBox, Loading, ProgressBar } from '../components.tsx';
import { AllProblems } from './AllProblems.tsx';

type Tab = 'problems' | 'solved' | 'review';

/**
 * Your problems in one place: the ones still to do, the ones you've done, and the
 * spaced-repetition queue of what you'd otherwise quietly forget.
 */
export function ReviewPage() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = (['problems', 'solved', 'review'] as const).find((t) => t === params.get('tab')) ?? 'problems';
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });

  const review = useLoad(api.review, []);
  const state = useLoad(api.state, []);

  // "Solved" means you have attempted the approach check here, or solved it on LeetCode.
  const { todo, done } = useMemo(() => {
    const all = state.data?.problems ?? [];
    const isDone = (p: (typeof all)[number]) => p.attempts > 0 || p.lcSolved;
    return { todo: all.filter((p) => !isDone(p)), done: all.filter(isDone) };
  }, [state.data]);

  const error = review.error ?? state.error;
  if (error) {
    return (
      <main className="page">
        <ErrorBox
          message={error}
          onRetry={() => {
            review.reload();
            state.reload();
          }}
        />
      </main>
    );
  }
  if (!review.data || !state.data) return <main className="page"><Loading /></main>;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'problems', label: `Problems (${todo.length})` },
    { id: 'solved', label: `Solved (${done.length})` },
    { id: 'review', label: reviewLabel(review.data.summary.due, review.data.delayed.length) },
  ];

  return (
    <main className="page stack">
      <div>
        <h1>Review</h1>
        <p className="muted" style={{ margin: 0 }}>
          What is left to do, what you have done, and what is due for another look.
        </p>
      </div>

      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'problems' && (
        <AllProblems
          problems={todo}
          title="Problems to do"
          intro="Problems you haven't attempted here and haven't solved on LeetCode."
          emptyText={todo.length === 0 ? 'You have been through every problem. Use the Review tab to keep them fresh.' : undefined}
          showStatus={false}
        />
      )}
      {tab === 'solved' && (
        <AllProblems
          problems={done}
          title="Solved"
          intro="Problems you have attempted here or solved on LeetCode. Open one to retake it as practice."
          emptyText={done.length === 0 ? 'Nothing yet. Attempt a problem and it shows up here.' : undefined}
          showStatus={false}
        />
      )}
      {tab === 'review' && <ReviewQueue data={review.data} />}
    </main>
  );
}

/** The spaced-repetition queue: due now, then what is coming up. */
function ReviewQueue({ data }: { data: { summary: ReviewSummary; due: ReviewItem[]; upcoming: ReviewItem[]; delayed: DelayedItem[]; hasPlan: boolean } }) {
  const { summary, due, upcoming, delayed, hasPlan } = data;
  return (
    <>
      {delayed.length > 0 ? (
        <section className="card">
          <div className="spread">
            <h2 style={{ margin: 0 }}>Delayed from your plan ({delayed.length})</h2>
            <span className="small muted">Oldest first</span>
          </div>
          <p className="small muted">
            Your study plan wanted these done on days that have passed. They stay here, getting later each day, until you attempt them.
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Pattern</th>
                  <th>Delayed by</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {delayed.map((d) => (
                  <tr key={d.slug}>
                    <td>
                      <Link to={`/problems/${d.slug}?mode=pattern`}>{d.title}</Link> <DifficultyTag difficulty={d.difficulty} />
                      {d.source && <span className="tag" style={{ marginLeft: '0.4rem' }}>{d.source}</span>}
                    </td>
                    <td className="small">
                      <Link to={`/patterns/${d.pattern}`}>{d.patternName}</Link>
                    </td>
                    <td>
                      <span className="tag tag-warn">{d.daysLate === 1 ? '1 day' : `${d.daysLate} days`}</span>
                    </td>
                    <td>
                      <Link className="btn btn-sm btn-primary" to={`/problems/${d.slug}?mode=pattern`}>
                        Do it now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          {hasPlan
            ? 'You are on schedule: no problems are delayed.'
            : 'Start a study plan on the dashboard and any day you miss will move its problems here, with how many days they are delayed.'}
        </p>
      )}

      <p className="muted" style={{ margin: 0 }}>
        Solving a problem once doesn't keep it. Every attempt schedules the next one — a day later, then three, a week, three weeks,
        two months — and a weak score sends a problem back to the start.
      </p>

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
    </>
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

function reviewLabel(due: number, delayed: number): string {
  const parts = [`${due} due`];
  if (delayed > 0) parts.push(`${delayed} late`);
  return `Review (${parts.join(', ')})`;
}

function dueLabel(days: number): string {
  if (days <= 0) return 'today';
  return days === 1 ? '1 day late' : `${days} days late`;
}
