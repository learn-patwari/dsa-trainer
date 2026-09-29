import { Link } from 'react-router';
import { PATTERNS } from '../../../shared/patterns/index.ts';
import { PORTALS } from '../links.ts';

/**
 * The prep guide: how to use this app, in what order, at what pace, and which
 * of the well-known portals to open when this one runs out of road.
 */
export function GuidePage() {
  const groups = [...new Set(PATTERNS.map((p) => p.group))];

  return (
    <main className="page stack">
      <div>
        <h1>The guide</h1>
        <p className="muted" style={{ margin: 0 }}>
          What to do, in what order, and where to go when you need more than this app has. Everything below is the
          consensus of the lists people actually use — NeetCode's roadmap, Striver's A2Z sheet and Grind 75 — adapted to
          the way this app rates you.
        </p>
      </div>

      <section className="card">
        <h2>The loop</h2>
        <p className="small muted">One problem, start to finish. It takes 20–40 minutes and it is the whole method.</p>
        <ol className="stack" style={{ gap: '0.6rem', paddingLeft: '1.2rem', margin: 0 }}>
          <li>
            <strong>Read the lesson first</strong> — <Link to="/patterns">Patterns</Link> lists the cues that give each
            one away. You are learning to recognise, not to memorise.
          </li>
          <li>
            <strong>Attempt the approach check before you write any code.</strong> Name the brute force and its cost,
            then the insight that beats it, then the complexity, then the edge cases. This is the order interviewers
            ask in, and it is where most people lose the round.
          </li>
          <li>
            <strong>Now write the Java</strong> in the editor tab and press Compile &amp; run. The check isn't graded
            until your code compiles: naming an approach is cheap until you've written it. Passing the example tests
            doesn't change your rating — that stays a measure of the approach — but compiling is the price of entry.
          </li>
          <li>
            <strong>Solve two of that pattern on LeetCode for real</strong>, under a clock, in the real editor. A
            pattern here only counts as complete when you have. Quizzes measure recognition; only typing measures recall.
          </li>
          <li>
            <strong>Come back when Review says so.</strong> Nothing you solve today survives a month untouched.
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>Order to learn in</h2>
        <p className="small muted">
          Each stage uses the one before it. Sliding window is two pointers with a rule; graphs are BFS/DFS on a
          different container; DP is recursion you stopped repeating. Skipping ahead is why DP feels impossible.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Patterns</th>
                <th>Why here</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, i) => (
                <tr key={group}>
                  <td>
                    <strong>{i + 1}</strong>
                  </td>
                  <td className="small">
                    {PATTERNS.filter((p) => p.group === group).map((p, j, all) => (
                      <span key={p.id}>
                        <Link to={`/patterns/${p.id}`}>{p.name}</Link>
                        {j < all.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </td>
                  <td className="small muted">{STAGE_WHY[group] ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Pace</h2>
        <div className="grid grid-3">
          <div className="card card-flat">
            <div className="stat-label">How long</div>
            <p className="small" style={{ margin: '0.4rem 0 0' }}>
              At 8 hours a week, ~75 problems takes about 8 weeks; the full 197 here is a 4–6 month project. Three to
              five problems a day is the pace people finish at — more than that and nothing sticks.
            </p>
          </div>
          <div className="card card-flat">
            <div className="stat-label">Per problem</div>
            <p className="small" style={{ margin: '0.4rem 0 0' }}>
              Interview budgets: <strong>Easy ~15 min</strong>, <strong>Medium ~25–30 min</strong>,{' '}
              <strong>Hard ~40 min</strong>. If you're stuck at 25 minutes with no idea, read the editorial — staring
              longer teaches nothing.
            </p>
          </div>
          <div className="card card-flat">
            <div className="stat-label">Daily shape</div>
            <p className="small" style={{ margin: '0.4rem 0 0' }}>
              Clear <Link to="/review">Review</Link> first, then new problems from Up next. Reviews are short and they
              are the reason week 12 doesn't erase week 2.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>In the room</h2>
        <ol className="small stack" style={{ gap: '0.35rem', paddingLeft: '1.2rem', margin: 0 }}>
          <li>Repeat the problem back and ask about input size, duplicates, empties and ranges. Never start cold.</li>
          <li>Say the brute force out loud with its complexity, then say why it isn't good enough. Never skip this.</li>
          <li>Propose the better approach and get agreement <em>before</em> writing code.</li>
          <li>Code it while narrating; leave the clever micro-optimisation out.</li>
          <li>Dry-run your own code on one small case and one edge case, out loud.</li>
          <li>State the final time and space, and what you'd change with more time.</li>
        </ol>
        <div className="callout" style={{ marginTop: '0.75rem' }}>
          <span className="small">
            The approach check here asks exactly steps 2, 3, 6 and the edge cases from step 1 — because those are the
            parts you can practise alone, and the parts candidates skip.
          </span>
        </div>
      </section>

      <section className="card">
        <h2>How the rating works</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Each pattern has its own Elo rating starting at 1200. A problem is an opponent rated 1200 (Easy), 1500
          (Medium) or 1800 (Hard), and your score is the result of the match. Only your <strong>first</strong> attempt
          at a problem is rated — after that you've seen the answer, so retakes are practice and feed the review
          schedule instead. A rating below 1250 means the pattern hasn't started; 1700+ means you recognise it cold.
        </p>
      </section>

      <section className="stack">
        <div>
          <h2 style={{ margin: 0 }}>Where else to go</h2>
          <p className="small muted" style={{ margin: '0.25rem 0 0' }}>
            This app trains recognition and approach. These cover the rest: volume, second explanations, live pressure,
            and the parts of the loop that aren't algorithms.
          </p>
        </div>
        {PORTALS.map((section) => (
          <section key={section.group} className="card">
            <h3 style={{ marginTop: 0 }}>{section.group}</h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>What it is</th>
                    <th>When to use it</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((p) => (
                    <tr key={p.name}>
                      <td style={{ minWidth: '11rem' }}>
                        <a href={p.href} target="_blank" rel="noreferrer">
                          {p.name} ↗
                        </a>
                        <div>
                          <span className={`tag ${p.cost === 'Free' ? 'tag-good' : p.cost === 'Paid' ? 'tag-warn' : ''}`}>{p.cost}</span>
                        </div>
                      </td>
                      <td className="small">{p.what}</td>
                      <td className="small muted">{p.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}

const STAGE_WHY: Record<string, string> = {
  'Arrays & Strings': 'Index arithmetic and hash counting. Everything later assumes these are automatic.',
  'Stacks & Linked Lists': 'Pointer surgery and last-in-first-out bookkeeping, on the smallest structures that need them.',
  'Trees & Heaps': 'Your first recursion that returns a value up the call stack, plus ordering by priority.',
  'Greedy & Backtracking': 'Choosing at each step: commit and never look back, or try it and undo.',
  Graphs: 'Trees without the guarantee of no cycles. BFS/DFS again, now with a visited set.',
  'Dynamic Programming': "Recursion with the repeats removed. It needs everything above it, which is why it's last.",
  Specialized: 'Structures worth knowing that show up in one round out of ten.',
};
