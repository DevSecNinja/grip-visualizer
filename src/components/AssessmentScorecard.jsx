import { useRef, useState } from 'react';
import { getMeasures, measuresByBasis, BASIS_LEVELS } from '../data/grip.js';
import {
  ASSESSMENT_STATUSES,
  exportAssessment,
  parseImport,
} from '../data/assessment.js';
import { t } from '../i18n/strings.js';

// Reject oversized files before reading them into memory. A legitimate export
// of all 52 measures is a few KB, so 1 MB is a generous ceiling that still
// guards against a crafted file freezing or OOM-ing the tab.
const MAX_IMPORT_BYTES = 1024 * 1024;

function countStatuses(measures, state) {
  const counts = Object.fromEntries(ASSESSMENT_STATUSES.map((s) => [s, 0]));
  for (const m of measures) {
    const status = state.measures[m.code]?.status ?? 'not_started';
    counts[status] = (counts[status] || 0) + 1;
  }
  return { counts, total: measures.length };
}

export default function AssessmentScorecard({ lang, state, onImport, onReset }) {
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const allMeasures = getMeasures();
  const { counts: overall, total } = countStatuses(allMeasures, state);
  const doneCount = overall.done;
  const inProgressCount = overall.in_progress;
  const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;

  function handleExport() {
    exportAssessment(state);
  }

  function handleImportClick() {
    setImportMsg(null);
    fileRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportMsg({ type: 'error', text: t(lang, 'importErrorTooLarge') });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { measures, warnings } = parseImport(ev.target.result);
        onImport(measures);
        const parts = [t(lang, 'importSuccess')];
        if (warnings.unknown.length > 0) {
          const MAX_SHOWN = 5;
          const shown = warnings.unknown.slice(0, MAX_SHOWN).join(', ');
          const extra = warnings.unknown.length - MAX_SHOWN;
          const suffix = extra > 0 ? ` (+${extra})` : '';
          parts.push(`${t(lang, 'importWarnUnknown')}: ${shown}${suffix}.`);
        }
        if (warnings.missing.length > 0) {
          parts.push(`${t(lang, 'importWarnMissing')}: ${warnings.missing.length}.`);
        }
        setImportMsg({ type: 'success', text: parts.join(' ') });
      } catch (err) {
        const key =
          err.message === 'invalidJson'
            ? 'importErrorJson'
            : err.message === 'invalidVersion'
              ? 'importErrorVersion'
              : 'importErrorSchema';
        setImportMsg({ type: 'error', text: t(lang, key) });
      }
      // Reset input so the same file can be re-imported if needed
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (window.confirm(t(lang, 'assessmentResetConfirm'))) {
      onReset();
      setImportMsg(null);
    }
  }

  return (
    <section className="scorecard" aria-label={t(lang, 'scorecardTitle')}>
      <div className="scorecard__head">
        <div>
          <h2 className="scorecard__title">{t(lang, 'scorecardTitle')}</h2>
          <p className="scorecard__browser-notice">
            <svg className="scorecard__lock-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v6h-9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t(lang, 'scorecardBrowserOnly')}
          </p>
        </div>
        <div className="scorecard__actions">
          <button type="button" className="scorecard__btn" onClick={handleExport}>
            ↓ {t(lang, 'assessmentExport')}
          </button>
          <button type="button" className="scorecard__btn" onClick={handleImportClick}>
            ↑ {t(lang, 'assessmentImport')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="scorecard__file-input"
            onChange={handleFileChange}
            aria-hidden="true"
          />
          <button
            type="button"
            className="scorecard__btn scorecard__btn--danger"
            onClick={handleReset}
          >
            {t(lang, 'assessmentReset')}
          </button>
        </div>
      </div>

      {importMsg && (
        <p className={`scorecard__msg scorecard__msg--${importMsg.type}`} role="status">
          {importMsg.text}
        </p>
      )}

      {/* Overall progress bar */}
      <div className="scorecard__overall">
        <div
          className="scorecard__progress-bar"
          role="progressbar"
          aria-valuenow={donePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="scorecard__progress-fill scorecard__progress-fill--done"
            style={{ width: `${donePercent}%` }}
          />
          <div
            className="scorecard__progress-fill scorecard__progress-fill--in-progress"
            style={{ width: `${inProgressPercent}%` }}
          />
        </div>
        <div className="scorecard__overall-stats">
          <span className="scorecard__stat">
            <span className="scorecard__dot scorecard__dot--done" />
            {t(lang, 'status_done')}: {doneCount}/{total} ({donePercent}%)
          </span>
          <span className="scorecard__stat">
            <span className="scorecard__dot scorecard__dot--in-progress" />
            {t(lang, 'status_in_progress')}: {inProgressCount}
          </span>
          <span className="scorecard__stat">
            <span className="scorecard__dot scorecard__dot--not-applicable" />
            {t(lang, 'status_not_applicable')}: {overall.not_applicable}
          </span>
        </div>
      </div>

      {/* Per-basis breakdown */}
      <div className="scorecard__basis-grid">
        {BASIS_LEVELS.map((basis) => {
          const basisMeasures = measuresByBasis(basis);
          const { counts, total: bTotal } = countStatuses(basisMeasures, state);
          const bDonePercent = bTotal > 0 ? Math.round((counts.done / bTotal) * 100) : 0;
          const bInProgressPercent =
            bTotal > 0 ? Math.round((counts.in_progress / bTotal) * 100) : 0;
          return (
            <div
              key={basis}
              className={`scorecard__basis-item scorecard__basis-item--b${basis}`}
            >
              <div className="scorecard__basis-head">
                <span className="scorecard__basis-num">{basis}</span>
                <span className="scorecard__basis-pct">{bDonePercent}%</span>
              </div>
              <div className="scorecard__basis-bar">
                <div
                  className="scorecard__basis-fill scorecard__basis-fill--done"
                  style={{ width: `${bDonePercent}%` }}
                />
                <div
                  className="scorecard__basis-fill scorecard__basis-fill--in-progress"
                  style={{ width: `${bInProgressPercent}%` }}
                />
              </div>
              <div className="scorecard__basis-counts">
                {counts.done}/{bTotal}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
