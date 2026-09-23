import { java } from '@codemirror/lang-java';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';
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
}

export default function JavaEditor({ slug, savedCode, starter, save }: Props) {
  const [code, setCode] = useState<string | null>(savedCode);
  const [status, edit] = useAutosave(save);
  const dark = usePrefersDark();

  // Until you type something, show LeetCode's Java stub once it arrives.
  useEffect(() => {
    if (code == null && starter != null) setCode(starter);
  }, [code, starter]);

  const value = code ?? starter ?? FALLBACK;
  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      <div className="spread">
        <span className="small muted">Your code is saved locally. It isn't run or graded; paste it into LeetCode to test it.</span>
        <StatusText status={status} />
      </div>
      <div className="editor-wrap">
        <CodeMirror
          value={value}
          height="460px"
          theme={dark ? 'dark' : 'light'}
          extensions={[java()]}
          basicSetup={{ tabSize: 4 }}
          onChange={(v) => {
            setCode(v);
            edit(v);
          }}
          aria-label="Java solution editor"
        />
      </div>
      <div className="row">
        <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(value)}>
          Copy code
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
    </div>
  );
}
