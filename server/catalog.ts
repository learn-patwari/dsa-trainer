import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Difficulty } from '../shared/types.ts';
import { fetchCatalog } from './leetcode.ts';
import { DATA_DIR, writeCacheFile } from './store.ts';

/**
 * A local copy of LeetCode's problem list (slug, title, difficulty, premium flag) so the
 * app can pick and search among all ~4,000 problems without hammering the API.
 */

export interface CatalogEntry {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  paidOnly: boolean;
}

export interface Catalog {
  fetchedAt: string;
  problems: CatalogEntry[];
}

const CATALOG_FILE = join(DATA_DIR, 'cache', 'catalog.json');
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let memo: Catalog | null = null;
let inFlight: Promise<Catalog> | null = null;

export async function getCatalog({ refresh = false } = {}): Promise<Catalog> {
  if (!refresh && memo && !isStale(memo)) return memo;
  if (!refresh) {
    const onDisk = await readCatalogFile();
    if (onDisk && !isStale(onDisk)) {
      memo = onDisk;
      return onDisk;
    }
  }
  inFlight ??= fetchCatalog()
    .then(async (problems) => {
      const catalog: Catalog = { fetchedAt: new Date().toISOString(), problems };
      await writeCacheFile(CATALOG_FILE, JSON.stringify(catalog));
      memo = catalog;
      return catalog;
    })
    .finally(() => {
      inFlight = null;
    });
  try {
    return await inFlight;
  } catch (err) {
    // A stale copy beats no catalog at all.
    const fallback = memo ?? (await readCatalogFile());
    if (fallback) return fallback;
    throw err;
  }
}

function isStale(c: Catalog): boolean {
  return Date.now() - new Date(c.fetchedAt).getTime() > MAX_AGE_MS;
}

async function readCatalogFile(): Promise<Catalog | null> {
  try {
    return JSON.parse(await readFile(CATALOG_FILE, 'utf8')) as Catalog;
  } catch {
    return null;
  }
}

/** Free problems only: premium statements can't be fetched. */
export function freeProblems(catalog: Catalog): CatalogEntry[] {
  return catalog.problems.filter((p) => !p.paidOnly);
}

export function findBySlug(catalog: Catalog, slug: string): CatalogEntry | undefined {
  return catalog.problems.find((p) => p.slug === slug);
}

/** Title/slug search, preferring titles that start with the query. */
export function searchCatalog(catalog: Catalog, query: string, limit = 8): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches = catalog.problems.filter((p) => !p.paidOnly && (p.title.toLowerCase().includes(q) || p.slug.includes(q)));
  return matches
    .sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.title.length - b.title.length || a.id - b.id;
    })
    .slice(0, limit);
}

/** Accepts a slug, a full LeetCode URL, or anything with /problems/<slug>/ in it. */
export function slugFromInput(input: string): string | null {
  const text = input.trim();
  const fromUrl = /leetcode\.com\/problems\/([a-z0-9-]+)/i.exec(text);
  if (fromUrl) return fromUrl[1]!.toLowerCase();
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text.toLowerCase()) && text.includes('-')) return text.toLowerCase();
  return null;
}
