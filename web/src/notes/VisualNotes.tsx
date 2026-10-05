import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Trace } from '../../../shared/trace.ts';
import { traceToAnimation } from '../../../shared/trace.ts';
import { TracePlayer } from '../animation/AnimatedHint.tsx';
import { Loading } from '../components.tsx';
import type { SaveState } from './SketchPad.tsx';
import { TraceEditor } from './TraceEditor.tsx';

const SketchPad = lazy(() => import('./SketchPad.tsx'));

type Tool = 'trace' | 'sketch';

interface Props {
  slug: string;
  title: string;
  savedTrace: Trace | null;
  exampleInput: string | null;
  saveTrace: (t: Trace | null) => Promise<unknown>;
}

/**
 * The visual half of the notes: a dry run you build step by step, and a free
 * drawing canvas. Both open in a large window, because neither fits in a column.
 */
export function VisualNotes({ slug, title, savedTrace, exampleInput, saveTrace }: Props) {
  const [open, setOpen] = useState<Tool | null>(null);
  const [trace, setTrace] = useState<Trace | null>(savedTrace);
  const [traceStatus, setTraceStatus] = useState<SaveState>('idle');
  const [sketchStatus, setSketchStatus] = useState<SaveState>('idle');
  const [watch, setWatch] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ t: Trace | null } | null>(null);
  const save = useRef(saveTrace);
  useEffect(() => {
    save.current = saveTrace;
  });

  // A trace changes on every click; save once the clicking settles, and on the way out.
  const flushTrace = useRef(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const p = pending.current;
    pending.current = null;
    if (!p) return;
    setTraceStatus('saving');
    save.current(p.t)
      .then(() => setTraceStatus('saved'))
      .catch(() => setTraceStatus('error'));
  }).current;
  const onTrace = (t: Trace | null) => {
    setTrace(t);
    pending.current = { t };
    setTraceStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flushTrace, 700);
  };
  useEffect(() => flushTrace, [flushTrace]);

  const animation = useMemo(() => (watch && trace ? traceToAnimation(trace, `Dry run · ${title}`) : null), [watch, trace, title]);
  const close = useRef(() => {
    flushTrace();
    setOpen(null);
  }).current;

  return (
    <div className="visual-notes">
      <div className="spread">
        <strong className="small">Visualise it</strong>
        <span className="tiny muted">saved with this problem</span>
      </div>
      <p className="tiny muted" style={{ margin: '0.25rem 0 0' }}>
        Walk an example through the algorithm, one iteration at a time — pointers moving along the input, values going in and
        out of the set, map or stack — and play it back like an explainer video. Or sketch it freely.
      </p>
      <div className="row" style={{ gap: '0.4rem', marginTop: '0.5rem' }}>
        <button className="btn btn-sm btn-primary" onClick={() => setOpen('trace')}>
          ▶ {trace ? `Dry run (${trace.steps.length} step${trace.steps.length === 1 ? '' : 's'})` : 'Start a dry run'}
        </button>
        <button className="btn btn-sm" onClick={() => setOpen('sketch')}>
          ✎ Sketch canvas
        </button>
        {trace && (
          <button className="btn btn-sm btn-ghost" onClick={() => setWatch((w) => !w)} aria-pressed={watch}>
            {watch ? 'Hide video' : '🎬 Watch it'}
          </button>
        )}
      </div>
      {animation && (
        <div style={{ marginTop: '0.6rem' }}>
          <TracePlayer animation={animation} />
        </div>
      )}

      {open && (
        <Window title={title} tool={open} onTool={setOpen} onClose={close} status={open === 'trace' ? traceStatus : sketchStatus}>
          {/* Kept mounted while you sketch, so the step you were on is still there when you come back. */}
          <div hidden={open !== 'trace'}>
            <TraceEditor saved={trace} exampleInput={exampleInput} onChange={onTrace} />
          </div>
          {open === 'sketch' && (
            <Suspense fallback={<Loading label="Loading the drawing canvas…" />}>
              <SketchPad slug={slug} onStatus={setSketchStatus} />
            </Suspense>
          )}
        </Window>
      )}
    </div>
  );
}

function Window({
  title,
  tool,
  onTool,
  onClose,
  status,
  children,
}: {
  title: string;
  tool: Tool;
  onTool: (t: Tool) => void;
  onClose: () => void;
  status: SaveState;
  children: React.ReactNode;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // Once, on open: focus inside the window, close on Escape, and keep the page behind still.
  useEffect(() => {
    // Something inside may have taken focus already (the first field of a new dry run).
    if (!box.current?.contains(document.activeElement)) closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // The canvas uses Escape itself (to finish a label, to deselect), so only close from outside it.
      // The path, not target.closest(): finishing a label removes its text box before the event gets here.
      const inCanvas = e.composedPath().some((n) => n instanceof Element && n.classList.contains('sketchpad'));
      if (e.key === 'Escape' && !inCanvas) onClose();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const label = { idle: '', saving: 'Saving…', saved: 'Saved ✓', error: "Couldn't save" }[status];

  // On <body>, so no card or animation on the page can trap it under the header.
  return createPortal(
    <div className="vn-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} className="vn-window" role="dialog" aria-modal="true" aria-label={`Visual notes for ${title}`}>
        <div className="vn-head">
          <div className="tabs" role="tablist" style={{ margin: 0, borderBottom: 'none' }}>
            <button role="tab" aria-selected={tool === 'trace'} className={tool === 'trace' ? 'active' : ''} onClick={() => onTool('trace')}>
              Dry run
            </button>
            <button role="tab" aria-selected={tool === 'sketch'} className={tool === 'sketch' ? 'active' : ''} onClick={() => onTool('sketch')}>
              Sketch
            </button>
          </div>
          <span className="small muted vn-title">{title}</span>
          <span className={`tiny ${status === 'error' ? 'delta-down' : 'muted'}`} role="status">
            {label}
          </span>
          <button ref={closeButton} className="btn btn-sm" onClick={onClose} title="Close (Esc)">
            Close
          </button>
        </div>
        <div className={`vn-body${tool === 'sketch' ? ' is-canvas' : ''}`}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
