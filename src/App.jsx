import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import MatrixView from './components/MatrixView.jsx';
import JourneyView from './components/JourneyView.jsx';
import ValueA3A5View from './components/ValueA3A5View.jsx';
import PrioritizeView from './components/PrioritizeView.jsx';
import MeasureDetailPanel from './components/MeasureDetailPanel.jsx';
import { findMeasure, getMeta } from './data/grip.js';
import { t } from './i18n/strings.js';

// All views share one dataset. `filterable` marks the views that respond to
// the footer type/tier filters (the faithful Matrix and Journey layouts).
const VIEWS = [
  { id: 'matrix', label: 'viewMatrix', hint: 'matrixHint', Component: MatrixView, filterable: true },
  { id: 'journey', label: 'viewJourney', hint: 'journeyHint', Component: JourneyView, filterable: true },
  { id: 'v1', label: 'vName_v1', hint: 'vHint_v1', Component: ValueA3A5View, filterable: false },
  { id: 'prioritize', label: 'vName_prioritize', hint: 'vHint_prioritize', Component: PrioritizeView, filterable: false },
];

export default function App() {
  const [lang, setLang] = useState('nl');
  const [view, setView] = useState('matrix');
  const [typeFilter, setTypeFilter] = useState(null);
  const [tierFilter, setTierFilter] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  useEffect(() => {
    document.documentElement.lang = lang;
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
      />

      <p className="app__hint">{t(lang, activeView.hint)}</p>

      <div className="app__body">
        <main className="app__main">
          <ActiveComponent
            lang={lang}
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
            typeFilter={filterable ? typeFilter : null}
            tierFilter={filterable ? tierFilter : null}
          />
        </main>

        <MeasureDetailPanel
          measure={selected}
          lang={lang}
          onClose={() => setSelectedCode(null)}
        />
      </div>

      <footer className="app__footer">
        <div className="legend" role="group" aria-label={t(lang, 'filters')}>
          <button
            type="button"
            className={`legend__item legend__item--btn${typeFilter === 'O' ? ' is-active' : ''}`}
            aria-pressed={typeFilter === 'O'}
            onClick={() => setTypeFilter((v) => (v === 'O' ? null : 'O'))}
          >
            <span className="legend__swatch legend__swatch--org" /> {t(lang, 'organisational')}
          </button>
          <button
            type="button"
            className={`legend__item legend__item--btn${typeFilter === 'T' ? ' is-active' : ''}`}
            aria-pressed={typeFilter === 'T'}
            onClick={() => setTypeFilter((v) => (v === 'T' ? null : 'T'))}
          >
            <span className="legend__swatch legend__swatch--tech" /> {t(lang, 'technical')}
          </button>
          <span className="legend__item legend__item--tiers">
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
          </span>
        </div>
        <a className="app__source" href={meta.sourceUrl} target="_blank" rel="noreferrer noopener">
          {t(lang, 'sourcePdf')} ↗
        </a>
      </footer>

      <section className="disclaimer" role="contentinfo" aria-label={t(lang, 'disclaimerTitle')}>
        <h2 className="disclaimer__title">{t(lang, 'disclaimerTitle')}</h2>
        <p className="disclaimer__text">{t(lang, 'disclaimerUnofficial')}</p>
        <p className="disclaimer__text">{t(lang, 'disclaimerAi')}</p>
        {lang !== 'nl' && (
          <p className="disclaimer__text">{t(lang, 'disclaimerTranslation')}</p>
        )}
        <p className="disclaimer__text">{t(lang, 'disclaimerAdvice')}</p>
      </section>
    </div>
  );
}
