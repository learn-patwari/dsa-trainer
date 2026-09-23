export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const PATTERN_IDS = [
  'hashing',
  'two-pointers',
  'sliding-window',
  'prefix-sum',
  'binary-search',
  'stack',
  'monotonic-stack',
  'linked-list',
  'fast-slow',
  'tree-dfs',
  'tree-bfs',
  'heap',
  'intervals',
  'greedy',
  'backtracking',
  'graph-traversal',
  'topological-sort',
  'union-find',
  'shortest-path',
  'dp-1d',
  'dp-2d',
  'trie',
  'bit-manipulation',
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

export interface Pattern {
  id: PatternId;
  name: string;
  group: string;
  summary: string;
  /** Cues in a problem statement that suggest this pattern. */
  signals: string[];
  idea: string;
  steps: string[];
  template: { title: string; code: string };
  complexity: string;
  pitfalls: string[];
  /** LeetCode topic-tag slugs used to estimate how much of this pattern you've solved there. */
  leetcodeTags: string[];
}

type Four = readonly [string, string, string, string];

/**
 * A curated problem and its answer key. By convention the FIRST option of
 * every multiple-choice question is the correct one; the server shuffles
 * options before sending them to the browser.
 */
export interface CuratedProblem {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  pattern: PatternId;
  /** Other patterns that also lead to an optimal solution (partial credit). */
  alsoAccept?: PatternId[];
  insight: { q: string; options: Four; why: string };
  /** What the variables in the complexity options mean, when it isn't obvious. */
  vars?: string;
  time: Four;
  space: Four;
  edgeCases: string[];
  /** Reference approach, revealed after an attempt. */
  approach: string;
}

export type PracticeMode = 'pattern' | 'blind';

export interface QuizView {
  askPattern: boolean;
  insight: { q: string; options: string[] };
  vars: string | null;
  time: string[];
  space: string[];
  edgeCases: string[];
}

export interface AttemptSubmission {
  mode: PracticeMode;
  pattern: PatternId | null;
  insight: string | null;
  time: string | null;
  space: string | null;
  edgeCasesHandled: number[];
  hintsUsed: number;
  elapsedSec: number;
}

export type QuestionKey = 'pattern' | 'insight' | 'time' | 'space' | 'edgeCases';
export type Verdict = 'correct' | 'partial' | 'wrong' | 'skipped';

export interface QuestionResult {
  key: QuestionKey;
  label: string;
  earned: number;
  max: number;
  verdict: Verdict;
  chosen: string | null;
  correct: string;
  explanation?: string;
}

export interface AttemptResult {
  slug: string;
  title: string;
  mode: PracticeMode;
  pattern: PatternId;
  score: number;
  maxScore: number;
  hintPenalty: number;
  percent: number;
  rated: boolean;
  ratingBefore: number;
  ratingAfter: number;
  breakdown: QuestionResult[];
  approach: string;
  at: string;
  elapsedSec: number;
}

export interface ProblemProgress {
  attempts: number;
  bestPercent: number;
  lastPercent: number;
  lastAt: string;
  lastResult?: AttemptResult;
  code?: string;
  notes?: string;
  /** Summary of the last compile & run, for the "code verified" badge. */
  lastRun?: { at: string; compiled: boolean; passed: number; checked: number; total: number };
}

export interface LeetCodeTagCount {
  tagSlug: string;
  tagName: string;
  solved: number;
}

export interface LeetCodeImport {
  username: string;
  importedAt: string;
  source: 'public' | 'session';
  /** True when solvedSlugs is your complete solved list (session import). */
  fullList: boolean;
  solvedCounts: { all: number; easy: number; medium: number; hard: number };
  tagCounts: LeetCodeTagCount[];
  solvedSlugs: string[];
}

export interface Progress {
  version: 1;
  ratings: Partial<Record<PatternId, number>>;
  ratedAttempts: Partial<Record<PatternId, number>>;
  history: AttemptResult[];
  problems: Record<string, ProblemProgress>;
  leetcode?: LeetCodeImport;
}

/** Problem statement and extras fetched live from LeetCode. */
export interface LeetCodeProblem {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  paidOnly: boolean;
  contentHtml: string | null;
  hints: string[];
  topicTags: { name: string; slug: string }[];
  javaSnippet: string | null;
  exampleTestcases: string[];
  /** LeetCode's signature description (JSON): method name, parameter types, return type. */
  metaData: string | null;
  /** Expected outputs scraped from the statement, aligned with exampleTestcases. */
  exampleOutputs: string[];
  fetchedAt: string;
  cacheVersion?: number;
}

// ---------- compile & run ----------

export interface CompileError {
  line: number | null;
  message: string;
}

export type TestVerdict = 'pass' | 'pass-unordered' | 'fail' | 'error' | 'timeout' | 'unchecked' | 'not-run';

export interface TestResult {
  index: number;
  input: string;
  expected: string | null;
  actual: string | null;
  verdict: TestVerdict;
  ms: number | null;
  stdout: string;
  error: string | null;
}

export interface RunResult {
  compiled: boolean;
  compileMs: number;
  compileErrors: CompileError[];
  compilerOutput: string;
  tests: TestResult[];
  passed: number;
  checked: number;
  total: number;
  runMs: number;
  /** Why tests were skipped or couldn't be checked, when that happened. */
  note: string | null;
  at: string;
}

export interface JavaStatus {
  available: boolean;
  version: string | null;
  message: string | null;
}

// ---------- API response shapes ----------

export type Tier = 'Not started' | 'Novice' | 'Learning' | 'Solid' | 'Strong' | 'Expert';

export interface PatternSummary {
  id: PatternId;
  name: string;
  group: string;
  summary: string;
  rating: number | null;
  tier: Tier;
  ratedAttempts: number;
  total: number;
  attempted: number;
  /** Problems in this pattern you've solved on LeetCode (from the import). */
  lcSolvedInSet: number;
  /** Rough count of LeetCode problems solved under this pattern's tags, or null if unknown. */
  lcTagSolved: number | null;
}

export interface Recommendation {
  slug: string;
  title: string;
  difficulty: Difficulty;
  pattern: PatternId;
  patternName: string;
  reason: string;
}

export interface DashboardState {
  overall: number | null;
  overallTier: Tier;
  attemptedProblems: number;
  totalProblems: number;
  patterns: PatternSummary[];
  upNext: Recommendation[];
  recent: AttemptResult[];
  leetcode: LeetCodeImport | null;
  sessionConfigured: boolean;
}

export interface ProblemRow {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  attempts: number;
  bestPercent: number | null;
  lcSolved: boolean;
  /** Your saved code compiled and passed every checked example test. */
  codeVerified: boolean;
}

export interface PatternDetail {
  pattern: Pattern;
  summary: PatternSummary;
  problems: ProblemRow[];
}

export interface ProblemView {
  slug: string;
  id: number;
  title: string;
  difficulty: Difficulty;
  mode: PracticeMode;
  /** Hidden in blind mode until you have attempted the problem. */
  pattern: { id: PatternId; name: string } | null;
  quiz: QuizView;
  lcSolved: boolean;
  progress: ProblemProgress | null;
  nextInPattern: string | null;
}
