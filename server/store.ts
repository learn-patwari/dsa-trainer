import { copyFile, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LeetCodeProblem, Progress } from '../shared/types.ts';

/**
 * Everything the app persists lives here (gitignored): progress, a cache of
 * fetched problems, and rolling backups of progress.json.
 *
 * The path is resolved from this file, not from the working directory. Starting
 * the server from somewhere else used to give you a different, empty data folder,
 * which looks exactly like losing all your progress.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = resolve(process.env.DSA_DATA_DIR ?? join(HERE, '..', 'data'));
const PROGRESS_FILE = join(DATA_DIR, 'progress.json');
const BACKUP_DIR = join(DATA_DIR, 'backups');
const PROBLEM_CACHE_DIR = join(DATA_DIR, 'cache', 'problems');
/** One file per problem: a scene can hold pasted images, too big to rewrite on every progress save. */
const DRAWING_DIR = join(DATA_DIR, 'drawings');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BACKUP_RE = /^progress-[\w.-]+\.json$/;

/** How many old copies to keep, and how often a routine one is taken. */
const KEEP_BACKUPS = 40;
const BACKUP_EVERY_MS = 10 * 60 * 1000;

export function emptyProgress(): Progress {
  return { version: 1, ratings: {}, ratedAttempts: {}, history: [], problems: {} };
}

let progress: Progress | null = null;
/** Size and mtime of the file as we last saw it, to notice edits from elsewhere. */
let seen: { mtimeMs: number; size: number } | null = null;
let lastBackupMs = 0;
let lock: Promise<unknown> = Promise.resolve();

async function statOrNull(file: string): Promise<{ mtimeMs: number; size: number } | null> {
  try {
    const s = await stat(file);
    return { mtimeMs: s.mtimeMs, size: s.size };
  } catch {
    return null;
  }
}

/**
 * True when the file on disk is still the one our cached copy came from. A second
 * server, an editor, or a restore can change it underneath us; writing our stale
 * copy over that would silently throw the newer work away.
 */
async function cacheIsFresh(): Promise<boolean> {
  const now = await statOrNull(PROGRESS_FILE);
  if (now === null && seen === null) return true;
  if (now === null || seen === null) return false;
  return now.mtimeMs === seen.mtimeMs && now.size === seen.size;
}

async function load(): Promise<Progress> {
  if (progress && (await cacheIsFresh())) return progress;
  try {
    progress = { ...emptyProgress(), ...(JSON.parse(await readFile(PROGRESS_FILE, 'utf8')) as Progress) };
  } catch (err) {
    if (isErrno(err, 'ENOENT')) {
      progress = emptyProgress();
    } else if (err instanceof SyntaxError) {
      // Keep the unreadable file for inspection instead of silently overwriting it.
      const broken = `${PROGRESS_FILE}.corrupt-${Date.now()}`;
      await rename(PROGRESS_FILE, broken);
      console.warn(`progress.json was not valid JSON; moved it to ${broken} and started fresh.`);
      progress = emptyProgress();
    } else {
      throw err;
    }
  }
  seen = await statOrNull(PROGRESS_FILE);
  return progress;
}

/** Read-only snapshot for GET handlers. */
export function readProgress(): Promise<Progress> {
  return serialize(load);
}

/** Runs `fn` against the progress document and persists it; calls are serialized. */
export function updateProgress<T>(fn: (p: Progress) => T): Promise<T> {
  return serialize(async () => {
    const p = await load();
    if (Date.now() - lastBackupMs > BACKUP_EVERY_MS) await snapshot('auto');
    const result = fn(p);
    await atomicWrite(PROGRESS_FILE, JSON.stringify(p, null, 1));
    seen = await statOrNull(PROGRESS_FILE);
    return result;
  });
}

// ---------------------------------------------------------------- backups

export interface BackupInfo {
  name: string;
  at: string;
  bytes: number;
  /** What prompted it: a routine copy, or the thing that was about to overwrite it. */
  reason: string;
}

/**
 * Copies the current progress file aside. Taken routinely while you work, and
 * always before anything that would destroy it, so "start over" is never final.
 */
async function snapshot(reason: string): Promise<string | null> {
  const current = await statOrNull(PROGRESS_FILE);
  if (!current || current.size === 0) return null;
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `progress-${stamp}-${reason}.json`;
  await copyFile(PROGRESS_FILE, join(BACKUP_DIR, name));
  lastBackupMs = Date.now();
  await prune();
  return name;
}

