import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import type { LeetCodeProblem } from '../../../shared/types.ts';
import { ErrorBox, Loading } from '../components.tsx';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

function Html({ html }: { html: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html), [html]);
  return <div className="statement" dangerouslySetInnerHTML={{ __html: clean }} />;
}

interface Props {
  slug: string;
  problem: (LeetCodeProblem & { stale?: boolean }) | null;
  error: string | null;
  onRetry: () => void;
  showTags: boolean;
  hintsShown: number;
  onRevealHint: () => void;
  hintsCost: boolean;
}

export function Statement({ slug, problem, error, onRetry, showTags, hintsShown, onRevealHint, hintsCost }: Props) {
  const origin = problem?.source ?? { name: 'LeetCode', url: `https://leetcode.com/problems/${slug}/` };
  const url = origin.url;
  if (error) {
    return (
      <div className="stack">
        <ErrorBox message={`Couldn't load the problem: ${error}`} onRetry={onRetry} />
        <p className="small">
          You can still read it on{' '}
          <a href={url} target="_blank" rel="noreferrer">
            {new URL(url).hostname}
          </a>{' '}
          and answer the approach check here.
        </p>
      </div>
    );
  }
  if (!problem) return <Loading label="Fetching the problem…" />;

  return (
    <div className="stack" style={{ gap: '0.75rem' }}>
      <div className="row small">
        <a className="btn btn-sm" href={url} target="_blank" rel="noreferrer">
          Open on {origin.name} ↗
        </a>
        {problem.stale && <span className="tag tag-warn">Offline copy from {new Date(problem.fetchedAt).toLocaleDateString()}</span>}
        {showTags && problem.topicTags.map((t) => <span key={t.slug} className="tag">{t.name}</span>)}
      </div>
      {problem.contentHtml ? (
        <Html html={problem.contentHtml} />
      ) : (
        <div className="callout warn">This statement is only available on LeetCode (premium problem).</div>
      )}
      {problem.hints.length > 0 && (
        <div>
          <h3>Hints</h3>
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="hint small">
              <Html html={h} />
            </div>
          ))}
          {hintsShown < problem.hints.length && (
            <button className="btn btn-sm btn-ghost" onClick={onRevealHint}>
              Reveal hint {hintsShown + 1} of {problem.hints.length}
              {hintsCost ? ' (−1 point)' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
