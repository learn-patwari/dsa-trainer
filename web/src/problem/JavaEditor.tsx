import { java as javaLang } from '@codemirror/lang-java';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';
import { methodsForLeetCode } from '../../../shared/java-source.ts';
import type { JavaStatus, RunResult } from '../../../shared/types.ts';
import { api } from '../api.ts';
import { RunResults } from './RunResults.tsx';
import { StatusText, useAutosave } from './Workbench.tsx';

// Loaded lazily by the problem page: CodeMirror is most of the app's JavaScript.

function usePrefersDark(): boolean {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return dark;
}

const FALLBACK = 'class Solution {\n    \n}\n';

interface Props {
  slug: string;
  savedCode: string | null;
  starter: string | null;
  save: (code: string) => Promise<unknown>;
  onRan: () => void;
}

export default function JavaEditor({ slug, savedCode, starter, save, onRan }: Props) {
  const [code, setCode] = useState<string | null>(savedCode);
  const [status, edit] = useAutosave(save);
  const dark = usePrefersDark();
  const [java, setJava] = useState<JavaStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'methods' | 'all' | null>(null);

  // Until you type something, show LeetCode's Java stub once it arrives.
  useEffect(() => {
    if (code == null && starter != null) setCode(starter);
  }, [code, starter]);

  useEffect(() => {
    let alive = true;
    api
      .javaStatus()
      .then((s) => alive && setJava(s))
      .catch(() => alive && setJava({ available: false, version: null, message: null }));
    return () => {
      alive = false;
    };
  }, []);

  const value = code ?? starter ?? FALLBACK;

  const run = async () => {
    if (running) return;
    setRunning(true);
    setRunError(null);
    try {
      setResult(await api.run(slug, value));
      onRan();
    } catch (e) {
      setRunError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  /** Copies, and says so for a moment. */
  const copy = (text: string, which: 'methods' | 'all') => {
    void navigator.clipboard?.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      <div className="spread">
        <span className="small muted">Compiled and run on your machine against LeetCode's example tests. Your code is saved locally.</span>
        <StatusText status={status} />
      </div>
      {java && !java.available && <div className="callout warn small">{java.message}</div>}
      <div
        className="editor-wrap"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            void run();
          }
        }}
      >
        <CodeMirror
          value={value}
          height="460px"
          theme={dark ? 'dark' : 'light'}
          extensions={[javaLang()]}
          basicSetup={{ tabSize: 4 }}
          onChange={(v) => {
            setCode(v);
            edit(v);
          }}
          aria-label="Java solution editor"
        />
      </div>
      <div className="row">
        <button className="btn btn-primary btn-sm" onClick={run} disabled={running || java?.available === false} title="Ctrl+Enter">
          {running ? (
            <>
              <span className="spinner" /> Compiling…
            </>
          ) : (
            'Compile & run'
          )}
        </button>
        <button
          className="btn btn-sm"
          title="Just the methods, unwrapped and re-indented — paste inside LeetCode's class Solution { }"
          onClick={() => copy(methodsForLeetCode(value), 'methods')}
        >
          {copied === 'methods' ? 'Copied ✓' : 'Copy methods'}
        </button>
        <button className="btn btn-sm btn-ghost" title="The whole file, imports and all" onClick={() => copy(value, 'all')}>
          {copied === 'all' ? 'Copied ✓' : 'Copy file'}
        </button>
        {starter && (
          <button
            className="btn btn-sm"
            onClick={() => {
              if (!confirm('Replace your code with the LeetCode starter?')) return;
              setCode(starter);
              edit(starter);
            }}
          >
            Reset to starter
          </button>
        )}
        <a className="btn btn-sm btn-ghost" href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noreferrer">
          Submit on LeetCode ↗
        </a>
      </div>
      {runError && <div className="callout bad small">{runError}</div>}
      {result && <RunResults result={result} />}
    </div>
  );
}
