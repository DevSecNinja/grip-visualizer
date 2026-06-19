import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import MatrixView from './components/MatrixView.jsx';
import JourneyView from './components/JourneyView.jsx';
import ValueA3A5View from './components/ValueA3A5View.jsx';
import PrioritizeView from './components/PrioritizeView.jsx';
import NetworkMapView from './components/NetworkMapView.jsx';
import MeasureDetailPanel from './components/MeasureDetailPanel.jsx';
import PrintDocument from './components/PrintDocument.jsx';
import AssessmentScorecard from './components/AssessmentScorecard.jsx';
import { findMeasure, getMeta } from './data/grip.js';
import { useAssessment } from './data/assessment.js';
import { t, DEFAULT_LANG, LANG_PARAM, langFromSearch } from './i18n/strings.js';

const REPO_URL = 'https://github.com/DevSecNinja/grip-visualizer';

// All views share one dataset. `filterable` marks the views that respond to
// the footer type/tier filters (the faithful Matrix and Journey layouts).
const VIEWS = [
  {
    id: 'matrix',
    label: 'viewMatrix',
    hint: 'matrixHint',
    Component: MatrixView,
    filterable: true,
  },
  {
    id: 'journey',
    label: 'viewJourney',
    hint: 'journeyHint',
    Component: JourneyView,
    filterable: true,
  },
  {
    id: 'v1',
    label: 'vName_v1',
    hint: 'vHint_v1',
    Component: ValueA3A5View,
    filterable: false,
  },
  {
    id: 'prioritize',
    label: 'vName_prioritize',
    hint: 'vHint_prioritize',
    Component: PrioritizeView,
    filterable: false,
  },
  {
    id: 'network',
    label: 'vName_network',
    hint: 'vHint_network',
    Component: NetworkMapView,
    filterable: true,
  },
];

