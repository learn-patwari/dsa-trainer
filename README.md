# DSA Trainer

A local web app for pattern-based interview prep. Learn one of 23 problem-solving patterns, apply it to curated LeetCode
problems, and get rated on your **approach**: brute force, pattern, key insight, time/space complexity and edge cases.
Every pattern has its own rating, so you can see exactly where you're weak. Your Java solution compiles and runs here
too, against LeetCode's own example tests, and a pattern finder will name the pattern behind any LeetCode problem.

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

**Problems.** 197 free LeetCode problems (NeetCode-150 coverage plus two extra per pattern), grouped by pattern and
ordered easy → hard. The
problem statement and Java starter code are fetched live from LeetCode when you open a problem, then cached in
`data/cache/`. They are never bundled with the app.

**Two ways to practice**

| Mode | Where | What's asked | Max |
|---|---|---|---|
| Pattern | From a pattern page or "Up next" | Brute force (1), key insight (3), time (2) and space (1) complexity, edge-case self-check (1) | 8 |
| Blind | "Blind practice" | Pick the pattern first and lock it in (3; 2 for an acceptable alternative), then the rest | 11 |

Every problem starts the way an interview does — *what does the obvious brute force cost?* — before asking for the
optimal idea, so you practise the brute → better → optimal ladder instead of jumping straight to the trick.

In blind mode you commit to a pattern before seeing the other questions, because their wording can hint at it.
Revealing one of LeetCode's hints costs 1 point. Answers are graded on the server, and the quiz options are shuffled
on every load.

**Rating.** Elo-style, per pattern, starting at 1200. Each problem acts as an opponent rated 1200 (Easy), 1500
(Medium) or 1800 (Hard), and your score percentage is the result. Only your **first** attempt at a problem counts;
retakes are practice, since you've already seen the answers. Tiers: Novice (below 1250), Learning (1250+), Solid
(1400+), Strong (1550+), Expert (1700+).

**Up next** keeps you on a pattern until it has three rated attempts, then moves you to your weakest pattern. With a
LeetCode import it also favors patterns you've rarely practiced there, and skips problems you've already solved. A
pattern only counts as **complete** once its rating has settled *and* you've actually solved two of its problems on
LeetCode — the dashboard nudges you back to any pattern that still owes solves, because answering a quiz is not the
same as writing the code.

After every attempt the result card links to the **editorial**, the **community solutions**, a **NeetCode** video
search and **takeuforward** (Striver) for that problem, so the next step is always one click away.

The **Java** tab has an editor pre-filled with LeetCode's starter code, and your code autosaves locally. The **Notes**
tab is for sketching your approach first.

## Compile & run

Press **Compile & run** (or Ctrl/Cmd+Enter) in the Java tab. Your solution is compiled with `javac` and executed
against LeetCode's own example tests, on your machine:

- **Per test**: PASS / FAIL with the expected and actual values, the runtime in ms, and anything the code printed.
- **Compile errors** are listed with the line numbers from your editor.
- A crash in one test is reported for that test only; the rest still run. An infinite loop is stopped after 10s.
- Answers that may come in any order are compared again ignoring order, and doubles use LeetCode's 1e-5 tolerance.

It works for all 197 curated problems, including linked lists, trees and design classes (LRU Cache, Trie, Min
Stack…). LeetCode's `metaData` supplies each signature, so the harness converts every input line to the right Java
type; expected values are read from the statement. Everything the harness needs sits next to your code in a temporary
folder that's deleted afterwards, and your code is never uploaded anywhere.

Test results do **not** change your rating, which stays a measure of your approach. Problems whose code passes every
checked test get a "code verified" badge.

## Challenge mode and the pattern finder

**Challenge** shows you a random problem — from the whole 4,000+ LeetCode catalog, not just the curated bank — and
asks one question: *which pattern is this?* You answer before reading anything else. It keeps a streak, tracks how
you do per pattern, and explains the answer with the evidence behind it.

**Pattern finder** does the same on demand: paste a LeetCode URL, slug or title and it names the likely pattern with a
confidence score and the cues behind it (topic tags plus phrasing), links the lesson, and lists similar problems —
marking the ones you've already solved on LeetCode.

Both work for any problem: the pattern comes from the curated bank when it's in there, otherwise it is inferred from
LeetCode's topic tags and the wording of the statement.

## Review (spaced repetition)