async function prune(): Promise<void> {
  const names = (await readdir(BACKUP_DIR).catch(() => [])).filter((n) => BACKUP_RE.test(n)).sort();
  for (const old of names.slice(0, Math.max(0, names.length - KEEP_BACKUPS))) {
    await unlink(join(BACKUP_DIR, old)).catch(() => undefined);
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  const names = (await readdir(BACKUP_DIR).catch(() => [])).filter((n) => BACKUP_RE.test(n));
  const rows = await Promise.all(
    names.map(async (name) => {
      const s = await statOrNull(join(BACKUP_DIR, name));
      const reason = /-([a-z-]+)\.json$/.exec(name)?.[1] ?? 'auto';
      return { name, at: new Date(s?.mtimeMs ?? 0).toISOString(), bytes: s?.size ?? 0, reason };
    }),
  );
  return rows.sort((a, b) => b.at.localeCompare(a.at));
}

/** Puts a backup back, after copying aside whatever it replaces. */
export async function restoreBackup(name: string): Promise<Progress> {
  if (!BACKUP_RE.test(name)) throw new Error('That is not a backup file name.');
  const text = await readFile(join(BACKUP_DIR, name), 'utf8'); // throws if it isn't there
  const parsed = { ...emptyProgress(), ...(JSON.parse(text) as Progress) };

  return serialize(async () => {
    await snapshot('before-restore');
    await atomicWrite(PROGRESS_FILE, JSON.stringify(parsed, null, 1));
    progress = parsed;
    seen = await statOrNull(PROGRESS_FILE);
    return parsed;
  });
}

/**
 * Start over: ratings, attempts, saved code/notes and the LeetCode import are all
 * cleared. A backup is taken first, and its name comes back so it can be offered.
 */
export function resetProgress(): Promise<string | null> {
  return serialize(async () => {
    await load();
    const backup = await snapshot('before-reset');
    progress = emptyProgress();
    await atomicWrite(PROGRESS_FILE, JSON.stringify(progress, null, 1));
    seen = await statOrNull(PROGRESS_FILE);
    return backup;
  });
}

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.catch(() => undefined);
  return run;
}

// ---------------------------------------------------------------- drawings

export async function readDrawing(slug: string): Promise<string | null> {
  try {
    return await readFile(drawingPath(slug), 'utf8');
  } catch (err) {
    if (isErrno(err, 'ENOENT')) return null;
    throw err;
  }
}

/** Keeps the previous version beside it, so one bad save can always be walked back. */
export async function writeDrawing(slug: string, scene: string): Promise<void> {
  const file = drawingPath(slug);
  const prev = await statOrNull(file);
  if (prev && prev.size > 0) await copyFile(file, `${file}.prev`).catch(() => undefined);
  await atomicWrite(file, scene);
}

function drawingPath(slug: string): string {
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug: ${slug}`);
  return join(DRAWING_DIR, `${slug}.json`);
}

// ---------------------------------------------------------------- problem cache

export async function readCachedProblem(slug: string): Promise<LeetCodeProblem | null> {
  try {
    return JSON.parse(await readFile(cachePath(slug), 'utf8')) as LeetCodeProblem;
  } catch (err) {
    if (isErrno(err, 'ENOENT') || err instanceof SyntaxError) return null;
    throw err;
  }
}

export async function writeCachedProblem(problem: LeetCodeProblem): Promise<void> {
  await atomicWrite(cachePath(problem.slug), JSON.stringify(problem));
}

/** Writes any other cache file (currently the problem catalog) under data/cache. */
export async function writeCacheFile(file: string, contents: string): Promise<void> {
  await atomicWrite(file, contents);
}

function cachePath(slug: string): string {
  if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug: ${slug}`);
  return join(PROBLEM_CACHE_DIR, `${slug}.json`);
}

async function atomicWrite(file: string, data: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, data);
  // Windows can briefly lock the target (antivirus, indexers); retry the rename a few times.
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(tmp, file);
      return;
    } catch (err) {
      const transient = isErrno(err, 'EPERM') || isErrno(err, 'EBUSY') || isErrno(err, 'EACCES');
      if (!transient || attempt >= 5) throw err;
      await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
    }
  }
}

function isErrno(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && (err as NodeJS.ErrnoException).code === code;
}