export default function App() {
  const [lang, setLang] = useState(() =>
    langFromSearch(typeof window === 'undefined' ? '' : window.location.search)
  );
  const [view, setView] = useState('matrix');
  const [typeFilter, setTypeFilter] = useState(null);
  const [tierFilter, setTierFilter] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [assessmentMode, setAssessmentMode] = useState(false);

  const {
    state: assessmentState,
    setStatus,
    setNote,
    reset,
    importMeasures,
    getStatus,
    getEntry,
  } = useAssessment();

  useEffect(() => {
    document.documentElement.lang = lang;
    // Reflect the active language in the URL so it can be shared as a deep
    // link. The default language is represented by a clean URL with no
    // `lang` parameter.
    const url = new URL(window.location.href);
    const current = url.searchParams.get(LANG_PARAM);
    if (current === lang) return;
    if (lang === DEFAULT_LANG) {
      if (current === null) return;
      url.searchParams.delete(LANG_PARAM);
    } else {
      url.searchParams.set(LANG_PARAM, lang);
    }
    window.history.replaceState(null, '', url);
  }, [lang]);

  const selected = selectedCode ? findMeasure(selectedCode) : null;
  const meta = getMeta();
  const activeView = VIEWS.find((v) => v.id === view) ?? VIEWS[0];
  const ActiveComponent = activeView.Component;
  const filterable = activeView.filterable;

  return (
    <div className="app">
      <AppHeader
        lang={lang}
        setLang={setLang}
        views={VIEWS}
        view={view}
        setView={setView}
        assessmentMode={assessmentMode}
        onToggleAssessment={() => setAssessmentMode((v) => !v)}
      />

      <p className="app__hint">{t(lang, activeView.hint)}</p>

      {assessmentMode && (
        <AssessmentScorecard
          lang={lang}
          state={assessmentState}
          onImport={importMeasures}
          onReset={reset}
        />
      )}

      <div className="app__body">
        <main className="app__main">
          <ActiveComponent
            lang={lang}
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
            typeFilter={filterable ? typeFilter : null}
            tierFilter={filterable ? tierFilter : null}
            getAssessmentStatus={assessmentMode ? getStatus : null}
          />
        </main>

        <MeasureDetailPanel
          measure={selected}
          lang={lang}
          onClose={() => setSelectedCode(null)}
          assessmentEntry={
            assessmentMode && selected ? getEntry(selected.code) : undefined
          }
          onStatusChange={assessmentMode ? setStatus : undefined}
          onNoteChange={assessmentMode ? setNote : undefined}
        />
      </div>

      <footer className="app__footer">
        <div className="filters" role="group" aria-label={t(lang, 'filters')}>
          <span className="filters__label">
            <svg className="filters__icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M1.5 3h13M4 8h8M6.5 13h3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            {t(lang, 'filterLabel')}
          </span>

          <div className="filters__group">
            <button
              type="button"
              className={`filters__chip${typeFilter === 'O' ? ' is-active' : ''}`}
              aria-pressed={typeFilter === 'O'}
              onClick={() => setTypeFilter((v) => (v === 'O' ? null : 'O'))}
            >
              <span className="filters__swatch filters__swatch--org" />{' '}
              {t(lang, 'organisational')}
            </button>
            <button
              type="button"
              className={`filters__chip${typeFilter === 'T' ? ' is-active' : ''}`}
              aria-pressed={typeFilter === 'T'}
              onClick={() => setTypeFilter((v) => (v === 'T' ? null : 'T'))}
            >
              <span className="filters__swatch filters__swatch--tech" />{' '}
              {t(lang, 'technical')}
            </button>
          </div>

          <span className="filters__divider" aria-hidden="true" />

          <div className="filters__group">
            {['A1', 'A3', 'A5'].map((tierName) => (
              <button
                key={tierName}
                type="button"
                className={`tier tier--${tierName.toLowerCase()} tier--btn${tierFilter === tierName ? ' is-active' : ''}`}
                aria-pressed={tierFilter === tierName}
                onClick={() => setTierFilter((v) => (v === tierName ? null : tierName))}
              >
                {tierName}
              </button>
            ))}
          </div>

          <span className="filters__divider" aria-hidden="true" />

          <span className="filters__legend">
            <span className="filters__legend-swatch" aria-hidden="true" />
            {t(lang, 'tierOverrideLegend')}
          </span>

          {(typeFilter || tierFilter) && (
            <button
              type="button"
              className="filters__clear"
              onClick={() => {
                setTypeFilter(null);
                setTierFilter(null);
              }}
            >
              {t(lang, 'clearFilters')} ×
            </button>
          )}
        </div>
        <div className="app__meta">
          <a
            className="app__source"
            href={meta.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t(lang, 'sourcePdf')} ↗
          </a>
          <span className="app__meta-divider" aria-hidden="true" />
          <a
            className="app__source"
            href="https://m365maps.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t(lang, 'm365MapsLink')} ↗
          </a>
          <span className="app__meta-divider" aria-hidden="true" />
          <a
            className="app__source app__repo"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            <svg className="app__repo-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            {t(lang, 'repoLink')} ↗
          </a>
          <a
            className="app__license"
            href={`${REPO_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t(lang, 'licenseMit')}
          </a>
          {import.meta.env.APP_RELEASE_TAG || import.meta.env.APP_COMMIT_SHA_SHORT ? (
            <span className="app__meta-divider" aria-hidden="true" />
          ) : null}
          {import.meta.env.APP_RELEASE_TAG ? (
            <a
              className="app__build"
              href={`${REPO_URL}/releases/tag/${import.meta.env.APP_RELEASE_TAG}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${t(lang, 'releaseVersionAria')} ${import.meta.env.APP_RELEASE_TAG}`}
            >
              {import.meta.env.APP_RELEASE_TAG}
            </a>
          ) : null}
          {import.meta.env.APP_COMMIT_SHA_SHORT ? (
            <a
              className="app__build app__commit"
              href={`${REPO_URL}/commit/${import.meta.env.APP_COMMIT_SHA}`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${t(lang, 'commitAria')} ${import.meta.env.APP_COMMIT_SHA_SHORT}`}
            >
              {import.meta.env.APP_COMMIT_SHA_SHORT}
            </a>
          ) : null}
        </div>
      </footer>

      <section
        className="disclaimer"
        role="contentinfo"
        aria-label={t(lang, 'disclaimerTitle')}
      >
        <h2 className="disclaimer__title">{t(lang, 'disclaimerTitle')}</h2>
        <p className="disclaimer__text">{t(lang, 'disclaimerUnofficial')}</p>
        <p className="disclaimer__text">{t(lang, 'disclaimerAi')}</p>
        {lang !== 'nl' && (
          <p className="disclaimer__text">{t(lang, 'disclaimerTranslation')}</p>
        )}
        <p className="disclaimer__text">{t(lang, 'disclaimerAdvice')}</p>
        <p className="disclaimer__text disclaimer__privacy">
          <svg
            className="disclaimer__privacy-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v6h-9z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t(lang, 'disclaimerPrivacy')}
        </p>
      </section>

      <PrintDocument lang={lang} />
    </div>
  );
}
