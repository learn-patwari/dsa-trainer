import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isPatternId, patternName } from '../shared/patterns/index.ts';
import { PROBLEMS } from '../shared/problems/index.ts';
import { findBySlug, getCatalog, searchCatalog, slugFromInput } from './catalog.ts';
import { clearConfig, readConfig, requestReview, saveConfig, view as aiView } from './ai.ts';
import { challengeStats, gradeChallenge, pickChallenge } from './challenge.ts';
import { compileAndRun, javaStatus } from './java-run.ts';
import { lookup } from './lookup.ts';
import { buildReviewPrompt, statementToText } from '../shared/ai-prompt.ts';
import { getProblem as getCurated } from '../shared/problems/index.ts';
import { setPlan } from './plan.ts';
import { dueList, reviewSummary, upcomingList } from './review.ts';
import { fetchMySolution, getProblem, importPublicProfile, importWithSession, LeetCodeError, sessionFromEnv, USERNAME_RE } from './leetcode.ts';
import { listBackups, readDrawing, readProgress, resetProgress, restoreBackup, updateProgress, writeDrawing } from './store.ts';
import {
  dashboard,
  HttpError,
  parseMode,
  patternDetail,
  pickBlind,
  problemView,
  recordAttempt,
  recordRun,
  recordSolution,
  addTime,
  requirePatternId,
  requireProblem,
  saveWork,
  validateSubmission,
} from './trainer.ts';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function createApp({ webDir = resolve('dist/web') } = {}) {
  const app = express();
  app.disable('x-powered-by');

  // Local-only app: refuse other Host headers (blocks DNS-rebinding), and require JSON on
  // writes so a random web page can't submit forms against the API.
  app.use((req, res, next) => {
    const host = (req.headers.host ?? '').replace(/:\d+$/, '');
    if (!LOCAL_HOSTS.has(host)) return res.status(403).json({ error: 'This server only accepts local requests.' });
    if (req.method !== 'GET' && req.method !== 'HEAD' && !req.is('application/json')) {
      return res.status(415).json({ error: 'Send JSON (Content-Type: application/json).' });
    }
    next();
  });
  // Drawings get their own larger limit — a sketch with a pasted screenshot is easily
  // over a megabyte — and sit after the local-only guard like every other route.
  app.get('/api/problems/:slug/drawing', async (req, res, next) => {
    try {
      requireProblem(req.params.slug);
      res.json({ scene: await readDrawing(req.params.slug) });
    } catch (err) {
      next(err);
    }
  });
  // The scene arrives as a JSON string inside JSON, and escaping it adds a little.
  app.put('/api/problems/:slug/drawing', express.json({ limit: '12mb' }), async (req, res, next) => {
    try {
      requireProblem(req.params.slug);
      const scene = (req.body as { scene?: unknown } | undefined)?.scene;
      if (typeof scene !== 'string' || scene.length > 8_000_000) throw new HttpError(400, 'Send the drawing as { "scene": "<json>" }, under 8 MB.');
      try {
        JSON.parse(scene);
      } catch {
        throw new HttpError(400, 'That drawing is not valid JSON.');
      }
      await writeDrawing(req.params.slug, scene);
      res.json({ ok: true, bytes: scene.length });
    } catch (err) {
      next(err);
    }
  });

  app.use(express.json({ limit: '1mb' }));

  const api = express.Router();

  api.get('/state', async (_req, res) => {
    res.json(dashboard(await readProgress(), sessionFromEnv() != null));
  });

  api.get('/patterns/:id', async (req, res) => {
    res.json(patternDetail(await readProgress(), requirePatternId(req.params.id)));
  });

  api.get('/problems/:slug', async (req, res) => {
    const jdk = await javaStatus();
    res.json(problemView(await readProgress(), req.params.slug, parseMode(req.query.mode), { requiresRun: jdk.available }));
  });

  api.get('/problems/:slug/leetcode', async (req, res) => {
    requireProblem(req.params.slug);
    res.json(await getProblem(req.params.slug, { refresh: req.query.refresh === '1' }));
  });

  api.post('/problems/:slug/attempts', async (req, res) => {
    requireProblem(req.params.slug);
    const submission = validateSubmission(req.body);
    // Without a JDK there is nothing to compile with, so the check can't wait on one.
    const jdk = await javaStatus();
    res.json(await updateProgress((p) => recordAttempt(p, req.params.slug, submission, { requireRun: jdk.available })));
  });

  api.put('/problems/:slug/work', async (req, res) => {
    requireProblem(req.params.slug);
    await updateProgress((p) => saveWork(p, req.params.slug, req.body));
    res.json({ ok: true });
  });

  api.get('/java/status', async (_req, res) => {
    res.json(await javaStatus());
  });

  api.post('/problems/:slug/run', async (req, res) => {
    requireProblem(req.params.slug);
    const { code } = (req.body ?? {}) as { code?: unknown };
    if (typeof code !== 'string' || code.trim() === '') throw new HttpError(400, 'Send the Java code to compile.');
    if (code.length > 100_000) throw new HttpError(400, 'That code is larger than 100 KB.');
    const problem = await getProblem(req.params.slug);
    const result = await compileAndRun(problem, code);
    await updateProgress((p) => recordRun(p, req.params.slug, code, result));
    res.json(result);
  });

  /** Pattern finder: a slug, a LeetCode URL, or a title to search for. */
  api.get('/lookup', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) throw new HttpError(400, 'Paste a LeetCode link, a slug, or part of a title.');
    const catalog = await getCatalog();
    const slug = slugFromInput(q) ?? (findBySlug(catalog, q.toLowerCase())?.slug ?? null);
    if (!slug) {
      const matches = searchCatalog(catalog, q);
      if (matches.length === 0) throw new HttpError(404, `Nothing on LeetCode matches "${q}".`);
      if (matches.length > 1) {
        res.json({ matches });
        return;
      }
      res.json({ result: lookup(await readProgress(), await getProblem(matches[0]!.slug)) });
      return;
    }
    res.json({ result: lookup(await readProgress(), await getProblem(slug)) });
  });

  api.get('/challenge/next', async (req, res) => {
    const exclude = typeof req.query.exclude === 'string' ? req.query.exclude : undefined;
    const { slug, curated } = await pickChallenge(exclude);
    const problem = await getProblem(slug);
    const progress = await readProgress();
    res.json({
      slug,
      title: problem.title,
      difficulty: problem.difficulty,
      curated,
      contentHtml: problem.contentHtml,
      stats: challengeStats(progress),
    });
  });

  api.post('/challenge/answer', async (req, res) => {
    const { slug, pattern } = (req.body ?? {}) as { slug?: unknown; pattern?: unknown };
    if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) throw new HttpError(400, 'Which problem was answered?');
    const chosen = isPatternId(pattern) ? pattern : null;
    const problem = await getProblem(slug);
    res.json(await updateProgress((p) => gradeChallenge(p, problem, chosen)));
  });

  api.get('/practice/blind', async (req, res) => {
    const exclude = typeof req.query.exclude === 'string' ? req.query.exclude : undefined;
    res.json({ slug: pickBlind(await readProgress(), exclude) });
  });

  api.post('/leetcode/import', async (req, res) => {
    const { username, useSession } = (req.body ?? {}) as { username?: unknown; useSession?: unknown };
    let result;
    if (useSession === true) {
      const creds = sessionFromEnv();
      if (!creds) throw new HttpError(400, 'LEETCODE_SESSION is not set. Add it to .env and restart the server.');
      result = await importWithSession(creds);
    } else {
      if (typeof username !== 'string' || !USERNAME_RE.test(username.trim())) {
        throw new HttpError(400, 'Enter your LeetCode username.');
      }
      result = await importPublicProfile(username.trim());
    }
    await updateProgress((p) => {
      p.leetcode = result;
    });
    res.json(result);
  });

  /** Re-runs the last import the same way it was done before. */
  api.post('/leetcode/sync', async (_req, res) => {
    const previous = (await readProgress()).leetcode;
    if (!previous) throw new HttpError(400, 'Import your LeetCode profile first, then you can sync it.');
    const creds = sessionFromEnv();
    if (previous.source === 'session' && !creds) {
      throw new HttpError(400, 'This import used LEETCODE_SESSION, which is no longer set. Add it to .env and restart, or re-import by username.');
    }
    const fresh = previous.source === 'session' && creds ? await importWithSession(creds) : await importPublicProfile(previous.username);
    const merged = await updateProgress((p) => {
      // Keep the first import date and every solve time learned so far.
      p.leetcode = {
        ...fresh,
        importedAt: previous.importedAt,
        syncCount: (previous.syncCount ?? 1) + 1,
        solvedAt: { ...previous.solvedAt, ...fresh.solvedAt },
      };
      return p.leetcode;
    });
    res.json(merged);
  });

  /** Your own accepted submission for a problem (needs the session cookie). */
  api.post('/problems/:slug/leetcode-solution', async (req, res) => {
    requireProblem(req.params.slug);
    const creds = sessionFromEnv();
    if (!creds) throw new HttpError(400, 'Fetching your solution needs LEETCODE_SESSION in .env (see the LeetCode page).');
    const solution = await fetchMySolution(req.params.slug, creds);
    if (!solution) {
      res.json({ solution: null, message: 'LeetCode has no accepted submission from you for this problem.' });
      return;
    }
    await updateProgress((p) => recordSolution(p, req.params.slug, solution));
    res.json({ solution, message: null });
  });

  api.delete('/leetcode/import', async (_req, res) => {
    await updateProgress((p) => {
      delete p.leetcode;
    });
    res.json({ ok: true });
  });

  /**
   * Everything a model needs to review one attempt. Returned as a ready-made
   * prompt so it works with no API key at all: copy it into any chat window.
   */
  api.get('/problems/:slug/ai-prompt', async (req, res) => {
    res.json({ prompt: buildReviewPrompt(await reviewContext(req.params.slug)) });
  });

  /** The same prompt, posted to whichever model you configured. */
  api.post('/problems/:slug/ai-review', async (req, res) => {
    const ctx = await reviewContext(req.params.slug);
    res.json(await requestReview({ ...ctx, statementHtml: ctx.statementHtml }));
  });

  api.get('/ai/config', async (_req, res) => {
    res.json(aiView(await readConfig()));
  });

  api.put('/ai/config', async (req, res) => {
    res.json(await saveConfig(req.body));
  });

  api.delete('/ai/config', async (_req, res) => {
    await clearConfig();
    res.json(aiView(await readConfig()));
  });

  /** Adds to the time banked against a problem; the body is the delta since the last call. */
  api.post('/problems/:slug/time', async (req, res) => {
    res.json(await updateProgress((p) => addTime(p, req.params.slug, req.body)));
  });

  /** The whole spaced-repetition queue: due now, then what's scheduled. */
  api.get('/review', async (_req, res) => {
    const p = await readProgress();
    res.json({ summary: reviewSummary(p), due: dueList(p), upcoming: upcomingList(p, 30) });
  });

  /** Start (or restart) a study plan: N problems over W weeks. */
  api.post('/plan', async (req, res) => {
    const { size, weeks } = (req.body ?? {}) as { size?: unknown; weeks?: unknown };
    const n = Number(size);
    const w = Number(weeks);
    if (!Number.isInteger(n) || n < 1 || n > PROBLEMS.length) {
      throw new HttpError(400, `Pick between 1 and ${PROBLEMS.length} problems.`);
    }
    if (!Number.isInteger(w) || w < 1 || w > 52) throw new HttpError(400, 'Pick between 1 and 52 weeks.');
    res.json(await updateProgress((p) => setPlan(p, n, w)));
  });

  api.delete('/plan', async (_req, res) => {
    await updateProgress((p) => {
      delete p.plan;
    });
    res.json({ ok: true });
  });

  api.post('/reset', async (req, res) => {
    if ((req.body as { confirm?: unknown } | undefined)?.confirm !== 'RESET') {
      throw new HttpError(400, 'Send {"confirm":"RESET"} to erase your progress.');
    }
    // A copy is taken first, so this is always undoable.
    res.json({ ok: true, backup: await resetProgress() });
  });

  /** Every copy of progress.json taken before something overwrote it. */
  api.get('/backups', async (_req, res) => {
    res.json(await listBackups());
  });

  api.post('/backups/restore', async (req, res) => {
    const { name } = (req.body ?? {}) as { name?: unknown };
    if (typeof name !== 'string') throw new HttpError(400, 'Which backup should be restored?');
    try {
      const restored = await restoreBackup(name);
      res.json({ ok: true, attempts: restored.history.length, problems: Object.keys(restored.problems).length });
    } catch (err) {
      throw new HttpError(400, `Couldn't restore that backup: ${(err as Error).message}`);
    }
  });

  api.use((_req, res) => {
    res.status(404).json({ error: 'Unknown API route.' });
  });

  app.use('/api', api);

  // The drawing canvas's fonts, straight from the package. Without this Excalidraw
  // fetches them from esm.sh, and this app makes no network calls it doesn't have to.
  const excalidrawAssets = resolve('node_modules/@excalidraw/excalidraw/dist/prod');
  if (existsSync(join(excalidrawAssets, 'fonts'))) {
    app.use('/excalidraw', express.static(excalidrawAssets, { immutable: true, maxAge: '30d', index: false }));
  }

  // Serve the built UI (npm start). In development Vite serves it instead.
  if (existsSync(join(webDir, 'index.html'))) {
    app.use(express.static(webDir));
    app.use((req, res, next) => {
      // Pass `root` so only the part below it is checked for dot-segments; an absolute path
      // is rejected whenever the checkout itself lives under a dot-directory (e.g. .claude/).
      if (req.method === 'GET' && !req.path.startsWith('/api/')) res.sendFile('index.html', { root: webDir });
      else next();
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError || err instanceof LeetCodeError) {
      return res.status(err.status).json({ error: err.message });
    }
    const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
    if (status && status >= 400 && status < 500) {
      return res.status(status).json({ error: (err as Error).message || 'Bad request.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server; see its console for details.' });
  });

  return app;
}

/** Gathers the problem, the candidate's work and how it went, for an AI review. */
async function reviewContext(slug: string) {
  const problem = requireProblem(slug);
  const progress = (await readProgress()).problems[slug] ?? null;
  const curated = getCurated(slug);
  let statementHtml: string | null = null;
  try {
    statementHtml = (await getProblem(slug)).contentHtml;
  } catch {
    statementHtml = null; // offline is fine; the model still gets the code and the answers
  }
  const attempted = (progress?.attempts ?? 0) > 0;
  return {
    slug,
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    statementHtml,
    statement: statementToText(statementHtml),
    // Both only make sense once they've committed to an answer.
    pattern: attempted && curated ? patternName(curated.pattern) : null,
    referenceApproach: attempted ? (curated?.approach ?? null) : null,
    code: progress?.code ?? null,
    notes: progress?.notes ?? null,
    attempt: progress?.lastResult ?? null,
    run: null,
  };
}
