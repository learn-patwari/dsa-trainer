import { mkdtempSync, rmSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const dataDir = mkdtempSync(join(tmpdir(), 'dsa-api-'));
process.env.DSA_DATA_DIR = dataDir;
delete process.env.LEETCODE_SESSION;

let server: Server;
let base: string;
const realFetch = globalThis.fetch;
const { javaStatus } = await import('../server/java-run.ts');
const jdk = await javaStatus();

/** Stand-in for leetcode.com so tests never depend on the network. */
const leetcode = vi.fn(async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const body = JSON.parse(String(init?.body ?? '{}')) as { query?: string; variables?: Record<string, string> };
  if (String(url).endsWith('/graphql') && body.query?.includes('question(')) {
    return Response.json({
      data: {
        question: {
          questionFrontendId: '1', title: 'Two Sum', titleSlug: 'two-sum',
          content: '<p>Given an array…</p><p><strong>Output:</strong> <span class="example-io">[0,1]</span></p><p><strong>Output:</strong> <span class="example-io">[1,2]</span></p>',
          difficulty: 'Easy', isPaidOnly: false, topicTags: [{ name: 'Array', slug: 'array' }],
          codeSnippets: [{ langSlug: 'java', code: 'class Solution {}' }, { langSlug: 'cpp', code: '' }],
          hints: ['Think about complements.'], exampleTestcaseList: ['[2,7,11,15]\n9', '[3,2,4]\n6'],
          metaData: JSON.stringify({
            name: 'twoSum',
            params: [{ name: 'nums', type: 'integer[]' }, { name: 'target', type: 'integer' }],
            return: { type: 'integer[]' },
          }),
        },
      },
    });
  }
  if (String(url).endsWith('/graphql') && body.query?.includes('matchedUser')) {
    if (body.variables?.username === 'ghost') {
      return Response.json({ errors: [{ message: 'That user does not exist.' }], data: { matchedUser: null, recentAcSubmissionList: [] } });
    }
    return Response.json({
      data: {
        matchedUser: {
          username: body.variables?.username,
          submitStatsGlobal: { acSubmissionNum: [{ difficulty: 'All', count: 3 }, { difficulty: 'Easy', count: 2 }, { difficulty: 'Medium', count: 1 }, { difficulty: 'Hard', count: 0 }] },
          tagProblemCounts: {
            fundamental: [{ tagName: 'Hash Table', tagSlug: 'hash-table', problemsSolved: 2 }],
            intermediate: [{ tagName: 'Sliding Window', tagSlug: 'sliding-window', problemsSolved: 1 }],
            advanced: [],
          },
        },
        recentAcSubmissionList: [{ titleSlug: 'two-sum' }, { titleSlug: 'two-sum' }, { titleSlug: 'valid-anagram' }],
      },
    });
  }
  return new Response('not found', { status: 404 });
});

beforeAll(async () => {
  vi.stubGlobal('fetch', leetcode);
  const { createApp } = await import('../server/app.ts');
  server = createApp({ webDir: join(dataDir, 'no-ui') }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server?.close();
  vi.unstubAllGlobals();
  rmSync(dataDir, { recursive: true, force: true });
});

const api = (path: string, init: RequestInit = {}) =>
  realFetch(`${base}/api${path}`, {
    ...init,
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(init.headers as Record<string, string>) },
  });

