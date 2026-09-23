import { useCallback, useEffect, useState } from 'react';
import type {
  AttemptResult,
  AttemptSubmission,
  DashboardState,
  LeetCodeImport,
  LeetCodeProblem,
  PatternDetail,
  PracticeMode,
  ProblemView,
} from '../../shared/types.ts';

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
  blind: (exclude?: string) => call<{ slug: string }>(`/practice/blind${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ''}`),
  importProfile: (body: { username?: string; useSession?: boolean }) =>
    call<LeetCodeImport>('/leetcode/import', { method: 'POST', body }),
  removeImport: () => call<{ ok: true }>('/leetcode/import', { method: 'DELETE', body: {} }),
  reset: () => call<{ ok: true }>('/reset', { method: 'POST', body: { confirm: 'RESET' } }),
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
