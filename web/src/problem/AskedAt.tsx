import { Link } from 'react-router';
import { COMPANY_NAMES, PROBLEM_ASKS } from '../../../shared/companies.ts';
import { frequencyLabel } from '../companies.ts';

/** Which companies candidates report being asked this problem, from public community-reported lists. */
export function AskedAt({ slug, reported }: { slug: string; reported?: string[] }) {
  if (reported && reported.length > 0) {
    return (
      <div className="stack" style={{ gap: '0.5rem', marginTop: '1rem' }}>
        <h3 style={{ margin: 0 }}>Asked at</h3>
        <div className="chips">
          {reported.map((company) =>
            COMPANY_NAMES.includes(company) ? (
              <Link key={company} to={`/companies?c=${encodeURIComponent(company)}`} className="tag tag-accent">
                {company}
              </Link>
            ) : (
              <span key={company} className="tag tag-accent">
                {company}
              </span>
            ),
          )}
        </div>
        <p className="tiny muted" style={{ margin: 0 }}>
          Candidates report these companies asking this. Collected from interview write-ups, so treat it as a signal rather than a promise.
        </p>
      </div>
    );
  }
  const entry = PROBLEM_ASKS[slug];
  if (!entry || entry.total === 0) return null;
  return (
    <div className="stack" style={{ gap: '0.5rem', marginTop: '1rem' }}>
      <div className="spread">
        <h3 style={{ margin: 0 }}>Asked at</h3>
        <span className="tiny muted">
          Reported by {entry.total} compan{entry.total === 1 ? 'y' : 'ies'} · <Link to="/companies">Browse by company</Link>
        </span>
      </div>
      {entry.asks.length > 0 ? (
        <div className="chips">
          {entry.asks.map(([company, freq, recent]) => (
            <Link
              key={company}
              to={`/companies?c=${encodeURIComponent(company)}`}
              className="tag tag-accent"
              title={`${frequencyLabel(freq)} at ${company}${recent ? ' · reported in the last 3 months' : ''}`}
            >
              {company}
              {recent === 1 && <span aria-label="reported recently">●</span>}
            </Link>
          ))}
        </div>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          Not often reported by the larger companies.
        </p>
      )}
      <p className="tiny muted" style={{ margin: 0 }}>
        ● = also reported in the last three months of the data. Community-reported, so treat it as a signal rather than a promise.
      </p>
    </div>
  );
}