Solving a problem once doesn't keep it — most of it is gone within a month. So every attempt schedules the next one:

| Passes in a row | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Next review in | 1 day | 3 days | 1 week | 3 weeks | 2 months |

Score **85%+** and the problem moves up a step; **60–84%** repeats the same interval; **below 60%** sends it back to
day one and counts a lapse. A problem that survives the two-month interval is marked settled. The **Review** tab shows
what's due, what's coming, and how many problems have stuck; the dashboard surfaces the first six due.

This is the Anki model, minus the deck management — your score on the approach check is the grade, so there's nothing
extra to rate.

## Study plan, streak and difficulty

Pick a target on the dashboard — say 75 problems in 8 weeks — and the app turns it into a **daily target**: how many
to attempt today, how many you've done, and whether you're ahead or behind. A **day streak** counts consecutive days
with at least one attempt (yesterday's streak survives until you miss a whole day). **Progress by difficulty** shows
Easy/Medium/Hard attempted here against what you've actually solved on LeetCode.

## LeetCode import

- **Public profile**: enter your username on the LeetCode page. This imports solved counts, per-topic counts and your
  recent accepted problems. LeetCode only exposes a short recent list publicly.
- **Full solved list** (optional): copy `.env.example` to `.env` and paste your `LEETCODE_SESSION` (and `csrftoken`)
  cookie values from a signed-in browser (DevTools → Application → Cookies → leetcode.com), then restart. The cookie
  stays on the server and is only sent to leetcode.com. Treat it like a password and never commit `.env`.

The import is saved with your progress, so it survives restarts. **Sync** (on the dashboard and the LeetCode page)
re-runs it the same way it was done the first time, keeping the original import date and every solve time learned so
far. Solved problems show when LeetCode accepted them; with the session cookie you can also pull **your own accepted
submission** onto the problem page. Anything you solved more than **two months** ago turns up under "Worth another
look" with a retry button — long enough to have forgotten why it worked.

LeetCode's GraphQL endpoint is unofficial and can change; if an import or statement fetch fails, the app still works
with cached data and the approach checks.

## Your data

Everything lives in `dsa-trainer/data/` (gitignored): `progress.json` (ratings, attempts, code, notes, LeetCode
import, challenge stats, study plan, review schedule) and `cache/` (statements and the problem catalog). "Start over" on the LeetCode page erases progress. The server listens on 127.0.0.1 only, rejects
non-local `Host` headers, and requires JSON on writes. Compile & run executes your own Java on your machine, with a
10s time limit and a 256 MB heap — treat pasted code as you would any code you run locally.

## The guide

The **Guide** tab in the app is the written version of all of this: the per-problem loop, the order to learn patterns
in and why each stage needs the one before it, pace (per week, per problem, per day), what to say in the room, how the
rating works, and a table of the other portals worth opening — Striver's A2Z sheet, NeetCode's roadmap, Grind 75,
Sean Prashad's pattern list, GeeksforGeeks, VisuAlgo, interviewing.io, Pramp, LeetCode contests, CSES, the Tech
Interview Handbook and the System Design Primer — with a line on when each one is the right thing to open.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (tsx watch) + Vite dev server |
| `npm start` | Build the UI and serve everything on port 5179 |
| `npm test` | Vitest: bank integrity, scoring, trainer logic, harness generation, real compile & run, HTTP API |
| `npm run typecheck` | `tsc --noEmit` over server, shared, web and tests |
| `npm run verify:bank` | Re-check all 197 problems against LeetCode (exists, free, id/title/difficulty) |
| `npm run verify:java` | Compile every pattern's Java template with `javac` |

## Layout

```
shared/     types, scoring/rating, pattern lessons, problem bank (answer keys stay server-side)
server/     Express API, JSON store, LeetCode client, grading + recommendations
            harness.ts (generates Main.java), java-run.ts (javac/java), compare.ts, java/J.java
            catalog.ts + infer.ts + lookup.ts (pattern finder), challenge.ts, plan.ts (study plan/streak)
            review.ts (spaced repetition)
web/        React UI (Vite): dashboard, patterns, problem page, finder, challenge, review, guide, LeetCode import
tests/      Vitest suites
scripts/    content verification (LeetCode metadata, javac)
```

To add a problem, append it to the matching file in `shared/problems/` with the first option of each question
correct, then run `npm test` and `npm run verify:bank`.
