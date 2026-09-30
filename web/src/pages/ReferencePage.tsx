import { useState } from 'react';
import { Link } from 'react-router';
import { patternName } from '../../../shared/patterns/index.ts';
import {
  ASCII_ANCHORS,
  ASCII_BLOCKS,
  CHAR_TRICKS,
  formatCount,
  formatDuration,
  FORMULAS,
  FUNDAMENTAL_GROUPS,
  FUNDAMENTALS,
  GROWTH_FNS,
  GROWTH_SIZES,
  STRUCTURE_GROUPS,
  STRUCTURES,
  TOOLBOX,
  UNICODE_NOTES,
  verdict,
} from '../../../shared/reference/index.ts';
import type { Structure } from '../../../shared/reference/index.ts';
import { isPatternId } from '../../../shared/patterns/index.ts';

type Tab = 'structures' | 'java' | 'complexity' | 'maths' | 'ascii';

const TABS: { id: Tab; label: string; blurb: string }[] = [
  { id: 'structures', label: 'Data structures', blurb: 'What Java gives you, what each operation costs, and the methods that do the work.' },
  { id: 'java', label: 'Java fundamentals', blurb: 'The language traps that turn a correct approach into a wrong answer.' },
  { id: 'complexity', label: 'Complexity toolbox', blurb: 'Building blocks you can cite by name, and how to add them up.' },
  { id: 'maths', label: 'Maths cheat sheet', blurb: 'The arithmetic behind the Big-O, number theory, bits, geometry and randomness — each with where it turns up.' },
  { id: 'ascii', label: 'ASCII & characters', blurb: 'Characters are numbers. The codes worth knowing, and the char arithmetic string problems quietly depend on.' },
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
      {tab === 'ascii' && <Ascii />}
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
      <Growth />
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

/** What each complexity costs at real sizes, and how long that takes. */
function Growth() {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>What the letters cost</h2>
      <p className="small muted">
        Operations at each input size, and how long that takes at about 10⁸ simple operations a second. Green fits a
        1-second time limit; amber is borderline; red times out. Read your constraint, find its column, and this tells you
        which complexities are even allowed.
      </p>
      <div className="table-wrap">
        <table className="table growth">
          <thead>
            <tr>
              <th>Complexity</th>
              {GROWTH_SIZES.map((n) => (
                <th key={n} className="mono">
                  n = {formatCount(Math.log10(n))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROWTH_FNS.map((f) => (
              <tr key={f.label}>
                <td>
                  <strong className="mono small">{f.label}</strong>
                  <div className="tiny muted">{f.example}</div>
                </td>
                {GROWTH_SIZES.map((n) => {
                  const l = f.log10(n);
                  return (
                    <td key={n} className={`growth-${verdict(l)}`}>
                      <div className="mono small">{formatCount(l)}</div>
                      <div className="tiny">{formatDuration(l)}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Ascii() {
  return (
    <div className="stack">
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Four numbers to know by heart</h2>
        <div className="ascii-anchors">
          {ASCII_ANCHORS.map((a) => (
            <div key={a.char} className="ascii-anchor">
              <span className="mono ascii-anchor-char">{a.char}</span>
              <span className="mono ascii-anchor-code">{a.code}</span>
              <span className="tiny muted">{a.why}</span>
            </div>
          ))}
        </div>
      </section>

      {ASCII_BLOCKS.map((b) => (
        <section key={b.title} className="card">
          <div className="spread">
            <h2 style={{ margin: 0 }}>{b.title}</h2>
            <span className="tag mono">{b.range}</span>
          </div>
          <p className="small muted" style={{ margin: '0.4rem 0 0.7rem' }}>
            {b.blurb}
          </p>
          <div className="ascii-grid">
            {b.cells.map((c) => (
              <div key={c.code} className="ascii-cell" title={c.name ?? `code ${c.code}`}>
                <span className="mono ascii-char">{c.char}</span>
                <span className="mono ascii-code">{c.code}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Char arithmetic</h2>
        <p className="small muted">A char is a number, so you can add to it, subtract from it, and flip its bits.</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Java</th>
                <th>Gives</th>
                <th>Why it's useful</th>
              </tr>
            </thead>
            <tbody>
              {CHAR_TRICKS.map((t) => (
                <tr key={t.expr}>
                  <td className="mono small" style={{ whiteSpace: 'nowrap' }}>
                    {t.expr}
                  </td>
                  <td className="mono small" style={{ whiteSpace: 'nowrap' }}>
                    {t.gives}
                  </td>
                  <td className="small">
                    {t.note}
                    {t.caution && <div className="tiny" style={{ color: 'var(--warn)' }}>⚠ {t.caution}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>A char is not a byte</h2>
        <ul className="small" style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {UNICODE_NOTES.map((n) => (
            <li key={n} style={{ marginBottom: '0.35rem' }}>
              {n}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
