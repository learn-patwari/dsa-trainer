import { useEffect, useMemo, useRef, useState } from 'react';
import {
  copyStep,
  newTrace,
  parseInput,
  STRUCTURE_KINDS,
  stepFrame,
  TRACE_LIMITS,
  traceToAnimation,
  type StructureKind,
  type Trace,
  type TraceItem,
  type TraceStep,
  type TraceStructure,
} from '../../../shared/trace.ts';
import { TracePlayer } from '../animation/AnimatedHint.tsx';
import { Scene } from '../animation/Scene.tsx';

interface Props {
  saved: Trace | null;
  /** Example 1's first input line from LeetCode, to start the trace from. */
  exampleInput: string | null;
  onChange: (trace: Trace | null) => void;
}

/**
 * Build a dry run one iteration at a time: move the pointers, change what the
 * data structures hold, say what happened — then play it back like a video.
 */
export function TraceEditor({ saved, exampleInput, onChange }: Props) {
  const [trace, setTrace] = useState<Trace | null>(saved);
  const [at, setAt] = useState(0);
  const [selected, setSelected] = useState<string | null>(saved?.pointers.at(-1) ?? null);
  const [mode, setMode] = useState<'move' | 'highlight'>('move');
  const [advance, setAdvance] = useState<string>(saved?.pointers.at(-1) ?? '');
  const [playing, setPlaying] = useState(false);
  // Built only while it plays, and only again when the trace changes, so a re-render doesn't restart the frame.
  const animation = useMemo(() => (trace && playing ? traceToAnimation(trace, 'Your dry run') : null), [trace, playing]);

  const update = (next: Trace | null) => {
    setTrace(next);
    onChange(next);
  };

  if (!trace) return <Setup exampleInput={exampleInput} onStart={(t) => { update(t); setAt(0); setSelected(t.pointers.at(-1) ?? null); setAdvance(t.pointers.at(-1) ?? ''); }} />;

  const step = trace.steps[Math.min(at, trace.steps.length - 1)]!;
  const cells = parseInput(trace.input).values;

  /** Every edit replaces the current step with a changed copy. */
  const editStep = (fn: (s: TraceStep) => void) => {
    const steps = trace.steps.map((s, i) => {
      if (i !== at) return s;
      const c: TraceStep = { ...s, pointers: { ...s.pointers }, highlight: [...s.highlight], data: { ...s.data } };
      fn(c);
      return c;
    });
    update({ ...trace, steps });
  };

  /** Item ids only need to be unique within the trace; they let a kept item stay put while a new one animates in. */
  const newId = (): string => `i${crypto.randomUUID().slice(0, 8)}`;

  const place = (index: number) => {
    if (mode === 'highlight') {
      editStep((s) => {
        s.highlight = s.highlight.includes(index) ? s.highlight.filter((h) => h !== index) : [...s.highlight, index];
      });
    } else if (selected) {
      editStep((s) => {
        s.pointers[selected] = index;
      });
    }
  };

  const nudge = (p: string, by: number) =>
    editStep((s) => {
      const cur = s.pointers[p];
      const next = (cur ?? -1) + by;
      s.pointers[p] = Math.max(0, Math.min(cells.length - 1, next));
    });

  const atLimit = trace.steps.length >= TRACE_LIMITS.steps;
  const addStep = () => {
    if (atLimit) return;
    const next = copyStep(step);
    if (advance && next.pointers[advance] != null) next.pointers[advance] = Math.min(cells.length - 1, (next.pointers[advance] as number) + 1);
    const steps = [...trace.steps.slice(0, at + 1), next, ...trace.steps.slice(at + 1)];
    update({ ...trace, steps });
    setAt(at + 1);
  };

  const deleteStep = () => {
    if (trace.steps.length === 1) return;
    const steps = trace.steps.filter((_, i) => i !== at);
    update({ ...trace, steps });
    setAt(Math.max(0, at - 1));
  };

  const frame = stepFrame(trace, step, at);

  return (
    <div className="tracer">
      {playing && animation && (
        <div className="tracer-play">
          <TracePlayer animation={animation} />
          <button className="btn btn-sm" onClick={() => setPlaying(false)} style={{ marginTop: '0.5rem' }}>
            ← Back to editing
          </button>
        </div>
      )}

      <div className="tracer-bar">
        <div className="row" style={{ gap: '0.35rem' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setAt(Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous step">
            ◀
          </button>
          <strong className="small">
            Step {at + 1} of {trace.steps.length}
          </strong>
          <button className="btn btn-sm btn-ghost" onClick={() => setAt(Math.min(trace.steps.length - 1, at + 1))} disabled={at === trace.steps.length - 1} aria-label="Next step">
            ▶
          </button>
        </div>
        <div className="row" style={{ gap: '0.35rem' }}>
          <button
            className="btn btn-sm btn-primary"
            onClick={addStep}
            disabled={atLimit}
            title={atLimit ? `A trace holds up to ${TRACE_LIMITS.steps} steps` : 'Copy this state into a new step, as the next loop iteration would'}
          >
            ＋ Next iteration
          </button>
          {trace.pointers.length > 0 && (
            <label className="tiny muted row" style={{ gap: '0.25rem' }}>
              and move
              <select className="input tracer-select" value={advance} onChange={(e) => setAdvance(e.target.value)}>
                <option value="">nothing</option>
                {trace.pointers.map((p) => (
                  <option key={p} value={p}>
                    {p} + 1
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="btn btn-sm btn-ghost" onClick={deleteStep} disabled={trace.steps.length === 1}>
            Delete step
          </button>
          <button className="btn btn-sm" onClick={() => setPlaying(true)}>
            ▶ Play as video
          </button>
        </div>
      </div>

      <div className="tracer-grid">
        <section>
          <div className="tracer-pointers">
            {trace.pointers.map((p) => (
              <div key={p} className={`tracer-pointer${selected === p && mode === 'move' ? ' is-selected' : ''}`}>
                <button type="button" className="tracer-pointer-name" onClick={() => { setSelected(p); setMode('move'); }} aria-pressed={selected === p}>
                  {p}
                </button>
                <span className="mono small">{step.pointers[p] ?? '—'}</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => nudge(p, -1)} aria-label={`Move ${p} left`}>
                  ←
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => nudge(p, 1)} aria-label={`Move ${p} right`}>
                  →
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => editStep((s) => { s.pointers[p] = null; })} title={`Take ${p} off the array`}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className={`btn btn-sm${mode === 'highlight' ? ' btn-primary' : ''}`} onClick={() => setMode(mode === 'highlight' ? 'move' : 'highlight')}>
              ✦ Highlight cells
            </button>
            {trace.pointers.length >= 2 && (
              <label className="small row" style={{ gap: '0.3rem' }}>
                <input type="checkbox" checked={step.window} onChange={(e) => editStep((s) => { s.window = e.target.checked; })} />
                window {trace.pointers[0]}…{trace.pointers[1]}
              </label>
            )}
          </div>
          <p className="tiny muted" style={{ margin: '0.3rem 0 0.4rem' }}>
            {mode === 'highlight' ? 'Click cells to mark them for this step.' : selected ? `Click a cell to move ${selected} there.` : 'Pick a pointer, then click a cell.'}
          </p>

          {/* The same stage the video plays on, so what you edit is what you will watch. */}
          <div
            className="tracer-preview anim-player is-stage"
            onClick={(e) => {
              const cell = (e.target as HTMLElement).closest('.kind-array .anim-cell');
              const block = cell?.closest('.kind-array');
              // Only the input array places pointers; a List structure is also drawn as an array.
              if (!cell || !block || block !== e.currentTarget.querySelector('.kind-array')) return;
              place([...cell.parentElement!.children].indexOf(cell));
            }}
          >
            <Scene layers={frame.layers} />
          </div>

          <label className="small" style={{ display: 'block', marginTop: '0.6rem' }}>
            What happens in this iteration
            <textarea
              className="input"
              rows={3}
              maxLength={1000}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              placeholder={`e.g. s[R] = '${cells[step.pointers[trace.pointers.at(-1) ?? ''] ?? 0] ?? 'b'}' is already in the set, so shrink from L`}
              value={step.note}
              onChange={(e) => editStep((s) => { s.note = e.target.value; })}
            />
          </label>
        </section>

        <section className="stack" style={{ gap: '0.6rem' }}>
          {trace.structures.map((ds) => (
            <StructureEditor
              key={ds.id}
              ds={ds}
              items={step.data[ds.id] ?? []}
              onItems={(items) => editStep((s) => { s.data[ds.id] = items; })}
              newId={newId}
              onRename={(label) => update({ ...trace, structures: trace.structures.map((x) => (x.id === ds.id ? { ...x, label } : x)) })}
            />
          ))}
          {trace.structures.length < TRACE_LIMITS.structures && <AddStructure
            onAdd={(kind) => {
              const id = `ds${crypto.randomUUID().slice(0, 8)}`;
              const label = STRUCTURE_KINDS.find((k) => k.kind === kind)!.label;
              update({
                ...trace,
                structures: [...trace.structures, { id, kind, label }],
                steps: trace.steps.map((s) => ({ ...s, data: { ...s.data, [id]: [] } })),
              });
            }}
          />}
          <button
            className="btn btn-sm btn-ghost"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              if (confirm('Throw this dry run away and start a new one?')) update(null);
            }}
          >
            Start over
          </button>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- one data structure

function StructureEditor({
  ds,
  items,
  onItems,
  newId,
  onRename,
}: {
  ds: TraceStructure;
  items: TraceItem[];
  onItems: (items: TraceItem[]) => void;
  newId: () => string;
  onRename: (label: string) => void;
}) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const keyed = ds.kind === 'map' || ds.kind === 'vars';

  const say = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };

  const primary = () => {
    const v = value.trim();
    if (keyed) {
      const k = key.trim();
      if (!k) return say(ds.kind === 'vars' ? 'Name the variable first.' : 'A map entry needs a key.');
      const existing = items.find((it) => it.k === k);
      if (!existing && items.length >= TRACE_LIMITS.items) return say(`A structure holds up to ${TRACE_LIMITS.items} entries here.`);
      onItems(existing ? items.map((it) => (it.k === k ? { ...it, v } : it)) : [...items, { id: newId(), k, v }]);
      if (existing) say(`${k} updated — put() on an existing key replaces the value.`);
      setKey('');
      setValue('');
      return;
    }
    if (!v) return;
    if (ds.kind === 'set' && items.some((it) => it.v === v)) return say(`${v} is already in the set — add() returns false.`);
    if (items.length >= TRACE_LIMITS.items) return say(`A structure holds up to ${TRACE_LIMITS.items} items here.`);
    onItems([...items, { id: newId(), v }]);
    setValue('');
  };

  const removeLast = () => {
    if (items.length === 0) return say(ds.kind === 'stack' ? 'pop() on an empty stack throws.' : 'Nothing to remove.');
    onItems(items.slice(0, -1));
  };
  const poll = () => {
    if (items.length === 0) return say('poll() on an empty queue returns null.');
    onItems(items.slice(1));
  };

  const verb = { set: 'add', map: 'put', stack: 'push', queue: 'offer', list: 'append', vars: 'set' }[ds.kind];

  return (
    <div className="tracer-ds">
      <div className="spread">
        <input className="tracer-ds-label" value={ds.label} maxLength={40} onChange={(e) => onRename(e.target.value)} aria-label="Structure name" />
        <span className="tag tiny">{STRUCTURE_KINDS.find((k) => k.kind === ds.kind)!.label}</span>
      </div>
      <div className="tracer-items">
        {items.length === 0 && <span className="tiny muted">empty</span>}
        {(ds.kind === 'stack' ? [...items].reverse() : items).map((it) => (
          <span key={it.id} className="tracer-chip">
            <span className="mono">{keyed ? `${it.k} ${ds.kind === 'vars' ? '=' : '→'} ${it.v}` : it.v}</span>
            <button type="button" onClick={() => onItems(items.filter((x) => x.id !== it.id))} aria-label={`Remove ${it.v}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="row" style={{ gap: '0.3rem' }}>
        {keyed && <input className="input tracer-input" placeholder={ds.kind === 'vars' ? 'name' : 'key'} maxLength={100} value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && primary()} />}
        <input className="input tracer-input" placeholder="value" maxLength={100} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && primary()} />
        <button type="button" className="btn btn-sm" onClick={primary}>
          {verb}
        </button>
        {ds.kind === 'stack' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={removeLast}>
            pop
          </button>
        )}
        {ds.kind === 'queue' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={poll}>
            poll
          </button>
        )}
        {ds.kind === 'list' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={removeLast}>
            remove last
          </button>
        )}
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => onItems([])} disabled={items.length === 0}>
          clear
        </button>
      </div>
      {flash && <div className="tiny tracer-flash">{flash}</div>}
    </div>
  );
}

function AddStructure({ onAdd }: { onAdd: (kind: StructureKind) => void }) {
  return (
    <div className="row" style={{ gap: '0.3rem' }}>
      <span className="tiny muted">Add:</span>
      {STRUCTURE_KINDS.map((k) => (
        <button key={k.kind} type="button" className="btn btn-sm btn-ghost" onClick={() => onAdd(k.kind)} title={k.hint}>
          + {k.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- the first screen

function Setup({ exampleInput, onStart }: { exampleInput: string | null; onStart: (t: Trace) => void }) {
  const [input, setInput] = useState(exampleInput ?? '');
  const [pointers, setPointers] = useState('L, R');
  const [kinds, setKinds] = useState<StructureKind[]>(['set']);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  const parsed = useMemo(() => parseInput(input), [input]);
  // Short, distinct names: they label the arrows under the cells.
  const names = [
    ...new Set(
      pointers
        .split(',')
        .map((p) => p.trim().slice(0, 12))
        .filter(Boolean),
    ),
  ].slice(0, TRACE_LIMITS.pointers);

  return (
    <div className="tracer-setup stack" style={{ gap: '0.8rem' }}>
      <p className="small" style={{ margin: 0 }}>
        Trace the algorithm the way a video explains it: one iteration at a time, moving the pointers and changing what
        the data structures hold. It is saved with this problem's notes.
      </p>
      <label className="small">
        Input — a string or an array
        <input
          ref={inputRef}
          className="input"
          style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          maxLength={2000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='abcdbcbb   or   [2, 7, 11, 15]'
        />
        <span className="tiny muted">
          {parsed.values.length > 0 ? `${parsed.values.length} ${parsed.kind === 'string' ? 'characters' : 'values'}` : 'Brackets or commas make an array; anything else is read as a string.'}
          {exampleInput && input !== exampleInput && (
            <>
              {' · '}
              <button type="button" className="linkish" onClick={() => setInput(exampleInput)}>
                use example 1
              </button>
            </>
          )}
        </span>
      </label>
      <label className="small">
        Pointers
        <input className="input" style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} value={pointers} onChange={(e) => setPointers(e.target.value)} placeholder="L, R" />
        <span className="tiny muted">Comma-separated. The window is drawn between the first two. Leave empty for none.</span>
      </label>
      <div className="small">
        Data structures
        <div className="row" style={{ gap: '0.35rem', marginTop: '0.3rem' }}>
          {STRUCTURE_KINDS.map((k) => {
            const on = kinds.includes(k.kind);
            return (
              <button
                key={k.kind}
                type="button"
                className={`chip${on ? ' selected' : ''}`}
                aria-pressed={on}
                title={k.hint}
                onClick={() => setKinds(on ? kinds.filter((x) => x !== k.kind) : [...kinds, k.kind])}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <button className="btn btn-primary" disabled={parsed.values.length === 0} onClick={() => onStart(newTrace(input, names, kinds))}>
          Start tracing
        </button>
      </div>
    </div>
  );
}
