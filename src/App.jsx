import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import MatrixView from './components/MatrixView.jsx';
import JourneyView from './components/JourneyView.jsx';
import MeasureDetailPanel from './components/MeasureDetailPanel.jsx';
import { findMeasure, getMeta } from './data/grip.js';
import { t } from './i18n/strings.js';

export default function App() {
  const [lang, setLang] = useState('nl');
  const [view, setView] = useState('matrix');
  const [a5Only, setA5Only] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const selected = selectedCode ? findMeasure(selectedCode) : null;
  const meta = getMeta();

  return (
    <div className="app">
      <AppHeader
        lang={lang}
        setLang={setLang}
        view={view}
        setView={setView}
        a5Only={a5Only}
        setA5Only={setA5Only}
      />

      <p className="app__hint">
        {view === 'matrix' ? t(lang, 'matrixHint') : t(lang, 'journeyHint')}
      </p>

      <div className="app__body">
        <main className="app__main">
          {view === 'matrix' ? (
            <MatrixView
              lang={lang}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
              a5Only={a5Only}
            />
          ) : (
            <JourneyView
              lang={lang}
              selectedCode={selectedCode}
              onSelect={setSelectedCode}
              a5Only={a5Only}
            />
          )}
        </main>

        <MeasureDetailPanel
          measure={selected}
          lang={lang}
          showA5={a5Only}
          onClose={() => setSelectedCode(null)}
        />
      </div>

      <footer className="app__footer">
        <div className="legend">
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--org" /> {t(lang, 'organisational')}
          </span>
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--tech" /> {t(lang, 'technical')}
          </span>
          <span className="legend__item">
            <span className="tier tier--a1">A1</span>
            <span className="tier tier--a3">A3</span>
            <span className="tier tier--a5">A5</span>
          </span>
          <span className="legend__item">
            <span className="legend__a5dot" /> {t(lang, 'a5Highlight')}
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
        <p className="disclaimer__text">{t(lang, 'disclaimerAdvice')}</p>
      </section>
    </div>
  );
}
