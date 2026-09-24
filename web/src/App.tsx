import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router';
import { api } from './api.ts';
import { ErrorBox, Loading } from './components.tsx';
import { ChallengePage } from './pages/ChallengePage.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { FinderPage } from './pages/FinderPage.tsx';
import { GuidePage } from './pages/GuidePage.tsx';
import { LeetCodePage } from './pages/LeetCodePage.tsx';
import { PatternPage } from './pages/PatternPage.tsx';
import { PatternsPage } from './pages/PatternsPage.tsx';
import { ProblemPage } from './pages/ProblemPage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';

export function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // may return a Promise in newer browsers; don't return it from the effect
  }, [pathname]);

  return (
    <>
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            DSA
          </span>
          DSA Trainer
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/patterns">Patterns</NavLink>
          <NavLink to="/review">Review</NavLink>
          <NavLink to="/blind">Blind practice</NavLink>
          <NavLink to="/challenge">Challenge</NavLink>
          <NavLink to="/finder">Pattern finder</NavLink>
          <NavLink to="/leetcode">LeetCode</NavLink>
          <NavLink to="/guide">Guide</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/patterns/:id" element={<PatternPage />} />
        <Route path="/problems/:slug" element={<ProblemPage />} />
        <Route path="/blind" element={<BlindRedirect />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/finder" element={<FinderPage />} />
        <Route path="/leetcode" element={<LeetCodePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route
          path="*"
          element={
            <main className="page">
              <div className="card empty">
                Nothing here. <Link to="/">Back to the dashboard</Link>
              </div>
            </main>
          }
        />
      </Routes>
    </>
  );
}

/** Picks a problem from your weakest patterns and opens it with the pattern hidden. */
function BlindRedirect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true; // StrictMode runs effects twice in dev; only the live one may navigate.
    api
      .blind(params.get('exclude') ?? undefined)
      .then(({ slug }) => alive && navigate(`/problems/${slug}?mode=blind`, { replace: true }))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [navigate, params]);
  return <main className="page">{error ? <ErrorBox message={error} /> : <Loading label="Picking a problem…" />}</main>;
}
