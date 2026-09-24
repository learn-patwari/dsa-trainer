import type { Difficulty, LeetCodeImport, LeetCodeProblem, LeetCodeSolution, LeetCodeTagCount } from '../shared/types.ts';
import { readCachedProblem, writeCachedProblem } from './store.ts';

/**
 * Minimal client for LeetCode's public (unofficial) GraphQL API and, optionally,
 * the signed-in problem list. Problem statements are fetched on demand and cached
 * under data/ for personal use; they are never bundled with the app.
 */

const ORIGIN = 'https://leetcode.com';
const TIMEOUT_MS = 15_000;
const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (dsa-trainer; personal study tool)',
  Referer: `${ORIGIN}/`,
};

export class LeetCodeError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
  }
}

export interface SessionCredentials {
  session: string;
  csrfToken?: string;
}

export function sessionFromEnv(): SessionCredentials | null {
  const session = process.env.LEETCODE_SESSION?.trim();
  if (!session) return null;
  return { session, csrfToken: process.env.LEETCODE_CSRF_TOKEN?.trim() || undefined };
}

function cookieHeader(creds: SessionCredentials): string {
  return [`LEETCODE_SESSION=${creds.session}`, creds.csrfToken ? `csrftoken=${creds.csrfToken}` : null]
    .filter(Boolean)
    .join('; ');
}

