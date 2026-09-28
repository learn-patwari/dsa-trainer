import { useState } from 'react';
import { Link } from 'react-router';
import { patternName } from '../../../shared/patterns/index.ts';
import { FORMULAS, FUNDAMENTAL_GROUPS, FUNDAMENTALS, STRUCTURE_GROUPS, STRUCTURES, TOOLBOX } from '../../../shared/reference/index.ts';
import type { Structure } from '../../../shared/reference/index.ts';
import { isPatternId } from '../../../shared/patterns/index.ts';

type Tab = 'structures' | 'java' | 'complexity' | 'maths';

const TABS: { id: Tab; label: string; blurb: string }[] = [
  { id: 'structures', label: 'Data structures', blurb: 'What Java gives you, what each operation costs, and the methods that do the work.' },
  { id: 'java', label: 'Java fundamentals', blurb: 'The language traps that turn a correct approach into a wrong answer.' },
  { id: 'complexity', label: 'Complexity toolbox', blurb: 'Building blocks you can cite by name, and how to add them up.' },
  { id: 'maths', label: 'Maths cheat sheet', blurb: 'The arithmetic behind the Big-O, and how to size an input from its constraints.' },
];

/** The reference half of the app: everything you should know before the quiz asks. */
export function ReferencePage() {
  const [tab, setTab] = useState<Tab>('structures');
  const [filter, setFilter] = useState('');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <main className="page stack">
      <div>
        <h1>Reference</h1>
        <p className="muted" style={{ margin: 0 }}>
          The facts the approach check assumes you already have. Nothing here is graded — it's the sheet you'd want open
          the night before.
        </p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: '-0.5rem' }}>
        {active.blurb}
      </p>

      {tab === 'structures' && <Structures filter={filter} setFilter={setFilter} />}
      {tab === 'java' && <Fundamentals />}
      {tab === 'complexity' && <Complexity />}
      {tab === 'maths' && <Maths />}
    </main>
  );
}

function Structures({ filter, setFilter }: { filter: string; setFilter: (s: string) => void }) {
  const q = filter.trim().toLowerCase();
  const matches = (s: Structure) =>
    !q ||
    s.name.toLowerCase().includes(q) ||
    s.summary.toLowerCase().includes(q) ||
    s.methods.some((m) => m.signature.toLowerCase().includes(q));

  return (
    <div className="stack">
      <input
        className="input"
        placeholder="Filter by name or method — e.g. computeIfAbsent, floorKey, deque"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter data structures"
      />
      {STRUCTURE_GROUPS.map((group) => {
        const items = STRUCTURES.filter((s) => s.group === group && matches(s));
        if (items.length === 0) return null;
        return (
          <section key={group} className="stack">
            <div className="pattern-group-label">{group}</div>
            {items.map((s) => (
              <StructureCard key={s.id} s={s} />
            ))}
          </section>
        );
      })}
      {STRUCTURES.filter(matches).length === 0 && <div className="card empty">Nothing matches "{filter}".</div>}
    </div>
  );
}

function StructureCard({ s }: { s: Structure }) {
  return (
    <section className="card">
      <div className="spread">
        <h2 style={{ margin: 0 }}>{s.name}</h2>
        <div className="row small">
          {s.patterns?.filter(isPatternId).map((p) => (
            <Link key={p} to={`/patterns/${p}`} className="tag tag-accent">
              {patternName(p)}
            </Link>
          ))}
        </div>
      </div>
      <p className="small" style={{ margin: '0.4rem 0 0.8rem' }}>
        {s.summary}
      </p>

      <div className="split-ref">
        <div>
          <h3 className="ref-h">Cost</h3>
          <table className="table">
            <tbody>
              {s.costs.map((c) => (
                <tr key={c.operation}>
                  <td className="small">{c.operation}</td>
                  <td className="mono small" style={{ whiteSpace: 'nowrap' }}>
                    {c.cost}
                  </td>
                  <td className="tiny muted">{c.note ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="ref-h">Watch out</h3>
          <ul className="small" style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {s.gotchas.map((g) => (
              <li key={g} style={{ marginBottom: '0.3rem' }}>
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="ref-h">Use it when</h3>
          <ul className="small" style={{ margin: '0 0 0.8rem', paddingLeft: '1.1rem' }}>
            {s.useWhen.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>

          <h3 className="ref-h">Methods to know</h3>
          <dl className="ref-methods">
            {s.methods.map((m) => (
              <div key={m.signature}>
                <dt className="mono small">{m.signature}</dt>
                <dd className="small">
                  {m.what}
                  {m.why && <div className="tiny muted">{m.why}</div>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Fundamentals() {
  return (
    <div className="stack">
      {FUNDAMENTAL_GROUPS.map((group) => (
        <section key={group} className="stack">
          <div className="pattern-group-label">{group}</div>
          {FUNDAMENTALS.filter((f) => f.group === group).map((f) => (
            <section key={f.id} className="card">
              <h2 style={{ margin: '0 0 0.3rem' }}>{f.title}</h2>
              <p className="small" style={{ margin: '0 0 0.6rem' }}>
                {f.rule}
              </p>
              {f.code && <pre className="ref-code">{f.code}</pre>}
              <p className="small muted" style={{ margin: '0.6rem 0 0' }}>
                <strong>Why it matters:</strong> {f.matters}
              </p>
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}

function Complexity() {
  return (
    <div className="stack">
      {TOOLBOX.map((g) => (
        <section key={g.group} className="card">
          <h2 style={{ marginTop: 0 }}>{g.group}</h2>
          <p className="small muted">{g.blurb}</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Routine</th>
                  <th>Time</th>
                  <th>Space</th>
                  <th>What to say</th>
                </tr>
              </thead>
              <tbody>
                {g.routines.map((r) => (
                  <tr key={r.name}>
                    <td>
                      <strong className="small">{r.name}</strong>
                      {r.call && <div className="mono tiny muted">{r.call}</div>}
                    </td>
                    <td className="mono small" style={{ whiteSpace: 'nowrap' }}>
                      {r.time}
                    </td>
                    <td className="mono small" style={{ whiteSpace: 'nowrap' }}>
                      {r.space}
                    </td>
                    <td className="small muted">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function Maths() {
  return (
    <div className="stack">
      {FORMULAS.map((g) => (
        <section key={g.group} className="card">
          <h2 style={{ marginTop: 0 }}>{g.group}</h2>
          <p className="small muted">{g.blurb}</p>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {g.formulas.map((f) => (
                  <tr key={f.name}>
                    <td className="small" style={{ width: '12rem' }}>
                      <strong>{f.name}</strong>
                    </td>
                    <td className="mono small">{f.expression}</td>
                    <td className="small muted">{f.useFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
