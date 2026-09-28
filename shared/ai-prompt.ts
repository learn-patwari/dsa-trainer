import type { AttemptResult, Difficulty, RunResult } from './types.ts';

/**
 * One prompt, two ways to use it: copy it into any chat window, or let the
 * server post it to a model you've configured. Either way the model gets the
 * same thing — the problem, your code, the approach you claimed, and how the
 * example tests went — because a review of code alone can't tell you whether
 * you understood the problem.
 */

export interface ReviewContext {
  title: string;
  id: number;
  difficulty: Difficulty;
  slug: string;
  /** The statement, as plain text. */
  statement: string | null;
  /** The pattern, once you've earned the right to see it. */
  pattern: string | null;
  code: string | null;
  /** Your graded answers, so the model can see what you claimed. */
  attempt: AttemptResult | null;
  run: RunResult | null;
  /** The bank's own model answer. */
  referenceApproach: string | null;
  notes: string | null;
}

const ROLE = `You are a staff engineer running a technical interview debrief. You are direct and specific, you never pad, and you would rather point out one real flaw than list five generic ones.`;

const TASK = `Review the candidate's work below. Structure your answer with these headings, and keep the whole thing under 600 words:

**Verdict** — Would this pass a FAANG-style phone screen? One of: pass, borderline, fail. One sentence of justification.

**Correctness** — Does the code actually solve the stated problem? Name any input that breaks it, concretely. If it is correct, say so and move on; do not invent problems.

**Complexity** — State the true time and space complexity of the code as written. If it differs from what the candidate claimed, say so plainly and explain where the difference is.

**Approach vs code** — The candidate answered a quiz about their approach before coding. Do the code and the claimed approach agree? A mismatch means they do not yet understand their own solution, which matters more than a bug.

**What to fix first** — The single highest-value change, with the specific lines or the specific idea. Then at most two smaller ones.

**What they'd be asked next** — The natural follow-up question an interviewer would ask about this solution, and a one-line sketch of the answer.`;

function section(title: string, body: string | null | undefined): string {
  if (!body || !body.trim()) return '';
  return `\n## ${title}\n${body.trim()}\n`;
}

/** Their quiz answers, rendered so a model can see claim vs truth. */
function attemptSection(attempt: AttemptResult | null): string {
  if (!attempt) return '';
  const lines = attempt.breakdown.map((q) => {
    const said = q.chosen ?? '(skipped)';
    const verdict = q.verdict === 'correct' ? 'correct' : `expected: ${q.correct}`;
    return `- ${q.label}: said "${said}" — ${verdict}`;
  });
  return section(
    'What the candidate claimed, before writing code',
    `Scored ${attempt.score}/${attempt.maxScore} (${attempt.percent}%).\n${lines.join('\n')}`,
  );
}

function runSection(run: RunResult | null): string {
  if (!run) return '';
  if (!run.compiled) {
    const errs = run.compileErrors.map((e) => `- line ${e.line ?? '?'}: ${e.message}`).join('\n');
    return section('Compiler', `It does not compile.\n${errs}`);
  }
  const failures = run.tests
    .filter((t) => t.verdict === 'fail' || t.verdict === 'error' || t.verdict === 'timeout')
    .map((t) => `- input ${JSON.stringify(t.input)} → got ${t.actual ?? t.error ?? 'nothing'}, expected ${t.expected ?? '?'}`);
  const summary = `Compiles. ${run.passed}/${run.checked} of the example tests pass.`;
  return section('Example tests', failures.length > 0 ? `${summary}\nFailing:\n${failures.join('\n')}` : summary);
}

export function buildReviewPrompt(ctx: ReviewContext): string {
  const header = `# ${ctx.id}. ${ctx.title} (${ctx.difficulty})\nhttps://leetcode.com/problems/${ctx.slug}/`;

  return [
    ROLE,
    '',
    TASK,
    '',
    '---',
    '',
    header,
    section('Problem', ctx.statement),
    section('Pattern this problem is filed under', ctx.pattern),
    attemptSection(ctx.attempt),
    section("The candidate's Java", ctx.code ? '```java\n' + ctx.code.trim() + '\n```' : null),
    runSection(ctx.run),
    section("The candidate's own notes", ctx.notes),
    section('Reference approach (from the problem bank, for your comparison only)', ctx.referenceApproach),
  ]
    .filter(Boolean)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Very small HTML-to-text, enough to put a LeetCode statement into a prompt. */
export function statementToText(html: string | null): string | null {
  if (!html) return null;
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