async function request(path: string, init: RequestInit & { creds?: SessionCredentials }): Promise<unknown> {
  const headers: Record<string, string> = { ...BASE_HEADERS, ...(init.headers as Record<string, string>) };
  if (init.creds) {
    headers.Cookie = cookieHeader(init.creds);
    if (init.creds.csrfToken) headers['x-csrftoken'] = init.creds.csrfToken;
  }
  let res: Response;
  try {
    res = await fetch(`${ORIGIN}${path}`, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timed out' : 'could not be reached';
    throw new LeetCodeError(`LeetCode ${reason}. Check your internet connection and try again.`, 504);
  }
  if (res.status === 403 || res.status === 429) {
    throw new LeetCodeError(`LeetCode refused the request (HTTP ${res.status}); wait a minute and retry.`, 503);
  }
  if (!res.ok) throw new LeetCodeError(`LeetCode responded with HTTP ${res.status}.`);
  try {
    return await res.json();
  } catch {
    throw new LeetCodeError('LeetCode returned something other than JSON (possibly a bot check page).');
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function graphql<T>(query: string, variables: Record<string, unknown>, creds?: SessionCredentials): Promise<GraphQLResponse<T>> {
  return (await request('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    creds,
  })) as GraphQLResponse<T>;
}

// ---------------------------------------------------------------- problems

const QUESTION_QUERY = `query question($slug: String!) {
  question(titleSlug: $slug) {
    questionFrontendId title titleSlug content difficulty isPaidOnly
    topicTags { name slug }
    codeSnippets { langSlug code }
    hints
    exampleTestcaseList
    metaData
    similarQuestions
  }
}`;

/** Bump when a new field is needed, so older cached copies are refetched. */
const CACHE_VERSION = 3;

interface RawQuestion {
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  content: string | null;
  difficulty: Difficulty;
  isPaidOnly: boolean;
  topicTags: { name: string; slug: string }[];
  codeSnippets: { langSlug: string; code: string }[] | null;
  hints: string[];
  exampleTestcaseList: string[] | null;
  metaData: string | null;
  similarQuestions: string | null;
}

const ENTITIES: Record<string, string> = {
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&#34;': '"',
};

function decodeEntities(s: string): string {
  return s.replace(/&(?:quot|#39|apos|amp|lt|gt|nbsp|#34);/g, (m) => ENTITIES[m] ?? m);
}

/**
 * Pulls the expected outputs out of a statement. LeetCode uses three shapes:
 * `<strong>Output:</strong> <span…>V</span>`, `<strong>Output:</strong> V` inside a <pre>,
 * and `<strong>Output</strong>` with the value on the next line.
 */
export function extractExampleOutputs(contentHtml: string | null): string[] {
  if (!contentHtml) return [];
  const outputs: string[] = [];
  const label = /<strong[^>]*>\s*Output:?\s*<\/strong>/gi;
  for (let m = label.exec(contentHtml); m; m = label.exec(contentHtml)) {
    const rest = contentHtml.slice(m.index + m[0].length);
    const end = rest.search(/<strong|<\/pre>|<\/div>/i);
    const chunk = end === -1 ? rest.slice(0, 600) : rest.slice(0, end);
    const text = decodeEntities(chunk.replace(/<[^>]+>/g, '')).trim();
    const firstLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
    if (firstLine) outputs.push(firstLine);
  }
  return outputs;
}

const inFlight = new Map<string, Promise<LeetCodeProblem>>();

/** Returns a problem from the local cache, fetching (and caching) it from LeetCode when needed. */
export async function getProblem(slug: string, { refresh = false } = {}): Promise<LeetCodeProblem & { stale?: boolean }> {
  const cached = await readCachedProblem(slug);
  if (cached && !refresh && cached.cacheVersion === CACHE_VERSION) return cached;
  try {
    return await fetchProblemOnce(slug);
  } catch (err) {
    if (cached) return { ...cached, stale: true };
    throw err;
  }
}

function fetchProblemOnce(slug: string): Promise<LeetCodeProblem> {
  let pending = inFlight.get(slug);
  if (!pending) {
    pending = fetchProblem(slug).finally(() => inFlight.delete(slug));
    inFlight.set(slug, pending);
  }
  return pending;
}

async function fetchProblem(slug: string): Promise<LeetCodeProblem> {
  const res = await graphql<{ question: RawQuestion | null }>(QUESTION_QUERY, { slug });
  const q = res.data?.question;
  if (!q) throw new LeetCodeError(`LeetCode has no problem called "${slug}".`, 404);
  const problem: LeetCodeProblem = {
    slug: q.titleSlug,
    id: Number(q.questionFrontendId),
    title: q.title,
    difficulty: q.difficulty,
    paidOnly: q.isPaidOnly,
    contentHtml: q.content,
    hints: q.hints ?? [],
    topicTags: q.topicTags ?? [],
    javaSnippet: q.codeSnippets?.find((s) => s.langSlug === 'java')?.code ?? null,
    exampleTestcases: q.exampleTestcaseList ?? [],
    metaData: q.metaData ?? null,
    similarQuestions: q.similarQuestions ?? null,
    exampleOutputs: extractExampleOutputs(q.content),
    fetchedAt: new Date().toISOString(),
    cacheVersion: CACHE_VERSION,
  };
  await writeCachedProblem(problem);
  return problem;
}

// ---------------------------------------------------------------- profile import

const PROFILE_QUERY = `query profile($username: String!, $limit: Int!) {
  matchedUser(username: $username) {
    username
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    tagProblemCounts {
      advanced { tagName tagSlug problemsSolved }
      intermediate { tagName tagSlug problemsSolved }
      fundamental { tagName tagSlug problemsSolved }
    }
  }
  recentAcSubmissionList(username: $username, limit: $limit) { titleSlug timestamp }
}`;

type TagTier = { tagName: string; tagSlug: string; problemsSolved: number }[];
interface RawProfile {
  matchedUser: null | {
    username: string;
    submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] };
    tagProblemCounts: { advanced: TagTier; intermediate: TagTier; fundamental: TagTier };
  };
  recentAcSubmissionList: { titleSlug: string; timestamp: string }[] | null;
}

export const USERNAME_RE = /^[A-Za-z0-9_.-]{1,50}$/;

/** Public profile data: solved counts, per-topic counts and the recent accepted list. */
export async function importPublicProfile(username: string): Promise<LeetCodeImport> {
  if (!USERNAME_RE.test(username)) throw new LeetCodeError('That does not look like a LeetCode username.', 400);
  const res = await graphql<RawProfile>(PROFILE_QUERY, { username, limit: 50 });
  const user = res.data?.matchedUser;
  if (!user) throw new LeetCodeError(`No public LeetCode profile found for "${username}".`, 404);

  const counts = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map((a) => [a.difficulty, a.count]));
  const tiers = user.tagProblemCounts;
  const tagCounts: LeetCodeTagCount[] = [...tiers.fundamental, ...tiers.intermediate, ...tiers.advanced].map((t) => ({
    tagSlug: t.tagSlug,
    tagName: t.tagName,
    solved: t.problemsSolved,
  }));
  const recent = res.data?.recentAcSubmissionList ?? [];
  const solvedAt: Record<string, number> = {};
  for (const s of recent) {
    const ts = Number(s.timestamp);
    // Keep the most recent accepted time per problem.
    if (Number.isFinite(ts) && ts > (solvedAt[s.titleSlug] ?? 0)) solvedAt[s.titleSlug] = ts;
  }
  const now = new Date().toISOString();
  return {
    username: user.username,
    importedAt: now,
    syncedAt: now,
    syncCount: 1,
    source: 'public',
    fullList: false,
    solvedCounts: { all: counts.All ?? 0, easy: counts.Easy ?? 0, medium: counts.Medium ?? 0, hard: counts.Hard ?? 0 },
    tagCounts,
    solvedSlugs: [...new Set(recent.map((s) => s.titleSlug))],
    solvedAt,
  };
}

interface RawAllProblems {
  user_name: string;
  num_solved: number;
  ac_easy: number;
  ac_medium: number;
  ac_hard: number;
  stat_status_pairs: { stat: { question__title_slug: string }; status: string | null }[];
}

/**
 * Complete solved list for the account behind LEETCODE_SESSION, combined with that
 * account's public per-topic counts. The cookie never leaves the server except to leetcode.com.
 */
export async function importWithSession(creds: SessionCredentials): Promise<LeetCodeImport> {
  const all = (await request('/api/problems/all/', { method: 'GET', creds })) as RawAllProblems;
  if (!all?.user_name) {
    throw new LeetCodeError('LeetCode did not accept LEETCODE_SESSION (it may have expired). Copy a fresh cookie into .env and restart.', 401);
  }
  const profile = await importPublicProfile(all.user_name);
  return {
    ...profile,
    source: 'session',
    fullList: true,
    solvedCounts: { all: all.num_solved, easy: all.ac_easy, medium: all.ac_medium, hard: all.ac_hard },
    solvedSlugs: all.stat_status_pairs.filter((p) => p.status === 'ac').map((p) => p.stat.question__title_slug),
  };
}

/** The whole problem list in one request: slug, title, difficulty and the premium flag. */
export async function fetchCatalog(): Promise<{ slug: string; id: number; title: string; difficulty: Difficulty; paidOnly: boolean }[]> {
  const all = (await request('/api/problems/all/', { method: 'GET' })) as {
    stat_status_pairs?: {
      stat: { question__title: string; question__title_slug: string; frontend_question_id: number };
      difficulty: { level: number };
      paid_only: boolean;
    }[];
  };
  const pairs = all?.stat_status_pairs;
  if (!Array.isArray(pairs)) throw new LeetCodeError("LeetCode's problem list came back in an unexpected shape.");
  const levels: Record<number, Difficulty> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  return pairs.map((p) => ({
    slug: p.stat.question__title_slug,
    id: p.stat.frontend_question_id,
    title: p.stat.question__title,
    difficulty: levels[p.difficulty.level] ?? 'Medium',
    paidOnly: p.paid_only,
  }));
}

// ---------------------------------------------------------------- your submissions

const SUBMISSIONS_QUERY = `query submissions($slug: String!, $offset: Int!, $limit: Int!) {
  questionSubmissionList(questionSlug: $slug, offset: $offset, limit: $limit) {
    submissions { id statusDisplay lang timestamp runtime memory }
  }
}`;

const SUBMISSION_CODE_QUERY = `query detail($id: Int!) {
  submissionDetails(submissionId: $id) { code timestamp statusDisplay runtime memoryDisplay lang { name } }
}`;

interface RawSubmission {
  id: string;
  statusDisplay: string;
  lang: string;
  timestamp: string;
  runtime: string | null;
  memory: string | null;
}

/**
 * Your own accepted submission for a problem: when it was accepted and the code you wrote.
 * Requires LEETCODE_SESSION; LeetCode exposes nothing of this publicly.
 */
export async function fetchMySolution(slug: string, creds: SessionCredentials): Promise<LeetCodeSolution | null> {
  const list = await graphql<{ questionSubmissionList: { submissions: RawSubmission[] | null } | null }>(
    SUBMISSIONS_QUERY,
    { slug, offset: 0, limit: 20 },
    creds,
  );
  const subs = list.data?.questionSubmissionList?.submissions;
  if (subs == null) {
    throw new LeetCodeError('LeetCode did not accept LEETCODE_SESSION (it may have expired). Refresh the cookie in .env and restart.', 401);
  }
  const accepted = subs.filter((s) => s.statusDisplay === 'Accepted');
  if (accepted.length === 0) return null;
  const best = accepted.reduce((a, b) => (Number(b.timestamp) > Number(a.timestamp) ? b : a));

  let code: string | null = null;
  let memory: string | null = best.memory;
  try {
    const detail = await graphql<{ submissionDetails: { code: string; memoryDisplay: string | null } | null }>(
      SUBMISSION_CODE_QUERY,
      { id: Number(best.id) },
      creds,
    );
    code = detail.data?.submissionDetails?.code ?? null;
    memory = detail.data?.submissionDetails?.memoryDisplay ?? memory;
  } catch {
    // The list already tells us when it was solved; the code is a bonus.
  }
  return {
    submissionId: Number(best.id),
    lang: best.lang,
    solvedAt: Number(best.timestamp),
    code,
    runtime: best.runtime,
    memory,
    fetchedAt: new Date().toISOString(),
  };
}
