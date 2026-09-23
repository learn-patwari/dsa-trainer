/**
 * Re-checks every curated problem against LeetCode: the slug still exists, it is
 * still free, and its number, title and difficulty match the bank. Run it after
 * editing shared/problems/*:
 *   npm run verify:bank
 */
import { PROBLEMS } from '../shared/problems/index.ts';

const QUERY = `query q($slug: String!) { question(titleSlug: $slug) { questionFrontendId title difficulty isPaidOnly } }`;
const problems: string[] = [];

for (const [i, p] of PROBLEMS.entries()) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/problems/${p.slug}/`, 'User-Agent': 'Mozilla/5.0 (dsa-trainer)' },
    body: JSON.stringify({ query: QUERY, variables: { slug: p.slug } }),
  });
  const q = ((await res.json()) as { data?: { question: null | { questionFrontendId: string; title: string; difficulty: string; isPaidOnly: boolean } } }).data?.question;
  if (!q) problems.push(`${p.slug}: not found on LeetCode`);
  else {
    if (q.isPaidOnly) problems.push(`${p.slug}: now premium-only`);
    if (Number(q.questionFrontendId) !== p.id) problems.push(`${p.slug}: id ${p.id} ≠ ${q.questionFrontendId}`);
    if (q.title !== p.title) problems.push(`${p.slug}: title "${p.title}" ≠ "${q.title}"`);
    if (q.difficulty !== p.difficulty) problems.push(`${p.slug}: difficulty ${p.difficulty} ≠ ${q.difficulty}`);
  }
  process.stdout.write(`\rChecked ${i + 1}/${PROBLEMS.length}`);
  await new Promise((r) => setTimeout(r, 250)); // be polite
}

console.log();
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`OK: all ${PROBLEMS.length} curated problems match LeetCode.`);
}
