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
        recentAcSubmissionList: [
          { titleSlug: 'two-sum', timestamp: String(Math.floor(Date.now() / 1000) - 5 * 86400) },
          { titleSlug: 'two-sum', timestamp: String(Math.floor(Date.now() / 1000) - 400 * 86400) },
          { titleSlug: 'valid-anagram', timestamp: String(Math.floor(Date.now() / 1000) - 200 * 86400) },
        ],
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
    expect(state).toMatchObject({ overall: null, totalProblems: 197, attemptedProblems: 0, sessionConfigured: false });
    expect(state.upNext[0].slug).toBe('contains-duplicate');
  });

  /** A solution that compiles, so the approach check will accept the attempt. */
  const WORKING_TWO_SUM = 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (seen.containsKey(target - nums[i])) return new int[] { seen.get(target - nums[i]), i };\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}';

  /** With a JDK present the check waits for code that compiles; write some and run it. */
  async function makeSubmittable(slug: string, code = WORKING_TWO_SUM) {
    if (!jdk.available) return;
    await api(`/problems/${slug}/work`, { method: 'PUT', body: JSON.stringify({ code }) });
    const run = await (await api(`/problems/${slug}/run`, { method: 'POST', body: JSON.stringify({ code }) })).json();
    expect(run.compiled, run.compilerOutput).toBe(true);
  }

  it('returns a quiz without the answer key, and grades an attempt', async () => {
    const view = await (await api('/problems/two-sum?mode=blind')).json();
    expect(view.pattern).toBeNull();
    expect(view.quiz.askPattern).toBe(true);
    expect(view.complexity, 'the walkthrough gives the answer away').toBeNull();

    const { getProblem } = await import('../shared/problems/index.ts');
    const p = getProblem('two-sum')!;
    await makeSubmittable('two-sum');
    const res = await api('/problems/two-sum/attempts', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'blind', pattern: 'hashing', brute: p.brute!.time[0], insight: p.insight.options[0], time: p.time[0], space: p.space[1],
        edgeCasesHandled: [0, 1, 2], hintsUsed: 0, elapsedSec: 42,
      }),
    });
    expect(res.status).toBe(200);
    const result = await res.json();
    expect(result).toMatchObject({ rated: true, maxScore: 11, score: 10, percent: 91, pattern: 'hashing' });
    expect(result.ratingAfter).toBeGreaterThan(result.ratingBefore);
    expect(result.approach).toContain('HashMap');

    const after = await (await api('/problems/two-sum?mode=blind')).json();
    expect(after.pattern).toEqual({ id: 'hashing', name: 'Hash Map / Set' });
    expect(after.progress.attempts).toBe(1);
    // Answered, so the counting behind the answer comes with it.
    expect(after.complexity.time.so).toBe('n × O(1) = O(n)');
    expect(after.complexity.space.steps.length).toBeGreaterThan(0);
  }, 60_000); // compiles real Java first, which is slow while other suites compile too

  it.skipIf(!jdk.available)('will not grade an approach until the code compiles', async () => {
    const answers = {
      mode: 'pattern', pattern: 'hashing', brute: 'O(n\u00b2)', insight: 'x', time: 'O(n)', space: 'O(n)',
      edgeCasesHandled: [0], hintsUsed: 0, elapsedSec: 30, activeSec: 30,
    };
    const submit = () => api('/problems/valid-palindrome/attempts', { method: 'POST', body: JSON.stringify(answers) });

    // Nothing written yet.
    let res = await submit();
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Java tab/i);

    // Written, but never run.
    await api('/problems/valid-palindrome/work', { method: 'PUT', body: JSON.stringify({ code: 'class Solution { }' }) });
    res = await submit();
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Compile & run/i);

    // Run, but it does not compile.
    const broken = 'class Solution { oops }';
    await api('/problems/valid-palindrome/run', { method: 'POST', body: JSON.stringify({ code: broken }) });
    res = await submit();
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/compile/i);

    // Compiles, so the attempt is graded. (The stubbed LeetCode hands out two-sum's
    // signature for every slug, so the harness calls twoSum whatever the problem.)
    const good = WORKING_TWO_SUM;
    await api('/problems/valid-palindrome/run', { method: 'POST', body: JSON.stringify({ code: good }) });
    expect((await (await api('/problems/valid-palindrome')).json()).codeCurrent).toBe(true);
    res = await submit();
    expect(res.status).toBe(200);

    // Editing afterwards makes the run stale again.
    await api('/problems/valid-palindrome/work', { method: 'PUT', body: JSON.stringify({ code: good + ' // tweak' }) });
    const view = await (await api('/problems/valid-palindrome')).json();
    expect(view.codeCurrent).toBe(false);
    expect(view.requiresRun).toBe(true);
    res = await submit();
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/edited the code/i);
  }, 90_000);

  it('refuses an attempt with nothing answered', async () => {
    const before = await (await api('/state')).json();
    const res = await api('/problems/contains-duplicate/attempts', {
      method: 'POST',
      body: JSON.stringify({ mode: 'pattern', edgeCasesHandled: [], hintsUsed: 0, elapsedSec: 3, activeSec: 3 }),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/at least one question/i);

    const after = await (await api('/state')).json();
    expect(after.attemptedProblems).toBe(before.attemptedProblems);
  });

  it('saves code and notes', async () => {
    const res = await api('/problems/valid-anagram/work', { method: 'PUT', body: JSON.stringify({ code: 'int x;', notes: 'count letters' }) });
    expect(res.status).toBe(200);
    const view = await (await api('/problems/valid-anagram')).json();
    expect(view.progress).toMatchObject({ code: 'int x;', notes: 'count letters', attempts: 0 });
  });

  it('keeps a dry run with the notes, checks it, and deletes it on null', async () => {
    const slug = 'longest-substring-without-repeating-characters';
    const put = (body: unknown) => api(`/problems/${slug}/work`, { method: 'PUT', body: JSON.stringify(body) });
    const view = async () => (await (await api(`/problems/${slug}`)).json()).progress;
    const trace = {
      version: 1,
      input: '"abcabcbb"',
      pointers: ['L', 'R'],
      structures: [{ id: 'ds0', kind: 'set', label: 'HashSet' }],
      steps: [{ note: 'a is new', pointers: { L: 0, R: 0 }, window: true, highlight: [], data: { ds0: [{ id: 'i1', v: 'a' }] } }],
    };

    expect((await put({ trace })).status).toBe(200);
    expect((await view()).trace).toEqual(trace);

    // Saving the notes later leaves the trace alone.
    await put({ notes: 'shrink from the left' });
    expect(await view()).toMatchObject({ trace, notes: 'shrink from the left', attempts: 0 });

    const bad = await put({ trace: { ...trace, pointers: ['L', 'L'] } });
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/can't be saved: two pointers share a name/);
    expect((await view()).trace).toEqual(trace);

    const huge = await put({ trace: { ...trace, input: 'x'.repeat(400_000) } });
    expect(huge.status).toBe(400);

    expect((await put({ trace: null })).status).toBe(200);
    const after = await view();
    expect(after.trace).toBeUndefined();
    expect(after.notes).toBe('shrink from the left');
  });

  it('stores a drawing in its own file and keeps the version before it', async () => {
    const { readFileSync } = await import('node:fs');
    const url = '/problems/two-sum/drawing';
    expect(await (await api(url)).json()).toEqual({ scene: null });

    const first = JSON.stringify({ type: 'excalidraw', version: 2, elements: [{ id: 'first' }], appState: {}, files: {} });
    const res = await api(url, { method: 'PUT', body: JSON.stringify({ scene: first }) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, bytes: first.length });
    expect(await (await api(url)).json()).toEqual({ scene: first });

    const second = first.replace('first', 'second');
    await api(url, { method: 'PUT', body: JSON.stringify({ scene: second }) });
    expect(readFileSync(join(dataDir, 'drawings', 'two-sum.json'), 'utf8')).toBe(second);
    expect(readFileSync(join(dataDir, 'drawings', 'two-sum.json.prev'), 'utf8')).toBe(first);
    // A scene can carry pasted images, so it stays out of progress.json.
    await api('/problems/two-sum/work', { method: 'PUT', body: JSON.stringify({ notes: 'hash the complement' }) });
    expect(readFileSync(join(dataDir, 'progress.json'), 'utf8')).not.toContain('excalidraw');
  });

  it('refuses a drawing that is not JSON, too big, for an unknown problem or not sent as JSON', async () => {
    const put = (path: string, scene: unknown) => api(path, { method: 'PUT', body: JSON.stringify({ scene }) });
    expect((await put('/problems/two-sum/drawing', '{not json')).status).toBe(400);
    expect((await put('/problems/two-sum/drawing', 42)).status).toBe(400);
    expect((await put('/problems/two-sum/drawing', `"${'x'.repeat(8_000_001)}"`)).status).toBe(400);
    expect((await put('/problems/not-a-problem/drawing', '{}')).status).toBe(404);
    expect((await api('/problems/not-a-problem/drawing')).status).toBe(404);
    const form = await realFetch(`${base}/api/problems/two-sum/drawing`, {
      method: 'PUT',
      body: 'scene=%7B%7D',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    expect(form.status).toBe(415);
  });

  it('serves the drawing canvas fonts itself, and nothing else from node_modules', async () => {
    const { readdirSync } = await import('node:fs');
    const font = readdirSync('node_modules/@excalidraw/excalidraw/dist/prod/fonts/Excalifont').find((f) => f.endsWith('.woff2'))!;
    const res = await realFetch(`${base}/excalidraw/fonts/Excalifont/${font}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toMatch(/immutable/);
    for (const escape of ['%2e%2e/package.json', '..%2fpackage.json', '%2e%2e%2f%2e%2e%2fpackage.json', 'fonts/%2e%2e/%2e%2e/package.json']) {
      const r = await realFetch(`${base}/excalidraw/${escape}`);
      expect(await r.text(), escape).not.toContain('"name": "@excalidraw/excalidraw"');
    }
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

  it('syncs an existing import and keeps the original import date', async () => {
    const before = await (await api('/leetcode/import', { method: 'POST', body: JSON.stringify({ username: 'someone' }) })).json();
    const res = await api('/leetcode/sync', { method: 'POST', body: JSON.stringify({}) });
    expect(res.status).toBe(200);
    const after = await res.json();
    expect(after).toMatchObject({ username: 'someone', importedAt: before.importedAt, syncCount: 2 });
    expect(new Date(after.syncedAt).getTime()).toBeGreaterThanOrEqual(new Date(before.syncedAt).getTime());
    // The recent list carries accepted-at times, which drive the revisit list.
    expect(after.solvedAt['valid-anagram']).toBeGreaterThan(0);
    const state = await (await api('/state')).json();
    expect(state.revisit.map((r: { slug: string }) => r.slug)).toContain('valid-anagram'); // solved ~200 days ago
    expect(state.revisit.map((r: { slug: string }) => r.slug)).not.toContain('two-sum'); // most recent solve is 5 days old
  });

  it('refuses to sync or fetch a solution without the prerequisites', async () => {
    await api('/leetcode/import', { method: 'DELETE', body: JSON.stringify({}) });
    const sync = await api('/leetcode/sync', { method: 'POST', body: JSON.stringify({}) });
    expect(sync.status).toBe(400);
    expect((await sync.json()).error).toMatch(/Import your LeetCode profile first/);
    const sol = await api('/problems/two-sum/leetcode-solution', { method: 'POST', body: JSON.stringify({}) });
    expect(sol.status).toBe(400);
    expect((await sol.json()).error).toMatch(/LEETCODE_SESSION/);
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

  it('banks time against a problem', async () => {
    const first = await (await api('/problems/two-sum/time', { method: 'POST', body: JSON.stringify({ elapsedSec: 90, activeSec: 60 }) })).json();
    expect(first).toMatchObject({ totalSec: 90, activeSec: 60 });

    const second = await (await api('/problems/two-sum/time', { method: 'POST', body: JSON.stringify({ elapsedSec: 30, activeSec: 30 }) })).json();
    expect(second).toMatchObject({ totalSec: 120, activeSec: 90 });

    const view = await (await api('/problems/two-sum')).json();
    expect(view.progress.time).toMatchObject({ totalSec: 120, activeSec: 90 });

    expect((await api('/problems/nope/time', { method: 'POST', body: JSON.stringify({ elapsedSec: 5, activeSec: 5 }) })).status).toBe(404);
  });

  it('puts every attempt into the review queue', async () => {
    const queue = await (await api('/review')).json();
    // Earlier tests in this file graded attempts too, so count from the slug, not a total.
    const twoSum = queue.upcoming.find((r: { slug: string }) => r.slug === 'two-sum');
    expect(twoSum).toMatchObject({ slug: 'two-sum', pattern: 'hashing', of: 5 });
    // It scored well, so it is scheduled rather than due.
    expect(queue.due).toEqual([]);
    expect(queue.summary.scheduled).toBe(queue.upcoming.length);

    const state = await (await api('/state')).json();
    expect(state.review.summary.scheduled).toBe(queue.summary.scheduled);
  });

  it('starts, reports and stops a study plan', async () => {
    expect((await api('/plan', { method: 'POST', body: JSON.stringify({ size: 0, weeks: 8 }) })).status).toBe(400);
    expect((await api('/plan', { method: 'POST', body: JSON.stringify({ size: 60, weeks: 99 }) })).status).toBe(400);

    const plan = await (await api('/plan', { method: 'POST', body: JSON.stringify({ size: 60, weeks: 6 }) })).json();
    expect(plan).toMatchObject({ size: 60, weeks: 6, daysElapsed: 1, daysTotal: 42 });
    expect(plan.todayTarget).toBeGreaterThan(0);

    const state = await (await api('/state')).json();
    expect(state.plan).toMatchObject({ size: 60, weeks: 6 });
    expect(state.streak).toMatchObject({ current: 1, activeToday: true });
    expect(state.difficulty.map((d: { difficulty: string }) => d.difficulty)).toEqual(['Easy', 'Medium', 'Hard']);
    expect(state.difficulty.reduce((n: number, d: { total: number }) => n + d.total, 0)).toBe(197);

    expect((await api('/plan', { method: 'DELETE', body: JSON.stringify({}) })).status).toBe(200);
    expect((await (await api('/state')).json()).plan).toBeNull();
  });

  it('resets progress only with explicit confirmation', async () => {
    expect((await api('/reset', { method: 'POST', body: JSON.stringify({}) })).status).toBe(400);
    expect((await api('/reset', { method: 'POST', body: JSON.stringify({ confirm: 'RESET' }) })).status).toBe(200);
    const state = await (await api('/state')).json();
    expect(state.attemptedProblems).toBe(0);
    expect(state.leetcode).toBeNull();
  });
});
