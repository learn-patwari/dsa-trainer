import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildReviewPrompt, statementToText, type ReviewContext } from '../shared/ai-prompt.ts';
import { DATA_DIR } from './store.ts';
import { HttpError } from './trainer.ts';

/**
 * Sending a review to a model you chose.
 *
 * The three shapes below cover everything people actually use: OpenAI-compatible
 * (OpenAI, OpenRouter, Groq, Together, LM Studio, vLLM), Anthropic, and Ollama.
 * The key lives in data/ai.json, is never sent to the browser, and only ever
 * goes to the base URL you configured.
 */

export type Provider = 'openai' | 'anthropic' | 'ollama';

export interface AiConfig {
  provider: Provider;
  baseUrl: string;
  model: string;
  apiKey: string;
  /** Cap on the reply, so a runaway model can't cost you a fortune. */
  maxTokens: number;
}

/** What the browser is allowed to see: everything except the key. */
export interface AiConfigView {
  configured: boolean;
  provider: Provider;
  baseUrl: string;
  model: string;
  maxTokens: number;
  hasKey: boolean;
}

const FILE = join(DATA_DIR, 'ai.json');
const TIMEOUT_MS = 120_000;

export const PRESETS: Record<Provider, { baseUrl: string; model: string; needsKey: boolean; label: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', needsKey: true, label: 'OpenAI-compatible' },
  anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-5', needsKey: true, label: 'Anthropic' },
  ollama: { baseUrl: 'http://localhost:11434', model: 'llama3.1', needsKey: false, label: 'Local (Ollama)' },
};

const DEFAULT: AiConfig = { provider: 'openai', baseUrl: PRESETS.openai.baseUrl, model: PRESETS.openai.model, apiKey: '', maxTokens: 1200 };

let cached: AiConfig | null = null;

export async function readConfig(): Promise<AiConfig> {
  if (cached) return cached;
  try {
    cached = { ...DEFAULT, ...(JSON.parse(await readFile(FILE, 'utf8')) as Partial<AiConfig>) };
  } catch {
    cached = { ...DEFAULT };
  }
  return cached;
}

export function view(c: AiConfig): AiConfigView {
  const needsKey = PRESETS[c.provider].needsKey;
  return {
    configured: Boolean(c.model && c.baseUrl && (!needsKey || c.apiKey)),
    provider: c.provider,
    baseUrl: c.baseUrl,
    model: c.model,
    maxTokens: c.maxTokens,
    hasKey: Boolean(c.apiKey),
  };
}

function isProvider(v: unknown): v is Provider {
  return v === 'openai' || v === 'anthropic' || v === 'ollama';
}

export async function saveConfig(body: unknown): Promise<AiConfigView> {
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Expected a JSON body.');
  const b = body as Record<string, unknown>;
  if (!isProvider(b.provider)) throw new HttpError(400, 'Pick a provider: openai, anthropic or ollama.');

  const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
  const preset = PRESETS[b.provider];
  const current = await readConfig();

  const baseUrl = str(b.baseUrl, preset.baseUrl).replace(/\/+$/, '');
  if (!/^https?:\/\//.test(baseUrl)) throw new HttpError(400, 'The base URL must start with http:// or https://.');

  // An empty key on an update means "keep the one you have"; null clears it.
  const apiKey = b.apiKey === null ? '' : typeof b.apiKey === 'string' && b.apiKey.trim() ? b.apiKey.trim() : current.apiKey;
  const maxTokens = typeof b.maxTokens === 'number' && b.maxTokens > 0 ? Math.min(8000, Math.round(b.maxTokens)) : current.maxTokens;

  cached = { provider: b.provider, baseUrl, model: str(b.model, preset.model), apiKey, maxTokens };
  await writeFile(FILE, JSON.stringify(cached, null, 1), 'utf8');
  return view(cached);
}

export async function clearConfig(): Promise<void> {
  cached = { ...DEFAULT };
  await writeFile(FILE, JSON.stringify(cached, null, 1), 'utf8');
}

interface Call {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  /** Pulls the reply text out of that provider's response shape. */
  read: (json: unknown) => string | null;
}

function callFor(c: AiConfig, prompt: string): Call {
  const messages = [{ role: 'user', content: prompt }];
  if (c.provider === 'anthropic') {
    return {
      url: `${c.baseUrl}/v1/messages`,
      headers: { 'content-type': 'application/json', 'x-api-key': c.apiKey, 'anthropic-version': '2023-06-01' },
      body: { model: c.model, max_tokens: c.maxTokens, messages },
      read: (j) => {
        const blocks = (j as { content?: { type: string; text?: string }[] }).content ?? [];
        return blocks.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('') || null;
      },
    };
  }
  if (c.provider === 'ollama') {
    return {
      url: `${c.baseUrl}/api/chat`,
      headers: { 'content-type': 'application/json' },
      body: { model: c.model, messages, stream: false, options: { num_predict: c.maxTokens } },
      read: (j) => (j as { message?: { content?: string } }).message?.content ?? null,
    };
  }
  return {
    url: `${c.baseUrl}/chat/completions`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${c.apiKey}`,
      // OpenRouter asks for these; harmless everywhere else.
      'http-referer': 'http://localhost',
      'x-title': 'DSA Trainer',
    },
    body: { model: c.model, max_tokens: c.maxTokens, messages },
    read: (j) => (j as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? null,
  };
}

export interface AiReview {
  review: string;
  model: string;
  provider: Provider;
  promptChars: number;
  at: string;
}

export async function requestReview(ctx: Omit<ReviewContext, 'statement'> & { statementHtml: string | null }): Promise<AiReview> {
  const c = await readConfig();
  const v = view(c);
  if (!v.configured) {
    throw new HttpError(400, 'No model configured yet. Set one up on the AI review page, or copy the prompt and paste it into any chat.');
  }

  const prompt = buildReviewPrompt({ ...ctx, statement: statementToText(ctx.statementHtml) });
  const call = callFor(c, prompt);

  let res: Response;
  try {
    res = await fetch(call.url, {
      method: 'POST',
      headers: call.headers,
      body: JSON.stringify(call.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const why = err instanceof Error && err.name === 'TimeoutError' ? `it didn't answer within ${TIMEOUT_MS / 1000}s` : String(err);
    throw new HttpError(502, `Couldn't reach ${call.url}: ${why}`);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new HttpError(502, `${c.provider} said ${res.status}: ${detail(text)}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new HttpError(502, `${c.provider} returned something that isn't JSON: ${text.slice(0, 200)}`);
  }

  const review = call.read(json);
  if (!review) throw new HttpError(502, `${c.provider} replied, but with no text. Check the model name.`);
  return { review, model: c.model, provider: c.provider, promptChars: prompt.length, at: new Date().toISOString() };
}

/** Providers bury the useful line in different places; try the common ones. */
function detail(text: string): string {
  try {
    const j = JSON.parse(text) as { error?: { message?: string } | string; message?: string };
    const e = j.error;
    return (typeof e === 'string' ? e : e?.message) ?? j.message ?? text.slice(0, 200);
  } catch {
    return text.slice(0, 200);
  }
}
