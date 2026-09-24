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
  /** Striver's ladder: the obvious slow solution the optimal one improves on. */
  brute?: { text: string; time: Four };
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
  /** Present when the problem has a brute-force reference; asked before the optimal approach. */
  brute: { options: string[] } | null;
  insight: { q: string; options: string[] };
  vars: string | null;
  time: string[];
  space: string[];
  edgeCases: string[];
}

export interface AttemptSubmission {
  mode: PracticeMode;
  pattern: PatternId | null;
  brute: string | null;
  insight: string | null;
  time: string | null;
  space: string | null;
  edgeCasesHandled: number[];
  hintsUsed: number;
  elapsedSec: number;
}

export type QuestionKey = 'pattern' | 'brute' | 'insight' | 'time' | 'space' | 'edgeCases';
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
  /** Your accepted LeetCode submission for this problem, fetched with the session cookie. */
  leetcodeSolution?: LeetCodeSolution;
}

export interface LeetCodeSolution {
  submissionId: number;
  lang: string;
  /** Unix seconds when LeetCode accepted it. */
  solvedAt: number;
  code: string | null;
  runtime: string | null;
  memory: string | null;
  fetchedAt: string;
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
  /** Accepted-at times (unix seconds) for the solves LeetCode reports publicly. */
  solvedAt?: Record<string, number>;
  /** Set on every sync; importedAt stays the first import. */
  syncedAt?: string;
  syncCount?: number;
}

export interface Progress {
  version: 1;
  ratings: Partial<Record<PatternId, number>>;
  ratedAttempts: Partial<Record<PatternId, number>>;
  history: AttemptResult[];
  problems: Record<string, ProblemProgress>;
  leetcode?: LeetCodeImport;
  /** Challenge mode: pattern recognition over any LeetCode problem. */
  challenge?: ChallengeStats & { perPattern: Partial<Record<PatternId, { asked: number; correct: number }>> };
  plan?: { size: number; weeks: number; startedAt: string };
}

export interface StudyPlan {
  size: number;
  weeks: number;
  startedAt: string;
  /** Problems attempted since the plan started. */
  done: number;
  daysElapsed: number;
  daysTotal: number;
  /** How many to attempt today to stay on schedule. */
  todayTarget: number;
  doneToday: number;
  /** Negative when you're ahead. */
  behindBy: number;
}

export interface StreakInfo {
  current: number;
  best: number;
  activeToday: boolean;
}

export interface DifficultyProgress {
  difficulty: Difficulty;
  total: number;
  attempted: number;
  lcSolved: number;
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
  /** LeetCode's own "similar questions" (JSON string), used to suggest more of the same pattern. */
  similarQuestions: string | null;
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
  /** Rating settled here AND at least LC_SOLVES_REQUIRED of its problems actually solved on LeetCode. */
  complete: boolean;
}

export interface PatternGuess {
  pattern: PatternId;
  name: string;
  score: number;
  /** Share of the total evidence, 0-100. */
  confidence: number;
  why: string[];
}

export interface SimilarProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  curated: boolean;
  lcSolved: boolean;
  attempted: boolean;
}

export interface LookupResult {
  slug: string;
  id: number | null;
  title: string;
  difficulty: Difficulty;
  topicTags: { name: string; slug: string }[];
  /** The hand-assigned pattern, when the problem is in the curated bank. */
  curated: { pattern: PatternId; name: string } | null;
  guesses: PatternGuess[];
  similar: SimilarProblem[];
  lcSolved: boolean;
}

export interface ChallengeQuestion {
  slug: string;
  title: string;
  difficulty: Difficulty;
  curated: boolean;
  contentHtml: string | null;
  /** Asked count and current streak, so the UI can show progress. */
  stats: ChallengeStats;
}

export interface ChallengeStats {
  asked: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

export interface ChallengeAnswer {
  correct: boolean;
  chosen: PatternId | null;
  accepted: { pattern: PatternId; name: string }[];
  why: string[];
  curated: boolean;
  stats: ChallengeStats;
  /** Where to read more about the right answer. */
  lessonPattern: PatternId | null;
}

export interface RevisitItem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  pattern: PatternId;
  patternName: string;
  solvedAt: number;
  days: number;
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
  /** Solved on LeetCode long enough ago to be worth another go. */
  revisit: RevisitItem[];
  challenge: ChallengeStats;
  plan: StudyPlan | null;
  streak: StreakInfo;
  difficulty: DifficultyProgress[];
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
  /** When LeetCode accepted your solution (unix seconds), when that is known. */
  lcSolvedAt: number | null;
  /** True when LEETCODE_SESSION is set, so your own submission can be fetched. */
  sessionConfigured: boolean;
  progress: ProblemProgress | null;
  nextInPattern: string | null;
}
