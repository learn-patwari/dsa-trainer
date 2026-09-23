# DSA Trainer

A local web app for pattern-based interview prep. Learn one of 23 problem-solving patterns, apply it to curated LeetCode
problems, and get rated on your **approach**: pattern, key insight, time/space complexity and edge cases. Every
pattern has its own rating, so you can see exactly where you're weak. Your Java solution compiles and runs here too,
against LeetCode's own example tests.

## Quick start

Requires Node.js 20+ (developed on Node 24). A JDK (17+, developed on 21) is optional: without one everything works
except "Compile & run".

```bash
cd dsa-trainer
npm install
npm run dev
```

Open http://localhost:5178. The API runs on port 5179 and Vite proxies `/api` to it.

To run a production build on one port instead: `npm start` (serves the built UI and API on http://localhost:5179).

## How training works

**Patterns.** 23 lessons (hashing, two pointers, sliding window, … DP, tries, bit tricks). Each lesson covers the
cues that give the pattern away, the core idea, steps, pitfalls, and a Java template. Every template compiles
(`npm run verify:java`).

**Problems.** 151 free LeetCode problems (NeetCode-150-style coverage), grouped by pattern and ordered easy → hard. The
problem statement and Java starter code are fetched live from LeetCode when you open a problem, then cached in
`data/cache/`. They are never bundled with the app.

**Two ways to practice**

| Mode | Where | What's asked | Max |
|---|---|---|---|
| Pattern | From a pattern page or "Up next" | Key insight (3), time (2) and space (1) complexity, edge-case self-check (1) | 7 |
| Blind | "Blind practice" | Pick the pattern first and lock it in (3; 2 for an acceptable alternative), then the rest | 10 |

In blind mode you commit to a pattern before seeing the other questions, because their wording can hint at it.
Revealing one of LeetCode's hints costs 1 point. Answers are graded on the server, and the quiz options are shuffled
on every load.

**Rating.** Elo-style, per pattern, starting at 1200. Each problem acts as an opponent rated 1200 (Easy), 1500
(Medium) or 1800 (Hard), and your score percentage is the result. Only your **first** attempt at a problem counts;
retakes are practice, since you've already seen the answers. Tiers: Novice (below 1250), Learning (1250+), Solid
(1400+), Strong (1550+), Expert (1700+).

**Up next** keeps you on a pattern until it has three rated attempts, then moves you to your weakest pattern. With a
LeetCode import it also favors patterns you've rarely practiced there, and skips problems you've already solved.

The **Java** tab has an editor pre-filled with LeetCode's starter code, and your code autosaves locally. The **Notes**
tab is for sketching your approach first.

## Compile & run

Press **Compile & run** (or Ctrl/Cmd+Enter) in the Java tab. Your solution is compiled with `javac` and executed
against LeetCode's own example tests, on your machine:

- **Per test**: PASS / FAIL with the expected and actual values, the runtime in ms, and anything the code printed.
- **Compile errors** are listed with the line numbers from your editor.
- A crash in one test is reported for that test only; the rest still run. An infinite loop is stopped after 10s.
- Answers that may come in any order are compared again ignoring order, and doubles use LeetCode's 1e-5 tolerance.

It works for all 151 curated problems, including linked lists, trees and design classes (LRU Cache, Trie, Min
Stack…). LeetCode's `metaData` supplies each signature, so the harness converts every input line to the right Java
type; expected values are read from the statement. Everything the harness needs sits next to your code in a temporary
folder that's deleted afterwards, and your code is never uploaded anywhere.

Test results do **not** change your rating, which stays a measure of your approach. Problems whose code passes every
checked test get a "code verified" badge.

## LeetCode import

- **Public profile**: enter your username on the LeetCode page. This imports solved counts, per-topic counts and your
  recent accepted problems. LeetCode only exposes a short recent list publicly.
- **Full solved list** (optional): copy `.env.example` to `.env` and paste your `LEETCODE_SESSION` (and `csrftoken`)
  cookie values from a signed-in browser (DevTools → Application → Cookies → leetcode.com), then restart. The cookie
  stays on the server and is only sent to leetcode.com. Treat it like a password and never commit `.env`.

LeetCode's GraphQL endpoint is unofficial and can change; if an import or statement fetch fails, the app still works
with cached data and the approach checks.

## Your data

Everything lives in `dsa-trainer/data/` (gitignored): `progress.json` (ratings, attempts, code, notes, import) and
`cache/`. "Start over" on the LeetCode page erases progress. The server listens on 127.0.0.1 only, rejects
non-local `Host` headers, and requires JSON on writes. Compile & run executes your own Java on your machine, with a
10s time limit and a 256 MB heap — treat pasted code as you would any code you run locally.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (tsx watch) + Vite dev server |
| `npm start` | Build the UI and serve everything on port 5179 |
| `npm test` | Vitest: bank integrity, scoring, trainer logic, harness generation, real compile & run, HTTP API |
| `npm run typecheck` | `tsc --noEmit` over server, shared, web and tests |
| `npm run verify:bank` | Re-check all 151 problems against LeetCode (exists, free, id/title/difficulty) |
| `npm run verify:java` | Compile every pattern's Java template with `javac` |

## Layout

```
shared/     types, scoring/rating, pattern lessons, problem bank (answer keys stay server-side)
server/     Express API, JSON store, LeetCode client, grading + recommendations
            harness.ts (generates Main.java), java-run.ts (javac/java), compare.ts, java/J.java
web/        React UI (Vite): dashboard, patterns, problem page, LeetCode import
tests/      Vitest suites
scripts/    content verification (LeetCode metadata, javac)
```

To add a problem, append it to the matching file in `shared/problems/` with the first option of each question
correct, then run `npm test` and `npm run verify:bank`.
