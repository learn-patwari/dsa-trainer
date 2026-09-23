import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getProblem, importPublicProfile, importWithSession, LeetCodeError, sessionFromEnv, USERNAME_RE } from './leetcode.ts';
import { readProgress, resetProgress, updateProgress } from './store.ts';
import {
  dashboard,
  HttpError,
  parseMode,
  patternDetail,
  pickBlind,
  problemView,
  recordAttempt,
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
  app.use(express.json({ limit: '1mb' }));

  const api = express.Router();

  api.get('/state', async (_req, res) => {
    res.json(dashboard(await readProgress(), sessionFromEnv() != null));
  });

  api.get('/patterns/:id', async (req, res) => {
    res.json(patternDetail(await readProgress(), requirePatternId(req.params.id)));
  });

  api.get('/problems/:slug', async (req, res) => {
    res.json(problemView(await readProgress(), req.params.slug, parseMode(req.query.mode)));
  });

  api.get('/problems/:slug/leetcode', async (req, res) => {
    requireProblem(req.params.slug);
    res.json(await getProblem(req.params.slug, { refresh: req.query.refresh === '1' }));
  });

  api.post('/problems/:slug/attempts', async (req, res) => {
    requireProblem(req.params.slug);
    const submission = validateSubmission(req.body);
    res.json(await updateProgress((p) => recordAttempt(p, req.params.slug, submission)));
  });

  api.put('/problems/:slug/work', async (req, res) => {
    requireProblem(req.params.slug);
    await updateProgress((p) => saveWork(p, req.params.slug, req.body));
    res.json({ ok: true });
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

  api.delete('/leetcode/import', async (_req, res) => {
    await updateProgress((p) => {
      delete p.leetcode;
    });
    res.json({ ok: true });
  });

  api.post('/reset', async (req, res) => {
    if ((req.body as { confirm?: unknown } | undefined)?.confirm !== 'RESET') {
      throw new HttpError(400, 'Send {"confirm":"RESET"} to erase your progress.');
    }
    await resetProgress();
    res.json({ ok: true });
  });

  api.use((_req, res) => {
    res.status(404).json({ error: 'Unknown API route.' });
  });

  app.use('/api', api);

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
