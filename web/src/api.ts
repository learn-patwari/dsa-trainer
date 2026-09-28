import { useCallback, useEffect, useState } from 'react';
import type {
  AttemptResult,
  AttemptSubmission,
  ChallengeAnswer,
  ChallengeQuestion,
  DashboardState,
  Difficulty,
  LookupResult,
  JavaStatus,
  LeetCodeImport,
  LeetCodeProblem,
  LeetCodeSolution,
  PatternDetail,
  PracticeMode,
  ProblemView,
  ReviewItem,
  ReviewSummary,
  RunResult,
  StudyPlan,
  TimeSpent,
} from '../../shared/types.ts';

export type Provider = 'openai' | 'anthropic' | 'ollama';

export interface AiConfigView {
  configured: boolean;
  provider: Provider;
  baseUrl: string;
  model: string;
  maxTokens: number;
  hasKey: boolean;
}

export interface AiReviewResult {
  review: string;
  model: string;
  provider: Provider;
  promptChars: number;
  at: string;
}

export interface BackupInfo {
  name: string;
  at: string;
  bytes: number;
  reason: string;
}

export interface ReviewQueue {
  summary: ReviewSummary;
  due: ReviewItem[];
  upcoming: ReviewItem[];
}

export interface CatalogMatch {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  paidOnly: boolean;
}

async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(data?.error ?? `Request failed (HTTP ${res.status}). Is the API server running?`);
  return data as T;
}

export const api = {
  state: () => call<DashboardState>('/state'),
  pattern: (id: string) => call<PatternDetail>(`/patterns/${encodeURIComponent(id)}`),
  problem: (slug: string, mode: PracticeMode) => call<ProblemView>(`/problems/${encodeURIComponent(slug)}?mode=${mode}`),
  leetcodeProblem: (slug: string, refresh = false) =>
    call<LeetCodeProblem & { stale?: boolean }>(`/problems/${encodeURIComponent(slug)}/leetcode${refresh ? '?refresh=1' : ''}`),
  submit: (slug: string, sub: AttemptSubmission) =>
    call<AttemptResult>(`/problems/${encodeURIComponent(slug)}/attempts`, { method: 'POST', body: sub }),
  saveWork: (slug: string, work: { code?: string; notes?: string }) =>
    call<{ ok: true }>(`/problems/${encodeURIComponent(slug)}/work`, { method: 'PUT', body: work }),
  lookup: (q: string) => call<{ result?: LookupResult; matches?: CatalogMatch[] }>(`/lookup?q=${encodeURIComponent(q)}`),
  challengeNext: (exclude?: string) =>
    call<ChallengeQuestion>(`/challenge/next${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ''}`),
  challengeAnswer: (slug: string, pattern: string | null) =>
    call<ChallengeAnswer>('/challenge/answer', { method: 'POST', body: { slug, pattern } }),
  javaStatus: () => call<JavaStatus>('/java/status'),
  run: (slug: string, code: string) => call<RunResult>(`/problems/${encodeURIComponent(slug)}/run`, { method: 'POST', body: { code } }),
  blind: (exclude?: string) => call<{ slug: string }>(`/practice/blind${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ''}`),
  importProfile: (body: { username?: string; useSession?: boolean }) =>
    call<LeetCodeImport>('/leetcode/import', { method: 'POST', body }),
  syncProfile: () => call<LeetCodeImport>('/leetcode/sync', { method: 'POST', body: {} }),
  fetchSolution: (slug: string) =>
    call<{ solution: LeetCodeSolution | null; message: string | null }>(`/problems/${encodeURIComponent(slug)}/leetcode-solution`, {
      method: 'POST',
      body: {},
    }),
  removeImport: () => call<{ ok: true }>('/leetcode/import', { method: 'DELETE', body: {} }),
  addTime: (slug: string, delta: { elapsedSec: number; activeSec: number }) =>
    call<TimeSpent>(`/problems/${encodeURIComponent(slug)}/time`, { method: 'POST', body: delta }),
  review: () => call<ReviewQueue>('/review'),
  aiPrompt: (slug: string) => call<{ prompt: string }>(`/problems/${encodeURIComponent(slug)}/ai-prompt`),
  aiReview: (slug: string) => call<AiReviewResult>(`/problems/${encodeURIComponent(slug)}/ai-review`, { method: 'POST', body: {} }),
  aiConfig: () => call<AiConfigView>('/ai/config'),
  saveAiConfig: (body: { provider: Provider; baseUrl: string; model: string; maxTokens: number; apiKey?: string }) =>
    call<AiConfigView>('/ai/config', { method: 'PUT', body }),
  clearAiConfig: () => call<AiConfigView>('/ai/config', { method: 'DELETE', body: {} }),
  setPlan: (size: number, weeks: number) => call<StudyPlan>('/plan', { method: 'POST', body: { size, weeks } }),
  clearPlan: () => call<{ ok: true }>('/plan', { method: 'DELETE', body: {} }),
  reset: () => call<{ ok: true; backup: string | null }>('/reset', { method: 'POST', body: { confirm: 'RESET' } }),
  backups: () => call<BackupInfo[]>('/backups'),
  restoreBackup: (name: string) =>
    call<{ ok: true; attempts: number; problems: number }>('/backups/restore', { method: 'POST', body: { name } }),
};

/** Loads data for a page; `reload` refetches without clearing what's on screen. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  useEffect(() => {
    let alive = true;
    setError(null);
    run()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [run, tick]);

  return { data, error, reload: () => setTick((t) => t + 1), setData };
}
