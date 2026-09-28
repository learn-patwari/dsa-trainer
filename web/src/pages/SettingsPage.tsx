import { useEffect, useState } from 'react';
import { api, useLoad } from '../api.ts';
import type { AiConfigView, Provider } from '../api.ts';
import { ErrorBox, Loading } from '../components.tsx';

const PRESETS: Record<Provider, { label: string; baseUrl: string; model: string; needsKey: boolean; hint: string }> = {
  openai: {
    label: 'OpenAI-compatible',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    needsKey: true,
    hint: 'Works with OpenAI, OpenRouter (https://openrouter.ai/api/v1), Groq, Together, DeepSeek, and local servers that speak the same API — LM Studio (http://localhost:1234/v1) or vLLM.',
  },
  anthropic: {
    label: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-5',
    needsKey: true,
    hint: 'Claude models direct from Anthropic.',
  },
  ollama: {
    label: 'Local (Ollama)',
    baseUrl: 'http://localhost:11434',
    model: 'llama3.1',
    needsKey: false,
    hint: 'Nothing leaves your machine, and no key is needed. Run `ollama pull llama3.1` first. Qwen2.5-coder is a good pick for code review.',
  },
};

/** Where you point the AI reviewer. The key is stored on the server and never comes back. */
export function SettingsPage() {
  const { data, error, reload } = useLoad(api.aiConfig, []);
  const [provider, setProvider] = useState<Provider>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [maxTokens, setMaxTokens] = useState(1200);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setProvider(data.provider);
    setBaseUrl(data.baseUrl);
    setModel(data.model);
    setMaxTokens(data.maxTokens);
  }, [data]);

  const pick = (p: Provider) => {
    setProvider(p);
    setBaseUrl(PRESETS[p].baseUrl);
    setModel(PRESETS[p].model);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await api.saveAiConfig({ provider, baseUrl, model, maxTokens, apiKey: apiKey || undefined });
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      reload();
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const forget = async () => {
    if (!confirm('Forget the stored API key and reset these settings?')) return;
    await api.clearAiConfig();
    setApiKey('');
    reload();
  };

  if (error) return <main className="page"><ErrorBox message={error} onRetry={reload} /></main>;
  if (!data) return <main className="page"><Loading /></main>;
  const preset = PRESETS[provider];

  return (
    <main className="page stack">
      <div>
        <h1>Settings</h1>
        <p className="muted" style={{ margin: 0 }}>
          Everything else in this app runs offline. This page is the one exception, and it's opt-in.
        </p>
      </div>

      <section className="card stack">
        <div className="spread">
          <h2 style={{ margin: 0 }}>AI code review</h2>
          <Status data={data} />
        </div>

        <p className="small muted" style={{ margin: 0 }}>
          You don't need this. The problem page will hand you a review prompt to paste into any chat for free — this is
          for when you'd rather the app just asked.
        </p>

        <div>
          <div className="small" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
            Provider
          </div>
          <div className="segmented" role="radiogroup" aria-label="Provider">
            {(Object.keys(PRESETS) as Provider[]).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={provider === p} className={provider === p ? 'selected' : ''} onClick={() => pick(p)}>
                {PRESETS[p].label}
              </button>
            ))}
          </div>
          <p className="tiny muted" style={{ marginTop: '0.4rem' }}>
            {preset.hint}
          </p>
        </div>

        <label className="small">
          Base URL
          <input className="input" style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
        </label>

        <label className="small">
          Model
          <input className="input" style={{ display: 'block', width: '100%', marginTop: '0.25rem' }} value={model} onChange={(e) => setModel(e.target.value)} />
        </label>

        {preset.needsKey && (
          <label className="small">
            API key
            <input
              className="input"
              type="password"
              autoComplete="off"
              placeholder={data.hasKey ? 'Stored — leave blank to keep it' : 'sk-…'}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span className="tiny muted">
              Kept in <code>data/ai.json</code> on this machine, never sent to the browser, and only ever sent to the base
              URL above.
            </span>
          </label>
        )}

        <label className="small">
          Reply limit (tokens)
          <input
            className="input"
            type="number"
            min={200}
            max={8000}
            step={100}
            style={{ display: 'block', width: '8rem', marginTop: '0.25rem' }}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
          />
        </label>

        {saveError && <ErrorBox message={saveError} />}

        <div className="row">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
          {(data.hasKey || data.configured) && (
            <button className="btn btn-ghost" onClick={forget}>
              Forget key & reset
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>What gets sent</h2>
        <p className="small" style={{ marginTop: 0 }}>
          When you press <strong>Review</strong> on a problem, the server posts one request containing the problem
          statement, your Java, the answers you gave in the approach check, and your notes. Nothing is sent in the
          background, nothing is sent from any other page, and your LeetCode session cookie is never included.
        </p>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Using a hosted provider means your code leaves your machine and is subject to that provider's retention policy.
          Pick <strong>Local (Ollama)</strong> if that matters to you.
        </p>
      </section>
    </main>
  );
}

function Status({ data }: { data: AiConfigView }) {
  if (data.configured) return <span className="tag tag-good">Ready · {data.model}</span>;
  if (data.hasKey) return <span className="tag tag-warn">Key stored, model incomplete</span>;
  return <span className="tag">Not set up</span>;
}