describe('API', () => {
  it('serves the dashboard for a new learner', async () => {
    const res = await api('/state');
    expect(res.status).toBe(200);
    const state = await res.json();
    expect(state).toMatchObject({ overall: null, totalProblems: 151, attemptedProblems: 0, sessionConfigured: false });
    expect(state.upNext[0].slug).toBe('contains-duplicate');
  });

  it('returns a quiz without the answer key, and grades an attempt', async () => {
    const view = await (await api('/problems/two-sum?mode=blind')).json();
    expect(view.pattern).toBeNull();
    expect(view.quiz.askPattern).toBe(true);

    const { getProblem } = await import('../shared/problems/index.ts');
    const p = getProblem('two-sum')!;
    const res = await api('/problems/two-sum/attempts', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'blind', pattern: 'hashing', insight: p.insight.options[0], time: p.time[0], space: p.space[1],
        edgeCasesHandled: [0, 1, 2], hintsUsed: 0, elapsedSec: 42,
      }),
    });
    expect(res.status).toBe(200);
    const result = await res.json();
    expect(result).toMatchObject({ rated: true, maxScore: 10, score: 9, percent: 90, pattern: 'hashing' });
    expect(result.ratingAfter).toBeGreaterThan(result.ratingBefore);
    expect(result.approach).toContain('HashMap');

    const after = await (await api('/problems/two-sum?mode=blind')).json();
    expect(after.pattern).toEqual({ id: 'hashing', name: 'Hash Map / Set' });
    expect(after.progress.attempts).toBe(1);
  });

  it('saves code and notes', async () => {
    const res = await api('/problems/valid-anagram/work', { method: 'PUT', body: JSON.stringify({ code: 'int x;', notes: 'count letters' }) });
    expect(res.status).toBe(200);
    const view = await (await api('/problems/valid-anagram')).json();
    expect(view.progress).toMatchObject({ code: 'int x;', notes: 'count letters', attempts: 0 });
  });

  it('fetches and caches the LeetCode statement, keeping only the Java snippet', async () => {
    const first = await (await api('/problems/two-sum/leetcode')).json();
    expect(first).toMatchObject({ id: 1, javaSnippet: 'class Solution {}', hints: ['Think about complements.'] });
    const calls = leetcode.mock.calls.length;
    await api('/problems/two-sum/leetcode');
    expect(leetcode.mock.calls.length).toBe(calls); // served from data/cache
  });

  it.skipIf(!jdk.available)('compiles and runs the code, then marks the problem code-verified', async () => {
    const code = `import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.containsKey(target - nums[i])) return new int[] {seen.get(target - nums[i]), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`;
    const res = await api('/problems/two-sum/run', { method: 'POST', body: JSON.stringify({ code }) });
    expect(res.status).toBe(200);
    const run = await res.json();
    expect(run).toMatchObject({ compiled: true, passed: 2, checked: 2, total: 2 });
    expect(run.tests.map((t: { verdict: string }) => t.verdict)).toEqual(['pass', 'pass']);

    const detail = await (await api('/patterns/hashing')).json();
    expect(detail.problems.find((r: { slug: string }) => r.slug === 'two-sum').codeVerified).toBe(true);
    const view = await (await api('/problems/two-sum')).json();
    expect(view.progress.code).toBe(code); // running also saves what ran
  }, 60_000);

  it('rejects a run request with no code', async () => {
    const res = await api('/problems/two-sum/run', { method: 'POST', body: JSON.stringify({ code: '   ' }) });
    expect(res.status).toBe(400);
  });

  it('imports a public profile and flags problems solved there', async () => {
    const res = await api('/leetcode/import', { method: 'POST', body: JSON.stringify({ username: 'someone' }) });
    expect(res.status).toBe(200);
    const imported = await res.json();
    expect(imported).toMatchObject({ username: 'someone', source: 'public', fullList: false, solvedSlugs: ['two-sum', 'valid-anagram'] });
    const detail = await (await api('/patterns/hashing')).json();
    expect(detail.problems.find((r: { slug: string }) => r.slug === 'valid-anagram').lcSolved).toBe(true);
    expect(detail.summary.lcTagSolved).toBe(2);
  });

  it('explains unknown users and a missing session cookie', async () => {
    const ghost = await api('/leetcode/import', { method: 'POST', body: JSON.stringify({ username: 'ghost' }) });
    expect(ghost.status).toBe(404);
    expect((await ghost.json()).error).toMatch(/No public LeetCode profile/);
    const session = await api('/leetcode/import', { method: 'POST', body: JSON.stringify({ useSession: true }) });
    expect(session.status).toBe(400);
    expect((await session.json()).error).toMatch(/LEETCODE_SESSION is not set/);
  });

  it('rejects unknown problems, non-JSON writes and foreign Host headers', async () => {
    expect((await api('/problems/not-a-problem')).status).toBe(404);
    expect((await api('/patterns/nope')).status).toBe(404);
    const form = await realFetch(`${base}/api/reset`, { method: 'POST', body: 'confirm=RESET', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    expect(form.status).toBe(415);
    // fetch() can't override Host, so use a raw request to simulate DNS rebinding.
    const rebindStatus = await new Promise<number>((resolve, reject) => {
      const req = request(`${base}/api/state`, { headers: { Host: 'evil.example:5179' } }, (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      });
      req.on('error', reject);
      req.end();
    });
    expect(rebindStatus).toBe(403);
  });

  it('serves the built UI for client-side routes, even from a dot-directory', async () => {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { createApp } = await import('../server/app.ts');
    const webDir = join(dataDir, '.hidden', 'web');
    mkdirSync(webDir, { recursive: true });
    writeFileSync(join(webDir, 'index.html'), '<!doctype html><title>ui</title>');
    const ui = createApp({ webDir }).listen(0, '127.0.0.1');
    await new Promise((r) => ui.once('listening', r));
    try {
      const res = await realFetch(`http://127.0.0.1:${(ui.address() as AddressInfo).port}/patterns/two-pointers`);
      expect(res.status).toBe(200);
      expect(await res.text()).toContain('<title>ui</title>');
    } finally {
      ui.close();
    }
  });

  it('resets progress only with explicit confirmation', async () => {
    expect((await api('/reset', { method: 'POST', body: JSON.stringify({}) })).status).toBe(400);
    expect((await api('/reset', { method: 'POST', body: JSON.stringify({ confirm: 'RESET' }) })).status).toBe(200);
    const state = await (await api('/state')).json();
    expect(state.attemptedProblems).toBe(0);
    expect(state.leetcode).toBeNull();
  });
});
