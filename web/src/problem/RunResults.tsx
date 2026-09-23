import type { RunResult, TestResult, TestVerdict } from '../../../shared/types.ts';

const CHIP: Record<TestVerdict, { label: string; className: string }> = {
  pass: { label: 'PASS', className: 'tag-good' },
  'pass-unordered': { label: 'PASS', className: 'tag-good' },
  fail: { label: 'FAIL', className: 'tag-bad' },
  error: { label: 'ERROR', className: 'tag-bad' },
  timeout: { label: 'TIMEOUT', className: 'tag-bad' },
  unchecked: { label: 'RAN', className: 'tag-warn' },
  'not-run': { label: 'SKIPPED', className: '' },
};

export function RunResults({ result }: { result: RunResult }) {
  const { compiled, compileErrors, compilerOutput, tests } = result;
  return (
    <div className="stack" style={{ gap: '0.6rem' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: '0.5rem' }}>
          <span className={`tag ${compiled ? 'tag-good' : 'tag-bad'}`}>{compiled ? 'Compiled' : 'Compile failed'}</span>
          <span className="tiny muted">{(result.compileMs / 1000).toFixed(1)}s</span>
        </span>
        {tests.length > 0 && (
          <strong className={result.checked > 0 && result.passed === result.checked ? 'delta-up' : undefined}>
            {result.checked > 0 ? `${result.passed} of ${result.checked} example tests passed` : `${tests.length} example tests ran`}
          </strong>
        )}
      </div>

      {!compiled && (
        <div className="callout bad">
          {compileErrors.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {compileErrors.map((e, i) => (
                <li key={i} className="small">
                  {e.line != null && <strong className="mono">line {e.line}: </strong>}
                  {e.message}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="tiny" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {compilerOutput || 'The compiler reported no details.'}
            </pre>
          )}
        </div>
      )}

      {tests.map((t) => (
        <TestRow key={t.index} test={t} />
      ))}

      {result.note && <p className="tiny muted" style={{ margin: 0 }}>{result.note}</p>}
      {compiled && compilerOutput && compileErrors.length === 0 && (
        <details className="tiny muted">
          <summary>Compiler output</summary>
          <pre className="code-block tiny">{compilerOutput}</pre>
        </details>
      )}
    </div>
  );
}

function TestRow({ test: t }: { test: TestResult }) {
  const chip = CHIP[t.verdict];
  const failed = t.verdict === 'fail' || t.verdict === 'error' || t.verdict === 'timeout';
  return (
    <div className="card card-flat" style={{ padding: '0.6rem 0.75rem' }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
        <span className="row" style={{ gap: '0.5rem', minWidth: 0 }}>
          <span className={`tag ${chip.className}`}>{chip.label}</span>
          <span className="mono tiny" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.input}>
            {t.input}
          </span>
        </span>
        {t.ms != null && <span className="tiny muted">{t.ms} ms</span>}
      </div>
      {t.verdict === 'pass-unordered' && <div className="tiny muted">Matched ignoring order.</div>}
      {failed || t.verdict === 'unchecked' ? (
        <div className="tiny mono" style={{ marginTop: '0.35rem', display: 'grid', gap: '0.15rem' }}>
          {t.expected != null && t.verdict !== 'unchecked' && (
            <div>
              <span className="muted">expected </span>
              {t.expected}
            </div>
          )}
          <div>
            <span className="muted">got </span>
            {t.error ? <span className="delta-down">{t.error}</span> : (t.actual ?? '—')}
          </div>
        </div>
      ) : null}
      {t.stdout.trim() && (
        <details className="tiny" style={{ marginTop: '0.35rem' }}>
          <summary className="muted">Printed output</summary>
          <pre className="code-block tiny" style={{ marginTop: '0.3rem' }}>{t.stdout.trimEnd()}</pre>
        </details>
      )}
    </div>
  );
}
