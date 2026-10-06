import { Link, useSearchParams } from 'react-router';
import { COMPANY_NAMES, PROBLEM_ASKS } from '../../../shared/companies.ts';
import { COMPANY_TOP } from '../../../shared/company-top.ts';
import { api, useLoad } from '../api.ts';
import { DifficultyTag } from '../components.tsx';
import { frequencyLabel } from '../companies.ts';

/** Where else people report interview questions, with a search pre-filled for the chosen company. */
function sources(company: string): { name: string; href: string; note: string }[] {
  const q = encodeURIComponent(company);
  return [
    {
      name: 'GeeksforGeeks',
      href: `https://www.google.com/search?q=${encodeURIComponent(`site:geeksforgeeks.org ${company} interview experience`)}`,
      note: 'Write-ups of full interview rounds, with the questions in order',
    },
    {
      name: 'Glassdoor',
      href: `https://www.glassdoor.com/Interview/index.htm?typedKeyword=${q}`,
      note: 'Short per-candidate reports; needs a free account for more than a few',
    },
    {
      name: 'LeetCode Discuss',
      href: `https://leetcode.com/discuss/interview-experience?currentPage=1&orderBy=hot&query=${q}`,
      note: 'Recent interview experiences, often with the exact problems',
    },
    {
      name: 'Quora',
      href: `https://www.quora.com/search?q=${encodeURIComponent(`${company} coding interview questions`)}`,
      note: 'Older and opinionated, but good for what the process feels like',
    },
  ];
}

export function CompaniesPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('c');
  const company = requested && COMPANY_TOP[requested] ? requested : COMPANY_NAMES[0]!;
  const { reported, questions } = COMPANY_TOP[company]!;
  const inBank = questions.filter(([slug]) => PROBLEM_ASKS[slug]).length;
  // Problems from outside LeetCode that candidates report from this company.
  const state = useLoad(api.state, []);
  const offSite = (state.data?.problems ?? []).filter((p) => p.askedAt.includes(company));

  return (
    <main className="page stack">
      <div>
        <h1>Companies</h1>
        <p className="muted">
          The questions candidates most often report from each company's interviews, ranked by how often they come up. Practise the
          ones in this app's bank here; the rest link out to LeetCode.
        </p>
      </div>

      <div className="chips" role="tablist" aria-label="Company">
        {COMPANY_NAMES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={c === company}
            className={`chip${c === company ? ' selected' : ''}`}
            onClick={() => setParams({ c })}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="card stack">
        <div className="spread">
          <h2 style={{ margin: 0 }}>{company}: most-reported questions</h2>
          <span className="small muted">
            {reported} questions reported · {inBank} of these {questions.length} are in the bank
          </span>
        </div>
        <div className="stack" style={{ gap: '0.25rem' }}>
          {questions.map(([slug, title, difficulty, freq, recent], i) => {
            const bank = PROBLEM_ASKS[slug] !== undefined;
            return (
              <div key={slug} className="spread" style={{ padding: '0.4rem 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <div className="row" style={{ minWidth: 0, flex: '1 1 18rem' }}>
                  <span className="muted mono tiny" style={{ width: '1.5rem' }}>
                    {i + 1}
                  </span>
                  {bank ? (
                    <Link to={`/problems/${slug}?mode=pattern`}>{title}</Link>
                  ) : (
                    <a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noreferrer">
                      {title} ↗
                    </a>
                  )}
                  <DifficultyTag difficulty={difficulty} />
                  {bank && <span className="tag tag-good">In the bank</span>}
                  {recent === 1 && <span className="tag tag-warn">Recent</span>}
                </div>
                <div className="row" style={{ flex: '0 0 9rem' }} title={frequencyLabel(freq)}>
                  <div className="bar" style={{ width: '6rem' }}>
                    <span style={{ width: `${freq}%` }} />
                  </div>
                  <span className="tiny muted mono">{freq}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="tiny muted" style={{ margin: 0 }}>
          Frequency is relative: 100 is the single most-reported question at that company. "Recent" means it was also reported in the
          last three months of the data (a June 2025 snapshot of LeetCode company tags, which come from candidate reports). It is
          community data, not an official list, and companies change their questions.
        </p>
      </section>

      {offSite.length > 0 && (
        <section className="card stack">
          <h2 style={{ margin: 0 }}>Also reported at {company}, not on LeetCode</h2>
          <p className="small muted" style={{ margin: 0 }}>
            These come from GeeksforGeeks, HackerRank, CSES and interview write-ups. Practise them here with the same approach check and Java tests.
          </p>
          <div className="stack" style={{ gap: '0.25rem' }}>
            {offSite.map((p, i) => (
              <div key={p.slug} className="row" style={{ padding: '0.4rem 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <Link to={`/problems/${p.slug}?mode=pattern`}>{p.title}</Link>
                <DifficultyTag difficulty={p.difficulty} />
                {p.source && <span className="tag">{p.source}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card stack">
        <h2 style={{ margin: 0 }}>More on {company} interviews</h2>
        <div className="grid grid-3">
          {sources(company).map((s) => (
            <a key={s.name} className="card card-link" href={s.href} target="_blank" rel="noreferrer">
              <strong>{s.name} ↗</strong>
              <p className="small muted" style={{ margin: '0.3rem 0 0' }}>
                {s.note}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
