import { useState } from 'react';
import { Link } from 'react-router';
import { api, useLoad } from '../api.ts';
import { ErrorBox, Loading } from '../components.tsx';

/**
 * Two ways to get a review: copy the prompt into whatever chat you already pay
 * for, or have the server send it to a model you configured. The prompt is the
 * same either way, so the no-key path isn't a lesser version.
 */
export function AiReview({ slug, hasCode }: { slug: string; hasCode: boolean }) {
  const cfg = useLoad(api.aiConfig, []);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [busy, setBusy] = useState<'prompt' | 'review' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setBusy('prompt');
    setError(null);
    try {
      const { prompt: p } = await api.aiPrompt(slug);
      setPrompt(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    setBusy('review');
    setError(null);
    try {
      const r = await api.aiReview(slug);
      setReview(r.review);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    let text = prompt;
    if (!text) {
      const r = await api.aiPrompt(slug);
      text = r.prompt;
      setPrompt(text);
    }
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasCode) {
    return (
      <div className="callout small">
        Write something in the <strong>Java</strong> tab first — a review of an empty file only tells you it's empty.
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: '0.75rem' }}>
      <div className="callout small">
        The prompt bundles the statement, your code, the approach you claimed in the check, and your notes. Reviewing
        against all four is the point: code alone can't show whether you understood the problem.
      </div>

      <div className="row">
        <button className="btn btn-primary btn-sm" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy review prompt'}
        </button>
        <a className="btn btn-sm" href="https://chatgpt.com/" target="_blank" rel="noreferrer">
          ChatGPT ↗
        </a>
        <a className="btn btn-sm" href="https://claude.ai/new" target="_blank" rel="noreferrer">
          Claude ↗
        </a>
        <button className="btn btn-sm btn-ghost" onClick={load} disabled={busy !== null}>
          {busy === 'prompt' ? 'Building…' : prompt ? 'Refresh' : 'Show the prompt'}
        </button>
      </div>

      <div className="row">
        {cfg.data?.configured ? (
          <>
            <button className="btn btn-sm" onClick={send} disabled={busy !== null}>
              {busy === 'review' ? (
                <>
                  <span className="spinner" /> Asking {cfg.data.model}…
                </>
              ) : (
                `Review with ${cfg.data.model}`
              )}
            </button>
            <span className="tiny muted">
              Sends your code to {cfg.data.baseUrl}. <Link to="/settings">Change</Link>
            </span>
          </>
        ) : (
          <span className="tiny muted">
            No key needed for the buttons above. To have the app ask a model directly, <Link to="/settings">set one up</Link> —
            OpenAI, OpenRouter, Anthropic or a local Ollama.
          </span>
        )}
      </div>

      {error && <ErrorBox message={error} />}
      {cfg.error && <div className="tiny muted">Couldn't read the AI settings: {cfg.error}</div>}

      {review && (
        <section>
          <h3 style={{ margin: '0 0 0.4rem' }}>Review</h3>
          <div className="ai-review small">{review}</div>
        </section>
      )}

      {prompt && (
        <details open={!review}>
          <summary className="small muted" style={{ cursor: 'pointer' }}>
            The prompt ({prompt.length.toLocaleString()} characters)
          </summary>
          <pre className="ref-code" style={{ marginTop: '0.5rem', maxHeight: '28rem', overflow: 'auto' }}>
            {prompt}
          </pre>
        </details>
      )}

      {busy === 'prompt' && !prompt && <Loading label="Building the prompt…" />}
    </div>
  );
}
