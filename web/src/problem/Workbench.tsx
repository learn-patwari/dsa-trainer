import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

/** Debounced autosave that also flushes a pending edit when the component unmounts. */
export function useAutosave(save: (v: string) => Promise<unknown>): [SaveStatus, (v: string) => void] {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const v = pending.current;
    pending.current = null;
    if (v == null) return;
    saveRef
      .current(v)
      .then(() => {
        if (pending.current == null) setStatus('saved'); // a newer edit may already be waiting
      })
      .catch(() => setStatus('error'));
  };

  const edit = (v: string) => {
    pending.current = v;
    setStatus('pending');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => flush(), []);
  return [status, edit];
}

export function StatusText({ status }: { status: SaveStatus }) {
  const text = { idle: '', pending: 'Saving…', saved: 'Saved', error: "Couldn't save; is the server running?" }[status];
  return <span className={`tiny ${status === 'error' ? 'delta-down' : 'muted'}`}>{text}</span>;
}

interface NotesProps {
  savedNotes: string | null;
  save: (notes: string) => Promise<unknown>;
}

export function NotesEditor({ savedNotes, save }: NotesProps) {
  const [notes, setNotes] = useState(savedNotes ?? '');
  const [status, edit] = useAutosave(save);
  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      <div className="spread">
        <span className="small muted">Sketch your approach before answering: brute force, bottleneck, better idea, edge cases.</span>
        <StatusText status={status} />
      </div>
      <textarea
        className="input"
        rows={16}
        value={notes}
        placeholder={'Brute force: …\nBottleneck: …\nPattern: …\nSteps: …\nEdge cases: …'}
        onChange={(e) => {
          setNotes(e.target.value);
          edit(e.target.value);
        }}
        aria-label="Notes"
      />
    </div>
  );
}
