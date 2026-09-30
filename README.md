# DSA Trainer

A local web app for pattern-based interview prep.

Most practice tools check whether your code passes. This one checks the part interviewers actually fail you on:
**can you name the brute force, spot the pattern, explain why the fast approach works, and state its complexity —
before you write a line of code?** You answer that for each of 197 curated LeetCode problems, and every one of the 23
patterns gets its own Elo rating, so "I'm bad at DP" becomes a number you can watch move.

Everything runs on your machine. No account, no telemetry; the only thing it talks to is leetcode.com, to fetch
problem statements and — if you ask it to — your own solved list.

---

**Contents**

[Quick start](#quick-start) · [Your first session](#your-first-session) · [What's in the app](#whats-in-the-app) ·
[How it grades you](#how-it-grades-you) · [Animations](#animations) · [The problem bank](#the-problem-bank) · [Compile & run](#compile--run) ·
[Reference](#reference) · [AI review](#ai-code-review) · [The timer](#the-timer) · [Review](#review-spaced-repetition) · [Study plan](#study-plan-streak-and-difficulty) ·
[Challenge & finder](#challenge-mode-and-the-pattern-finder) · [LeetCode integration](#leetcode-integration) ·
[Your data](#your-data) · [Configuration](#configuration) · [Development](#development) ·
[Troubleshooting](#troubleshooting)

---

## Quick start

**Requirements:** Node.js 20 or newer (developed on 24). A JDK 17+ (developed on 21) is optional — without one
everything works except **Compile & run**.

**Windows, day to day:** double-click `start.cmd`, or the **DSA Trainer** shortcut on your desktop. It installs
dependencies on a first run, rebuilds the UI only when something it's built from has changed, serves on
http://localhost:5179 and opens your browser there. Launch it again while it's running and it just reopens the tab
instead of fighting over the port. Closing the console window stops the server.

To create the desktop shortcut, from the project folder:

```powershell
$sh = New-Object -ComObject WScript.Shell
$s = $sh.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'DSA Trainer.lnk'))
$s.TargetPath = "$PWD\start.cmd"; $s.WorkingDirectory = "$PWD"; $s.IconLocation = "$PWD\tools\icon.ico,0"
$s.WindowStyle = 7   # 7 = start minimised, 1 = keep the console window in front
$s.Save()
```

**Any platform:**

```bash
npm install
npm start          # builds the UI, then serves everything on http://localhost:5179
```

**Working on the app itself:**

```bash
npm run dev        # API on 5179 + Vite on 5178, hot reload on both
```

Open http://localhost:5178; Vite proxies `/api` to the server.

## Your first session

1. **Import your LeetCode profile** (LeetCode tab). Optional, but it makes everything else smarter: solved problems
   are skipped, patterns you've avoided get pushed up, and old solves resurface for review.
2. **Read one lesson** — Patterns → Hash Map / Set. Look at *Spot it when*; that recognition is what you're training.
3. **Take the first problem from "Up next".** Answer the approach check *before* opening the Java tab. Getting it
   wrong on day one is the point — that's what the rating is measuring.
4. **Write the code and press Compile & run.** It runs against LeetCode's own examples, locally.
5. **Set a study plan** on the dashboard (75 problems in 8 weeks is a sane default) so you get a daily target.
6. **Come back tomorrow and clear Review first.** That habit is the difference between 197 problems solved and 197
   problems remembered.

The **Guide** tab has the long version: the order to learn patterns in and why, pace per week and per problem, what to
say in an interview, and which other sites to open when this one runs out of road.

## What's in the app

| Tab | What it's for |
|---|---|
| **Dashboard** | Ratings per pattern, what's due, up next, study plan, streak, difficulty breakdown |
| **Patterns** | 23 lessons — cues, idea, steps, pitfalls, a compiling Java template, and each pattern's problems |
| **Review** | The spaced-repetition queue: due now, coming up, and what has stuck |
| **Blind practice** | A problem with the pattern hidden — you name it first |
| **Challenge** | "Which pattern is this?" over the whole ~4,000-problem LeetCode catalog |
| **Pattern finder** | Paste any LeetCode URL, slug or title → likely pattern, the evidence, similar problems |
| **LeetCode** | Import and sync your profile; start over |
| **Guide** | The written prep guide and a table of other portals worth using |

## How it grades you

Each problem asks the same questions, in interview order:

| # | Question | Points |
|---|---|---|
| 1 | *(blind mode only)* Which pattern is this? | 3 — or 2 for a defensible alternative |
| 2 | What does the obvious brute force cost? | 1 |
| 3 | What's the key insight that beats it? | 3 |
| 4 | Time complexity | 2 |
| 5 | Space complexity | 1 |
| 6 | Which edge cases does your approach handle? (self-check) | 1 |

**8 points** in pattern mode, **11** in blind mode. Revealing one of LeetCode's hints costs a point.

Starting with the brute force is Striver's brute → better → optimal ladder: interviewers want to hear the slow
solution and *why it isn't good enough* before they hear the clever one.

**Two modes.** *Pattern mode* tells you which pattern you're applying — use it while learning one. *Blind mode* hides
it and makes you commit to a pattern before you see the other questions, because their wording can give it away.
That's the mode that resembles a real interview.

Grading happens on the server. The answer key never reaches the browser, and options are shuffled on every load — you
can't infer the answer from its position, or by picking the longest option (there's a test that enforces that).

**Rating.** Elo, per pattern, starting at 1200. A problem is an opponent rated 1200 (Easy), 1500 (Medium) or 1800
(Hard); your score percentage is the match result. Only your **first** attempt at a problem is rated — after that
you've seen the answers, so retakes are practice and feed the review schedule instead.

| Tier | Rating |
|---|---|
| Novice | below 1250 |
| Learning | 1250+ |
| Solid | 1400+ |
| Strong | 1550+ |
| Expert | 1700+ |

**Up next** keeps you on one pattern until it has three rated attempts, then moves you to your weakest. A pattern is
only **complete** once its rating has settled *and* — if you've imported your profile — you've actually solved two of
its problems on LeetCode. The dashboard nudges you back to any pattern that still owes solves, because answering a
quiz is not the same as writing the code.

After every attempt the result card links to the LeetCode editorial, the community solutions, a NeetCode video search
and takeuforward for that problem.

### After the result: how the complexity adds up

Every one of the 197 problems has a worked complexity derivation, shown on the result card once you have answered.
It lists each piece of work and its cost, then how they combine, for time and for space:

```
Time                                          Space
1. One pass over the n numbers  n iterations  1. The map may store every number
2. Each: one lookup, one insert  O(1) average     before the pair turns up    up to n entries
→ n × O(1) = O(n)                             → O(n)
```

It marks whether your own time and space answers were right. Every derivation ends on exactly the answer the approach
check grades, and a test holds all 197 to that, so the walkthrough and the quiz can never disagree. It lives with the
answer key on the server and is sent only after an attempt, because it gives the answer away.

## Animations

Every one of the 23 patterns has an animation: the technique running on a small example, one step at a time, with
a caption saying what just happened and why. Two pointers closing in on a pair, a sliding window growing and
shrinking, a heap re-ordering itself as values arrive, Dijkstra settling nodes, a backtracking decision tree
filling in, a linked list having its arrows flipped — including the moment the rest of the list is reachable only
through the saved `next` pointer, which is the whole point of that pattern.

**Where they appear.** At the end of every pattern lesson, free. And on every problem as an **animated hint**, which
costs a point like the text hints do. In blind mode the animated hint stays locked until you have answered, because
an animation titled "two pointers" would name the pattern you are meant to spot.

**It shows the technique, not the answer.** Each animation runs on its own small example, not the problem you are
looking at, so it is a hint about how the pattern moves rather than a walkthrough of your solution.

**Controls.** Play and pause (Space), step back and forward (arrow keys), jump to start or end (Home / End), drag the
scrubber, and pick a speed. Longer captions stay on screen longer, so autoplay never outruns the reading. With
"reduce motion" set in your OS, transitions switch off and nothing plays until you ask.

**They cannot be wrong.** No frame is drawn by hand. Each animation runs the real algorithm and records its state at
every step, and a test holds every one of them to the answer that algorithm must produce — `8 + 2 = 10` found at
indices `(1, 3)`, Dijkstra distances `A0 B3 C1 D4 E7`, eight subsets of `[1, 2, 3]`. If a generator ever draws a
wrong step, its answer drifts and the test names the pattern. The whole player is a separate 46 kB chunk, loaded
only when you press play.

## The problem bank

197 free LeetCode problems — NeetCode-150 coverage plus two extra per pattern — grouped by pattern and ordered
easy → hard. Every entry is hand-written: the pattern assignment, the brute force, the key insight with its
distractors, complexities, edge cases and a reference approach.

Statements, hints and Java starter code are fetched live from LeetCode when you open a problem, then cached in
`data/cache/`. They are never bundled with the app. `npm run verify:bank` re-checks all 197 against LeetCode (still
exists, still free, id/title/difficulty unchanged).

The 23 patterns: hashing, two pointers, sliding window, prefix sum, binary search, stack, monotonic stack, linked
list, fast & slow pointers, tree DFS, tree BFS, heap/top-K, intervals, greedy, backtracking, graph traversal,
topological sort, union-find, shortest path, 1-D DP, 2-D DP, trie, bit manipulation.

## Compile & run

Answering the approach check is free; having it **graded** is not. With a JDK installed, the check stays locked
until your solution compiles, and until the code you have now is the code you last ran. Name the approach first if
you like — that is the interview order — but the rating only lands once you have written the thing you described.

Passing the example tests is still not required, and still doesn't move your rating: a wrong answer honestly
attempted is worth recording. Compiling is the bar, because it is the cheapest possible proof that you wrote real
code. Without a JDK there is nothing to compile with, so the check grades as soon as you answer.

Press **Compile & run** (or Ctrl/Cmd+Enter) in the Java tab. Your solution is compiled with `javac` and run against
LeetCode's own example tests, on your machine:

- **Per test:** PASS / FAIL with expected and actual values, runtime in ms, and anything your code printed.
- **Imports are supplied**, exactly as LeetCode supplies them — paste code that uses `HashMap` or `PriorityQueue`
  with no import line and it just compiles. If javac still can't find a class, the name is looked up and the import
  added for one more attempt, and the run note tells you what it added.
- **Compile errors** are listed with the line numbers from your editor.
- A crash in one test is reported for that test only; the rest still run. An infinite loop is stopped after 10s, and
  the heap is capped at 256 MB.
- Answers that may come in any order are compared again ignoring order; doubles use LeetCode's 1e-5 tolerance.

It works for all 197 problems, including linked lists, trees and design classes (LRU Cache, Trie, Min Stack…).
LeetCode's `metaData` supplies each signature, so the harness converts every input line to the right Java type;
expected values are scraped from the statement. Everything the harness needs sits next to your code in a temp folder
that's deleted afterwards, and your code is never uploaded anywhere.

The prelude covers `java.util`, `java.util.function`, `java.util.stream`, `java.math`, `java.util.concurrent`,
`java.util.concurrent.atomic` and `java.util.regex`. It is injected on a single line above your code in the temp
file — never in your editor — and that one line is subtracted again before errors are shown, so a reported line
number is the line you actually wrote.

Test results do **not** change your rating — that stays a measure of your approach. Problems whose code passes every
checked test get a **code verified** badge.

## Reference

A tab of the things the approach check assumes you already know, in six parts:

- **Data structures** — every Java structure worth knowing, with a cost table per operation, the methods that
  actually do the work (`computeIfAbsent`, `floorKey`, `merge`, `deleteCharAt`…), when to reach for it, and the
  mistakes that cost people offers. Filterable by method name, and each card links to the patterns that use it.
- **Algorithms & sorting** — where every complexity comes from: the shape of code that produces `O(1)` through
  `O(n!)` and the named algorithms in each class. A section on where `n log n` comes from: halving plus linear
  work (merge sort), or `n` operations of `log n` each (heap sort, `n` binary searches), and why no comparison sort can
  beat it (`log₂(n!)`). Then the eight classic sorts — bubble, selection, insertion, merge, quick, heap, counting,
  radix — each with how it works, best/average/worst, stability, the counting argument behind its complexity, when
  to use it, what Java itself uses, working Java, and an animation. Every sort's Java is compiled and checked against
  `Arrays.sort` on 400 random arrays plus empty, single, all-equal, sorted, reversed and int-extreme inputs.
- **Java fundamentals** — the language traps that turn a correct approach into a wrong answer: int overflow in
  `(lo + hi) / 2`, `==` on boxed Integers above 127, integer division truncating toward zero, pass-by-value in
  backtracking, `ConcurrentModificationException`, comparator subtraction overflow.
- **Complexity toolbox** — opens with a growth table: what `O(1)` through `O(n!)` cost at n = 10 up to 10⁶,
  and how long that takes at about 10⁸ operations a second, coloured by whether it fits a one-second limit. `O(n²)` at
  10⁵ is 10 billion operations, about two minutes, so read your constraint and the allowed complexities fall out.
  Then the routines you may cite by name with their costs (BFS `O(V + E)`, Dijkstra `O(E log V)`, heap push
  `O(log n)`, monotonic stack `O(n)` amortised), and how to add them up. The table is computed in log₁₀ space, so
  `2ⁿ` and `n!` stay exact to the order of magnitude instead of overflowing.
- **Maths cheat sheet** — the series and counting formulas behind the Big-O (why `1 + 2 + … + n` makes a
  nested loop quadratic, why doubling is amortised `O(1)`), modular arithmetic for the `10^9 + 7` problems, a
  constraint table, and four further groups: number theory (fast exponentiation, the modular inverse, ceiling division
  `(a + b − 1) / b`, divisor counts), bases and bits (two's complement, the power-of-two test, `x & −x`), geometry
  (compare squared distances, slopes as reduced fractions, the cross-product turn test, shoelace area) and randomness
  (reservoir sampling, weighted picks, Fisher–Yates).
- **ASCII & characters** — the four codes to know by heart (`'0'` 48, `'A'` 65, `'a'` 97, space 32), the digit,
  letter and punctuation tables generated from real char codes, and the char arithmetic string problems depend on:
  `c − '0'`, `c − 'a'` into an `int[26]`, and case as a single bit (`c ^ 32` toggles it). Every letters-only trick
  says so, and a test checks each claim against actual character codes.

## The timer

Two clocks on one set of controls — **Pause**, **Stop**, **Restart**:

- **Wall clock** — from the moment the page opens until you pause or stop it, whatever you do with the window. It
  turns amber past the interview budget for the difficulty: 15 min Easy, 30 Medium, 45 Hard.
- **Active** — only the seconds this tab was genuinely in front of you. Switch tab, minimise, or click into another
  window and it holds; come back and it resumes. The gap between the two is the time you only *thought* you spent.

Leave the tab in the background for more than five minutes and the whole timer pauses itself, so a problem forgotten
behind another window doesn't bank the rest of the afternoon.

Both clocks go with the attempt (the result card reads *"Time 8:00 (5:05 at the screen)"*) and both accumulate into a
per-problem total, shown whenever you come back to it. Time is banked every 30 seconds, on pause, on stop, when the
tab is hidden and when you leave the page — closing the tab loses nothing.

## Review (spaced repetition)

Solving a problem once doesn't keep it; most of it is gone within a month. So every attempt schedules the next one:

| Passes in a row | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Next review in | 1 day | 3 days | 1 week | 3 weeks | 2 months |

Score **85%+** and the problem moves up a step. **60–84%** repeats the same interval. **Below 60%** sends it back to
day one and counts a lapse. Survive the two-month interval and it's marked settled.

This is the Anki model without the deck management: your score on the approach check *is* the grade, so there's
nothing extra to rate.

## Study plan, streak and difficulty

Pick a target on the dashboard — say 75 problems in 8 weeks — and it becomes a **daily target**: how many to attempt
today, how many you've done, and whether you're ahead or behind. Today's share isn't counted as overdue until the day
is over.

A **day streak** counts consecutive days with at least one attempt; yesterday's streak survives until you miss a whole
day. **Progress by difficulty** shows Easy/Medium/Hard attempted here against what you've actually solved on LeetCode.

## Challenge mode and the pattern finder

**Challenge** shows a random problem — from the whole ~4,000-problem LeetCode catalog, not just the curated bank — and
asks one thing: *which pattern is this?* You answer before reading anything else. It keeps a streak, tracks accuracy
per pattern, and explains the answer with the evidence behind it.

**Pattern finder** does the same on demand: paste a LeetCode URL, slug or title and it names the likely pattern with a
confidence score and the cues behind it (topic tags plus phrasing), links the lesson, and lists similar problems —
marking the ones you've already solved.

Both work for any problem: the pattern comes from the curated bank when it's in there, otherwise it's inferred from
LeetCode's topic tags and the wording of the statement.

## AI code review

Two ways to get your solution reviewed, sharing one prompt. The prompt bundles the **statement**, your **Java**, the
**answers you gave in the approach check**, your **notes** and the run results — because a review of code alone
cannot tell you whether you understood the problem. It asks for a verdict, correctness, the true complexity against
the one you claimed, whether the code and your stated approach agree, what to fix first, and the follow-up an
interviewer would ask next.

**Without an API key.** The **AI review** tab on any problem gives you **Copy review prompt** and links to ChatGPT and
Claude. Paste, read, done. This is the default and it costs nothing.

**With a key.** Set a provider up under **Settings** and the app asks the model itself:

| Provider | Base URL | Notes |
|---|---|---|
| OpenAI-compatible | `https://api.openai.com/v1` | Also OpenRouter (`https://openrouter.ai/api/v1`), Groq, Together, DeepSeek, LM Studio (`http://localhost:1234/v1`), vLLM |
| Anthropic | `https://api.anthropic.com` | Claude models direct |
| Local (Ollama) | `http://localhost:11434` | No key, nothing leaves the machine |

The key is stored in `data/ai.json` (gitignored), is never returned to the browser, and is only ever sent to the base
URL you configured. A request happens only when you press the button — never in the background, never from any
other page — and your `LEETCODE_SESSION` cookie is never included. A hosted provider means your code leaves your
machine under that provider's retention policy; pick Ollama if that matters.

## LeetCode integration

**Public profile** — enter your username on the LeetCode tab. Imports solved counts, per-topic counts and your recent
accepted problems. LeetCode only exposes a short recent list publicly.

**Full solved list** (optional) — copy `.env.example` to `.env` and paste your `LEETCODE_SESSION` and
`LEETCODE_CSRF_TOKEN` cookie values from a signed-in browser (DevTools → Application → Cookies → leetcode.com), then
restart. The cookie stays on the server, is only ever sent to leetcode.com, and is gitignored. Treat it like a
password.

**Sync** (dashboard and LeetCode tab) re-runs the import the same way it was done the first time, keeping the original
import date and every solve time learned so far. Solved problems show when LeetCode accepted them; with the session
cookie you can also pull **your own accepted submission** onto the problem page. Anything you solved more than two
months ago turns up under *Worth another look* with a retry button.

LeetCode's GraphQL endpoint is unofficial and can change. If a fetch fails, the app falls back to the cached copy
(marked with its date) and everything else keeps working.

## Your data

Your progress is written to disk on every single change — each answer, each save, each run, each banked minute —
so nothing is held only in memory and a crash or a closed window costs you nothing.

`data/` sits next to the code, resolved from the server source rather than the working directory. That matters: it
means `npm start`, `npm run dev` and the desktop shortcut all read the same progress, wherever you launch them from.
Set `DSA_DATA_DIR` to put it somewhere else.

**Backups.** A copy of `progress.json` is taken every ten minutes while you work, and always immediately before
anything that would overwrite it — including "start over" and a restore. The last 40 live in `data/backups/`,
named for when and why they were taken. **Settings → Backups** lists them with a Restore button, and restoring copies
your current state aside first, so that is reversible too.

**Two servers at once.** If the file changes underneath a running server — a second process, a restore, your own
editor — the next read notices and reloads it, instead of writing a stale in-memory copy back over the newer work.



Everything lives in `data/` (gitignored):

- `progress.json` — ratings, attempts and their history, saved code and notes, LeetCode import, challenge stats,
  study plan, review schedule, time banked per problem.
- `cache/` — LeetCode statements and the problem catalog.

*Start over* on the LeetCode tab erases progress. To back it up, copy `progress.json`.

**Security posture.** The server binds 127.0.0.1 only, rejects non-local `Host` headers (so a web page can't reach it
by DNS rebinding), and requires `application/json` on writes. Compile & run executes your own Java on your machine
with a 10-second limit and a 256 MB heap — treat pasted code as you would any code you run locally.

## Configuration

`.env` in the project root (copy from `.env.example`; never commit it):

| Variable | Default | What it does |
|---|---|---|
| `API_PORT` | `5179` | Server port. Deliberately not `PORT`, which dev tools like to hijack |
| `LEETCODE_SESSION` | — | Enables the full solved list and fetching your own submissions |
| `LEETCODE_CSRF_TOKEN` | — | Sent alongside the session cookie |
| `DSA_DATA_DIR` | `./data` | Where progress and the cache live (environment variable only, not `.env`) |

## Development

### Scripts

| Command | What it does |
|---|---|
| `start.cmd` | Everyday launcher (Windows): build if stale, serve on 5179, open the browser |
| `npm run dev` | API (tsx watch) + Vite dev server |
| `npm start` | Build the UI and serve everything on 5179 |
| `npm test` | Vitest — 499 tests |
| `npm run typecheck` | `tsc --noEmit` over server, shared, web and tests |
| `npm run verify:bank` | Re-check all 197 problems against LeetCode |
| `npm run verify:java` | Compile every pattern's Java template with `javac` |

### Layout

```
shared/     types, scoring/rating, the 23 pattern lessons, the 197-problem bank
            (answer keys live here and never reach the browser)
            reference/    structures, fundamentals, formulas, complexity toolbox
            ai-prompt.ts  the review prompt; java-source.ts  unwraps your methods
server/     app.ts        Express API, local-only guard
            trainer.ts    grading, ratings, recommendations, dashboard
            leetcode.ts   GraphQL + REST client, session handling
            store.ts      JSON store with serialized writes
            harness.ts    generates Main.java from LeetCode metaData
            java-run.ts   javac/java with timeouts; compare.ts; java/J.java
            catalog.ts, infer.ts, lookup.ts   the pattern finder
            challenge.ts, plan.ts, review.ts  challenge, study plan, spaced repetition
            imports.ts    the Java import prelude; ai.ts  provider config + review call
web/        React 19 + Vite: dashboard, patterns, problem page (quiz, Java editor,
            notes, AI review, your LeetCode solution), finder, challenge, review,
            reference, guide, settings
tests/      Vitest suites, including a real javac compile-and-run
scripts/    content verification against LeetCode
tools/      start.ps1 (what start.cmd runs) and the shortcut icon
```

### Tests

`npm test` runs 499 tests: bank integrity (every problem well-formed, no answer inferable from option length),
scoring and rating maths, trainer logic, harness generation for all 197 signatures, output comparison, the
spaced-repetition schedule, timer accounting, pattern inference, a real `javac` compile-and-run, and the HTTP API
end to end against a stubbed LeetCode.

### Adding a problem

Append it to the matching file in `shared/problems/`, with **the first option of every multiple-choice question as
the correct one** — the server shuffles them before sending. Then run `npm test` and `npm run verify:bank`.

### HTTP API

All routes are under `/api`, JSON in and out, localhost only.

| Method | Route | Purpose |
|---|---|---|
| GET | `/state` | Everything the dashboard shows |
| GET | `/patterns/:id` | One lesson plus its problems and your progress |
| GET | `/problems/:slug?mode=` | Problem view and the quiz (no answer key) |
| GET | `/problems/:slug/leetcode` | Statement, hints, Java snippet (cached; `?refresh=1`) |
| POST | `/problems/:slug/attempts` | Grade an attempt, update the rating and review schedule |
| PUT | `/problems/:slug/work` | Save code / notes |
| POST | `/problems/:slug/run` | Compile and run against the example tests |
| POST | `/problems/:slug/time` | Bank elapsed and active seconds |
| POST | `/problems/:slug/leetcode-solution` | Fetch your accepted submission (needs the session cookie) |
| GET | `/java/status` | Whether a JDK was found, and its version |
| GET | `/review` | The spaced-repetition queue |
| GET | `/lookup?q=` | Pattern finder for any problem |
| GET | `/challenge/next` · POST `/challenge/answer` | Challenge mode |
| GET | `/practice/blind` | Pick a blind-mode problem |
| POST | `/leetcode/import` · `/leetcode/sync` · DELETE `/leetcode/import` | Profile import |
| POST | `/plan` · DELETE `/plan` | Study plan |
| POST | `/reset` | Erase progress (requires `{"confirm":"RESET"}`) |

## Troubleshooting

**Port 5179 is already in use.** The launcher reuses a running instance rather than starting a second one. If
something else owns the port, set `API_PORT` in `.env`.

**Compile & run is unavailable.** No JDK on the PATH. Install one (17+) and restart; `GET /api/java/status` reports
what it found.

**The statement says "Offline copy from …".** LeetCode's API didn't answer, so you're seeing the cache. Everything
else still works; refresh it later.

**Sync says the session is no longer set.** The `LEETCODE_SESSION` cookie expired, or `.env` changed. Paste a fresh
cookie and restart, or re-import by username.

**The UI looks stale after you edit it.** The launcher skips the rebuild when nothing it watches has changed. Run
`npm run build`, or use `npm run dev` while working on the UI.

**PowerShell blocks the launcher.** It runs with `-ExecutionPolicy Bypass` for that one file, so no machine-wide
change is needed. If the shortcut appears to do nothing, run `start.cmd` from a terminal to see the error.

## Where the content comes from

Problems, statements and metadata are LeetCode's, fetched from their public endpoints. The pattern taxonomy follows
the consensus of NeetCode's roadmap, Striver's A2Z sheet and Grind 75; the brute → better → optimal framing is
Striver's; the review schedule is the standard spaced-repetition ladder Anki popularised. Lessons, problem
assignments, insights and distractors are written for this app. The **Guide** tab links each source, with a note on
when to use it instead of this one.
